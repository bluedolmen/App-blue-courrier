<#macro renderDataList data>
[<#list data as value><@renderValue value /><#if value_has_next>,</#if></#list>]
</#macro>

<#macro renderValue value>
<@compress single_line=true>
<#if value?is_boolean>${value?string}
<#elseif value?is_number>${value?c}
<#elseif value?is_date>${value?datetime?iso_utc}
<#elseif value?is_sequence><@renderDataList value />
<#elseif value?is_hash><@renderObject value />
<#else>${value?string?replace("\"","\"\"")}
</#if>
</@compress>
</#macro>

<#macro renderObject item>
<#list fields as field><#assign value = item[field.name]!"">"<@renderValue value/>"<#if field_has_next>,</#if></#list>
</#macro>

<#macro displayResults>
<#compress>
<#assign displayTitleLine = (args.omitTitleLine?string!"false") != "true">
<#if displayTitleLine><#list fields as field>"${field.label!field.name}"<#if field_has_next>,</#if></#list></#if>
<#list data.items as item>
	<@renderObject item />
</#list>
</#compress>
</#macro>