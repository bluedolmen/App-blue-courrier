<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader>
	<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/templates/bluedolmen/form/extjs-forms.css" />
<#if page.url.args.appCss??>
	<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/templates/${page.url.args.appCss}/form/extjs-forms.css" />
</#if>
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluedolmen/form/socket.js" ></@script>
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluedolmen/form/form-integration.js" ></@script>
</@>

<@templateBody>
	<div class="share-form">
		<@region scope="template" id="formPortlet" protected=true />
	</div>
</@>

<@templateFooter>
</@>
