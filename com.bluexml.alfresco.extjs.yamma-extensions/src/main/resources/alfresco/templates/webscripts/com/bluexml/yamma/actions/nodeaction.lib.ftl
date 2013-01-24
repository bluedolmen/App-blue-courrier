<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />

<#macro renderOutcome>
<#escape x as jsonUtils.encodeJSONString(x)>
{	 
	"status" : "${actionStatus}",
	<#list actionOutcome?keys as k>
	"${k}" : <@itemLib.renderObject actionOutcome[k] />
	</#list>
}
</#escape>
</#macro>

