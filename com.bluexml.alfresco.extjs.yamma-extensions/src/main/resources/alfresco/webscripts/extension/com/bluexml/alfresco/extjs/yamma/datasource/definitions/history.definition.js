(function() {

	function getEvents(documentNodeRef) {
		
		if (!documentNodeRef) return [];
		var document = search.findNode(documentNodeRef);
		if (!document)
			throw new Error('[Datasource.History] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + documentNodeRef);
		
		if (document.isSubType && !document.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)) return [];
		
		var events = document.assocs[YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME];
		if (!events) return [];
		
		return events;
	}
	
	DatasourceDefinitions.register('History',
		{
		
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (!nodeRef)
						throw new Error("[DataSource.History] IllegalStateException! There should be one filter named 'nodeRef'");
					
					return getEvents(nodeRef);
					
				}
				
			},
			
			fields : [
				
				YammaModel.EVENT_DATE_PROPNAME,
				YammaModel.EVENT_EVENT_TYPE_PROPNAME,
				YammaModel.EVENT_COMMENT_PROPNAME,
				
				{
					name : YammaModel.EVENT_REFERRER_PROPNAME + '_displayName',
					type : 'string',
					evaluate : function(node) {
						var referrer = node.properties[YammaModel.EVENT_REFERRER_PROPNAME];
						return Utils.getPersonDisplayName(referrer);
					}
				}
				
				
			]			
			
	
		}
		
	);

})();