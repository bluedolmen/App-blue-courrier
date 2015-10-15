///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	var outgoingCertification = execution.getVariable('bcogwf_needsCertification');
	if (null == outgoingCertification) {
		execution.setVariable('bcogwf_needsCertification', ConfigUtils.getConfigValue('wf.outgoing.certification'));
	}

})();