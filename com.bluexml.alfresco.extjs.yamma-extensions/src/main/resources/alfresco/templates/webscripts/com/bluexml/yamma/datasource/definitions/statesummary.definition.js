(function(){
	
	const LATE = 'late';
	const ON_TIME = 'onTime';
	
	function getStateFieldDefinitions() {
		
		return Utils.map(YammaModel.LATE_STATES, function(stateId) {
			
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
	
	DatasourceDefinitions.register('StateSummary',
		{
			searchType : 'aggregate',
			
			searchAdditional : {
				
				datasource : 'Mails',
				groupBy : YammaModel.STATUSABLE_STATE_PROPNAME
				
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
								var documentState = values[YammaModel.DUEABLE_ASPECT_SHORTNAME + '_lateState'] || YammaModel.LATE_STATE_UNDETERMINED;
								this.documentStateNumber[documentState]++;
							break;
							
							case 'initialize':
								this.documentNumber = 0;

								var me = this;
								this.documentStateNumber = {};
								Utils.forEach(YammaModel.LATE_STATES, function(stateId) {
									me.documentStateNumber[stateId] = 0;
								});
								
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