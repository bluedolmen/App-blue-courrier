package com.bluexml.alfresco.barcode.extracter;

import java.io.InputStream;

public interface BarcodeExtracter {

	public static final class BarcodeExtracterException extends Exception {

		private static final long serialVersionUID = 1358124812364531486L;
		
		public BarcodeExtracterException(Throwable t) {
			super(t);
		}
		
	}
	
	String extract(InputStream inputStream) throws BarcodeExtracterException;
	
	String extractSafe(InputStream inputStream);

}