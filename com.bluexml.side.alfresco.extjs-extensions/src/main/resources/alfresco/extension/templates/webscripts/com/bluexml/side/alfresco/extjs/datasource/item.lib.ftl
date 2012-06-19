<#macro renderObject item>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{   	
		<#list item?keys as propertyName>
			<#assign value = item[propertyName]>
		"${propertyName}" : <@renderValue value /><#if propertyName_has_next>,</#if>
		</#list>
	}
	</#escape>
</#macro>

<#macro renderValue value>
<#if value?is_sequence><@renderDataList value />
<#elseif value?is_hash><@renderObject value />
<#else><@renderData value />
</#if>
</#macro>

<#macro renderDataList data>
[<#list data as value><@renderData value /><#if value_has_next>,</#if></#list>]
</#macro>

<#macro renderData data>
	<#escape x as jsonUtils.encodeJSONString(x)>
		<#if data?is_boolean>
${data?string}
		<#elseif data?is_number>
${data?c}
		<#elseif data?is_date>
"${data?datetime?iso_utc}"
      <#else>
"${data?string}"
      </#if>
   </#escape>
</#macro>