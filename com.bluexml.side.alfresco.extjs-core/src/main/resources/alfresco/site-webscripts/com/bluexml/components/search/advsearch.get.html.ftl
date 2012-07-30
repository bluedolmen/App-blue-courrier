<#assign el=args.htmlid>

<script type="text/javascript">//<![CDATA[
   new Bluexml.SocketAdvancedSearch("${el}").setOptions(
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