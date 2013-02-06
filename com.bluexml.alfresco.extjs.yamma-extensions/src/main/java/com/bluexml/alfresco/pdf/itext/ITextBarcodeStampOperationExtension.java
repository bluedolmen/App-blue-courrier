package com.bluexml.alfresco.pdf.itext;

import java.awt.image.BufferedImage;

import org.alfresco.service.cmr.repository.NodeRef;

import com.bluexml.alfresco.barcode.BarcodeGenerator;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;
import com.bluexml.alfresco.pdf.Merger;
import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.itext.ITextMergeOperation.MergerListener;
import com.bluexml.alfresco.pdf.itext.InputSourceFactory.InputSource;
import com.bluexml.alfresco.reference.ReferenceProviderService;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfCopy.PageStamp;

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
