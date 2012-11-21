{
<#list statuses as status>
	{
		"id" : "${(status.id!"")?js_string}",
		"status" : "${status.state?js_string}",
		<#if status.details??>
		"details" : "${(status.details!"")?js_string}",
		</#if>
		"actions" : [
			<#list status.actions as action>
			{
				"id" : "${action.id}",
				"url" : "${action.url?js_string}"
			}<#if action_has_next>,</#if>
			</#list> 		
		]
	}<#if status_has_next>,</#if>
</#list>
}