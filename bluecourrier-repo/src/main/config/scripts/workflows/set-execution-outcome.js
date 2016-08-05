///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	if ('undefined' == typeof task) return;
	
	var
		outcomePropertyQName = task.getVariable('bpm_outcomePropertyName'),
		outcomePropertyPrefixedQName = null != outcomePropertyQName ? Utils.Alfresco.toPrefixQName(outcomePropertyQName) : null,
		outcomePropertyValue
	;
	
	if (null == outcomePropertyPrefixedQName ) return;

	outcomePropertyPrefixedQName = outcomePropertyPrefixedQName.replace(':','_');	
	outcomePropertyValue = Utils.asString(task.getVariable(outcomePropertyPrefixedQName));
	execution.setVariable(outcomePropertyPrefixedQName, outcomePropertyValue);
	
})();