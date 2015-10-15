///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	BPMUtils.copyExecutionVariablesToTask([
   	    'bcinwf_processKind',
   	    'bcinwf_shares',
   	    {
  	    	'serviceName': 'bcinwf_serviceName',
  	    	'serviceRole': 'bcinwf_serviceRole'
   	    }
    ]);	
	
})();
