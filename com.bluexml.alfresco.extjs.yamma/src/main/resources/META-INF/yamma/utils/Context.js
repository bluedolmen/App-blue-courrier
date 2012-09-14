Ext.define('Yamma.utils.Context', {

	config : {
		// Generic context
		title : null,
		
		// Service-based (tray) context
		service : null,
		tray : null, 
		
		// Filter-based context
		filters : [],
		
		// Advanced-search context
		query : null,
		term : null
	},
	
	constructor : function(config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	
	isTrayBased : function() {
		
		return !!(this.getService() || this.getTray());
		
	},
	
	isAdvancedSearchBased : function() {
		
		return !!(this.getQuery() || this.getTerm());
		
	},
	
	/**
	 * Beware! isFitlerBased() returns true based on the
	 * declared filters, not the implied ones (tray and service)
	 * 
	 * @return {Boolean}
	 */
	isFilterBased : function() {
		
		var localFilters = this.getFilters();
		return (localFilters && localFilters.length > 0);
		
	},
	
	getDocumentDatasourceFilters : function() {
		
		var filters = [].concat(this.getFilters());
		
		var trayFilter = this.getTrayFilter();
		if (trayFilter) filters.push(trayFilter);

		var serviceFilter = this.getServiceFilter();
		if (serviceFilter) filters.push(serviceFilter);
		
		return filters;		
	},
	
	getTrayFilter : function() {
		
		var tray = this.getTray();
		if (!tray) return null;
			
		var trayName = tray.trayName;
		return {
			property : 'tray',
			value : trayName
		};
		
	},
	
	getServiceFilter : function() {
		
		var service = this.getService();
		if (!service) return null;
		
		var serviceName = service.serviceName;
		return {
			property : 'site',
			value : serviceName
		};
		
	},
	
	getLabel : function() {
		
		var title = this.getTitle();
		if (title != null) return title;
		
		var tray = this.getTray();
		if (tray != null) {
			var service = this.getService();
			
			return Ext.String.format(
				'Bannette {0} du service {1}',
				tray.label || '',
				service.label || ''
			);
		}
	}
	
});