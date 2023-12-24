answer = (function transformEntry(source) {

	var gr = new GlideRecord("sn_fin_legal_entity");
	gr.addQuery('erp_company_code', source.company_code);
	gr.addQuery('erp_source', source.erp_source);
	gr.query();
	if(gr.next()){
		if(!gs.nil(target.legal_entities)){
			var listArr = target.legal_entities.toString().split(',');
			var presentValue = gr.getUniqueValue().toString();
			if(listArr.indexOf(presentValue) == -1){
				listArr.push(gr.getUniqueValue().toString());
			}
			return listArr.join(',');
		} else {
			return gr.getUniqueValue();
		}
	}
	

})(source);