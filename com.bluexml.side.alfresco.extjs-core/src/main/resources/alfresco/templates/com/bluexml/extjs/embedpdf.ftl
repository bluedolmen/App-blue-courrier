<#include "/org/alfresco/include/alfresco-template.ftl" />

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>${msg("page.title", pageTitle)}</title>
		<meta http-equiv="X-UA-Compatible" content="Edge" />
	   
		<!-- Shortcut Icons -->
		<link rel="shortcut icon" href="${url.context}/res/favicon.ico" type="image/vnd.microsoft.icon" />
		<link rel="icon" href="${url.context}/res/favicon.ico" type="image/vnd.microsoft.icon" />
		
		<!-- yui is used for onReady -->
		<script type="text/javascript" src="${url.context}/res/js/yui-common.js"></script>
		${head}
	</head>

	<body id="PdfObject" class="extjs-embedpdf" style=" margin:0; height:100%" >
			<@region scope="template" id="embedded-pdf" protected=true />
	</body>
</html>