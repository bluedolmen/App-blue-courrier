///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">


(function() {
	
	Yamma.Actions.ReviewOutgoingStepTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcwfoutgoing:Validating',
		
		doExecute : function(task) {

			var 
				result = {},
				properties = BPMUtils.getNonAlfrescoProperties(task, valueAdapter),
				owner
			;
			
			function valueAdapter(value, propertyName) {
				
				propertyName = Utils.asString(propertyName);
				
				if (
					'{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}validationChain' == propertyName ||
					'{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}signingChain' == propertyName
				){
					if (!value) return [];
					return Utils.Array.map(Utils.toArray(value), function(user) {
						return {
							id : user,
							displayName : Utils.Alfresco.getPersonDisplayName(user)
						}
					});
				}

				if (
						'{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}validationHistory' == propertyName ||
						'{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}signingHistory' == propertyName
				){
					if (!value) return [];
					return Utils.Array.map(Utils.toArray(value), function(event) {
						
						var
							split_ = Utils.asString(event).split('|'),
							user = split_[0],
							decision = split_[1] || ''
						;
						
						return {
							id : user,
							displayName : Utils.Alfresco.getPersonDisplayName(user),
							decision : decision 
						}
					});
					
				}

				if ('{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}signingActor' == propertyName){
					if (!value) return '';
					return {
						id : Utils.asString(value),
						displayName : Utils.Alfresco.getPersonDisplayName(value)
					}
				}
				
				return Utils.asString(value);
				
			}
			
			var owner = Utils.asString(task.properties['cm:owner']);
			properties.owner = {
				id : owner,
				displayName : owner ? Utils.Alfresco.getPersonDisplayName(owner) : ''
			}
			
			result.properties = properties;
			
			return result;
			
		}		
	});

	Yamma.Actions.ReviewOutgoingStepTaskAction.execute();
	
})();