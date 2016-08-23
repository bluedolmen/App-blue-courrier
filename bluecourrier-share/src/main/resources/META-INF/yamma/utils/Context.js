Ext.define('Yamma.utils.Context', {

	config : {
		// Generic context
		title : null,
		
		// Service-based (tray) context
		service : null,
		state : null,
		kind : null,
		/**
		 * Trays are deprecated and are replaced by kind.
		 * The incoming and outgoing mail locations are not fixed anymore.
		 * @deprecated
		 */
		tray : null,
		
		// Task-based context
		tasks : null,
		
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
	
	isServiceBased : function() {
		
		return !!this.getService();
		
	},
	
	isKindBased : function() {
		return !!this.getKind();
	},
	
	isStateBased : function() {
		
		return !!this.getState();
		
	},

	/**
	 * @deprecated
	 * @returns {Boolean}
	 */
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
	
	isTaskBased : function() {
		
		return null != this.getTasks();
		
	},
	
	/**
	 * Abstract the form of the service either as an object
	 * or as a string to get the service name
	 */
	getServiceName : function() {
	
		var service = this.getService();
		if (!service) return null;
		
		var 
			services = Ext.Array.map([].concat(service), function(service) {
				return Ext.isString(service) ? service : service.serviceName;
			})
		;
		
		return services.join(',');
		
	},
	
	getDocumentDatasourceFilters : function() {
		
		var filters = [].concat(this.getFilters());
		
		var stateFilter = this.getStateFilter();
		if (stateFilter) filters.push(stateFilter);
		
		var trayFilter = this.getTrayFilter();
		if (trayFilter) filters.push(trayFilter);

		var serviceFilter = this.getServiceFilter();
		if (serviceFilter) filters.push(serviceFilter);
		
		var kindFilter = this.getKindFilter();
		if (kindFilter) filters.push(kindFilter);
		
		return filters;		
	},
	
	/**
	 * @deprecated
	 * @returns
	 */
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
		
		var serviceName = this.getServiceName();
		return {
			property : 'site',
			value : serviceName
		};
		
	},
	
	getStateFilter : function() {
		
		var state = this.getState();
		if (!state) return null;
		
		return ({
			property : 'state',
			value : state
		});
		
	},
	
	getKindFilter : function() {
		
		var kind = this.getKind();
		if (!kind) return null;
		
		return ({
			property : 'kind',
			value : kind
		});
		
	},
	
	getLabel : function() {
		
		if (this.isAdvancedSearchBased()) {
			return i18n.t('utils.context.label.advancedsearch');//"Recherche avancée";
		}
		
		if (this.isTaskBased()) {
			return i18n.t('utils.context.label.mytask');
		}
		
		var title = this.getTitle();
		if (title != null) return title;
		
		var tray = this.getTray();
		if (tray != null) {
			var service = this.getService();
			
			return Ext.String.format(
				i18n.t('utils.context.label.tray'),
				tray.label || '',
				service.label || ''
			);
		}
		
		return i18n.t('utils.context.label.default');
	},
	
	merge : function(context) {
		
		if (null == context) return this;
		
		var
			filters = this.getFilters() ||  [],
			otherFilters = context.getFilters() || [],
			filtersByProps = {}
		;
		
		this.setConfig(context.config);
		
		/* order of concat is important in order to override values */
		Ext.Array.forEach(filters.concat(otherFilters) , function(filter) {
			filtersByProps[filter.property] = filter;
		});
		
		this.filters = Ext.Object.getValues(filtersByProps);
		
		return this;
		
	}
	
});