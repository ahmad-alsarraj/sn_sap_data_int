answer = (function transformEntry(source) {
    var gr = new GlideRecord('core_country');
    gr.addQuery('iso3166_2', source.country_key);
    gr.query();
    if (gr.next()) {
        return gr.name;
    }
})(source);