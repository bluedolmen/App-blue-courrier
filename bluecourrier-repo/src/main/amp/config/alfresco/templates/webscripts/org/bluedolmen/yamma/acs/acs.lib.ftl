<#macro renderACS>
<#escape x as jsonUtils.encodeJSONString(x)>
<#if active>
{
	<#if (width > 0) >width: '${width}px',</#if>
	<#if (height > 0) >height: '${height}px',</#if>
	<#if source??>url: '${source}',</#if>
	region : '${region!east}'
}
<#else>
{
	/* ACS is not activated */
}
</#if>
</#escape>
</#macro>
