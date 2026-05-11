#!/usr/bin/env python3
"""
Surgical offline sync integration for BuildTrack stores.
Only touches clearly-identifiable patterns. Skips ambiguous ones.
"""

import os
import re

STORES_DIR = '/root/BuildTrack/stores'
SKIP = {'syncStore.ts'}

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
    """Process a single store file."""
    content = read_file(filepath)
    original = content
    lines = content.split('\n')
    result = []
    i = 0
    modified = False

    while i < len(lines):
        line = lines[i]

        # === DELETE PATTERN ===
        # Pattern: const { error } = await supabase.from('table').delete().eq('id', id);
        delete_match = re.search(
            rf"const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.delete\(\)\.eq\('id',\s*(\w+)\);",
            line
        )
        if delete_match:
            id_var = delete_match.group(1)
            result.append(line)
            i += 1
            # Look for next non-empty line
            while i < len(lines) and lines[i].strip() == '':
                result.append(lines[i])
                i += 1
            # Check if it's if (error) throw error;
            if i < len(lines) and re.search(r'if\s*\(\s*error\s*\)\s*throw\s*error;', lines[i]):
                indent = re.match(r'(\s*)', lines[i]).group(1)
                result.append(f"{indent}if (error) {{")
                result.append(f"{indent}  useSyncStore.getState().queueMutation('{table}', 'delete', {{ {id_var} }});")
                result.append(f"{indent}  return;")
                result.append(f"{indent}}}")
                i += 1
                modified = True
                continue

        # === UPDATE PATTERN (single-line) ===
        # Pattern: const { error } = await supabase.from('table').update(updates).eq('id', id);
        update_match = re.search(
            rf"const\s+\{{\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.update\((\w+)\)\.eq\('id',\s*(\w+)\);",
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
                modified = True
                continue

        # === INSERT PATTERN (variable) ===
        # Pattern: const { data, error } = await supabase.from('table').insert(var).select().single();
        insert_var_match = re.search(
            rf"const\s+\{{\s*data,\s*error\s*\}}\s*=\s*await\s+supabase\.from\('{table}'\)\.insert\((\w+)\)(?:\.select\(\))?(?:\.single\(\))?;",
            line
        )
        if insert_var_match:
            payload_var = insert_var_match.group(1)
            result.append(line)
            i += 1
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
                modified = True
                continue

        # === INSERT PATTERN (inline object - extract to variable) ===
        # Check if this line starts an inline insert
        inline_insert = re.search(
            rf"\.from\('{table}'\)\.insert\(\{{$",
            line.strip()
        )
        if inline_insert:
            # We need to:
            # 1. Find the variable name that comes before .from (it's in the await line)
            # 2. Extract the entire inline object
            # 3. Add a const payload = { ... }; before the await
            # 4. Replace the insert({...}) with insert(payload)
            # 5. Change the error handler

            # Find the start of this statement (look backwards in result)
            start_idx = len(result) - 1
            while start_idx >= 0 and 'await' not in result[start_idx]:
                start_idx -= 1
            if start_idx < 0:
                result.append(line)
                i += 1
                continue

            # Extract the object lines
            obj_lines = [line]
            i += 1
            brace_depth = 1
            while i < len(lines) and brace_depth > 0:
                current = lines[i]
                obj_lines.append(current)
                brace_depth += current.count('{') - current.count('}')
                i += 1

            # Now collect .select().single();
            suffix_lines = []
            while i < len(lines) and not lines[i].strip().endswith(';'):
                suffix_lines.append(lines[i])
                i += 1
            if i < len(lines):
                suffix_lines.append(lines[i])
                i += 1

            # Get the indentation from the first line
            base_indent = re.match(r'(\s*)', obj_lines[0]).group(1)

            # Build the payload variable declaration
            payload_declaration = f"{base_indent}const payload = {{"
            # Add the object content (lines[1:-1] since first is opening, last is closing)
            for obj_line in obj_lines[1:-1]:
                payload_declaration += '\n' + obj_line
            payload_declaration += f"\n{base_indent}}};"

            # Build the modified insert line
            # The original await line needs to be modified
            await_line = result[start_idx]
            # Remove the inline object part and replace with (payload)
            # This is tricky - let's rebuild the await line
            # Find where .insert({ starts in the await line
            insert_pos = await_line.find(".insert({")
            if insert_pos < 0:
                # Fallback: just append
                result.extend(obj_lines)
                result.extend(suffix_lines)
                continue

            new_await = await_line[:insert_pos] + ".insert(payload)"
            # Find any suffix in the await line after the object
            rest = await_line[insert_pos:]
            # Check if there's .select().single(); in the same line
            select_match = re.search(r'\)\s*(\.select\(\))?(\.single\(\))?;', rest)
            if select_match:
                new_await += select_match.group(1) or ''
                new_await += select_match.group(2) or ''
                new_await += ';'

            # Replace the await line in result
            result[start_idx] = payload_declaration + '\n' + new_await
            result.extend(suffix_lines)

            # Now handle the error check
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
                modified = True
            continue

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
