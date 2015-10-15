{
<#if statuses??>
<#list statuses as status>
	"${(status.id!"")?js_string}" : {
		"id" : "${(status.id!"")?js_string}",
		"state" : "${status.state?js_string}",
		<#if status.details??>
		"details" : "${(status.details!"")?js_string}",
		</#if>
		"actions" : [
			<#list status.actions as action>
			{
				"id" : "${action.id}",
				"title" : "${action.title!action.id?js_string}"
			}<#if action_has_next>,</#if>
			</#list> 		
		]
	}<#if status_has_next>,</#if>
</#list>
</#if>
}