(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {

	// Add your code here
	if(!gs.nil(source.company_code)){
		target.setValue('used_for_entities', 'yes');
	}

})(source, map, log, target);