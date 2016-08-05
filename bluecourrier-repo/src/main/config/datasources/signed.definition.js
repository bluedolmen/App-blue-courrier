(function() {
	
	var isDSNamespaceDefined = (null != sideDictionary.getAspect('ds:signed'));
	
	DatasourceDefinitions.register('Signed',
		{
			
			fields : [
				
				{
					name : 'ds:signed',
					type : 'object',
					evaluate : function(node) {
						
						if (!isDSNamespaceDefined) return false;
						if (null == node) return false;
						if (!node.hasAspect('ds:signed')) return false;
						
						return {
							'by' : node.properties['ds:signedby'] || '',
							'on' : node.properties['ds:signaturedate'] || ''
						};
						
					}
				}
				
			]
	
		}
		
	);
	

})();