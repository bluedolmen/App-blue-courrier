Ext.define('Bluedolmen.store.CommentStore', {
	
	extend : 'Ext.data.Store',
	
	nodeRef : null,
	
	model : 'Bluedolmen.model.Comment',
	
	constructor : function() {
		
		if (null == nodeRef) {
			Ext.Error.raise('This store has to be initialized with a valid document nodeRef');
		}
		
		var url = "/api/node/{nodeRef}/comments?reverse={reverse}";
		
		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(url)
			.replace(/\{nodeRef\}/, nodeRef.replace(/:\//,''))
			.replace(/\{reverse\}/, true);

		this.proxy = {
			type : 'ajax',
			url : url,
		    reader: {
		        type: 'json',
		        root: 'items'
		    }
		};
		
		this.callParent(arguments);
		
	}
	
});