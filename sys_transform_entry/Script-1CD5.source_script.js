answer = (function transformEntry(source) {
    var gr = new GlideRecord("sn_fin_legal_entity");
    gr.addQuery("erp_company_code", source.company_code);
    gr.query();
    if (gr.next())
        return gr.getUniqueValue();
    else
        return "";
})(source);