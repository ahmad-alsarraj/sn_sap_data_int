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

    return name.toString();

})(source);