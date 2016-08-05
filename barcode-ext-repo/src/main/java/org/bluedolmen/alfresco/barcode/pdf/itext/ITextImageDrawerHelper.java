package org.bluedolmen.alfresco.barcode.pdf.itext;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;

import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Position;
import org.bluedolmen.alfresco.barcode.pdf.LabelPageConfiguration.Rectangle;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Utilities;
import com.itextpdf.text.pdf.PdfContentByte;

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
		
        final com.itextpdf.text.Image image = com.itextpdf.text.Image.getInstance(bufferedImage, null);
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
		pdfContentByte.setColorStroke(new BaseColor(lineColor));
		
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
