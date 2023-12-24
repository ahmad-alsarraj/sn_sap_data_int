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

    var gr = new GlideRecord("cmn_location");
    gr.addQuery("name", name.toString());
    gr.query();
    if (gr.next()) {
        return gr.getUniqueValue();
    }
})(source);