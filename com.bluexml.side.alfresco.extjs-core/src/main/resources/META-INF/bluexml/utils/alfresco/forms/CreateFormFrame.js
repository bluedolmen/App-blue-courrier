Ext.define('Bluexml.utils.alfresco.forms.CreateFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.createformframe',
	
	statics : {
		WS_URL : 
			'/share/page/standalonecreateform' +
			'?itemId={itemId}' +
			'&destination={destination}' +
			'&site={site}' +
			'&redirect={redirect}'
	},
	
	getSourceUrl : function() {
		
		var itemId = this.getItemId();
		if (!itemId) throw new Error('IllegalStateException! The itemId must be defined');
		
		var destination = this.getDestination();
		if (!destination) throw new Error('IllegalStateException! The destination must be defined');
		
		var url = 
			Bluexml.utils.alfresco.forms.CreateFormFrame.WS_URL
				.replace(/\{itemId\}/,  itemId)
				.replace(/\{destination\}/, destination);
				
		return url;
	},
	
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
});