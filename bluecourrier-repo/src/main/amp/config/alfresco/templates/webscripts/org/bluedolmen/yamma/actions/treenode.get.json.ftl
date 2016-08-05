<#import "/org/bluedolmen/alfresco/utils/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"totalChildren": ${totalChildren?c},
	"startIndex": ${startIndex?c},
	"itemCount" : ${itemCount?c},
	"children": [
	<#list children as child>
		<@itemLib.renderObject child /><#if child_has_next>,</#if>
	</#list>
	]
}
</#escape>
