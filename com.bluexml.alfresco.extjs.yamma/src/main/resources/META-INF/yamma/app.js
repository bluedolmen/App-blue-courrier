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
]);


//Ext.require('Ext.selection.RowModel', function() {
//	// Hack fixing a bug in ExtJS 4.0.7
//	Ext.override(Ext.selection.RowModel, {
//		
//		onLastFocusChanged : function(oldFocused, newFocused, supressFocus) {
//			if (this.views && this.views.length) {
//				this.callOverridden(arguments);
//			}
//		},
//		
//		onSelectChange : function(record, isSelected, suppressEvent,
//				commitFn) {
//			if (this.views && this.views.length) {
//				this.callOverridden(arguments);
//			}
//		}
//		
//	});
//});

Ext.require('Ext.window.MessageBox', function() {
	// Localize some button labels to French
	Ext.MessageBox.buttonText.yes = "oui";
	Ext.MessageBox.buttonText.no = "non";	
});


Ext.application(
	{
		name : 'Yamma',
		appFolder : '/share/res/yamma',
		
		controllers : [
			'menus.MainMenuController',
			'MailsViewController',
			'EditDocumentViewController'
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
