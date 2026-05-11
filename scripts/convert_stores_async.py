#!/usr/bin/env python3
"""Convert all store update methods to async with Supabase + offline sync fallback."""
import os, re

STORES_DIR = '/root/BuildTrack/stores'

# Map: filename -> (table_name, interface_name, state_key, update_method_name)
# The update_method_name is what appears in the store interface/implementation
TABLE_MAP = {
    'changeOrdersStore.ts': ('change_orders', 'ChangeOrder', 'changeOrders', 'updateChangeOrder'),
    'dailyReportsStore.ts': ('daily_reports', 'DailyReport', 'reports', 'updateReport'),
    'defectsStore.ts': ('defects', 'Defect', 'defects', 'updateDefect'),
    'delayNotesStore.ts': ('delay_notes', 'DelayNote', 'delayNotes', 'updateDelayNote'),
    'drawingPinsStore.ts': ('drawing_pins', 'DrawingPin', 'pins', 'updatePin'),
    'drawingsStore.ts': ('drawings', 'Drawing', 'drawings', 'updateDrawing'),
    'equipmentStore.ts': ('equipment', 'Equipment', 'equipment', 'updateEquipment'),
    'invoicesStore.ts': ('invoices', 'Invoice', 'invoices', 'updateInvoice'),
    'materialsStore.ts': ('materials', 'Material', 'materials', 'updateMaterial'),
    'meetingsStore.ts': ('meetings', 'Meeting', 'meetings', 'updateMeeting'),
    'permitsStore.ts': ('permits', 'Permit', 'permits', 'updatePermit'),
    'punchItemsStore.ts': ('punch_items', 'PunchItem', 'punchItems', 'updatePunchItem'),
    'purchaseOrdersStore.ts': ('purchase_orders', 'PurchaseOrder', 'purchaseOrders', 'updatePurchaseOrder'),
    'rfisStore.ts': ('rfis', 'Rfi', 'rfis', 'updateRfi'),
    'sitePhotosStore.ts': ('site_photos', 'SitePhoto', 'sitePhotos', 'updateSitePhoto'),
    'submittalsStore.ts': ('submittals', 'Submittal', 'submittals', 'updateSubmittal'),
    'tasksStore.ts': ('tasks', 'Task', 'tasks', 'updateTask'),
    'timesheetsStore.ts': ('timesheets', 'Timesheet', 'timesheets', 'updateTimesheet'),
}

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def process_store(filepath, table, interface_name, state_key, method_name):
    content = read_file(filepath)
    original = content

    # Pattern: updateX: (id, updates) => set((state) => ({
    #   stateKey: state.stateKey.map((x) => (x.id === id ? { ...x, ...updates } : x)),
    # })),
    # Need to replace with async version

    # Find the exact pattern
    pattern = re.compile(
        rf"(      {re.escape(method_name)}: \(id, updates\) => set\(\(state\) => \({{\n"
        rf"        {re.escape(state_key)}: state\.{re.escape(state_key)}\.map\(\([a-z]\) => \([a-z]\.id === id \? {{ \.\.\.[a-z], \.\.\.updates }} : [a-z]\)\),\n"
        rf"      }}\)\),)"
    )

    match = pattern.search(content)
    if not match:
        # Try alternative pattern (changeOrdersStore has slightly different format)
        pattern2 = re.compile(
            rf"(      {re.escape(method_name)}: \(id, updates\) =>\n?\s*set\(\(state\) => \({{\n"
            rf"        {re.escape(state_key)}: state\.{re.escape(state_key)}\.map\(\([a-z]\) => \([a-z]\.id === id \? {{ \.\.\.[a-z], \.\.\.updates }} : [a-z]\)\),\n"
            rf"      }}\)\),?)"
        )
        match = pattern2.search(content)

    if not match:
        return False  # Already async or different pattern

    old_code = match.group(1)

    # Build replacement
    replacement = f"""      {method_name}: async (id, updates) => {{
        set((state) => ({{
          {state_key}: state.{state_key}.map((item) => (item.id === id ? {{ ...item, ...updates }} : item)),
        }}));
        const {{ error }} = await supabase.from('{table}').update(updates).eq('id', id);
        if (error) {{
          useSyncStore.getState().queueMutation('{table}', 'update', {{ id, ...updates }});
        }}
      }},"""

    content = content.replace(old_code, replacement)

    # Also update interface declaration: => void to => Promise<void>
    iface_pattern = f"{method_name}: (id: string, updates: Partial<{interface_name}>) => void;"
    iface_replacement = f"{method_name}: (id: string, updates: Partial<{interface_name}>) => Promise<void>;"
    content = content.replace(iface_pattern, iface_replacement)

    if content != original:
        write_file(filepath, content)
        return True
    return False

def main():
    modified = 0
    no_change = 0
    errors = []

    for filename, (table, interface_name, state_key, method_name) in sorted(TABLE_MAP.items()):
        filepath = os.path.join(STORES_DIR, filename)
        if not os.path.exists(filepath):
            errors.append(f"MISSING: {filename}")
            continue
        try:
            if process_store(filepath, table, interface_name, state_key, method_name):
                modified += 1
                print(f"MODIFIED: {filename}")
            else:
                no_change += 1
                print(f"NO_CHANGE: {filename}")
        except Exception as e:
            import traceback
            errors.append(f"ERROR {filename}: {e}\n{traceback.format_exc()}")

    print(f"\nSummary: {modified} modified, {no_change} no_change, {len(errors)} errors")
    if errors:
        for e in errors:
            print(f"  {e}")

if __name__ == '__main__':
    main()
