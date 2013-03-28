(function() {
	
	function getActionsFieldDefinitions() {
		
		var availableMethodNames = Utils.keys(ReplyUtils);
		
		return Utils.map(availableMethodNames, function(methodName) {
			if (methodName.indexOf('can') != 0) return; // ignore
			
			return ({
				name : methodName,
				type : 'boolean',
				evaluate : getActionFunction(methodName)
			});
		});		
		
		function getActionFunction(functionName) {
			
			var actualFunction = ReplyUtils[functionName];
			return function(node) {
				return actualFunction(node);
			};
			
		}
		
	}	

	DatasourceDefinitions.register('Replies',
		{
		
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (null == nodeRef)
						throw new Error("[DataSource.Replies] IllegalStateException! There should be one filter named 'nodeRef'");
					
					var document = search.findNode(nodeRef);
					if (null == document)
						throw new Error('[Datasource.Replies] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef);
						
					return ReplyUtils.getReplies(document);
					
				}
				
//				metadata : function(params) {
//										
//					var 
//						nodeRef = params.getFilterValue('nodeRef'),
//						document = search.findNode(nodeRef)
//					;
//					
//					return ({
//						state : document.properties[YammaModel.STATUSABLE_STATE_PROPNAME] || ''
//					});
//					
//				}				
				
			},
			
			fields : [
				
				'@nodeRef*',
				'@typeShort',
				'@mimetype',
				'cm:name',
				'cm:title',
				YammaModel.MAIL_WRITING_DATE_PROPNAME,
				YammaModel.MAIL_SENT_DATE_PROPNAME,
				
				{
					name : YammaModel.MAIL_TYPE_SHORTNAME + '_author',
					type : 'string',
					evaluate : function(reply) {
					
						if (null == reply) return '';
						var author = (
							reply.properties['cm:author']
							|| reply.properties['cm:owner']
							|| reply.properties['cm:modifier']
							|| reply.properties['cm:creator']
						);
							
						if (null == author) return '';
						return Utils.Alfresco.getPersonDisplayName(author);

					}
				},
				
				/*
				 * Propagate the status of the replied-document as the actual
				 * status of the reply. This may be different in the future if
				 * several replies can be managed independently (with their own
				 * lifecycle).
				 */
				{
					name : YammaModel.STATUSABLE_STATE_PROPNAME,
					type : 'string',
					evaluate : function(reply) {
						var repliedDocument = ReplyUtils.getRepliedDocument(reply);
						if (null == repliedDocument) return '';
						
						return repliedDocument.properties[YammaModel.STATUSABLE_STATE_PROPNAME] || '';
					}
				},
				
				{
					name : YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME + '_signedContent',
					type : 'boolean',
					evaluate : function(reply) {
						return ReplyUtils.isSignedContent(reply);
					}
				}
				
			].concat(getActionsFieldDefinitions())		
			
	
		}
		
	);

})();