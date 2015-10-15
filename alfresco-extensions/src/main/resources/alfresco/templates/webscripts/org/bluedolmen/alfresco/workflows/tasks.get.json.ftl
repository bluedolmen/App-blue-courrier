<#escape x as jsonUtils.encodeJSONString(x)>
{
	tasks : [
<#list tasks as task>
	{
		"id" : "${(task.id!"")?js_string}",
		"name" : "${(task.name!"")?js_string}",
		"title" : "${(task.title!"")?js_string}",
		"description" : "${(task.description!"")?js_string}"
	}<#if task_has_next>,</#if>
</#list>
	]
}
</#escape>