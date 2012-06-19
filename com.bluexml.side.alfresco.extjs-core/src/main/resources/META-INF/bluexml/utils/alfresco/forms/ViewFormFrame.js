/**
 * BE CAREFUL! THIS CLASS IS NOT USED IN THE BRITAIR PROJECT 
 */
Ext.define('Bluexml.utils.alfresco.forms.ViewFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.viewformframe',
	
	statics : {
		WS_URL : '/share/page/standaloneviewform' +
			'?nodeRef={nodeRef}' +
			'&site={site}'
	},
	
	getSourceUrl : function() {
		
		var nodeRef = this.getNodeRef();
		if (!nodeRef) throw new Error('IllegalStateException! The nodeRef must be defined');
		
		var url = 
			Bluexml.utils.alfresco.forms.ViewFormFrame.WS_URL
				.replace(/\{nodeRef\}/, nodeRef);
				
		return url;
	}
	
});