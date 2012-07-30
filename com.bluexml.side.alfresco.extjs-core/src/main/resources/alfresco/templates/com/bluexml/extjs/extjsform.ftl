<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader>
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluexml/form/socket.js" ></@script>
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluexml/form/form-integration.js" ></@script>
</@>

<@templateBody>
	<div class="share-form">
		<@region scope="template" id="formPortlet" protected=true />
	</div>
</@>

<@templateFooter>
</@>
