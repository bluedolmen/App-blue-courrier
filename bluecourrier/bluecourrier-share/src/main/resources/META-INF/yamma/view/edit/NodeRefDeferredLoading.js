Ext.define('Yamma.view.edit.NodeRefDeferredLoading', {
	
	extend : 'Yamma.view.edit.DeferredLoading',
	
	config : {
		documentNodeRef : null,
		permissions : {}
	},
	
	loadInternal : function() {
		this.loadByNodeRef.apply(this, arguments);
	},
	
	clearInternal : function() {
		this.setDocumentNodeRef(null);
	},
	
	loadByNodeRef : function(nodeRef, permissions, forceReload) {
		
		if (!nodeRef || !Ext.isString(nodeRef)) {
			Ext.Error.raise('IllegalArgumentException! The provided document nodeRef is not valid');
		}
		
		var currentNodeRef = this.getDocumentNodeRef();
		if (nodeRef == currentNodeRef && forceReload !== true) return;
		
		
		this.setDocumentNodeRef(nodeRef);
		this.setPermissions(permissions || {});
		
		this.load({
			filters : [
				{
					property : 'nodeRef',
					value : nodeRef
				}
			]
		});
		
	}
	
});