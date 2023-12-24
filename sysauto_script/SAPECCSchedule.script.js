var gr = new GlideRecord("sn_fcms_intg_source");
gr.addQuery('sys_id', '7bd6edcf871921508dd710683cbb3560');
gr.query();
if (gr.next()) {
    var job_running = new sn_sap_data_int.IntegrationsUtilsSNC().isNotRunning(gr.getValue("sys_id"));
    if (job_running) {
        var inputs = {};
        inputs['source'] = gr;
        inputs['job_name'] = gr.name + ' Job';
		var gr_con = new GlideRecord('sys_alias');
        gr_con.addQuery('sys_id', gr.connection);
        gr_con.query();
        if (gr_con.next()) {
            inputs['connection_name'] = gr_con;
        }
        sn_fd.FlowAPI.getRunner().subflow('sn_sap_data_int.run_job').inBackground().withInputs(inputs).run();
    }
}