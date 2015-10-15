<#-- Renders a hidden form field for edit and create modes only -->
<#assign fieldValue = "">
<#if field.control.params.contextProperty??>
   <#if context.properties[field.control.params.contextProperty]??>
      <#assign fieldValue = context.properties[field.control.params.contextProperty]>
   <#elseif args[field.control.params.contextProperty]??>
      <#assign fieldValue = args[field.control.params.contextProperty]>
   </#if>
<#elseif context.properties[field.name]??>
   <#assign fieldValue = context.properties[field.name]>
<#elseif (!field.value?? || field.value == "") && field.control.params.initialValue??>
   <#assign fieldValue="${field.control.params.initialValue}"> 
<#else>
   <#assign fieldValue = field.value>
</#if>

<#if form.mode == "edit" || form.mode == "create">
   <input type="hidden" name="${field.name}" 
          <#if field.value?is_number>value="${fieldValue?c}"<#else>value="${fieldValue?html}"</#if> />
</#if>
