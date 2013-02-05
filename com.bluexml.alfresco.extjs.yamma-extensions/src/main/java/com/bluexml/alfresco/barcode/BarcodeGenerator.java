package com.bluexml.alfresco.barcode;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

public interface BarcodeGenerator {

	// Value based

	public abstract void generate(String barcodeValue, OutputStream output, String mimetype) throws IOException;

	public abstract BufferedImage generate(String barcodeValue) throws IOException;

}
