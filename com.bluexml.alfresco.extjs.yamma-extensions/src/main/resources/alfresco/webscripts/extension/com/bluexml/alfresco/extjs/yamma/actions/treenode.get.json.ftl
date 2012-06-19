<#escape x as jsonUtils.encodeJSONString(x)>
{
	"totalChildren": ${totalChildren?c},
	"startIndex": ${startIndex?c},
	"itemCount" : ${itemCount?c},
	"children": [
	<#list children as child>
		{
			"type" : "${child.type}",
			"title" : "${child.title}",
			"ref" : "${child.ref}",
			"hasChildren" : ${child.hasChildren?string}
		}<#if child_has_next>,</#if>
	</#list>
	]
}
</#escape>
