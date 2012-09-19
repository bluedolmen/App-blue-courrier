<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader>
	<style type="text/css">
		#Share div {
			height: 100%;
		}
	</style>
</@>

<#if !PORTLET>
<body id="Share" class="yui-skin-${theme} alfresco-share">
	<style type="text/css">
		.web-preview .previewer {
			height: 100%;
		}
	</style>
</#if>
	<@region scope="page" id="web-preview" protected=true />

<@templateFooter>
	<style type="text/css">
		.sticky-footer {
			display:none;
		}
	</style>
</@>
