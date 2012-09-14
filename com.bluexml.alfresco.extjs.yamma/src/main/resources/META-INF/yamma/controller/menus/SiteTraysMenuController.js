Ext.define('Yamma.controller.menus.SiteTraysMenuController', {
	
	extend : 'Yamma.controller.menus.MainMenuController',
	
	init: function() {
		
		this.control({
			'sitetraysmenu': {
				itemclick : this.onItemClick
			}
		});
		
	},
	
	extractContext : function(record) {
		
		if (!record) return {};
		
		var context = Ext.create('Yamma.utils.Context');
		
		// Iterates through ancestors to get the hierarchical context
		for (var iterator = record; null != iterator ; iterator = iterator.parentNode) {
			
			var type = iterator.get('type');
			if ('st:site' === type) {
				context.setService({
					label : iterator.get('text'),
					serviceName : iterator.get('name'),
					nodeRef : iterator.get('id')
				});
			} else if ('tray' === type) {
				context.setTray({
					label : iterator.get('text'),
					trayName : iterator.get('name'),
					nodeRef : iterator.get('id')
				});
			} else if ('state-tray' === type) {
				
				var 
					stateId = iterator.get('name'),
					stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId],
					serviceName = iterator.parentNode.get('text'); // TODO: This method is weak
				;
				
				context.setTitle(
					Ext.String.format(
						"Documents du service '{0}' ayant l'état '{1}'",
						serviceName,
						stateDefinition.shortTitle
					)
				);
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