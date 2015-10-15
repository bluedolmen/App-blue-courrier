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
	
	extractContext : function(record, initialContext) {
		
		if (!record) return {};
		
		var 
			context = null,
			nodeId = record.getId(),
			text = record.get('text')
		;
		
		if (!nodeId) return;
		
		if (0 == nodeId.indexOf('myDocuments!')) {
			context = this.getMyDocumentsContext(initalContext, nodeId, text);
		} 
		else if (0 == nodeId.indexOf('myActions!')) {
			context = this.getMyActionsContext(initialContext, nodeId, text);
		}
		else if ('myTasks' == nodeId) {
			initialContext.setTasks('ALL');
		}
		
		return context;
		
	},
	
	getMyDocumentsContext : function(context, id, title) {
		
		var
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
	
	getMyActionsContext : function(context, id, title) {
		
		var
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