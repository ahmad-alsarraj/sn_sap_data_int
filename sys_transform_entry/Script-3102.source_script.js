answer = (function transformEntry(source) {

    var givenDate = source.effective_date + " 23:59:59";
    var gd = new GlideDateTime(givenDate);
    return gd;

})(source);