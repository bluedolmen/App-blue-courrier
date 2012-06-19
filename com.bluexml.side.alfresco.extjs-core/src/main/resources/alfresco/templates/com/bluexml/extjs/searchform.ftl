<#include "/org/alfresco/include/alfresco-template.ftl" />
<#include "/com/bluexml/standalone-header.ftl" />

<@templateHeader>
	<@addStandaloneTemplateHeader/>
	<@script type="text/javascript" src="${page.url.context}/res/templates/britair/form/common.js"></@script>
</@>

<@templateBody>
	<div id="alf-hd">
	</div>
	<div id="bd">
		<div class="share-form">
			
			<@region scope="template" id="searchform" protected=true />
			         				
		</div>
	</div>
</@>

<@templateFooter>
	<@addStandaloneTemplateFooter/>
</@>
