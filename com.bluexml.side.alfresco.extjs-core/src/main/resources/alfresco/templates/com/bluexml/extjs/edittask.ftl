<#include "/org/alfresco/include/alfresco-template.ftl" />
<#include "/com/bluexml/standalone-header.ftl" />

<@templateHeader>
	<@addStandaloneTemplateHeader/>
	<@script type="text/javascript" src="${page.url.context}/res/templates/britair/form/edittask.js" ></@script>
</@templateHeader>

<@templateBody>
   <div id="alf-hd">
   </div>
   <div id="bd">
      <div class="share-form">
         <@region id="data-form" scope="page" />
      </div>
   </div>
</@>

<@templateFooter>
	<div id="alf-ft">				   	
	</div>
</@>