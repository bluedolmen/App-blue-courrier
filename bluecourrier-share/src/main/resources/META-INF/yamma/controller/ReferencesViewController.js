Ext.define('Yamma.controller.ReferencesViewController', {

	extend : 'Yamma.controller.MailSelectionAwareController',
	
	refs : [
	    {
	    	ref : 'referencesView',
	    	selector : 'referencesview'
	    }
	],
		
	onNewMailSelected : function(newMailRecord) {
		
		var nodeRef = newMailRecord.get('nodeRef');
		if (!nodeRef) return;		
		
		this.displayAttachedFiles(nodeRef);
		
		this.callParent(arguments);
	},
	
	onClearSelectedMail : function() {
		
		var referencesView = this.getReferencesView();
		if (referencesView) referencesView.getStore().removeAll();
		
		this.callParent(arguments);
		
	},
	
	displayAttachedFiles : function(nodeRef) {
		
		var referencesView = this.getReferencesView();
		if (!referencesView) return;
		
		var state = referencesView.getState();
		if (!state) return;
		
		var hasAttachedFiles = this.hasAttachedFiles(nodeRef);
		if (state.collapsed && hasAttachedFiles) {
			referencesView.collapse(Ext.Component.DIRECTION_LEFT);
			return;
		}
		
		if (!state.collapsed && !hasAttachedFiles) {
			referencesView.collapse(Ext.Component.DIRECTION_RIGHT);
			return;			
		}
		
	},
	
	hasAttachedFiles : function(nodeRef) {
		
		return false;
		
	}	
	
	
});