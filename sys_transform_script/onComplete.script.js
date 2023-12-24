(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {

    if (!gs.nil(new GlideRecord('sys_store_app').get('sys_id', '2516c903c33030103622aaafc840ddfc')) || !gs.nil(new GlideRecord('sys_app').get('sys_id', '2516c903c33030103622aaafc840ddfc'))) {
        var gr = new GlideRecord('sn_sap_data_int_supplier_stg');
        gr.addQuery('sys_import_set', source.sys_import_set);
        gr.query();
        while (gr.next()) {
            var loc_details = {};
            loc_details['street'] = gr.street_and_house_number;
            loc_details['city'] = gr.district_1 + " " + gr.district_2;
            loc_details['state'] = gr.region_state_province_county;
            loc_details['zip'] = gr.postal_code;
            loc_details['country'] = gr.country_key;
            loc_details['fax_phone'] = gr.fax_number;
            loc_details['phone'] = gr.first_telephone_number;
            var name = new IntegrationsUtils().getLocationName(loc_details.street, loc_details.city, loc_details.state, loc_details.zip);
            loc_details['name'] = name;
            var targetRecordSysId = gr.sys_target_sys_id;
            var getLocSysId = new IntegrationsUtils().getLocationID(loc_details);
            var locationSysId;
            if (gs.nil(getLocSysId)) {
                locationSysId = new IntegrationsUtils().createLocation(loc_details);
            }

            if (!gs.nil(targetRecordSysId)) {
                var supplierLocation = new IntegrationsUtils().checkForSupplierLocation(targetRecordSysId);
                if (supplierLocation === true) {
                    if (!gs.nil(getLocSysId)) {
                        new IntegrationsUtils().updateSupplierLocation(targetRecordSysId, getLocSysId);
                    } else if (!gs.nil(locationSysId)) {
                        new IntegrationsUtils().updateSupplierLocation(targetRecordSysId, locationSysId.sys_id);
                    }
                } else if (supplierLocation === false) {
                    if (!gs.nil(getLocSysId)) {
                        new IntegrationsUtils().createSupplierLocation(targetRecordSysId, getLocSysId);
                    } else if (!gs.nil(locationSysId)) {
                        new IntegrationsUtils().createSupplierLocation(targetRecordSysId, locationSysId.sys_id);
                    }
                }
            }
        }
    }
})(source, map, log, target);