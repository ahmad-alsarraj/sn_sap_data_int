try {
	var inputs = {};
	inputs['Master_IDs'] = [];
	var result = sn_fd.FlowAPI.getRunner().subflow('sn_sap_data_int.run_failed_masters').inBackground().withInputs(inputs).run();
} catch (ex) {
	var message = ex.getMessage();
	gs.error(message);
}