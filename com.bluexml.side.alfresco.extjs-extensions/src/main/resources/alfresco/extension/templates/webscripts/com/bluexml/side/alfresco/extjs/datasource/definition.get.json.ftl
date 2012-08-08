<#macro displayDefinition>
<#escape x as jsonUtils.encodeJSONString(x)>
{
   "id" : "${datasourceId}",
   <#if idProperty??>"idProperty" : "${idProperty}",</#if>
   "fields" :
   [
      <#list fields as field>
      {
         "name" : "${field.name}",
         <#if field.label??>
         "label" : "${field.label}",
         </#if>
         <#if field.description??>
         "description" : "${field.description}",
         </#if>
         "type" : "${field.datatype}"
      }<#if field_has_next>,</#if>
      </#list>
   ]
}
</#escape>
</#macro>
