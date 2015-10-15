package org.bluedolmen.alfresco.yamma.pdf;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;

import org.bluedolmen.alfresco.pdf.itext.ITextBarcodeStampOperationExtension;
import org.bluedolmen.alfresco.pdf.itext.InputSourceFactory.InputSource;
import org.bluedolmen.alfresco.yamma.BlueCourrierModel;
import com.itextpdf.text.pdf.PdfCopy.PageStamp;

public class ITextYammaBarcodeStampOperation extends ITextBarcodeStampOperationExtension {
	
	private NodeService nodeService;
	
	public boolean notifyPageAppended(InputSource inputSource, PageStamp stamper, String eventType) throws Exception {
		
		// Only stamp with a barcode the replies and not the attached files
		final NodeRef nodeRef = inputSource.getNodeRef();
		final QName typeQName = nodeService.getType(nodeRef);
		if (!BlueCourrierModel.ASPECT_OUTBOUND_MAIL.equals(typeQName)) return true; 
		
		return super.notifyPageAppended(inputSource, stamper, eventType);
		
	}	
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

}
