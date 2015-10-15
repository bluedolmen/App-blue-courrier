///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">


(function() {
	
	var
		node = null
	;
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{name : 'nodeRef', mandatory : true }
			),
			nodeRef = parseArgs['nodeRef']
		;
		
		
		
		node = Utils.Alfresco.getExistingNode(nodeRef, true /* failsSilently */);
		if (null == node) {
			throw {
				code : Status.STATUS_NOT_FOUND,
				message : 'Cannot find any valid nodeRef with id ' + nodeRef + ' (or you are not allowed to retrieve it)'
			}
		}
		
		main();
		
	});
	
	function main() {
		
		var 
			tasks = workflowUtils.getTasksForNode(node),
			parapheAssocs = node.assocs['blueparapheur:paraphe_Paraphable_paraphe_paraphe_Paraphe'] || [null],
			paraphe = parapheAssocs[0]
		;
		if (null != paraphe) {
			tasks.concat(workflowUtils.getTasksForNode(paraphe));
		}
		
		model.tasks = tasks;
		
	}
	
	
})();