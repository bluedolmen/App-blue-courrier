///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	// serviceAndRole has to be defined to be evaluated in JUEL expressions
	var serviceAndRole = execution.getVariable('serviceAndRole');
	if (null == serviceAndRole) {
		execution.setVariableLocal('serviceAndRole', '');
	}
	
	var startingMode = execution.getVariable('bcinwf_startingMode');
	if (null == startingMode) {
		execution.setVariable('bcinwf_startingMode', '');
	}
	
	
})();