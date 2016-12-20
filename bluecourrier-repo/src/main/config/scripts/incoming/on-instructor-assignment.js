///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">


(function() {
	
	/*
	 * Activiti integration in Alfresco defines a behaviour where
	 * this handler is called multiple times on an assignment of a
	 * person. This lead to an unwanted behaviour where multiple task-assignment
	 * mails are sent to the instructor.
	 * <p>
	 * We use here a hack based on a local process-variable to store
	 * the first time the user is assigned to this task.
	 * 
	 * @see bcinwf_firstTimeInstructorAssigned
	 */

	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee), // is the task assigned?
		previousInstructorName = Utils.asString(task.getVariableLocal('bcinwf_instructor')),
		hasActorChanged = owner != previousInstructorName,
		serviceRole = Utils.asString(task.getVariableLocal('bcinwf_serviceRole')),
		firstTimeAssigned = task.getVariableLocal('bcinwf_firstTimeInstructorAssigned'),
		actorRole = ConfigUtils.getConfigValue('wf.incoming.processing.' + serviceRole + '.role')
	;
	
	if (null == document) return;
	
	firstTimeAssigned = (null == firstTimeAssigned || true === firstTimeAssigned) || hasActorChanged;
	if (firstTimeAssigned && null != owner) {
		
		giveRightsToActor(document, actorRole);
		sendEmailToUser();
		task.setVariableLocal('bcinwf_firstTimeInstructorAssigned', false); // update the flag
		
	}
	
	if (!hasActorChanged) return; // no-extra work
	
	storeCurrentInstructor();
	logActorChange(document, owner);
	
	function storeCurrentInstructor() {
		
		task.setVariableLocal('bcinwf_instructor', owner);

		if (!isProcessingRole()) return;
		
		if (null == owner) {
			bdNodeUtils.removeProperty(document, 'bcinwf:instructorUserName');
		}
		else {
			document.properties['bcinwf:instructorUserName'] = owner;
			document.save();
		}

	}
	
	function isProcessingRole() {
		
		return Yamma.DeliveryUtils.ROLE_PROCESSING == serviceRole;
		
	}
	
	function giveRightsToActor(/* ScriptNode */ documentNode, /* String */ role) {
		
		role = role || 'Contributor';
		
		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		documentContainer.setPermission(role, owner);
//		documentContainer.setPermission('Delete', owner); // also enable the user to move the document outside the inbox tray
		
	}
	
	function logActorChange(/* ScriptNode */ documentNode, /* String */ owner) {
		
		if (!owner) return;
		
		HistoryUtils.addEvent(documentNode, {
			eventType : 'reassign', 
			key : 'yamma.actions.reassign.processing',
			args : [ Yamma.DeliveryUtils.ROLE_LABELS[serviceRole] || '(Inconnu)', Utils.Alfresco.getPersonDisplayName(owner) ]
		});
		
	}
	
	function sendEmailToUser (onSendMailSuccess, onSendMailFailure) {
		
		var email = Utils.Alfresco.getPersonEmail(owner);
		if (!email) return;
		
		var 
			authenticatedPersonDN = Utils.Alfresco.getPersonDisplayName(Utils.Alfresco.getFullyAuthenticatedUserName()) || '',
			templateDefinition = Utils.Object.create(new TemplateDefinition.Default(), {
			  
			  document : document,
			  templateName : 'assign-acknowledgment.html.ftl',
			  senderName : authenticatedPersonDN,
			  recipientName : null != owner ? Utils.Alfresco.getPersonDisplayName(owner) : '',
			  role : Yamma.DeliveryUtils.ROLE_LABELS[serviceRole],
			  
			  getTemplateArgs : function() {
			    
			    var 
			        enclosingSiteShortName = Utils.Alfresco.getEnclosingSiteName(this.document), 
			        
			        templateArgs = {
			          subject : "Assignation en traitement d'un courrier",
			          object : this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '',
			          senderName : this.senderName,
			          recipientName : this.recipientName,
			          nodeRef : Utils.asString(this.document.nodeRef),
			          role : this.role
			        }
			    ;
			    
			    return templateArgs;
			    
			  }		
			  
			})
		;
			
		return SendMailUtils.sendMail({
			
			document : document,
			recipientEmail : email,
			templateDefinition : templateDefinition,
			
			sendMailSuccess : onSendMailSuccess || undefined,
			sendMailFailure : onSendMailFailure || undefined,
			silent : true
		
		});						
		
	}	
	
})();
