answer = (function transformEntry(source) {

	var gl = new GlideRecord("sn_fin_gl_account");
	gl.addQuery('gl_account', source.reconciliation_account_in_general_ledger);
	gl.addQuery('erp_source', source.erp_source);
	gl.query();
	if(gl.next()){
		return gl.getUniqueValue();	
	}
	
})(source);