Ext.define('Yamma.utils.Context', {

	config : {
		title : null,
		tray : null,
		service : null,
		filters : []
	},
	
	getDocumentDatasourceFilters : function() {
		
		var filters = [].concat(this.getFilters());
		
		var trayFilter = this.getTrayFilter();
		if (trayFilter) filters.push(trayFilter);

		return filters;		
	},
	
	getTrayFilter : function() {
		
		var tray = this.getTray();
		if (!tray) return null;
			
		var trayNodeRef = tray.nodeRef;
		return {
			property : 'trayNodeRef',
			value : trayNodeRef
		};
		
	},
	
	getLabel : function() {
		
		var title = this.getTitle();
		if (title != null) return title;
		
		var tray = this.getTray();
		if (tray != null) {
			var service = this.getService();
			
			return Ext.String.format(
				'Banette {0} du service {1}',
				tray.label || '',
				service.label || ''
			);
		}
	}
	
});