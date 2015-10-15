<#if field.control.params.ds?exists><#assign ds=field.control.params.ds><#else><#assign ds=''></#if>
<#if field.control.params.width?exists><#assign width=field.control.params.width><#else><#assign width='30em'></#if>
<#if field.control.params.queryParam?exists><#assign queryParam=field.control.params.queryParam><#else><#assign queryParam='q'></#if>

<div class="form-field">
   <#if form.mode == "view">
      <div class="viewmode-field">
         <#if field.mandatory && !(field.value?is_number) && field.value == "">
            <span class="incomplete-warning"><img src="${url.context}/components/form/images/warning-16.png" title="${msg("form.field.incomplete")}" /><span>
         </#if>
         <span class="viewmode-label">${field.label?html}:</span>
         <#if field.control.params.activateLinks?? && field.control.params.activateLinks == "true">
            <#assign fieldValue=field.value?html?replace("((http|ftp|https):\\/\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?\\^=%&:\\/~\\+#]*[\\w\\-\\@?\\^=%&\\/~\\+#])?)", "<a href=\"$1\" target=\"_blank\">$1</a>", "r")>
         <#else>
            <#assign fieldValue=field.value?html>
         </#if>
         <span class="viewmode-value">${fieldValue}</span>
      </div>
   <#else>
      <label for="${fieldHtmlId}">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <div id="${fieldHtmlId}-autocomplete" style="width: ${width}; padding-bottom: 2em;">
         <div id="${fieldHtmlId}-container"></div>
      </div>
   </#if>
</div>

<script type="text/javascript">//<![CDATA[
(function() {

	var itemUrl = Alfresco.constants.PROXY_URI + "${ds}";
	
	function onItemCreate(itemId) {
		console.log('Created item : ' + itemId);
	};
	
	new Alfresco.widget.MultiSelectAutoComplete("${fieldHtmlId}-container", {
		itemUrl: itemUrl,
		formInputMode : "single",
		itemPath : "data.items",
		itemName : "title",
		itemId : "name",
		itemTemplate : "{title}",
		onItemCreate : onItemCreate 
	});
   
})();
//]]></script>