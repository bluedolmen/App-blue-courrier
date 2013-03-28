Ext.define('Bluexml.view.utils.PreviewFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	alias : 'widget.previewframe',
	
	PREVIEW_PAGE_URL : '/share/page/extjspreview?nodeRef={nodeRef}',
	EMBED_PAGE_URL : '/share/page/extjsembedpdf?nodeRef={nodeRef}',
	CONTENT_WS_URL : 'aflresco://api/node/content/',
	
	config : {
		nodeRef : null,
		mimeType : null,
		managePdf : true
	},
	
	constructor : function(config) {

		this.initConfig(config || {});
		this.setAutoScroll(false);
		this.callParent();
		
	},
	
	load : function(config) {
		
		config = config || {};
		var nodeRef = Ext.isString(config) ? config : config.nodeRef;
		if (nodeRef) {
			this.setNodeRef(nodeRef);		
			this.setMimeType(config.mimetype || config.mimeType);
		}		
		
		var url = this.getContentUrl();
		this.setSrc(url);
		
	},
	
	refresh : function() {		
		this.load();
	},
			
	getContentUrl : function() {
		var nodeRef = this.getNodeRef();
		if (!nodeRef) {
			Ext.Error.raise('IllegalStateException! The nodeRef is not available but is mandatory.');
		}		
		
		var url = this.PREVIEW_PAGE_URL.replace(/\{nodeRef\}/, nodeRef); // default delegate previsualisation to Alfresco

		switch (this.getMimeType()) {
			
			case 'application/pdf':
				if (this.getManagePdf() === true) {
					url = this.EMBED_PAGE_URL.replace(/\{nodeRef\}/, nodeRef); 
				}
			break;
			
			case 'message/rfc822':
			case 'text/plain':
			case 'text/html':
				url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					'alfresco://api/node/' + nodeRef.replace(':/','') + '/content/thumbnails/html?c=force'
				);
			break;
			
		}		
		
		return url;
	}
	
	
});