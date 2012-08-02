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
	'Ext.window.MessageBox',
	'Bluexml.store.AlfrescoStore',
	'Bluexml.utils.alfresco.Alfresco',
	'Bluexml.utils.DirtyManager',
	'Bluexml.utils.tab.Tool',
	'Bluexml.utils.grid.column.HeaderImage',
	'Yamma.utils.Constants',
	'Yamma.utils.grid.MailsViewGrouping'
], function() {
	initApplication();
});

function initApplication() {

	Ext.application(
		{
			requires : [
				
			],
			
			name : 'Yamma',
			appFolder : '/share/res/yamma',
			
			controllers : [
				'header.OpenSearchController',
				'menus.SiteTraysMenuController',
				'menus.MyMenuController',
				'menus.AdvancedSearchMenuController',
				'charts.StatesStatsViewController',
				'MailsViewController',
				'ReferencesViewController',
				'display.DisplayViewController'
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
