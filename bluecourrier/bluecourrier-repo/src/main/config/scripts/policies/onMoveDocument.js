///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var
		oldChildAssoc = behaviour.args[0],
		newChildAssoc = behaviour.args[1],
		documentContainer = oldChildAssoc.getParent(),
		document = oldChildAssoc.getChild(),
		tasks, filteredTasks,errorMessage
	;
	
	if (null == document) return; // should not happen
	
	if (!DocumentUtils.isDocumentContainer(documentContainer)) return; // outside of the control scope (maybe initialization of the document)
	
	tasks = workflowUtils.getTasksForNode(document);
	filteredTasks = Utils.Array.filter(tasks, function(task) {
		return Utils.Array.contains(['bcwfincoming:Pending','bcwfincoming:Delivering','bcwfincoming:Validating'], Utils.wrapString(task.name));
	});
	
	if (!Utils.Array.isEmpty(filteredTasks)) {
		errorMessage = Utils.Alfresco.getMessage('yamma.errors.forbiddenDocumentMoving') || 
			'Cannot move the document outside its container while the delivering process is running.';
		throw new Error(errorMessage);
	}
	
})();
