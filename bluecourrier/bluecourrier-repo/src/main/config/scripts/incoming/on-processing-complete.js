///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	addHistoryEvent();
	
	
	function addHistoryEvent() {
		
		var 
			document = BPMUtils.getFirstPackageResource(),
			processingOutcome = Utils.asString(task.getVariable('bcinwf_processingOutcome')),
			args = [],
			replyNode, serviceRole 
		;
		
		if ('Add Reply' == processingOutcome) {
			
			replyNode = task.getVariable('bcinwf_reply');
			if (null != replyNode) {
				args = [ Utils.asString(replyNode.name) ];
			}
			
		}
		else if ('Done' == processingOutcome) {
			
			serviceRole = BPMUtils.getContextVariable('serviceRole') || '';
			serviceRole = Yamma.DeliveryUtils.ROLE_LABELS[serviceRole] || '';
			
			args = [serviceRole];
			
		}
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'completeProcessing',
			key : 'yamma.actions.completeProcessing.' + processingOutcome + '.comment',
			args : args
			
		});
		
	}

	                               	
})();