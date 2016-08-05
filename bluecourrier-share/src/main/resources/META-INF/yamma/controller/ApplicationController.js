Ext.define('Yamma.controller.ApplicationController', {
	
	extend : 'Ext.app.Controller',
	
	uses : [
	    'Yamma.utils.LicenseManager'
	],
	
	refs : [
	
	    {
			ref : 'aboutDialog',
	    	selector : 'aboutdialog'
	    }
	    
	],
	
	init: function() {
		
		var me = this;
		
		this.control({
		});
		
		function showAboutDialog() {
			Ext.Function.defer(function() {
				Yamma.view.dialogs.AboutDialog.getInstance().show();
			}, 10);
		}
		
		Yamma.utils.LicenseManager.on('expired', function onExpiredLicense(validUntilDate) {
			me.application.fireEvent('expired', validUntilDate);
			showAboutDialog();
		}, me);
		
		Yamma.utils.LicenseManager.on('invalid', function onInvalidLicense() {
			me.application.fireEvent('invalid');
			showAboutDialog();
		}, this);
		
		this.application.on({
		});
		
		var 
			runner = new Ext.util.TaskRunner(),
			task = runner.start({
				run: function () {
					Yamma.utils.LicenseManager.isLicenseValid();
					this.interval = Ext.Number.randomInt(1,6) * 1000 * 60 * 10;
				},
				interval: 1000 * 60 * 60
			})
		;
		
	}
	
});