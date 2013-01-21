Ext.Loader.setConfig(
	{
		enabled : true,
		disableCaching : false,
		paths : {
			'Yamma' : '/share/res/yamma',
			'Yaecma' : '/share/res/yaecma',
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
	'Bluexml.utils.Constants',
	
	'Yamma.utils.Constants',
	'Yamma.utils.Services',
	'Yamma.utils.Preferences',
	'Yamma.utils.grid.MailsViewGrouping',
	
	'Yaecma.utils.Constants'
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
				'menus.SiteArchivesMenuController',
				'menus.MyMenuController',
				
				'menus.AdvancedSearchMenuController',
				'charts.StatesStatsViewController',
				'MailsViewController',
				'button.UploadButtonController',
				'ReferencesViewController',
				'display.DisplayViewController',
				'comments.CommentsViewController',
				'attachments.AttachmentsViewController'
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
