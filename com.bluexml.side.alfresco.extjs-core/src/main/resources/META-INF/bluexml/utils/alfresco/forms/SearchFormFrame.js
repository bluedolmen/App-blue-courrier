Ext.define('Bluexml.utils.alfresco.forms.SearchFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.searchformframe',
	
	uses : [
		'Bluexml.Constants'
	],
	
	statics : {
		WS_URL : 
			'/share/page/britairsearchform' +
			'?siteId={site}' + 
			'&itemId={itemId}' +
			'&redirect={redirect}' +
			'&single=true'
	},
	
	getSourceUrl : function() {
		
		var itemId = this.getItemId();
		if (!itemId) throw new Error('IllegalStateException! The itemId must be defined');
		
		var url = 
			Bluexml.utils.alfresco.forms.SearchFormFrame.WS_URL
				.replace(/\{itemId\}/, itemId);
				
		return url;
	}
	
});