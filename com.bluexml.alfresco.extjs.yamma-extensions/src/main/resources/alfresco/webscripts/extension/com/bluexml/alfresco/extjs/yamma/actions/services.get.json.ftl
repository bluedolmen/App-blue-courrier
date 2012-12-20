<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{
	<#if "tree" == rformat>"children"<#else>"items"</#if>: [
	<#list items as item>
		<@itemLib.renderObject item /><#if item_has_next>,</#if>
	</#list>
	]
}
</#escape>
