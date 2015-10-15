Ext.define('Yaecma.controller.navigator.NavigatorController', {
	
	extend : 'Ext.app.Controller',
	
	refs : [
		{
			ref : 'navigator',
			selector : 'navigator'
		},
		{
			ref : 'documentsView',
			selector : 'documentsview'
		}		
	],
	
	init: function() {
		
		this.control({
			
			'documentsview' : {
				changecontainer : this.onChangeContainer
			}
			
		});
		
		this.callParent();
	},	
	
	onChangeContainer : function(nodeRef, parentRef) {
		
		var
			navigator = this.getNavigator()
		;
			
		Ext.defer(
			function() {
				navigator.expandTo(nodeRef, parentRef, true /* suppressEvent */);
			},
			50
		);
		
	}	
	
	
	
});