(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
          // Add your code here
		//template.print(current.sys_id);
		var new_gr = new GlideRecord('sn_sap_data_int_integration_service_job_tracker');
		new_gr.addQuery('integrations_job_tracker',current.sys_id);
		new_gr.query();
		while(new_gr.next())
		{
			var service_name = new_gr.integration_service.name;
			var import_set = new_gr.integration_service.import_set_tables;
			var import_state = new_gr.state;
			var import_set_number = [];
			var import_sys_id = new_gr.getValue('sets').toString().split(',');
			var import_new = new GlideRecord('sys_import_set');
			for(var i = 0 ; i<import_sys_id.length; i++)
				{
					import_new.get(import_sys_id[i].toString().trim());
					import_set_number.push(import_new.number);					
					
				}
			//var source = new_gr.integration_service.source.sys_id;
		var set = import_set_number.toString();
		var staging_url = import_set.toString() + '_list.do';
			template.print("Set :" + set + "<br />" + "State :" + import_state + "<br />" + "Service :" + service_name + "<br />" + "Import Set Table :" +'<a href='+ staging_url +'>' +  'Staging Table </a>');
			
	}	
				
})(current, template, email, email_action, event);