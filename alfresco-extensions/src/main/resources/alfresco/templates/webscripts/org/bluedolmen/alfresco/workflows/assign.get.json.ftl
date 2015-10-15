<#escape x as jsonUtils.encodeJSONString(x)>
{
	current : <#if currentAssigned??>{
		"userName" : "${(currentAssigned.properties.userName!"")?js_string}",
		"firstName" : "${(currentAssigned.properties.firstName!"")?js_string}",
		"lastName" : "${(currentAssigned.properties.lastName!"")?js_string}",
		"email" : "${(currentAssigned.properties.email!"")?js_string}"
	}<#else>null</#if>,
	canReassign : ${canReassign?string}<#if availableActors??>,
	availableActors : [<#if !canReassign>/* not authorized */<#if currentAssigned??>{
			"userName" : "${(currentAssigned.properties.userName!"")?js_string}",
			"firstName" : "${(currentAssigned.properties.firstName!"")?js_string}",
			"lastName" : "${(currentAssigned.properties.lastName!"")?js_string}",
			"email" : "${(currentAssigned.properties.email!"")?js_string}",
			"isAssigned" : true
		}</#if></#if>
<#list availableActors as actor>
		{
			"userName" : "${(actor.properties.userName!"")?js_string}",
			"firstName" : "${(actor.properties.firstName!"")?js_string}",
			"lastName" : "${(actor.properties.lastName!"")?js_string}",
			"email" : "${(actor.properties.email!"")?js_string}",
			"isAssigned" : <#if currentAssigned?? && (actor.properties.userName == currentAssigned.properties.userName)>true<#else>false</#if>
		}<#if actor_has_next>,</#if>
</#list>
	]</#if>
}
</#escape>