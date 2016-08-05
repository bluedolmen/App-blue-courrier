(function(){
		
	DatasourceDefinitions.register('OpenSearch',
	{
		
		baseSearchPath : 'app:company_home/st:sites//*',
		baseSearchType : YammaModel.DOCUMENT_ASPECT_SHORTNAME,

		searchAdditional : {
			
			page : {
				maxItems: 10,
				skipCount: 0
			},
			
			sortBy : {
				column : 'cm:name',
				dir : 'ASC'
			}
		},
		
		fields : [
			'@nodeRef',
			'cm:name',
			YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
			YammaModel.MAIL_OBJECT_PROPNAME,
			
			{
				name : YammaModel.MAIL_ASPECT_SHORTNAME + 'Kind',
				type : 'string',
				evaluate : function(node) {
					return MailUtils.getKind(node);
				}
			}				
			
		],
		
		filters : {
			
			'term' : CommonDatasourceFilters['term'],
			
			'kind' : {
				
				applyQueryFilter : function(query, kind) {
					
					var
						kindAspectName = ({
							'inbound' : YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME,
							'incoming' : YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME,
							'outbound' : YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME,
							'outgoing' : YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME,							
							'copy' : YammaModel.COPIED_FROM_ASPECT_SHORTNAME
						})[kind]
					;
					
					if (null == kindAspectName) return;
					return (query + ' +ASPECT:"' + kindAspectName + '"');
					
				}
				
			}
			
		}
		
		
	});
	
})();