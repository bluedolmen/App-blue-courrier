Ext.define('Bluexml.view.utils.PreviewFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	alias : 'widget.previewframe',
	
	PREVIEW_PAGE_URL : '/share/page/extjspreview?nodeRef={nodeRef}',
	EMBED_PAGE_URL : '/share/page/extjsembedpdf?nodeRef={nodeRef}',
	CONTENT_WS_URL : 'aflresco://api/node/content/',
	
	autoScroll : false,	
	
	config : {
		nodeRef : null,
		mimeType : null
	},
	
	constructor : function(config) {

		config = config || {};
		this.initConfig(config);
		
		this.callParent([config]);
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
		
		var url = null;

		switch (this.getMimeType()) {
			
			case 'application/pdf':
				url = this.EMBED_PAGE_URL.replace(/\{nodeRef\}/, nodeRef);
			break;
			
			case 'message/rfc822':
				url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					'alfresco://api/node/' + nodeRef.replace(':/','') + '/content/thumbnails/html?c=force'
				);
			break;
			
			default:
				url = this.PREVIEW_PAGE_URL.replace(/\{nodeRef\}/, nodeRef);
				
		}		
		
		return url;
	}
	
	
});