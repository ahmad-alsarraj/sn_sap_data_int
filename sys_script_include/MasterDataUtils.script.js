var MasterDataUtils = Class.create();
MasterDataUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	callRunFailedMasters : function (){
		var sysIdList = this.getParameter('sysparm_sysid_list');
		try {
			var inputs = {};
			inputs['Master_IDs'] = []; 
			var gr = new GlideRecord('sn_sap_data_int_master_data_error_handler');
			gr.addQuery('sys_id', 'IN' , sysIdList);
			gr.orderBy('number');
			gr.query();
			while(gr.next()){
				var temp = gr.sys_id;
				inputs['Master_IDs'].push(temp.toString());
			}
			var result = sn_fd.FlowAPI.getRunner().subflow('sn_sap_data_int.run_failed_masters').inBackground().withInputs(inputs).run();
			var msg = gs.getMessage("Failed masters initiation message");
			return msg;
		} catch (ex) {
			var message = ex.getMessage();
			return message;
		}	
	},

	type: 'MasterDataUtils'
});