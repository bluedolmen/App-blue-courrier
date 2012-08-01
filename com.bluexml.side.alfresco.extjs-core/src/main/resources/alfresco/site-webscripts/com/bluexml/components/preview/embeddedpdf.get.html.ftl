<#assign el=args.htmlid?html>

<script type="text/javascript">//<![CDATA[
	var Event = YAHOO.util.Event;
	Event.onContentReady('${el}-embeddedpdf', onPdfContainerReady);
	
	function onPdfContainerReady() {
		var pdfObject = new PDFObject(
			{ 
				url: "${page.url.context}/proxy/alfresco/${contentUrl}",
				pdfOpenParams: { 
					zoom: '100' 
				}
			}
		).embed("${el}-embeddedpdf");
		if (!pdfObject) return; // acccessing the pdfObject seems to fix the problem of pdf object not loaded
		
	};
//]]></script>

<div id="${el}-embeddedpdf" class="embeddedpdf">
	<span class="pdfsupportmissing">${msg("label.pdfsupportmissing")}.<a href="${downloadUrl}">${msg("label.downloadpdf")}</a></span>
</div>
