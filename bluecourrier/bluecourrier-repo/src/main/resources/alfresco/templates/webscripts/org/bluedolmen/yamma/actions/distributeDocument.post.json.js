///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {

	Utils.ns('Yamma.Actions').ShareTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcwfincoming:Delivering',
		saveOnly : false,
		validateDelivering : null,
		processKind : null,
		
		addedShares : null,
				
		wsArguments : [
			'saveOnly',
			'validateDelivering',
			'processKind',
			'addedShares'
		],
		
		prepare : function() {
			
			var 
				matchOp = url.service.match(/.*\/([^\/]+)\/?$/),
				operation = matchOp ? matchOp[1] : ''
			;
			
			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
			
			this.extractParameters();
						
		},
		
		extractParameters : function() {
			
			var addedSharesParam = Utils.asString(this.parseArgs['addedShares']);
			if (addedSharesParam) {
				this.addedShares = Yamma.DeliveryUtils.decode(addedSharesParam, true /* performCheck */);
			}
			
			this.saveOnly = 'true' == Utils.asString(this.parseArgs['saveOnly']);
			
			var validateDelivering = Utils.asString(this.parseArgs['validateDelivering']);
			if (validateDelivering /* non-empty string */) {
				this.validateDelivering = 'true' == validateDelivering;
			}
			
			this.processKind = Utils.wrapString(this.parseArgs['processKind']);
			
		},
		
		doExecute : function(task) {
			
			var 
				me = this,
				taskProperties = {}
			;
			
			processValidateDelivering();
			processProcessKind();
			addedShares = processShares();
			
			if (!Utils.Array.isEmpty(Utils.keys(taskProperties)) ) {
				workflowUtils.updateTaskProperties(task, taskProperties);
			}
				
			if (!me.saveOnly) {
				task.endTask(this.action);
			}
			
			function processValidateDelivering() {
				
				var currentValue = task.properties['bcinwf:validateDelivering'];
				if (null == me.validateDelivering || me.validateDelivering == currentValue) return;
				
				taskProperties['bcinwf:validateDelivering'] = me.validateDelivering;
				
			}
			
			function processProcessKind() {
				
				var 
					currentValue = Utils.wrapString(task.properties['bcinwf:processKind']),
					taskName = Utils.asString(task.name)
				;
				
				if (null == me.processKind || me.processKind == currentValue) return;
				
				if (currentValue && 'bcinwf:pendingTask' != taskName) {
					throw {
						code : 400,
						message : "IllegalStateException! Cannot change the process-kind once set" 
					};
				}
				
				taskProperties['bcinwf:processKind'] = me.processKind;
				
			}
			
			function processShares() {
				
				if (!me.addedShares) return;
				taskProperties['bcinwf:shares'] = me.addedShares.encodeAsString();
				
			}
			
		}

	});


	Yamma.Actions.ShareTaskAction.execute();
	
})();

