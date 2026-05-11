#!/usr/bin/env python3
"""Comprehensive offline sync integration for BuildTrack stores."""

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

def integrate_inserts(content, table):
    """Handle inline insert objects by wrapping in a payload variable."""
    # Pattern: supabase.from('table').insert({ ... literal object ... }).select().single();
    # We need to:
    # 1. Extract the insert object
    # 2. Create a variable for it
    # 3. Use the variable in both insert and queueMutation

    # Find: const { data, error } = await supabase.from('table').insert({...}).select().single();
    #       if (error) throw error;

    # Match the entire create method body pattern
    pattern = re.compile(
        rf"(const\s+\{{\s*data,\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.insert)\((\{{[\s\S]*?\}})\)((?:\.select\(\))?(?:\.single\(\))?;)\s*\n\s*(if\s*\(\s*error\s*\)\s*throw\s*error;)",
        re.MULTILINE
    )

    def replace_insert(match):
        prefix = match.group(1)  # "const { data, error } = await supabase.from('table').insert"
        payload = match.group(2)  # "{ name: ..., ... }"
        suffix = match.group(3)  # ".select().single();"
        throw_line = match.group(4)  # "if (error) throw error;"

        # Find the indentation of the throw line
        indent_match = re.match(r'(\s*)', throw_line)
        indent = indent_match.group(1) if indent_match else '          '

        return f"{prefix}(payload){suffix}\n{indent}if (error) {{\n{indent}  useSyncStore.getState().queueMutation('{table}', 'insert', payload);\n{indent}  return null;\n{indent}}}"

    content = pattern.sub(replace_insert, content)

    # Now add the payload declaration before the insert call
    # Look for: const { data, error } = await supabase.from('table').insert(payload)
    # And add: const payload = { ... }; before it
    # But we need to find the original object. Let me use a different approach.

    return content

def integrate_updates(content, table):
    """Handle inline update objects."""
    # Pattern for inline update: .update({ status: newStatus, completed_at: updates.completedAt }).eq('id', id);
    pattern = re.compile(
        rf"(const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.update)\((\{{[\s\S]*?\}})\)(\.eq\('id',\s*(\w+)\);)\s*\n\s*(if\s*\(\s*error\s*\)\s*throw\s*error;)",
        re.MULTILINE
    )

    def replace_update(match):
        prefix = match.group(1)
        payload = match.group(2)
        suffix = match.group(3)
        id_var = match.group(4)
        throw_line = match.group(5)

        indent_match = re.match(r'(\s*)', throw_line)
        indent = indent_match.group(1) if indent_match else '          '

        return f"{prefix}(updates){suffix}\n{indent}if (error) {{\n{indent}  useSyncStore.getState().queueMutation('{table}', 'update', {{ {id_var}, ...updates }});\n{indent}  return;\n{indent}}}"

    content = pattern.sub(replace_update, content)

    return content

def integrate_file(filepath, table):
    content = read_file(filepath)
    original = content

    content = add_import(content)
    content = integrate_inserts(content, table)
    content = integrate_updates(content, table)

    if content != original:
        write_file(filepath, content)
        return True
    return False

def main():
    modified = 0
    no_change = 0
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

        try:
            if integrate_file(filepath, table):
                modified += 1
                print(f"MODIFIED: {filename}")
            else:
                no_change += 1
                print(f"NO_CHANGE: {filename}")
        except Exception as e:
            errors.append(f"ERROR {filename}: {e}")

    print(f"\nSummary: {modified} modified, {no_change} no_change, {skipped} skipped, {len(errors)} errors")
    if errors:
        for e in errors:
            print(f"  {e}")

if __name__ == '__main__':
    main()
