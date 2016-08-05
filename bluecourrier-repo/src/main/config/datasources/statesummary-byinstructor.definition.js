(function(){
	
	function getStateFieldDefinitions() {
		
		return Utils.map(YammaModel.DOCUMENT_STATES, function(stateId) {
			
			return {
				name : stateId + 'StateNumber',
				type : 'int',
				
				evaluate : function(creator, operation, values) {
					if ('finalize' === operation) {
						return this.documentStateNumber[stateId];
					}
				}
			}
			
		});

		
	}
	
	/*
	 * MAIN VIEW DEFINITION
	 */
	
	DatasourceDefinitions.register('StateSummaryByInstructor',
		{
			searchType : 'aggregate',
			
			searchAdditional : {
				
				datasource : 'Mails',
				groupBy : YammaModel.YAMMA_NS_PREFIX + ':assignedAuthority'
				
			},
			
			fields : [			
				
				{
					name : 'documentNumber',
					type : 'int',
					
					evaluate : function(creator, operation, values) {
						
						// Use this as an aggregator
						// Also used to compute request state since the aggregator is common to all computed fields
						
						switch (operation) {
							case 'compute':
								this.documentNumber++;
								var documentState = values[YammaModel.STATUSABLE_STATUS_PROPNAME] || YammaModel.DOCUMENT_STATE_UNKNOWN;
								this.documentStateNumber[documentState]++;
							break;
							
							case 'initialize':
								this.documentNumber = 0;

								var me = this;
								this.documentStateNumber = {};
								Utils.forEach(YammaModel.DOCUMENT_STATES, function(stateId) {
									me.documentStateNumber[stateId] = 0;
								});
								this.documentStateNumber[YammaModel.DOCUMENT_STATE_UNKNOWN] = 0;
								
							break;
							
							case 'finalize':
								return this.documentNumber;
							break;
						}
						
						return null;
					}				

				}
				
			].concat(getStateFieldDefinitions())
			
		}
	);
	
	
})();