#!/usr/bin/env python3
"""Integrate offline sync into BuildTrack stores using line-by-line parsing."""

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
    return re.sub(
        r"(import\s*\{\s*supabase\s*\}\s*from\s*['\"]\.\./lib/supabase['\"];)",
        r"\1\nimport { useSyncStore } from './syncStore';",
        content
    )

def process_file(content, table):
    """Process a file's content to integrate offline sync."""
    lines = content.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check for delete pattern: await supabase.from('table').delete().eq('id', var);
        delete_match = re.search(
            rf"await\s+supabase\.from\('{table}'\)\.delete\(\)\.eq\('id',\s*(\w+)\);",
            line
        )
        if delete_match:
            id_var = delete_match.group(1)
            result.append(line)
            i += 1
            # Check next non-empty line for if (error) throw error;
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            if i < len(lines) and re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                indent = re.match(r'(\s*)', lines[i]).group(1)
                result.append(f"{indent}if (error) {{")
                result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'delete', {{ {id_var} }});")
                result.append(f"{indent}  return;")
                result.append(f"{indent}}}")
                i += 1
                continue

        # Check for update pattern: await supabase.from('table').update(...).eq('id', var);
        update_match = re.search(
            rf"await\s+supabase\.from\('{table}'\)\.update\((\w+)\)\.eq\('id',\s*(\w+)\);",
            line
        )
        if update_match:
            updates_var = update_match.group(1)
            id_var = update_match.group(2)
            result.append(line)
            i += 1
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            if i < len(lines) and re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                indent = re.match(r'(\s*)', lines[i]).group(1)
                result.append(f"{indent}if (error) {{")
                result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'update', {{ {id_var}, ...{updates_var} }});")
                result.append(f"{indent}  return;")
                result.append(f"{indent}}}")
                i += 1
                continue

        # Check for insert pattern: await supabase.from('table').insert(var).select().single();
        # or .insert({...}).select().single();
        insert_match = re.search(
            rf"await\s+supabase\.from\('{table}'\)\.insert\((\w+)\)(?:\.select\(\))?(?:\.single\(\))?;",
            line
        )
        if insert_match:
            payload_var = insert_match.group(1)
            result.append(line)
            i += 1
            # Skip empty lines and the if (error) throw error; line
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            if i < len(lines) and re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                indent = re.match(r'(\s*)', lines[i]).group(1)
                result.append(f"{indent}if (error) {{")
                result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'insert', {payload_var});")
                result.append(f"{indent}  return null;")
                result.append(f"{indent}}}")
                i += 1
                continue

        # Check for inline insert: .insert({  - need multiline handling
        inline_insert_start = re.search(
            rf"\.from\('{table}'\)\.insert\(\{{$",
            line.strip()
        )
        if inline_insert_start:
            # Collect the inline object
            result.append(line)
            i += 1
            insert_lines = []
            brace_count = 1
            while i < len(lines) and brace_count > 0:
                current = lines[i]
                insert_lines.append(current)
                brace_count += current.count('{') - current.count('}')
                i += 1
            # Now i points to the line after the closing }
            # Check for .select().single();
            select_lines = []
            while i < len(lines) and not lines[i].strip().endswith(';'):
                select_lines.append(lines[i])
                i += 1
            if i < len(lines):
                select_lines.append(lines[i])  # The line with ;
                i += 1

            # Add all collected lines
            result.extend(insert_lines)
            result.extend(select_lines)

            # Check for if (error) throw error;
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            if i < len(lines) and re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                indent = re.match(r'(\s*)', lines[i]).group(1)
                result.append(f"{indent}if (error) {{")
                result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'insert', payload);")
                result.append(f"{indent}  return null;")
                result.append(f"{indent}}}")
                i += 1
            continue

        result.append(line)
        i += 1

    return '\n'.join(result)

def integrate_file(filepath, table):
    content = read_file(filepath)
    original = content

    content = add_import(content)
    content = process_file(content, table)

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
            import traceback
            errors.append(f"ERROR {filename}: {e}\n{traceback.format_exc()}")

    print(f"\nSummary: {modified} modified, {no_change} no_change, {skipped} skipped, {len(errors)} errors")
    if errors:
        for e in errors:
            print(f"  {e}")

if __name__ == '__main__':
    main()
