/**
 * Override the ExtJS Loader internal method to add a forced timestamping based
 * on the Software revision (or on build-date if unavailable).
 * <p>
 * In future versions, ExtJS may support the customization of the timestamping (_dc),
 * but in the currently used version (4.2.1), this customization is not supported.
 * 
 * *MUST BE* set before using the ExtJS loader
 * 
 */
(function overrideLoaderTimestamping() {
	
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
	
})();

Ext.Loader.setConfig(
	{
		enabled : true,
		disableCaching : false,
		paths : {
			'Yamma' : '/share/res/yamma',
			'Yaecma' : '/share/res/yaecma',
			'Bluedolmen' : '/share/res/bluedolmen',
			'Ext.ux' : '${extjs.ux.path}',
			'Ext' : '${extjs.root.path}'
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
	
	Ext.useShims = true;
	
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
			    'ApplicationController',
				'header.OpenSearchController',
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
				console.log("sessionStorage : " + sessionStorage['reload']);
				var IEVersion = this.detectIE(window.navigator.userAgent);
				if (IEVersion && IEVersion <= 11) {
					console.log("IE version <= : " + IEVersion);
					window.location.reload(true);

					if(!sessionStorage['reload']) {
						console.log("Reloading IE for the first time.");
						sessionStorage['reload'] = true;
						window.location.reload(true);
					}

				}
			},

			detectIE : function(ua) {
			  var msie = ua.indexOf('MSIE ');
			  if (msie > 0) {
			    // IE 10 or older => return version number
			    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			  }

			  var trident = ua.indexOf('Trident/');
			  if (trident > 0) {
			    // IE 11 => return version number
			    var rv = ua.indexOf('rv:');
			    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			  }

			  var edge = ua.indexOf('Edge/');
			  if (edge > 0) {
			    // Edge (IE 12+) => return version number
			    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
			  }

			  // other browser
			  return false;
			}
		}
	);
	
}
