///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	BPMUtils.copyExecutionVariablesToTask([
   	    'bcinwf_processKind',
   	    {
  	    	'serviceName': 'bcinwf_serviceName',
  	    	'serviceRole': 'bcinwf_serviceRole'
   	    }
    ]);	
	
})();
