var ga = new GlideAggregate('sn_sap_data_int_master_data_error_handler');
ga.addAggregate('COUNT');
ga.addQuery('state', 'failed');
ga.query();
ga.next();
if(ga.getAggregate('COUNT') !== '0'){
	true;
}