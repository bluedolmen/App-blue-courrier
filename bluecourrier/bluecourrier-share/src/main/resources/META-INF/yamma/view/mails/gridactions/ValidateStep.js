Ext.define('Yamma.view.mails.gridactions.ValidateStep', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	uses : [
	    'Yamma.view.dialogs.OutgoingValidationDialog'
	],
	
	icon : Yamma.Constants.getIconDefinition('tick').icon,
	tooltip : 'Valider le courrier',
	
	taskName : 'bcogwf:validatingTask',
	actionName : 'Next',
	actionUrl : 'alfresco://bluedolmen/yamma/review-outgoing',
	
	supportBatchedNodes : false,
	
	getParameters : function(record) {
		
		var task = this.getFirstMatchingTask(record);
		return [task];
		
	},
	
	performAction : function(task, preparationContext) {
		
		var 
			thisAction = this,
			nodeRef = this.getContextNodeRefs(preparationContext)
		;
		
		Ext.define('Yamma.view.mails.gridactions.ValidateStep.OutgoingValidationDialog', {
			
			extend : 'Yamma.view.dialogs.OutgoingValidationDialog',
			
			taskRef : task.id,
			taskName : thisAction.taskName,
			nodeRef : nodeRef,
			
			performOperation : function(action) {
				
				var 
					me = this,
					actorsChain = this.getActorsChain(),
					values = {
						taskRef : me.taskRef,
						validationChain : actorsChain,
						action : action,
						comment : me.propertiesForm.getValues()['comment']
					},
					url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(thisAction.actionUrl)
				;
				
				me.setLoading(true);
				
				Bluedolmen.Alfresco.jsonPost({
					
					url : url,
					
					dataObj : values,
					
				    onSuccess: function(response, options) {
				    	
				    	thisAction.fireEvent('actionComplete', 'success', arguments);
				    	me.close();
				    	
				    },
				    
					'finally' : function() {
						
						me.setLoading(false);
						
					}
				    
				});		
				
			}
			
		}, function() {
			
			(new this()).show();
			
		});
		
	}	
	
});
