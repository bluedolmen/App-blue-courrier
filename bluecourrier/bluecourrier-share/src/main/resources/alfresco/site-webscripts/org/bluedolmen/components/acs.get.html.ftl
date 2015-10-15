<#include "/org/alfresco/components/component.head.inc">

<#if acs.url??>
<#assign style>
<#if acs.width??>width:${acs.width};</#if><#if acs.height??>height:${acs.height};</#if>
</#assign>
	<div id="acs" class="acs" style="${style}">
		<iframe src="${acs.url}" title="ACS" name="ACS">
		</iframe>
	</div>
</#if>

