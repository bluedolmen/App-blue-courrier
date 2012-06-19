Ext.define('Bluexml.utils.alfresco.forms.EditFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.editformframe',
	
	statics : {
		WS_URL : '/share/page/standaloneeditform' + 
		'?nodeRef={nodeRef}' +
		'&site={site}' +
		'&redirect={redirect}'
	},
	
	getSourceUrl : function() {
		
		var nodeRef = this.getNodeRef();
		if (!nodeRef) throw new Error('IllegalStateException! The nodeRef must be defined');
		
		var url = 
			Bluexml.utils.alfresco.forms.EditFormFrame.WS_URL
				.replace(/\{nodeRef\}/, this.getNodeRef());
		return url;
	},
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});