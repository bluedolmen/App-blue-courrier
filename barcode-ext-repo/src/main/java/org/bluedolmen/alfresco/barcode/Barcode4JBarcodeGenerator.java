package org.bluedolmen.alfresco.barcode;

import java.awt.image.BufferedImage;
import java.io.OutputStream;

import org.krysalis.barcode4j.impl.AbstractBarcodeBean;
import org.krysalis.barcode4j.output.bitmap.BitmapCanvasProvider;


public class Barcode4JBarcodeGenerator implements BarcodeGenerator {
	
	private AbstractBarcodeBean barcodeGenerator;
	private String mimetype;
	private int resolution;
	private boolean antiAlias = true;
	private int orientation = 0;

	public void generate(String barcodeValue, OutputStream output, String mimetype) throws BarcodeGeneratorException {
		
		if (null == barcodeValue || barcodeValue.isEmpty()) {
			throw new IllegalArgumentException("The provided barcode-value is not valid (null or empty).");
		}
		
		mimetype = null != mimetype ? mimetype : this.mimetype;
        
        //Set up the canvas provider to create a monochrome bitmap
		final BitmapCanvasProvider canvas = new BitmapCanvasProvider(
				output,
				mimetype,
				resolution,
				BufferedImage.TYPE_BYTE_BINARY,
				antiAlias, 
				orientation
		);

        //Generate the barcode
        barcodeGenerator.generateBarcode(canvas, barcodeValue);

        //Signal end of generation
        try {
	        try {
				canvas.finish();
			} finally {
				output.close();
			}
        } catch (Exception e) {
        	throw new BarcodeGeneratorException(e);
        }
		
	}

	public BufferedImage generate(String barcodeValue) throws BarcodeGeneratorException {
		
		if (null == barcodeValue || barcodeValue.isEmpty()) {
			throw new IllegalArgumentException("The provided barcode-value is not valid (null or empty).");
		}
		
        //Set up the canvas provider to create a monochrome bitmap
		final BitmapCanvasProvider canvas = new BitmapCanvasProvider(
				resolution,
				BufferedImage.TYPE_BYTE_BINARY,
				antiAlias, 
				orientation
		);

        //Generate the barcode
        barcodeGenerator.generateBarcode(canvas, barcodeValue);

        try {
        	
			canvas.finish();
	        return canvas.getBufferedImage();
	        
        } catch (Exception e) {
        	throw new BarcodeGeneratorException(e);
        }
		
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
