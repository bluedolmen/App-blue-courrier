package com.bluexml.alfresco.barcode.extracter;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.ghost4j.document.Document;
import org.ghost4j.document.DocumentException;
import org.ghost4j.document.PDFDocument;
import org.ghost4j.renderer.RendererException;
import org.ghost4j.renderer.SimpleRenderer;

public final class Ghost4JBarcodeExtracter extends ZXingBasedBarcodeExtracter {
	
	private final SimpleRenderer renderer = new SimpleRenderer();
	
	public Ghost4JBarcodeExtracter() {
		renderer.setResolution(300);
	}
	
	@Override
	protected BufferedImage extractFirstPageAsImage(InputStream inputStream) throws IOException, DocumentException, RendererException {
		// load PDF document
		Document pdfDocument = new PDFDocument();
		pdfDocument.load(inputStream);
		if ( pdfDocument.getPageCount() == 0) return null;
		inputStream.close();
		
		pdfDocument = pdfDocument.extract(1, 1); // keep the first page only (1-indexed)

		// render
		final List<Image> images = renderer.render(pdfDocument);
		final Image firstImage = images.get(0);
		
		if (!(firstImage instanceof BufferedImage)) {
			throw new IllegalStateException("The rendered-image is not of the expected type " + BufferedImage.class.getName());
		}
		
		return (BufferedImage) firstImage;
	}

	public void setResolution(int resolution) {
		renderer.setResolution(resolution);
	}

}
