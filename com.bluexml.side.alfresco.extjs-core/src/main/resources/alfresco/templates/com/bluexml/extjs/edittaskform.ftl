<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader>
	<style type="text/css">
		.share-form .yui-nav li:first-child + li {
			display:none;
		}
	</style>

	<@script type="text/javascript" src="${page.url.context}/res/templates/britair/form/socket.js" ></@script>
	<@script type="text/javascript" src="${page.url.context}/res/templates/britair/form/form-integration.js" ></@script>
</@>

<@templateBody>
	<div class="share-form">
		<@region scope="template" id="formPortlet" protected=true />
	</div>
</@>

<@templateFooter>
</@>
