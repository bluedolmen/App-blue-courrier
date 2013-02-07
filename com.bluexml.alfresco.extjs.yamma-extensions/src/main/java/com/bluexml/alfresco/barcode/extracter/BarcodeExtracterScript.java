package com.bluexml.alfresco.barcode.extracter;

import java.io.InputStream;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;


public final class BarcodeExtracterScript extends BaseScopableProcessorExtension {
	
//	private static Log logger = LogFactory.getLog(BarcodeExtracterScript.class);
	
	private BarcodeExtracter barcodeExtracter;
	private FileFolderService fileFolderService;

	public String extract(ScriptNode node)  {
		
		final NodeRef nodeRef = node.getNodeRef();
		final ContentReader reader = fileFolderService.getReader(nodeRef);
		
		final InputStream inputStream = reader.getContentInputStream();
		final String value = barcodeExtracter.extractSafe(inputStream);
		
		return value;
	}
	
	/*
	 * Spring IoC/DI material
	 */
	
	public void setBarcodeExtracter(BarcodeExtracter extracter) {
		this.barcodeExtracter = extracter;
	}
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
}
