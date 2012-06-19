<#import "item.lib.ftl" as itemLib />
<#macro displayResults>
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"totalRecords": ${data.paging.totalRecords?c},
	"startIndex": ${data.paging.startIndex?c},
	"itemCount" : ${data.count?c},
	<#if data.query??>
	"query" : ${data.query},
	</#if>
	"items": [
	<#list data.items as item>
		<@itemLib.renderObject item /><#if item_has_next>,</#if>
	</#list>
	]
}
</#escape>
</#macro>
