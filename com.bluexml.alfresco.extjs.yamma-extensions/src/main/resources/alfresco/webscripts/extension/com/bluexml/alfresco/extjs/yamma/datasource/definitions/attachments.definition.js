(function() {

	DatasourceDefinitions.register('Attachments',
		{
		
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (!nodeRef)
						throw new Error("[DataSource.Attachments] IllegalStateException! There should be one filter named 'nodeRef'");
					
					var document = search.findNode(nodeRef);
					if (!document)
						throw new Error('[Datasource.Attachments] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef);
					
					
					return AttachmentUtils.getAttachments(document);
				}
				
			},
			
			fields : [
				
				'@nodeRef',
				'@mimetype',
				'cm:name',
				'cm:title',
				{
					name : 'sizeInBytes',
					type : 'int',
					evaluate : function(attachmentNode) {
						if (!attachmentNode && !attachmentNode.properties) return 0;
						
						var content = attachmentNode.properties.content;
						if (!content) return 0;
						
						return content.size;
					}
				},
				{
					name : 'canDelete',
					type : 'boolean',
					evaluate : function(attachmentNode) {
						var canDelete = attachmentNode.hasPermission('Delete') && AttachmentUtils.canDelete(attachmentNode);
						return canDelete;
					}
				}
				
				
			]			
			
	
		}
		
	);

})();