#!/usr/bin/env python3
"""Integrate offline sync (useSyncStore.queueMutation) into all BuildTrack Zustand stores."""

import os
import re

STORES_DIR = '/root/BuildTrack/stores'
SKIP = {'syncStore.ts', 'safetyStore.ts'}

TABLE_MAP = {
    'projectsStore.ts': 'projects',
    'tasksStore.ts': 'tasks',
    'teamStore.ts': 'workers',
    'materialsStore.ts': 'materials',
    'equipmentStore.ts': 'equipment',
    'dailyReportsStore.ts': 'daily_reports',
    'timesheetsStore.ts': 'timesheets',
    'meetingsStore.ts': 'meetings',
    'sitePhotosStore.ts': 'site_photos',
    'permitsStore.ts': 'permits',
    'defectsStore.ts': 'defects',
    'punchItemsStore.ts': 'punch_items',
    'rfisStore.ts': 'rfis',
    'drawingsStore.ts': 'drawings',
    'drawingPinsStore.ts': 'drawing_pins',
    'changeOrdersStore.ts': 'change_orders',
    'purchaseOrdersStore.ts': 'purchase_orders',
    'invoicesStore.ts': 'invoices',
    'submittalsStore.ts': 'submittals',
    'delayNotesStore.ts': 'delay_notes',
    'budgetStore.ts': 'budget_entries',
    'billingStore.ts': 'billing_entries',
    'notificationsStore.ts': 'notifications',
}

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def add_import(content):
    if 'useSyncStore' in content:
        return content
    content = re.sub(
        r"(import\s*\{\s*supabase\s*\}\s*from\s*['\"]\.\./lib/supabase['\"];)",
        r"\1\nimport { useSyncStore } from './syncStore';",
        content
    )
    return content

def integrate_file(filepath, table):
    content = read_file(filepath)
    original = content

    content = add_import(content)

    # Pattern 1: Delete operations
    # Match: const { error } = await supabase.from('table').delete().eq('id', id);
    #        if (error) throw error;
    content = re.sub(
        rf"(const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.delete\(\)\.eq\('id',\s*(\w+)\);)\s*(\n\s*)if\s*\(\s*error\s*\)\s*throw\s*error;",
        lambda m: f"{m.group(1)}{m.group(3)}if (error) {{{m.group(3)}  useSyncStore.getState().queueMutation('{table}', 'delete', {{ {m.group(2)} }});{m.group(3)}  return;{m.group(3)}}}",
        content
    )

    # Pattern 2: Update operations
    content = re.sub(
        rf"(const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.update\((\w+)\)\.eq\('id',\s*(\w+)\);)\s*(\n\s*)if\s*\(\s*error\s*\)\s*throw\s*error;",
        lambda m: f"{m.group(1)}{m.group(4)}if (error) {{{m.group(4)}  useSyncStore.getState().queueMutation('{table}', 'update', {{ {m.group(3)}, ...{m.group(2)} }});{m.group(4)}  return;{m.group(4)}}}",
        content
    )

    # Pattern 3: Insert operations (most complex - need to capture the data being inserted)
    # Look for: await supabase.from('table').insert({...}).select().single();
    #           if (error) throw error;
    content = re.sub(
        rf"(const\s+\{{\s*data,\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.insert\((\w+)\)(?:\.select\(\))?(?:\.single\(\))?;[\s\S]{{0,50}}?)(\n\s*)if\s*\(\s*error\s*\)\s*throw\s*error;",
        lambda m: f"{m.group(1)}{m.group(3)}if (error) {{{m.group(3)}  useSyncStore.getState().queueMutation('{table}', 'insert', {m.group(2)});{m.group(3)}  return null;{m.group(3)}}}",
        content
    )

    if content != original:
        write_file(filepath, content)
        return True
    return False

def main():
    modified = 0
    skipped = 0
    errors = []

    for filename, table in sorted(TABLE_MAP.items()):
        filepath = os.path.join(STORES_DIR, filename)
        if not os.path.exists(filepath):
            errors.append(f"MISSING: {filename}")
            continue
        if filename in SKIP:
            skipped += 1
            continue
        if 'useSyncStore' in read_file(filepath):
            skipped += 1
            continue

        try:
            if integrate_file(filepath, table):
                modified += 1
                print(f"MODIFIED: {filename}")
            else:
                print(f"NO_CHANGE: {filename}")
        except Exception as e:
            errors.append(f"ERROR {filename}: {e}")

    print(f"\nSummary: {modified} modified, {skipped} skipped, {len(errors)} errors")
    if errors:
        for e in errors:
            print(f"  {e}")

if __name__ == '__main__':
    main()
