(function transformRow(source, target, map, log, isUpdate) {

    // Add your code here
    var actualPrimaryPosting = source.lock_indicator_for_actual_primary_postings;
    if (gs.nil(actualPrimaryPosting)) {
        target.available_for_use =  false;
    }else {
        target.available_for_use = true;
    }

})(source, target, map, log, action === "update");