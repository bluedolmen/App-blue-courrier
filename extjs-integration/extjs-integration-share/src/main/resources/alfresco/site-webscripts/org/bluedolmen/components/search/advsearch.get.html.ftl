<#-- JavaScript Dependencies -->
<@script type="text/javascript" src="${url.context}/res/components/form/form.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/date.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/date-picker.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/period.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/percentage-approve.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/object-finder/object-finder.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/rich-text.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/content.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/workflow/transitions.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/workflow/activiti-transitions.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/form/jmx/operations.js" group="form"/>
<@script type="text/javascript" src="${url.context}/res/components/object-finder/cloud-object-finder.js" group="form"/>


<#include "/org/alfresco/components/component.head.inc">
<#include "/org/alfresco/components/form/form.get.head.ftl">
<!-- Advanced Search -->
<@script type="text/javascript" src="${page.url.context}/res/components/form/date-range.js"></@script>
<@script type="text/javascript" src="${page.url.context}/res/components/form/number-range.js"></@script>
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/search/search.css" />
<@script type="text/javascript" src="${page.url.context}/res/components/search/advsearch.js"></@script>
<!-- overloading version -->
<@script type="text/javascript" src="${page.url.context}/res/components/bluedolmen/search/socket-advsearch.js"></@script>


<#if config.global.forms?exists && config.global.forms.dependencies?exists && config.global.forms.dependencies.js?exists>
   <#list config.global.forms.dependencies.js as jsFile>
      <@script type="text/javascript" src="${url.context}/res${jsFile}" group="form"/>
   </#list>
</#if>

<#assign el=args.htmlid>

<script type="text/javascript">//<![CDATA[
   new Bluedolmen.SocketAdvancedSearch("${el}").setOptions(
   {
      siteId: "${siteId}",
      searchForms: [<#list searchForms as f>
      {
         id: "${f.id}",
         type: "${f.type}",
         label: "${f.label?js_string}",
         description: "${f.description?js_string}"
      }<#if f_has_next>,</#if></#list>],
      savedQuery: "${(page.url.args["sq"]!"")?js_string}"
   }).setMessages(
      ${messages}
   );
//]]></script>


<div id="${el}-body" class="search">

   <#-- keywords entry box -->
   <div class="keywords-box <#if page.url.args["showKeywords"]!"false" != "true">hidden</#if>">
      <div>${msg("label.keywords")}:</div>
      <input type="text" class="terms" name="${el}-search-text" id="${el}-search-text" value="${(page.url.args["st"]!"")?html}" maxlength="1024" />
   </div>
	 
   <#-- container for forms retrieved via ajax -->
	<div id="${el}-forms" class="forms-container form-fields"></div>
   
	<div class="yui-gc form-row">
		<div class="yui-u first"></div>
      <#-- search button -->
		<div class="yui-u align-right">
			<span id="${el}-search-button-2" class="yui-button yui-push-button search-icon">
				<span class="first-child">
					<button type="button">${msg('button.search')}</button>
				</span>
			</span>
		</div>
	</div>
   
</div>
