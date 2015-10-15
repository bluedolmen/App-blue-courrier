(function() {	

	PriorityUtils = Utils.Object.create(DatalistUtils, {
			
		DATALIST_XPATH_LOCATION : '/app:company_home/st:sites/cm:' + YammaUtils.ConfigSite.name + '/cm:dataLists/cm:priority-levels',
		PROPERTY_NAME : YammaModel.PRIORITIZABLE_PRIORITY_PROPNAME		
		
	});

})();
