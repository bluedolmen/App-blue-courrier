package org.bluedolmen.alfresco.barcode;

import java.awt.image.BufferedImage;
import java.io.OutputStream;

public interface BarcodeGenerator {

	public static final class BarcodeGeneratorException extends Exception {

		private static final long serialVersionUID = 6354915023345316074L;
		
		public BarcodeGeneratorException(Throwable t) {
			super(t);
		}
		
	}
	
	// Value based

	public abstract void generate(String barcodeValue, OutputStream output, String mimetype) throws BarcodeGeneratorException;

	public abstract BufferedImage generate(String barcodeValue) throws BarcodeGeneratorException;

}
