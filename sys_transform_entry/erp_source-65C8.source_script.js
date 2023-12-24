answer = (function transformEntry(source) {

	var gr = new GlideRecord("sn_fin_erp_source");
	gr.get(source.erp_source);
	return gr;

})(source);