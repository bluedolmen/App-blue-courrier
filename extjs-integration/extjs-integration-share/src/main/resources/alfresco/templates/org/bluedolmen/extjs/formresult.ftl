<#include "/org/alfresco/include/alfresco-template.ftl" />
<#assign success=page.url.args.nodeRef??/>

<@templateHeader >
	<@script type="text/javascript" src="${page.url.context}/res/templates/bluedolmen/form/socket.js" ></@script>
	
	<script type="text/javascript">
		var result = {
			eventType : 'form-result',
			state : '<#if page.url.args.error??>failure<#else>success</#if>',
			message : '<#if page.url.args.mesg??>${page.url.args.mesg?js_string}<#elseif page.url.args.error??>${page.url.args.error?js_string}</#if>'
		};
	
		Bluedolmen.Socket.Default.postMessage(result);
		
	</script>
</@>

<body>
</body>
