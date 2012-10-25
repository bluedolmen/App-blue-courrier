Ext.define('Yamma.controller.menus.MyMenuController', {
	
	extend : 'Yamma.controller.menus.MainMenuController',
	
	init: function() {
		
		this.control({
			'mymenu': {
				itemclick : this.onItemClick
			}
		});
		
		this.callParent();
	},	
	
	extractContext : function(record, item) {
		
		if (!record) return {};
		
		var 
			context = null,
			nodeId = record.get('id'),
			text = record.get('text')
		;
		
		if (!nodeId) return;
		
		if (0 == nodeId.indexOf('myDocuments!')) {
			context = this.getMyDocumentsContext(nodeId, text);
		} else if (0 == nodeId.indexOf('myActions!')) {
			context = this.getMyActionsContext(nodeId, text);
		}
		
		return context;
		
	},
	
	getMyDocumentsContext : function(id, title) {
		
		var
			context = Ext.create('Yamma.utils.Context'),
			matchState = /state!(.*)/.exec(id) || [],
			stateId = matchState[1],
			matchLate = /late!(.*)/.exec(id) || [],
			lateState = matchLate[1] !== 'false',
			filters = [
				{
					property : 'mine',
					value : true // fake value
				}
			]
		;
				
		
		if (stateId) {
			
			filters.push(
				{
					property : 'state',
					value : stateId
				}					
			);
			
		} else if (lateState) {
			
			filters.push(
				{
					property : 'late',
					value : true
				}
			);			
			
		}
		
		context.setTitle(title);
		context.setFilters(filters);
		
		return context;
	},
	
	getMyActionsContext : function(id, title) {
		
		var
			context = Ext.create('Yamma.utils.Context'),
			matchAction = /myActions!(.*)/.exec(id) || [],
			actionId = matchAction[1],
			filters = [
				{
					property : 'mine',
					value : true // fake value
				},
				{
					property : 'can',
					value : actionId
				}
			]
		;
		
		context.setTitle(title);
		context.setFilters(filters);
		
		return context;
	}
	
	
});