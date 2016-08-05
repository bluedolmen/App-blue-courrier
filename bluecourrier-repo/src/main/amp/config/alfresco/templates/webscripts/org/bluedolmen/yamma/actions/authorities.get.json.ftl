<#import "/org/alfresco/repository/person/person.lib.ftl" as personLib/>
<#import "/org/alfresco/repository/groups/authority.lib.ftl" as authorityLib/>
<#macro personJSON person>
<#local p=person.properties>
{
	"authorityType": "USER",
	"userName": "${p.userName}",
	"shortName": "${p.userName}",
	"enabled": ${people.isAccountEnabled(person)?string("true","false")},
	<#if person.assocs["cm:avatar"]??>
	"avatar": "${"api/node/" + person.assocs["cm:avatar"][0].nodeRef?string?replace('://','/') + "/content/thumbnails/avatar"}",
	</#if>
	"firstName": <#if p.firstName??>"${p.firstName}"<#else>null</#if>,
	"lastName": <#if p.lastName??>"${p.lastName}"<#else>null</#if>,
	"displayName": "<#if p.firstName??>${p.firstName} </#if><#if p.lastName??>${p.lastName}</#if>",
	"url": "${url.serviceContext + "/api/person/" + p.userName}"
}
</#macro>
<#macro authorityJSON authority>
{
	"authorityType": "GROUP",
	"shortName": "${authority.shortName}",
	"fullName": "${authority.fullName}",
	"displayName": "${authority.displayName}",
	"url": "/api/groups/${authority.shortName?url}"
	<#if authority.zones?exists>
	,"zones": [
	<#list authority.zones as zone>
		"${zone}"<#if zone_has_next>,</#if>
	</#list>
	]
	</#if>
}
</#macro>
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"authorities" : [
        <#list peoplelist as person>
                <@personJSON person=person/>
                <#if person_has_next>,</#if>
        </#list>
        <#if peoplelist?size gt 0 && groups?size gt 0>,</#if>
        <#list groups as group>
                <@authorityJSON authority=group />
                <#if group_has_next>,</#if>
        </#list>
	]
}
</#escape>
