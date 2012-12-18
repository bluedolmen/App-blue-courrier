<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"items": [
	<#list items as item>
		<@itemLib.renderObject item /><#if item_has_next>,</#if>
	</#list>
	]
}
</#escape>
