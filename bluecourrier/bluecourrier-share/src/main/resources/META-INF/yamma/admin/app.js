Ext.Loader.setConfig(
	{
		enabled : true,
		disableCaching : false,
		paths : {
			'Yamma' : '/share/res/yamma',
			'Yaecma' : '/share/res/yaecma',
			'Bluedolmen' : '/share/res/bluedolmen',
			'Ext' : '/extjs/src'
		}
	}
);

Ext.require([
	'Ext.window.MessageBox',
	
	'Bluedolmen.store.AlfrescoStore',
	'Bluedolmen.utils.alfresco.Alfresco',
	'Bluedolmen.utils.DirtyManager',
	'Bluedolmen.utils.tab.Tool',
	'Bluedolmen.utils.grid.column.HeaderImage',
	'Bluedolmen.utils.Constants',
	'Bluedolmen.utils.alfresco.config.AppConfigFactory',
	
	'Yamma.utils.Constants',
	'Yamma.utils.Services',
	'Yamma.utils.Preferences'
	
	
//	'Yaecma.utils.Constants'
], function() {
	Ext.useShims = true;//Ext.isIE;
	
	Bluedolmen.utils.alfresco.config.AppConfigFactory.initConfigs({
		'bluecourrier.client' : 'Yamma.config.client',
		'bluecourrier.bluecourrier' : 'Yamma.config'
	}, initApplication /* callback */);
	
});

function initApplication() {

		Ext.require('Yamma.admin.AdminDesktop');
		var adminDesktopApp;
		Ext.onReady(function () {
		    adminDesktopApp = new Yamma.admin.AdminDesktop();
		});	
}
