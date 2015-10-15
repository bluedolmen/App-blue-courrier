package org.bluedolmen.alfresco.barcode.extracter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import org.junit.Test;

import org.bluedolmen.alfresco.barcode.extracter.BarcodeExtracter.BarcodeExtracterException;

public class PdfBoxBarcodeExtracterTesX {

	private static final String QRCODE_1 = "yamma/pdf/file-with-qrcode_1.pdf";
	
	@Test
	public void test() throws BarcodeExtracterException, IOException {
		
		final BarcodeExtracter extracter = new PdfBoxBarcodeExtracter();
		
		final URL testFile1 = getClass().getClassLoader().getResource(QRCODE_1);
		if (null == testFile1) {
			fail("Cannot load the test-file resource");
		}
		
		final InputStream pdfFile = testFile1.openStream();
		final String value = extracter.extract(pdfFile);
		
		assertEquals("13", value);
		
	}

}
