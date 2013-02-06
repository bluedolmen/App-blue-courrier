package com.bluexml.alfresco.pdf.itext;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

import com.bluexml.alfresco.barcode.BarcodeGenerator.BarcodeGeneratorException;
import com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.LabelPageIterator;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.MarginConfiguration;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Utilities;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;

public class ITextBarcodeLabelPdfDocument extends AbstractBarcodeLabelPdfDocument {
	
	private boolean showLabelBorders = false;
	
	@Override
	protected com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation getOperation() {
		return new GenerateOperation();
	}	
	
	private final class GenerateOperation implements com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation {
		
		private int labelNumber = -1;
		private Document doc = null;
		private PdfWriter writer = null;
		private PdfContentByte over = null;
		
		private final MarginConfiguration labelPadding = pageConfiguration.getLabelPadding();
		private final Rectangle labelSize = pageConfiguration.getLabelSize();
				
		public synchronized void execute(OutputStream output, int labelNumber) throws Exception {

			this.labelNumber = labelNumber;
			
	        try {
	        	
	        	createPdfDocument(output);
	        	
	        	while (this.labelNumber > 0) {
	        		createNewPage();
	        		drawPageLabels();
	        	}
	            
	            doc.close();
	            
	        }
	        
	        finally {
	        	if( writer != null ) writer.close();
	        }
			
		}
		
		private void createPdfDocument(OutputStream output) throws IOException, DocumentException {
			final Rectangle pageSize = pageConfiguration.getPageSize();
			
			doc = new Document(
					new com.lowagie.text.Rectangle(
							Utilities.millimetersToPoints(pageSize.width), 
							Utilities.millimetersToPoints(pageSize.height)
					)
			);
			writer = PdfWriter.getInstance(doc, output);
			doc.open();
		}
		
		private void createNewPage() throws IOException {
			//doc.newPage();
			writer.setPageEmpty(false);
			over = writer.getDirectContent();
		}
				
		private void drawPageLabels() throws IOException, DocumentException, BarcodeGeneratorException {
			
			final LabelPageIterator iterator = pageConfiguration.getLabelIterator();
			final ITextImageDrawerHelper helper = new ITextImageDrawerHelper(over);
			
			while (iterator.hasNext()) {
				
				if (labelNumber-- <= 0) break; // break early
				
				final Position position = iterator.next();
				if (showLabelBorders) helper.showLabelBorder(position, labelSize, 1f, new Color(220,220,220));
				
	            final BufferedImage bufferedImage = getNextBarcode(null);
	            
	            final float bottomLeftX = position.x + labelPadding.getLeft();
	            final float bottomLeftY = position.y + labelPadding.getDown();
	            
	            final float availableWidth = labelSize.width - labelPadding.getLeft() - labelPadding.getRight();
	            final float availableHeight = labelSize.height - labelPadding.getUp() - labelPadding.getDown();
	            
	            helper.drawImage(bufferedImage, bottomLeftX, bottomLeftY, availableWidth, availableHeight);
	            
			}
            
            
		}
		
		
		private BufferedImage getNextBarcode(Object config) throws BarcodeGeneratorException  {
			
			final String newReference = referenceProvider.getUnboundReference(config);
			return barcodeGenerator.generate(newReference);
			
		}
		
	}
	

	/*
	 * Spring IoC/DI material
	 */
	
	public void setShowLabelBorders(boolean showLabelBorders) {
		this.showLabelBorders = showLabelBorders;
	}
}
