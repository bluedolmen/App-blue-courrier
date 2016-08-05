///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	// Fix the signing role (to certification) if not yet set
	var signingRole = Utils.asString(execution.getVariable('bcogwf_signingRole'));
	if (!signingRole) {
		execution.setVariableLocal('bcogwf_signingRole', 'certification');
	}
	
	BPMUtils.copyExecutionVariablesToTask([
  	    'bcogwf_signingActor',   	    
  	    'bcogwf_signingRole',
  	    'bcogwf_signingChain',
  	    'bcogwf_signingHistory'
   ]);	
	
})();
