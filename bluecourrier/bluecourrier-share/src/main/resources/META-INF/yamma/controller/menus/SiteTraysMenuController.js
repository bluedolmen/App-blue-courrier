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
	
	onItemClick : function(view, node, item, index, event, eOpts) {

		var disabled = node.get('disabled');
		if (disabled) return;
		
		this.callParent(arguments);		
		
	},	
	
	extractContext : function(record, context) {
		
		if (!record) return {};
		
		var filters = record.get('filters');
		if (filters) {
			
			if (filters.type) {
				context.setKind(filters.type);
			}
			
			if (filters.state) {
				context.setState(filters.state);
			}
			
		}

		// BEWARE ! DEPRECATED		
		// The 'kind' hierarchical "method" is deprecated and kept for backward compatibility
		
		var 
			stateId = null,
			kind = null
		;
		
		// Iterates through ancestors to get the hierarchical context
		for (var iterator = record; null != iterator ; iterator = iterator.parentNode) {
			
			kind = iterator.get('kind');
			
			switch (kind) {
			
			case 'st:site':
				
				var serviceLabel = iterator.get('text');
				
				context.setService({
					label : serviceLabel,
					serviceName : iterator.get('name'),
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
				
				return context; // end on the first site (if hierarchical)
				
			break;
			
			case 'tray':
				
				var trayName = iterator.get('id').split('|')[1];
				context.setTray({
					label : iterator.get('text'),
					trayName : trayName
				});
				
			break;
				
			case 'state-tray':
				
				stateId = iterator.get('id').split('|')[1];
				context.setState(stateId);
				
			break;
				
			}
			
		}
		
		return context;
		
		
	}
	
	
});