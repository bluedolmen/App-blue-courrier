<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />
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
