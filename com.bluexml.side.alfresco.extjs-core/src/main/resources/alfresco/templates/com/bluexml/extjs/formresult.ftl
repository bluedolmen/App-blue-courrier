<#include "/org/alfresco/include/alfresco-template.ftl" />
<#assign success=page.url.args.nodeRef??/>

<@templateHeader >
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluexml/form/common.js"></@script>
	<script type="text/javascript">
	(function() {
	
		document.onformaction.fire(
			<#if success>
			"success",
			"${page.url.args.nodeRef}"
			<#else>
			"error",
			<#if page.url.args.mesg??>
			"${page.url.args.mesg}"
			<#elseif page.url.args.error??>
			"${page.url.args.error}"			 
			<#else>"unknown error"</#if>
			</#if>
		);
		
	})();
	</script>
</@>

<body>
</body>
