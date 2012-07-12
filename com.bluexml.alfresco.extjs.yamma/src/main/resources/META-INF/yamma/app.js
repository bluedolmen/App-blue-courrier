Ext.Loader.setConfig(
	{
		enabled : true,
		disableCaching : false,
		paths : {
			'Yamma' : '/share/res/yamma',
			'Bluexml' : '/share/res/bluexml',
			'Ext' : '/scripts/extjs/src'
		}
	}
);

Ext.require([
	'Bluexml.store.AlfrescoStore',
	'Bluexml.utils.alfresco.Alfresco',
	'Bluexml.utils.DirtyManager',
	'Yamma.utils.Constants'
], function() {
	initApplication();
});

function initApplication() {

	Ext.application(
		{
			name : 'Yamma',
			appFolder : '/share/res/yamma',
			
			controllers : [
				'menus.SiteTraysMenuController',
				'menus.MyMenuController',
				'MailsViewController',
				'EditDocumentViewController',
				'ReferencesViewController',
				'DisplayViewController',
				'charts.StatesStatsViewController'
			],
			
			autoCreateViewport : true,
			
			init : function() {
				//Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
			},
			
			launch : function() {
				this.hideLoadingMask();
				return true;
			},
			
			hideLoadingMask : function() {
			    Ext.get('loading-mask').fadeOut({remove:true});			
			    Ext.get('loading').remove();			
			}
		}
	);
	
}
