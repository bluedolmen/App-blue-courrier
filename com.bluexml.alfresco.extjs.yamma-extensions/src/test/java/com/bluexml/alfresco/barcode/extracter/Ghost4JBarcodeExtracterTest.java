package com.bluexml.alfresco.barcode.extracter;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import org.junit.Test;

import com.bluexml.alfresco.barcode.extracter.BarcodeExtracter.BarcodeExtracterException;

public class Ghost4JBarcodeExtracterTest {

	private static final String QRCODE_1 = "yamma/pdf/file-with-qrcode_1.pdf";
	
	@Test
	public void test() throws BarcodeExtracterException, IOException {
		
		final BarcodeExtracter extracter = new Ghost4JBarcodeExtracter();
		
		final URL testFile1 = getClass().getClassLoader().getResource(QRCODE_1);
		if (null == testFile1) {
			fail("Cannot load the test-file resource");
		}
		
		final InputStream pdfFile = testFile1.openStream();
		final String value = extracter.extract(pdfFile);
		
		assertEquals("13", value);
		
	}

}
