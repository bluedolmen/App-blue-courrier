///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/send-utils.js">

(function() {
	
	function checkActorsChain(actorsChain) {
		
		if (null == actorsChain) return;
		actorsChain = Utils.String.splitToTrimmedStringArray(Utils.asString(actorsChain));
		
		var message = null;
		
		Utils.forEach(actorsChain, function(actor) {
			
			if (null != people.getPerson(actor)) return;
			message = "Actor '" + actor + "' is not a valid Alfresco user for the validation chain";
			
		});
		
		return message;
		
	}
	
	function checkSigningActor(actor) {
		
		if (!actor) return;
		
		if (null == people.getPerson(actor)) {
			return "Actor '" + actor + "' is not a valid Alfresco username";
		}
		
	}
	
	Yamma.Actions.SendOutboundTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcogwf:processingTask',
		
		eventType : 'send-outbound',
		sendByMail : false, /* boolean */ // whether the reply will be sent by mail on the sending step
		skipValidation : false,
		actorsChain : null,
		signingActor : null,
		
		wsArguments : [
		               
			{ name : 'sendByMail', defaultValue : 'true' }, 
			{ name : 'skipValidation', defaultValue : 'false' },
			{ name : 'actorsChain', checkValue : checkActorsChain },
			{ name : 'signingActor', checkValue : checkSigningActor }
		],
		
		prepare : function() {
			
			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
			
			this.sendByMail = ( Utils.asString(this.parseArgs['sendByMail']) === 'true' );
			this.skipValidation = ( Utils.asString(this.parseArgs['skipValidation']) === 'true' );
			this.eventType = this.eventType + '!' + (this.skipValidation ? 'sendOut' : 'sendToValidation');
			
			this.actorsChain = Utils.asString(this.parseArgs['actorsChain']);
			this.actorsChain = Utils.String.splitToTrimmedStringArray(this.actorsChain);
			
			this.signingActor = Utils.wrapString(this.parseArgs['signingActor']);
			
		},		
		
		doExecute : function(task) {
			
			this.fixWritingDate();
			this.manageSendByMail();
			
			var transitionName = (this.skipValidation === true || Utils.Array.isEmpty(this.actorsChain)) ?
				'Send Without Validation' :  'Validate';
			
			if (!Utils.Array.isEmpty(this.actorsChain)) {
				
				// TODO: do something to inject the value in the workflow
				workflowUtils.updateTaskProperties(task, {
					'bcogwf:validationChain' : this.actorsChain 
				});

			}
			
			if (this.signingActor) {
				workflowUtils.updateTaskProperties(task, {
					'bcogwf:signingActor' : this.signingActor
				});
			}
			
			task.endTask(transitionName);
			
		},
		
		fixWritingDate : function() {
			
			// Also update writing-date if not yet filled
			var writingDate = this.node.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
			if (null == writingDate) {
				this.node.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
			}
			this.node.save();
			
		},
		
		/**
		 * If the replies are meant to be sent by mail, then add the corresponding
		 * aspect to the contained replies
		 */
		manageSendByMail : function() {
			
			if (this.sendByMail !== true) return;
			if (null == this.node) return;
			
			this.node.addAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME);
			
		}
		
	});

	Yamma.Actions.SendOutboundTaskAction.execute();
	
})();