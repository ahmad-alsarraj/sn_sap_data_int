var IntegrationsUtilsSNC = Class.create();
IntegrationsUtilsSNC.prototype = {
    initialize: function() {},

    createJobTracker: function(source, jobName) {
        var trackerGr = new GlideRecord('sn_sap_data_int_integration_job_tracker');
        trackerGr.job_name = jobName;
        trackerGr.source = source;
        trackerGr.job_start_time = new GlideDateTime();
        trackerGr.insert();
    },

    createServiceJobTracker: function(jobId, service, set) {
        var serviceTrackerGr = new GlideRecord('sn_sap_data_int_integration_service_job_tracker');
        serviceTrackerGr.set = set;
        serviceTrackerGr.integration_service = service;
        serviceTrackerGr.integrations_job_tracker = jobId;
        serviceTrackerGr.state = 'pending';
        serviceTrackerGr.insert();
    },

    createImportSet: function(tableName, mode, shortDescription) {
        var importSetGr = new GlideRecord('sys_import_set');
        importSetGr.initialize();
        importSetGr.table_name = tableName;
        importSetGr.mode = mode;
        importSetGr.short_description = shortDescription;
        return importSetGr.insert();
    },

    getLastSuccessfulServiceRunDate: function(service) {
        var serviceTrackerGr = new GlideRecord('sn_sap_data_int_integration_service_job_tracker');
        serviceTrackerGr.addQuery('integration_service', service);
        serviceTrackerGr.addQuery('state', 'complete');
        serviceTrackerGr.orderByDesc('load_started_at');
        serviceTrackerGr.query();
        if (!serviceTrackerGr.next())
            return '';
        return serviceTrackerGr.getDisplayValue('integrations_job_tracker.job_start_time');
    },

    transformImportSet: function(importSetId) {
        var importSetGr = new GlideRecord("sys_import_set");
        importSetGr.addQuery("sys_id", importSetId);
        importSetGr.query();
        if (importSetGr.next()) {
            var importSetRun = new GlideImportSetRun(importSetId);
            var importLog = new GlideImportLog(importSetRun, "Integrations Transform");
            var transformer = new GlideImportSetTransformer();
            transformer.setLogger(importLog);
            transformer.setImportSetRun(importSetRun);
            transformer.setSyncImport(true);
            transformer.setImportSetID(importSetId);
            transformer.transformAllMaps(importSetGr);
        }
    },

    isFullPull: function(fullPull, modifiedDate) {
        var propertyValue = 'true';
        if (!gs.nil(fullPull) && propertyValue == fullPull.toLowerCase()) {
            return true;
        } else if (gs.nil(modifiedDate)) {
            return true;
        } else {
            return false;
        }
    },

    getPulledTodo: function(todoID) {
        var todoObj = {
            description: "",
            url: "",
            finished: false,
            createdTime: ""
        };
        var pullGr = new GlideRecord('sn_hr_integr_fw_todo_inbound');
        if (pullGr.get(todoID) && pullGr.canRead()) {
            todoObj.description = pullGr.getValue("todo_description");
            todoObj.url = pullGr.getValue("todo_url");
            todoObj.finished = (pullGr.getValue("todo_state") == 3);
        }

        return todoObj;
    },

    isNotRunning: function(source) {
        if (!gs.nil(source)) {
            var job = new GlideAggregate('sn_sap_data_int_integration_job_tracker');
            job.addQuery('state', 'running').addOrCondition('state', 'hold');
            job.addEncodedQuery('source.sys_id=' + source);
            job.orderByDesc('job_start_time');
            job.query();

            if (!job.next()) {
                return true;
            }
            return false;

        } else {
            throw ("Source is Empty, Please try again");
        }
    },

    getTransformHelper: function(sourceRecord, extensionName) {
        var source = sourceRecord.source;
        if (gs.nil(source))
            return;
        var extensionCacheKey = source + "_" + extensionName;
        if (!gs.nil(IntegrationsUtilSNC.extension) && !gs.nil(IntegrationsUtilSNC.extension[extensionCacheKey])) {
            return IntegrationsUtilsSNC.extension[extensionCacheKey];
        }
        var ep = new GlideScriptedExtensionPoint().getExtensions(extensionName);
        for (var i = 0; i < ep.length; i++) {
            if (ep[i].canHandle(sourceRecord)) {
                if (gs.nil(IntegrationsUtilSNC.extension)) {
                    IntegrationsUtilSNC.extension = {};
                }
                IntegrationsUtilsSNC.extension[extensionCacheKey] = ep[i];
                return ep[i];
            }
        }
    },

    parseExecuteRFC: function(inputJsonReponse, inputDelimiter) {
        if (Object.keys(inputJsonReponse).length == 0) {
            throw new Error("Null Json passed.");
        } else {
            var responseCountObject, inputJsonCount;
            inputDelimiter = inputDelimiter.toString().trim();
            var inputData = inputJsonReponse.IT_DATA;
            var responseJsonList = [];
            responseCountObject = inputData[0];
            inputJsonCount = (responseCountObject.WA).split(":")[1];
            for (var iterator = 1; iterator < inputData.length; iterator++) {
                var tempJson = [];
                for (var loopingIterator = 0; loopingIterator < Object.keys(inputData[iterator]).length; loopingIterator++) {
                    var parentKey = '';
                    if (loopingIterator == 0) parentKey = "WA";
                    else parentKey = "WA" + loopingIterator;
                    if (gs.nil(JSON.stringify(inputData[iterator][parentKey])) || JSON.stringify(inputData[iterator][parentKey]) == 'null') {
                        break;
                    }
                    var tempKeyValues = JSON.parse(JSON.stringify(inputData[iterator][parentKey])).toString().split(inputDelimiter);
                    var tempArray = {};
                    for (var tempArrayIterator = 0; tempArrayIterator < tempKeyValues.length; tempArrayIterator++) {
                        var keyValuePair = tempKeyValues[tempArrayIterator];
                        tempArray[(keyValuePair.split(":")[0])] = (keyValuePair.split(":")[1]);
                        tempArray = this.trimInputs(tempArray);
                    }
                    if (!Object.keys(tempArray).length == 0) {
                        tempJson.push(JSON.stringify(tempArray));
                    }
                }
                responseJsonList.push(tempJson.join("").replace(/{}/g, "").replace(/}{/g, ","));
            }
            var returnArray = {};
            returnArray["JSONOBJECT"] = (this.seggregateArr(responseJsonList));
            returnArray["ROWCOUNT"] = inputJsonCount;
            return returnArray;
        }
    },

    trimInputs: function(inputs) {
        for (var key in inputs) {
            if (typeof(inputs[key]) == 'string') {
                inputs[key] = inputs[key].trim();
            }
        }
        return inputs;
    },

    seggregateArr: function(jsonString) {
        var arr = [];
        for (var i = 0; i < jsonString.length; i++) {
            arr.push(JSON.parse(jsonString[i]));
        }
        return arr;
    },

    getLocationName: function(street, city, state, zip) {
        var location_name = [street, city, state].filter(function(val) {
            return !gs.nil(val);
        }).join(',');
        location_name = [location_name, zip].filter(function(val) {
            return !gs.nil(val);
        }).join(' ');
        return location_name;
    },

    checkForSupplierLocation: function(supplierID) {
        var gr_supp = new GlideAggregate('sn_supplier_m2m_location');
        gr_supp.addQuery('supplier', supplierID);
        gr_supp.addQuery('is_headquarters', true);
        gr_supp.query();
        return gr_supp.next();
    },

    updateLocation: function(location_id, location_details) {
        var gr_loc = new GlideRecord('cmn_location');
        gr_loc.addQuery('sys_id', location_id);
        gr_loc.query();
        if (gr_loc.next()) {
            gr_loc.street = location_details.street;
            gr_loc.city = location_details.city;
            gr_loc.state = location_details.state;
            gr_loc.zip = location_details.zip;
            gr_loc.country = location_details.country;
            gr_loc.name = location_details.name;
            gr_loc.fax_phone = location_details.fax_phone;
            gr_loc.phone = location_details.phone;
            if (gr_loc.update() == null) {
                gs.error("Error while updating the location id " + location_id);
            }
        }
    },

    getLocationID: function(location_details) {
        var gr_location = new GlideAggregate('cmn_location');
        gr_location.addQuery('street', location_details.street);
        gr_location.addQuery('city', location_details.city);
        gr_location.addQuery('state', location_details.state);
        gr_location.addQuery('zip', location_details.zip);
        gr_location.addQuery('country', location_details.country);
        gr_location.query();
        if (gr_location.next()) {
            return gr_location.getUniqueValue();
        } else {
            return null;
        }
    },

    createLocation: function(location_details) {
        var loc = new GlideRecord('cmn_location');
        loc.initialize();
        loc.street = location_details.street;
        loc.city = location_details.city;
        loc.state = location_details.state;
        loc.zip = location_details.zip;
        loc.country = location_details.country;
        loc.name = location_details.name;
        loc.fax_phone = location_details.fax_phone;
        loc.phone = location_details.phone;
        if (loc.insert() != null) {
            return loc;
        } else {
            gs.error("Error occurred while creating the location");
        }
    },

    createSupplierLocation: function(supSysId, locSysId) {
        if (!gs.nil(locSysId) || !gs.nil(supSysId)) {
            var supp_loc = new GlideRecord('sn_supplier_m2m_location');
            supp_loc.initialize();
            supp_loc.location = locSysId;
            supp_loc.supplier = supSysId;
            supp_loc.is_headquarters = true;
            supp_loc.insert();
            return supp_loc;
        } else {
            throw "Mandatory field(s) Suppier or Location cannot be blank.";
        }
    },

    updateSupplierLocation: function(supSysId, locSysId) {
        var supp_loc = new GlideRecord('sn_supplier_m2m_location');
        supp_loc.addQuery('supplier', supSysId);
        supp_loc.addQuery('is_headquarters', true);
        supp_loc.query();
        if (supp_loc.next()) {
            supp_loc.location = locSysId;
            if (supp_loc.update() == null) {
                gs.error("Error occurred while updating the sn_supplier_m2m_location");
            }
        }
    },


    increaseCount: function(recordSysId) {
        var batchCountResumeCounter = 0,
            completedCountResumeCounter = 0;
        var gr = new GlideRecord("sn_sap_data_int_integration_service_job_tracker");
        gr.get(recordSysId);
        var grMessage = (gr.helper_notes_field.getJournalEntry(-1)).split("\n\n");
        for (var i = 0; i < grMessage.length; i++) {
            if (grMessage[i].indexOf("INCREASE BATCH COUNT") != -1) {
                batchCountResumeCounter++;
            }
            if (grMessage[i].indexOf("INCREASE COMPLETE COUNT") != -1) {
                completedCountResumeCounter++;
            }
        }
        var batchCountResumeValue = GlideApplicationProperty.getValue("sn_sap_data_int.Subflow.Resume.Count");
        while (batchCountResumeCounter > batchCountResumeValue) {
            batchCountResumeCounter = batchCountResumeCounter - batchCountResumeValue;
        }
        gr.resume_count = batchCountResumeCounter;
        gr.completed_count = completedCountResumeCounter;
        gr.update();
        return true;
    },

    getIntegrationService: function(jobTracker) {
        var obj = {};
        var setList = [];
        var importSetTables = [];
        var gr = new GlideRecord('sn_sap_data_int_integration_service_job_tracker');
        if (gr.get(jobTracker)) {
            if (!gs.nil(gr.getValue('sets')))
                setList = gr.getValue('sets').split(",");
            var serviceId = gr.getValue('integration_service');
        }
        var service = new GlideRecord('sn_sap_data_int_integrations_service');
        if (service.get(serviceId))
            importSetTables = service.getValue('import_set_tables').split(",");
        obj['set_list'] = setList;
        obj['import_set_tables'] = importSetTables;
        return obj;
    },
    type: 'IntegrationsUtilsSNC'
};