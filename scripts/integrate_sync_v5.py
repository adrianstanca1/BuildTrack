#!/usr/bin/env python3
"""
Smart offline sync integration - only replaces 'throw error' that is 
preceded by a Supabase mutation within 3 lines.
"""

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

def process_store(filepath, table):
    """Process a store file using two-pass approach."""
    content = read_file(filepath)
    original = content
    lines = content.split('\n')
    result = []
    i = 0
    modified = False

    while i < len(lines):
        line = lines[i]

        # === PASS 1: Look for direct Supabase mutation followed by error check ===
        # Check current line for supabase mutation
        mutation_info = None

        # Delete: const { error } = await supabase.from('table').delete().eq('id', id);
        m = re.search(rf"const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.delete\(\)\.eq\('id',\s*(\w+)\);", line)
        if m:
            mutation_info = ('delete', m.group(1), 'id')

        # Update: const { error } = await supabase.from('table').update(updates).eq('id', id);
        if not mutation_info:
            m = re.search(rf"const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.update\((\w+)\)\.eq\('id',\s*(\w+)\);", line)
            if m:
                mutation_info = ('update', m.group(2), m.group(1))  # id_var, updates_var

        # Insert with variable: const { data, error } = await supabase.from('table').insert(var).select().single();
        if not mutation_info:
            m = re.search(rf"const\s+\{{\s*data,\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.insert\((\w+)\)(?:\.select\(\))?(?:\.single\(\))?;", line)
            if m:
                mutation_info = ('insert', m.group(1), None)  # payload_var

        if mutation_info:
            result.append(line)
            i += 1
            # Look for next non-empty line - must be within 3 lines
            found = False
            empty_lines = []
            for j in range(3):
                if i >= len(lines):
                    break
                if lines[i].strip() == '':
                    empty_lines.append(lines[i])
                    i += 1
                    continue
                if re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                    # Found it! Replace
                    indent = re.match(r'(\s*)', lines[i]).group(1)
                    op_type, var1, var2 = mutation_info

                    if op_type == 'delete':
                        result.extend(empty_lines)
                        result.append(f"{indent}if (error) {{")
                        result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'delete', {{ {var1} }});")
                        result.append(f"{indent}  return;")
                        result.append(f"{indent}}}")
                        found = True
                    elif op_type == 'update':
                        result.extend(empty_lines)
                        result.append(f"{indent}if (error) {{")
                        result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'update', {{ {var1}, ...{var2} }});")
                        result.append(f"{indent}  return;")
                        result.append(f"{indent}}}")
                        found = True
                    elif op_type == 'insert':
                        result.extend(empty_lines)
                        result.append(f"{indent}if (error) {{")
                        result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'insert', {var1});")
                        result.append(f"{indent}  return null;")
                        result.append(f"{indent}}}")
                        found = True

                    if found:
                        i += 1
                        modified = True
                        break
                else:
                    # Not our target line, add everything and continue
                    result.extend(empty_lines)
                    result.append(lines[i])
                    i += 1
                    break

            if not found:
                result.extend(empty_lines)
            continue

        # === PASS 2: Inline insert objects (multiline) ===
        # Check if this line ends with .insert({
        inline_insert = re.search(rf"\.from\('{table}'\)\.insert\(\{{$", line.strip())
        if inline_insert:
            # This is a multiline inline insert - we need to handle it differently
            # Collect the object, then look for if (error) throw error;
            # For now, skip these (they're complex and fewer in number)
            pass

        result.append(line)
        i += 1

    new_content = '\n'.join(result)
    new_content = add_import(new_content)
    modified = modified or (new_content != original)

    if modified:
        write_file(filepath, new_content)
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
            if process_store(filepath, table):
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
