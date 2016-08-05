package org.bluedolmen.alfresco.barcode.pdf.itext;

import java.awt.image.BufferedImage;

import org.alfresco.service.cmr.repository.NodeRef;

import org.bluedolmen.alfresco.barcode.BarcodeGenerator;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;
import org.bluedolmen.alfresco.pdf.Merger;
import org.bluedolmen.alfresco.pdf.PdfOperationConfig;
import org.bluedolmen.alfresco.pdf.itext.AbstractITextExtension;
import org.bluedolmen.alfresco.pdf.itext.ITextMergeOperation;
import org.bluedolmen.alfresco.pdf.itext.InputSourceFactory;
import org.bluedolmen.alfresco.pdf.itext.ITextMergeOperation.MergerListener;
import org.bluedolmen.alfresco.pdf.itext.InputSourceFactory.InputSource;
import org.bluedolmen.alfresco.reference.ReferenceProviderService;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfCopy.PageStamp;

public class ITextBarcodeStampOperationExtension extends AbstractITextExtension implements MergerListener {
	
	private ReferenceProviderService referenceProviderService;	
	protected BarcodeGenerator barcodeGenerator;
	protected Position position;
	protected Rectangle barcodeSize;
	
	
	public boolean isActive(PdfOperationConfig config) {
		return "barcode".equals(config.getValue(Merger.STAMPED, String.class));
	}	

	public boolean notifyPageAppended(InputSource inputSource, PageStamp stamper, String eventType) throws Exception {
		
		if (!MergerListener.FIRST_PAGE.equals(eventType)) return true;
		
		return new InternalOperation(inputSource, stamper).execute();
		
	}	
	
	private final class InternalOperation {
		
		private final PageStamp stamper;
		private final InputSource source;
		private final PdfContentByte content;
		
		private InternalOperation(InputSource source, PageStamp stamper) {
			this.source = source;
			this.stamper = stamper;
			this.content = stamper.getOverContent();
		}
		
		private boolean execute() throws Exception {
			
			final NodeRef nodeRef = source.getNodeRef();
			final String referenceValue = referenceProviderService.getExistingReference(nodeRef);
			if (null == referenceValue) return false;
			
			stampPage(referenceValue);
			stamper.alterContents();
			
			return true;
		}
		
		private void stampPage(String barcodeValue) throws Exception {
			
			final ITextImageDrawerHelper helper = new ITextImageDrawerHelper(content);
			final BufferedImage barcode = barcodeGenerator.generate(barcodeValue);
			helper.drawImage(barcode, position.x, position.y, barcodeSize.width, barcodeSize.height);
			
		}
		
	}
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}	
	
	public void setBarcodeGenerator(BarcodeGenerator barcodeGenerator) {
		this.barcodeGenerator = barcodeGenerator;
	}
	
	public void setBarcodePosition(Position position) {
		this.position = position;
	}
	
	public void setBarcodeSize(Rectangle barcodeSize) {
		this.barcodeSize = barcodeSize;
	}


}
