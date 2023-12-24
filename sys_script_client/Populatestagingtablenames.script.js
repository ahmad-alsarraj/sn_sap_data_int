function onLoad() {
    var tablesToShow = g_scratchpad.tableNames;
	//alert("tablesToShow "+tablesToShow);
    var tablesDropDown = "choice.sn_sap_data_int_integrations_service.import_set_tables";
    g_form.addOption(tablesDropDown, '', getMessage('-- None --'));
    for (var table = 0; table < tablesToShow.length; table++) {
        g_form.addOption(tablesDropDown, tablesToShow[table].value, tablesToShow[table].label);
    }
}