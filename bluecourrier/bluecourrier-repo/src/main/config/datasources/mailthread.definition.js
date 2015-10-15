(function() {
	
	DatasourceDefinitions.register('MailThread',
		{
			
			extend : 'Mails',
			
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (!nodeRef)
						throw new Error("[DataSource.MailThread] IllegalStateException! There should be one filter named 'nodeRef'");
					
					var document = search.findNode(nodeRef);
					if (null == document)
						throw new Error('[Datasource.MailThread] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef);
					
					var threadRootDocument = ReplyUtils.getThreadRootDocument(document);
					if (null == threadRootDocument)
						throw new Error('[Datasource.MailThread] IllegateStateException! Cannot find a valid thread root-document for the given nodeRef: ' + nodeRef);
					
					return [threadRootDocument]; 
					
				}
				
			},			
			
			fields : [
				
				{
					name : 'children',
					type : 'datasource',
					evaluate : function(node) {
						
						if (null == node) return null;
						return ReplyUtils.getReplies(node);
						
					}
				}

			
			]
	
		}
		
	);

})();