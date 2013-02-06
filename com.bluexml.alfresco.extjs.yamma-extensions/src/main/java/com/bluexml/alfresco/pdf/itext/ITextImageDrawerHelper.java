package com.bluexml.alfresco.pdf.itext;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;

import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import com.bluexml.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Utilities;
import com.lowagie.text.pdf.PdfContentByte;

public final class ITextImageDrawerHelper {
	
	private final PdfContentByte pdfContentByte;
	
	public ITextImageDrawerHelper(PdfContentByte pdfContentByte) {
		
		if (null == pdfContentByte) throw new NullPointerException();
		this.pdfContentByte = pdfContentByte;
		
	}
	
	public void drawImage(BufferedImage bufferedImage, float bottomLeftX, float bottomLeftY, float availableWidth, float availableHeight) throws IOException, DocumentException {
		
		bottomLeftX = Utilities.millimetersToPoints(bottomLeftX);
		bottomLeftY = Utilities.millimetersToPoints(bottomLeftY);
		availableWidth = Utilities.millimetersToPoints(availableWidth);
		availableHeight = Utilities.millimetersToPoints(availableHeight);
		
        final com.lowagie.text.Image image = com.lowagie.text.Image.getInstance(bufferedImage, null);
        image.scaleToFit(availableWidth, availableHeight);
        
        final float scaledWidth = image.getScaledWidth();
        final float deltaX = (availableWidth - scaledWidth) / 2;
        final float scaledHeight = image.getScaledHeight();
        final float deltaY = (availableHeight - scaledHeight) / 2;
        
        image.setAbsolutePosition(bottomLeftX + deltaX, bottomLeftY + deltaY);
        pdfContentByte.addImage(image);
        
	}
	
	public void showLabelBorder(Position position, Rectangle labelSize, float lineWidth, Color lineColor) {
		
		pdfContentByte.saveState();
		
		pdfContentByte.setLineWidth(lineWidth);
		pdfContentByte.setColorStroke(lineColor);
		
		pdfContentByte.rectangle(
				Utilities.millimetersToPoints(position.x), 
				Utilities.millimetersToPoints(position.y), 
				Utilities.millimetersToPoints(labelSize.width), 
				Utilities.millimetersToPoints(labelSize.height)
		);
		
		pdfContentByte.stroke();
		pdfContentByte.restoreState();
	}

}
