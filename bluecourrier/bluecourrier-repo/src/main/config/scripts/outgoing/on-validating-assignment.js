///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee), // is the task assigned?
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		sendEmail = ConfigUtils.getConfigValue('wf.outgoing.validation.notify-email', true, 'boolean'),
		addedPermissions,
		currentStoreOwner = Utils.asString(execution.getVariable('bcogwf_lastValidatingTaskOwner'))
	;
	
	if (null == document) return;
	if (!owner) return;

	if (currentStoreOwner && owner == currentStoreOwner) return;
	execution.setVariableLocal('bcogwf_lastValidatingTaskOwner', owner);
	
	giveRightsToActor(document);
	
	if (sendEmail) {
		sendEmailToUser();
	}
	
	function giveRightsToActor(/* ScriptNode */ documentNode, role) {
		
		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		
		if (!Utils.Alfresco.hasPermission(documentContainer, 'Read', owner)) {
			
			role = role || 'Consumer';
			
			documentContainer.setPermission(role, owner);
			
			addedPermissions = Utils.toArray(BPMUtils.getContextVariable('bcogwf_addedPermissions') || []);
			addedPermissions.push(owner + '|' + role);
			execution.setVariable('bcogwf_addedPermissions', workflowUtils.toJavaCollection(addedPermissions)); // Activiti/Alfresco does not wrap native Javascript arrays
			
		}
		
		// TODO: We should also manage rights on a replied document here
		
	}
	
	function sendEmailToUser (onSendMailSuccess, onSendMailFailure) {
		
		var
		
			person = people.getPerson(owner),
		
			reviewTaskTemplateDefinition = Utils.Object.create(new TemplateDefinition.Default(), {
			  
				document : document,
				templateName : 'review-document.html.ftl',
				senderName : Utils.Alfresco.getPersonDisplayName(fullyAuthenticatedUserName),
				recipientName : null != person ? Utils.Alfresco.getPersonDisplayName(person) : '',
			  
				getTemplateArgs : function() {
			    
				    var 
				        enclosingSiteShortName = Utils.Alfresco.getEnclosingSiteName(this.document), 
				        
				        templateArgs = {
				          subject : "Validation d'un courrier sortant",
				          object : this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '',
				          senderName : this.senderName,
				          recipientName : this.recipientName,
				          nodeRef : Utils.asString(this.document.nodeRef)
				        }
				    ;
				    
				    return templateArgs;
				    
				}
			}),
		
			email = Utils.asString(person.properties['cm:email'])
		;
		
		if (!email) return;
		
		
		return SendMailUtils.sendMail({
			
			document : document,
			recipientEmail : email,
			templateDefinition : reviewTaskTemplateDefinition,
			
			sendMailSuccess : onSendMailSuccess || undefined,
			sendMailFailure : onSendMailFailure || undefined,
			silent : true
		
		});						
		
	}
	
})();
