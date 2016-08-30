<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader >
    
	<link rel="stylesheet" type="text/css" href="${extjs.root.path}/resources/css/ext-all.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/bluedolmen/resources/css/extjs-custom.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/bluedolmen/resources/css/icons.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/extjs-custom.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/extjs-custom.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/admin.css" />
	<script type="text/javascript" src="${url.context}/res/bluedolmen/i18n/i18next.min.js"></script>
    <#if DEBUG>	
	<script type="text/javascript" src="${extjs.root.path}/ext-all-debug.js"></script>
	<#else>
	<script type="text/javascript" src="${extjs.root.path}/ext-all.js"></script>
	</#if>
	<script type="text/javascript" src="${extjs.root.path}/locale/ext-lang-${lang!"fr"}.js"></script>
	<script type="text/javascript" src="${url.context}/res/yamma/admin/app.js"></script>
</@>


<body>
	<!-- div id="loading-mask"></div>
	<div id="loading">
		<div id="logo-application"></div>
		<div id="logo-bluedolmen"></div><div id="loading-indicator"></div>
	</div -->

</body>
