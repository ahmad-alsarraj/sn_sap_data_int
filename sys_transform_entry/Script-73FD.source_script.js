answer = (function transformEntry(source) {
    var street = source.street_and_house_number;
    var city = source.city;
    var state = source.region_state_province_county;
    var zip = source.postal_code;

    var name = [street, city, state].filter(function(val) {
        return val != null ? (val) : "";
    }).join(', ');

    name = [name, zip].filter(function(val) {
        return val != null ? (val) : "";
    }).join(' ');

    var query = "name=" + name.toString();
    var legalEntity = "";
    var grLe = new GlideRecord("sn_fin_legal_entity");
    grLe.addQuery("erp_company_code", source.company_code);
    grLe.query();
    if (grLe.next()) {
        legalEntity = grLe.getUniqueValue();
        query += "^legal_entity.sys_id=" + legalEntity.toString();
    }

    var gr = new GlideRecord("sn_shop_office_location");
    gr.addEncodedQuery(query);
    gr.query();
    if (gr.next()) {
        return gr.getUniqueValue();
    }

})(source);