<#import "/com/bluexml/side/alfresco/extjs/datasource/item.lib.ftl" as itemLib />
<#escape x as jsonUtils.encodeJSONString(x)>
<@itemLib.renderObject serviceDescription />
</#escape>
