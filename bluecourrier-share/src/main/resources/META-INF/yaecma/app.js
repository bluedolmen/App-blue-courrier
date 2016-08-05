Ext.Loader.setConfig(
	{
		enabled : true,
		disableCaching : false,
		paths : {
			'Ext' : '/scripts/extjs/src',
			'Bluedolmen' : '/share/res/bluedolmen',
			'Yaecma' : '/share/res/yaecma'
		}
	}
);

Ext.require([
	'Ext.window.MessageBox',
	'Bluedolmen.store.AlfrescoStore',
	'Bluedolmen.utils.alfresco.Alfresco',
	'Bluedolmen.utils.grid.column.HeaderImage',
	'Bluedolmen.utils.Constants',
	'Yaecma.utils.Constants'
], function() {
	initApplication();
});

function initApplication() {

	Ext.application({
		
		name : 'Yaecma',
		appFolder : '/share/res/yaecma',
		
		models : [
			'children.Item'
		],
		
		controllers : [
			'navigator.NavigatorController',
			'documents.DocumentsViewController',
			'header.QuickSearchController'
		],
		
		stores : [
			'children.Store'
		],
		
		autoCreateViewport : true,
		
		launch : function() {
			this.hideLoadingMask();
			return true;
		},
		
		hideLoadingMask : function() {
		    Ext.get('loading-mask').fadeOut({remove:true});			
		    Ext.get('loading').remove();			
		}
		
	});
	
}
