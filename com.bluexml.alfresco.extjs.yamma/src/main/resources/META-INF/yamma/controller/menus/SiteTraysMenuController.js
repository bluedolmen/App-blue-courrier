Ext.define('Yamma.controller.menus.SiteTraysMenuController', {
	
	extend : 'Yamma.controller.menus.ClosingMenuController',
	
	
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
		
		for (var iterator = record; null != iterator ; iterator = iterator.parentNode) {
			var type = iterator.get('type');
			if ('st:site' === type) {
				context.setService({
					label : iterator.get('text'),
					nodeRef : iterator.get('id')
				});
			} else if ('tray' === type) {
				context.setTray({
					label : iterator.get('text'),
					nodeRef : iterator.get('id')
				});
			}			
		}
		
		return context;
		
	}
	
	
});