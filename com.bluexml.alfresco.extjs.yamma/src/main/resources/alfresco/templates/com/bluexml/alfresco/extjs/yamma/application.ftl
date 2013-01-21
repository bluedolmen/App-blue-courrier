<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader >
	<@link rel="stylesheet" type="text/css" href="/scripts/extjs/resources/css/ext-all.css" />
	<script type="text/javascript" src="/scripts/extjs/ext-dev.js"></script>

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/extjs-custom.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/extjs-custom.css" />
	<script type="text/javascript" src="${url.context}/res/yamma/app.js"></script>
</@>

<body>
	<div id="loading-mask"></div>
	<div id="loading">
		<div id="logo-yamma"></div>
		<div class="loading-indicator">
			Chargement de l'application en cours.<br/>
			Veuillez patienter...
		</div>
		<div id="logo-bluexml"></div>
	</div>

</body>