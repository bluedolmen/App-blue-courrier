<#import "/org/bluedolmen/alfresco/utils/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{	 
	success : true,
	outcome : <@itemLib.renderObject actionOutcome />
}
</#escape>