<#macro renderObject item>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{   	
		<#list item?keys as propertyName>
		<#if item[propertyName]??>
		<#assign value = (item[propertyName]!null) />
		"${propertyName}" : <@renderValue value /><#if propertyName_has_next>,</#if>
		</#if>
		</#list>
	}
	</#escape>
</#macro>

<#macro renderNode item>
	<#escape x as jsonUtils.encodeJSONString(x)>
	{   	
		<#list item.properties?keys as propertyName>
			<#assign value = item.properties[propertyName]>
		"${propertyName}" : <@renderValue value /><#if propertyName_has_next>,</#if>
		</#list>
	}
	</#escape>
</#macro>

<#macro renderDataList data>
[<#list data as value><@renderValue value /><#if value_has_next>,</#if></#list>]
</#macro>

<#macro renderValue value>
	<#escape x as jsonUtils.encodeJSONString(x)>
		<#if value?is_macro>
		<#elseif value?is_method>
		<#elseif value?is_boolean>
${value?string}
		<#elseif value?is_number>
${value?c}
		<#elseif value?is_date>
"${value?datetime?iso_utc}"
		<#elseif value?is_sequence>
<@renderDataList value />
		<#elseif value?is_hash>
<@renderObject value />
		<#else>
"${value?string}"
      </#if>
   </#escape>
</#macro>