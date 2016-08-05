<#import "/org/bluedolmen/alfresco/utils/item.lib.ftl" as itemLib />

<#macro renderOutcome>
<#escape x as jsonUtils.encodeJSONString(x)>
{	 
<#if actionOutcome??>
	<#list actionOutcome?keys as k>
	"${k}" : <@itemLib.renderObject actionOutcome[k] /><#if k_has_next>,</#if>
	</#list>
	,
</#if>
	"status" : "${actionStatus!"success"}"
}
</#escape>
</#macro>
