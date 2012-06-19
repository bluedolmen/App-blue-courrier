Ext.define('Bluexml.view.utils.DownloadFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	
	singleton : true,
	
	renderTo : Ext.getBody(),
	hidden : true,
	
	download : function(uri) {
		if (!uri) return;
		
		this.setSrc(uri);
	}
	
});