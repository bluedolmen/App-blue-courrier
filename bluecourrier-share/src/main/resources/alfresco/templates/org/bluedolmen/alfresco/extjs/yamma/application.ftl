<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader >

	<link rel="stylesheet" type="text/css" href="/extjs/resources/css/ext-all.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/bluedolmen/resources/css/extjs-custom.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/bluedolmen/resources/css/icons.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yaecma/resources/css/extjs-custom.css" />

	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/icons.css" />
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/yamma/resources/css/extjs-custom.css" />
	
	<@region id="config" scope="page"/>
	
	<script type="text/javascript" src="${url.context}/res/bluedolmen/i18n/i18next.min.js"></script>
	<script type="text/javascript">
	
		var options = {
			resGetPath : '${url.context}/res/yamma/resources/locales/__lng__/__ns__.json',
			lng : 'fr-FR',
			ns: { 
				namespaces: ['bc'], 
				defaultNs: 'bc'
			},
			fallbackNS: ['bc'] /* may be used for overloading */
		};
		i18n.init(options);
		
	</script>

    <#if DEBUG>	
	<script type="text/javascript" src="/extjs/ext-all-debug.js"></script>
	<#else>
	<script type="text/javascript" src="/extjs/ext-all.js"></script>
	</#if>
	<script type="text/javascript" src="/extjs/locale/ext-lang-${lang!"fr"}.js"></script>
	<script type="text/javascript" src="${url.context}/res/yamma/app.js"></script>
	
</@>


<body>
	<@region id="extensions" scope="page"/>
	<@region id="license" scope="page"/>

	<div id="loading-mask"></div>
	<div id="loading">
		<div class="applogo">
			<img class="applogo" src="/alfresco/service/bluedolmen/yamma/logo.png" />
		</div>
		<div id="logo-bluedolmen"></div><div id="loading-indicator"></div>
	</div>

</body>
