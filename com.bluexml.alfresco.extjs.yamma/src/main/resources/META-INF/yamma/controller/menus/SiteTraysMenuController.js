Ext.define('Yamma.controller.menus.SiteTraysMenuController', {
	
	extend : 'Yamma.controller.menus.MainMenuController',
	
	init: function() {
		
		this.control({
			'sitetraysmenu': {
				itemclick : this.onItemClick
			}
		});
		
		this.callParent();
	},
	
	extractContext : function(record) {
		
		if (!record) return {};
		
		var 
			context = Ext.create('Yamma.utils.Context'),
			stateId = null
		;
		
		// Iterates through ancestors to get the hierarchical context
		for (var iterator = record; null != iterator ; iterator = iterator.parentNode) {
			
			type = iterator.get('type');
			if ('st:site' === type) {
				var serviceLabel = iterator.get('text');
				
				context.setService({
					label : serviceLabel,
					serviceName : serviceName = iterator.get('name'),
					nodeRef : iterator.get('id')
				});
				
				if (stateId) {
					// Delayed to get the service label...
					var stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId];
					
					context.setTitle(
						Ext.String.format(
							"Documents du service '{0}' ayant l'état '{1}'",
							serviceLabel,
							stateDefinition.shortTitle
						)
					);
				}

			} else if ('tray' === type) {
				
				context.setTray({
					label : iterator.get('text'),
					trayName : iterator.get('name'),
					nodeRef : iterator.get('id')
				});
				
			} else if ('state-tray' === type) {
				
				stateId = iterator.get('name');
				context.setFilters([
					{
						property : 'state',
						value : stateId
					}				                    
				]);
				
			}
		}
		
		return context;
		
		
	}
	
	
});