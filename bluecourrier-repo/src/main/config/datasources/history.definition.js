(function() {

	DatasourceDefinitions.register('History',
		{
			
//			baseSearchType : YammaModel.EVENT_TYPE_SHORTNAME,			
		
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (!nodeRef)
						throw new Error("[DataSource.History] IllegalStateException! There should be one filter named 'nodeRef'");
					
					var document = search.findNode(nodeRef);
					if (!document)
						throw new Error('[Datasource.History] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef);
						
					return HistoryUtils.getHistoryEvents(document);
					
				}
				
			},
			
			fields : [
				
			    {
			    	name : YammaModel.EVENT_DATE_PROPNAME,
			    	type : 'date',
			    	evaluate : function(node) {
			    		if (null == node) return null;
			    		return node.properties['cm:created'];
			    	}
			    },
				
				YammaModel.EVENT_EVENT_TYPE_PROPNAME,
				YammaModel.EVENT_DESCRIPTION_PROPNAME,
				
				{
					name : YammaModel.EVENT_REFERRER_PROPNAME + '_displayName',
					type : 'string',
					evaluate : function(node) {
						var referrer = node.properties[YammaModel.EVENT_REFERRER_PROPNAME];
						if (null == referrer) return '(unknown)'; // should not happen
						
						return Utils.Alfresco.getPersonDisplayName(Utils.asString(referrer));
					}
				},
				
				{
					name : YammaModel.EVENT_DELEGATE_PROPNAME + '_displayName',
					type : 'string',
					evaluate : function(node) {
						var delegate = node.properties[YammaModel.EVENT_DELEGATE_PROPNAME];
						if (null == delegate) return ''; // normal case
						
						return Utils.Alfresco.getPersonDisplayName(Utils.asString(delegate));
					}
				}				
				
			]
			
//			filters : {
//				
//				'nodeRef' : {
//					
//					applyQueryFilter : function(query, documentNodeRef) {
//						
//						if (null == documentNodeRef) {
//							throw new Error("[DataSource.History] IllegalStateException! There should be one filter named 'nodeRef'");
//						}
//						
//						query = '+PRIMARYPARENT:"' + documentNodeRef + '" ' + query;
//						
//						return query;
//						
//					}
//					
//				}
//				
//			}
	
		}
		
	);

})();