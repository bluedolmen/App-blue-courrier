package com.bluexml.alfresco.pdf.pdfbox;

import java.awt.image.BufferedImage;

import org.apache.pdfbox.pdmodel.edit.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDJpeg;

import com.bluexml.alfresco.barcode.BarcodeGenerator;

public abstract class PdfBoxBarcodeStampOperation extends PdfBoxStampOperation {
	
	protected BarcodeGenerator barcodeGenerator;

	@Override
	protected void addStampToStream(final PDPageContentStream contentStream) throws Exception {
		
//		PDFont font = PDType1Font.HELVETICA_BOLD;
//        float fontSize = 36.0f;
//        contentStream.beginText();
//        // set font and font size
//        contentStream.setFont( font, fontSize );
//        // set text color to red
//        contentStream.setNonStrokingColor(255, 0, 0);
//        contentStream.drawString( "Hello World!" );
//        contentStream.endText();
        
		
		final BufferedImage bufferedImage = getBarcode();
		final PDJpeg codebarImage = new PDJpeg(document, bufferedImage);
		
		contentStream.drawImage(codebarImage, 50, 50);

	}
	
	protected abstract BufferedImage getBarcode() throws Exception;
	
	
	public void setBarcodeGenerator(BarcodeGenerator barcodeGenerator) {
		this.barcodeGenerator = barcodeGenerator;
	}
	

}
