package com.bluexml.alfresco.barcode;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

import org.krysalis.barcode4j.impl.AbstractBarcodeBean;
import org.krysalis.barcode4j.output.bitmap.BitmapCanvasProvider;


public class BarcodeGeneratorImpl implements BarcodeGenerator {
	
	private AbstractBarcodeBean barcodeGenerator;
	private String mimetype;
	private int resolution;

	/* (non-Javadoc)
	 * @see com.bluexml.alfresco.barcode.BarcodeService#generate(java.lang.String, java.io.OutputStream)
	 */
	public void generate(String barcodeValue, OutputStream output) throws IOException {
		generate(barcodeValue, output, (String) null);
	}
	
	/* (non-Javadoc)
	 * @see com.bluexml.alfresco.barcode.BarcodeService#generate(java.lang.String, java.io.OutputStream, java.lang.String)
	 */
	public void generate(String barcodeValue, OutputStream output, String mimetype) throws IOException {
		
		if (null == barcodeValue || barcodeValue.isEmpty()) {
			throw new IllegalArgumentException("The provided barcode-value is not valid (null or empty).");
		}
		
		mimetype = null != mimetype ? mimetype : this.mimetype;
        final int orientation = 0;
        
        //Set up the canvas provider to create a monochrome bitmap
		final BitmapCanvasProvider canvas = new BitmapCanvasProvider(
				output,
				mimetype,
				resolution,
				BufferedImage.TYPE_BYTE_BINARY,
				false, /* antiAlias */ 
				orientation
		);

        //Generate the barcode
        barcodeGenerator.generateBarcode(canvas, barcodeValue);

        //Signal end of generation
        try {
			canvas.finish();
		} finally {
			output.close();
		}
		
	}

	public BufferedImage generate(String barcodeValue) throws IOException {
		if (null == barcodeValue || barcodeValue.isEmpty()) {
			throw new IllegalArgumentException("The provided barcode-value is not valid (null or empty).");
		}
		
        int orientation = 0;
        
        //Set up the canvas provider to create a monochrome bitmap
		final BitmapCanvasProvider canvas = new BitmapCanvasProvider(
				resolution,
				BufferedImage.TYPE_BYTE_BINARY,
				false, /* antiAlias */ 
				orientation
		);

        //Generate the barcode
        barcodeGenerator.generateBarcode(canvas, barcodeValue);

        canvas.finish();
		
        return canvas.getBufferedImage();
	}
		
	
	public void setBarcodeGenerator(AbstractBarcodeBean barcodeGenerator) {
		this.barcodeGenerator = barcodeGenerator;
	}
	
	public void setMimetype(String mimetype) {
		this.mimetype = mimetype;
	}
	
	public void setResolution(int resolution) {
		this.resolution = resolution;
	}

}
