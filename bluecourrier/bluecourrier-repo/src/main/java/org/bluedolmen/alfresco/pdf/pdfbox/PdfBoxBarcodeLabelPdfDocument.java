package org.bluedolmen.alfresco.pdf.pdfbox;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.alfresco.repo.content.MimetypeMap;
import org.apache.pdfbox.exceptions.COSVisitorException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.edit.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDJpeg;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDXObjectImage;

import org.bluedolmen.alfresco.barcode.BarcodeGenerator.BarcodeGeneratorException;
import org.bluedolmen.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.LabelPageIterator;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.MarginConfiguration;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;

public class PdfBoxBarcodeLabelPdfDocument extends AbstractBarcodeLabelPdfDocument {
		
	@Override
	protected org.bluedolmen.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation getOperation() {
		return new GenerateOperation();
	}

	
	
	private final class GenerateOperation implements org.bluedolmen.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateOperation {
		
		private int labelNumber = -1;
		private PDDocument doc = null;
		private PDPage page = null;
		private PDPageContentStream contentStream = null;
		
		private final MarginConfiguration labelPadding = pageConfiguration.getLabelPadding();
				
		public synchronized void execute(OutputStream output, int labelNumber) throws IOException, COSVisitorException, BarcodeGeneratorException {

			this.labelNumber = labelNumber;
			
	        try {
	        	
	        	createPdfDocument();
	        	
	        	while (this.labelNumber > 0) {
	        		createNewPage();
	        		openContentStream();
	        		drawPageLabels();
	        		closeContentStream();
	        	}
	            
	            doc.save( output );
	            
	        }
	        
	        finally {
	        	if( doc != null ) doc.close();
	        }
			
		}
		
		private void createPdfDocument() throws IOException {
			this.doc = new PDDocument();
		}
		
		private void createNewPage() throws IOException {
			final Rectangle pageSize = pageConfiguration.getPageSize(); 
			page = new PDPage(new PDRectangle(
					pageSize.width * LabelPageConfiguration.MM_TO_UNITS, 
					pageSize.height * LabelPageConfiguration.MM_TO_UNITS
			));
            doc.addPage( page );
		}
		
		private void openContentStream() throws IOException {
			contentStream = new PDPageContentStream(doc, page);
		}
		
		private void closeContentStream() throws IOException {
			contentStream.close();
		}
		
		private void drawPageLabels() throws IOException, BarcodeGeneratorException {
			
			final LabelPageIterator iterator = pageConfiguration.getLabelIterator();
			contentStream.setNonStrokingColor(180, 180, 180);
			
			while (iterator.hasNext()) {
				
				if (labelNumber-- <= 0) break; // break early
				
				final Position position = iterator.next();
				
				contentStream.saveGraphicsState();
				contentStream.drawPolygon(
						new float[]{
							position.x * LabelPageConfiguration.MM_TO_UNITS,
							( position.x + pageConfiguration.getLabelSize().width ) * LabelPageConfiguration.MM_TO_UNITS,
							( position.x + pageConfiguration.getLabelSize().width ) * LabelPageConfiguration.MM_TO_UNITS,
							position.x * LabelPageConfiguration.MM_TO_UNITS
						}, 
						new float[]{
							position.y * LabelPageConfiguration.MM_TO_UNITS,
							position.y * LabelPageConfiguration.MM_TO_UNITS,
							(position.y + pageConfiguration.getLabelSize().height ) * LabelPageConfiguration.MM_TO_UNITS,
							(position.y + pageConfiguration.getLabelSize().height ) * LabelPageConfiguration.MM_TO_UNITS
						}
				);
				contentStream.stroke();
				contentStream.restoreGraphicsState();
				
	            final InputStream input = getNextBarcode(null);
	            final PDXObjectImage ximage = new PDJpeg( doc, input );
	            
	            contentStream.saveGraphicsState();
	            final float bottomLeftX = (position.x + labelPadding.getLeft()) * LabelPageConfiguration.MM_TO_UNITS; // interpret sizes to mm
	            final float bottomLeftY = (position.y + labelPadding.getDown()) * LabelPageConfiguration.MM_TO_UNITS;
	            contentStream.drawImage( ximage, bottomLeftX, bottomLeftY );
	            contentStream.restoreGraphicsState();
				
			}
            
            
		}
		
		private InputStream getNextBarcode(Object config) throws BarcodeGeneratorException {
			
			final ByteArrayOutputStream output = new ByteArrayOutputStream();
			final String newReference = referenceProvider.getUnboundReference(config);
			
			barcodeGenerator.generate(newReference, output, MimetypeMap.MIMETYPE_IMAGE_JPEG);
			return new ByteArrayInputStream(output.toByteArray());
			
		}
		
	}
	
}
