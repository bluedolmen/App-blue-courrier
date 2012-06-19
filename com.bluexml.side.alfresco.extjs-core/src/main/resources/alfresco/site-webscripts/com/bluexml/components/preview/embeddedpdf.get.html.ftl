<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
window.onload = function (){
	var success = new PDFObject(
		{ 
			url: "${page.url.context}/proxy/alfresco/${contentUrl}",
			pdfOpenParams: { 
				zoom: '100', 
				scrollbars: '0', 
				toolbar: '0', 
				statusbar: '0', 
				messages: '1', 
				navpanes: '1' 
			}
		}
	).embed("${el}-embeddedpdf");
};
//]]></script>

<div id="${el}-embeddedpdf" class="embeddedpdf">
	<span class="pdfsupportmissing">${msg("label.pdfsupportmissing")}.<a href="${downloadUrl}">${msg("label.downloadpdf")}</a></span>
</div>
