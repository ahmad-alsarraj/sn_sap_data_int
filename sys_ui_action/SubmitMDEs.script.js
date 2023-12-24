function submitMDEs(){
	var entries = g_list.getChecked();
	if (!entries || entries.length == 0){
		alert("Please select entries");
		return;
	}
	else {
		var ga = new GlideAjax('sn_sap_data_int.MasterDataUtils');
		ga.addParam('sysparm_name', 'callRunFailedMasters');
		ga.addParam('sysparm_sysid_list', entries);
		ga.getXML(callback);
	}
	function callback(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		alert(answer);
		location.reload();
	}
}