(function executeRule(current, previous) {
    var tableNames = [];
    var tables = new GlideTableHierarchy("sys_import_set_row").getAllExtensions();
    for (var num = 0; num < tables.length; num++) {
        tableNames.push({
            label: new GlideRecord(tables[num]).getClassDisplayValue(),
            value: tables[num]
        });
    }
    g_scratchpad.tableNames = tableNames;
})(current, previous);