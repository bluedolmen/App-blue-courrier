Ext.define('Yamma.view.gridactions.GridAction', {

	statics : {
		ICON : Yamma.Constants.getIconDefinition('lorry_go'),
		LABEL : 'Distribuer le document',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_DISTRIBUTE,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/distribute'
	},
	
	getActionDefinition : function() {
		
	},
	
	isAvailable : function(record) {
		
	},
	
	onActionLaunched : function(grid, rowIndex, colIndex, item, e) {
		var 
			record = grid.getStore().getAt(rowIndex),
			parameters = this.getParameters(record)
		;
		
		this.performAction.call(this, parameters);
	},
	
	getParameters : function(record) {
		return[];
	},
	
	performAction : function(/* arguments */) {
		
	}
	
}, function() {
	
});