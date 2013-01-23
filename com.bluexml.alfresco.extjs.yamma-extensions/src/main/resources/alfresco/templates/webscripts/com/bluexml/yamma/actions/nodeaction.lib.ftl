<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />

<#macro renderOutcome>
<#escape x as jsonUtils.encodeJSONString(x)>
{	 
	status : ${actionStatus},
	outcome : <@itemLib.renderObject actionOutcome />
}
</#escape>
</#macro>

