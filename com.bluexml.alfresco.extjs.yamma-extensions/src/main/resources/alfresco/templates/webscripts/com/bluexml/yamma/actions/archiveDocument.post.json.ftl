<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
{	 
	success : true,
	outcome : <@itemLib.renderObject actionOutcome />
}
</#escape>