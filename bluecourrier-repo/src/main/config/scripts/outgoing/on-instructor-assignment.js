///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee), // is the task assigned?
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		previousInstructorName = Utils.asString(execution.getVariable('bcogwf_instructor')),
		hasActorChanged = !!previousInstructorName && owner != previousInstructorName
	;
	
	if (null == document) return;
	
	storeCurrentInstructor();
	
	if (!hasActorChanged || null == owner) return; // no-extra work
	
	giveRightsToActor(document);
	
	if (hasActorChanged) {
		logActorChange(document, owner);
	}

	
	function storeCurrentInstructor() {

		execution.setVariable('bcogwf_instructor', owner);
		
	}
	
	function giveRightsToActor(/* ScriptNode */ documentNode, /* String */ role) {
		
		role = role || 'Collaborator';
		
		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		documentContainer.setPermission(role, owner);
		
	}
	
	function logActorChange(/* ScriptNode */ documentNode, /* String */ owner) {
		
		HistoryUtils.addEvent(documentNode, {
			eventType : 'reassign', 
			key : 'yamma.actions.reassign.processing',
			args : [ 'Traitement', Utils.Alfresco.getPersonDisplayName(owner) ]
		});
		
	}
	
	
})();
