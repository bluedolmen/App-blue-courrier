/**
 * Override the ExtJS Loader internal method to add a forced timestamping based
 * on the Software revision (or on build-date if unavailable).
 * <p>
 * In future versions, ExtJS may support the customization of the timestamping (_dc),
 * but in the currently used version (4.2.1), this customization is not supported.
 * 
 */
function overrideLoaderTimestamping() {
	
	if (undefined === bluecourrierClientConfig) return;
	
	var 
		loadScriptFile = Ext.Loader.loadScriptFile,
		revisionNumber = bluecourrierClientConfig.config['application.svnrev']
	;
	
	if (!revisionNumber || -1 != revisionNumber.indexOf('${')) { // not set correctly, relies on build-date
		revisionNumber = bluecourrierClientConfig.config['application.build-date'];
	}
	
	Ext.Loader.loadScriptFile = function(url, onLoad, onError, scope, synchronous) {
		
		if (-1 == url.indexOf('?') ) {
			url = url + '?_dc=' + revisionNumber;
		}
		
		loadScriptFile.apply(this, arguments);
		
	}
	
}

// MUST BE set before using the ExtJS loader
overrideLoaderTimestamping(); 

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
	// Missing ExtJS dependencies
	'Ext.data.ArrayStore',
	'Ext.data.Request', 
	'Ext.window.MessageBox',
	'Ext.layout.component.Body',
	'Ext.layout.Context',
	
	'Bluedolmen.store.AlfrescoStore',
	'Bluedolmen.utils.alfresco.Alfresco',
	'Bluedolmen.utils.DirtyManager',
	'Bluedolmen.utils.tab.Tool',
	'Bluedolmen.utils.grid.column.HeaderImage',
	'Bluedolmen.utils.Constants',
	'Bluedolmen.utils.alfresco.grid.GridUtils',
	'Bluedolmen.utils.alfresco.config.AppConfigFactory',
	
	'Yamma.utils.Constants',
	'Yamma.utils.Services',
	'Yamma.utils.Preferences',
	'Yamma.utils.datasources.Documents',
	'Yamma.utils.grid.MailsViewGrouping',
	'Yamma.utils.DeliveryUtils',
	
	'Yaecma.utils.Constants'
], function() {
	Ext.useShims = true;//Ext.isIE;
	
	Bluedolmen.utils.alfresco.config.AppConfigFactory.initConfigs({
		'bluecourrier.stats' : 'Yamma.config.stats',
		'bluecourrier.client' : 'Yamma.config.client',
		'bluecourrier.bluecourrier' : 'Yamma.config'
	}, initApplication /* callback */);
	
});

function initApplication() {

	Ext.application(
		{
			name : 'Yamma',
			appFolder : '/share/res/yamma',
			
			controllers : [
				'Yamma.controller.header.OpenSearchController',
				'menus.AdvancedSearchMenuController',
				
				'mails.MailsViewController',
				'mails.ThreadedViewController',
				'edit.EditDocumentViewController',
				'display.DisplayViewController',
				
				'attachments.AttachmentsViewController',
				
				'mails.MailFiltersViewController'
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
