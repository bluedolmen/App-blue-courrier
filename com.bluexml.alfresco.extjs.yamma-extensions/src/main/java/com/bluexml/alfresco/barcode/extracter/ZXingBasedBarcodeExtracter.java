package com.bluexml.alfresco.barcode.extracter;

import java.awt.image.BufferedImage;
import java.io.InputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.Reader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

public abstract class ZXingBasedBarcodeExtracter implements BarcodeExtracter {
		
	private final Log logger = LogFactory.getLog(getClass());
	
	public String extract(InputStream inputStream) throws BarcodeExtracterException {
		
		try {
			return extractInternal(inputStream);
		} 
		catch (NotFoundException e) {
			return null; // minor problem in our case
		}
		catch (Exception e) {
			throw new BarcodeExtracterException(e);
		}
		
	}

	public String extractSafe(InputStream inputStream) {
		
		try {
			return extract(inputStream);
		} catch (Exception e) {
			if (logger.isDebugEnabled()) {
				logger.debug("Ignoring exception while trying to extract the barcode value.", e);
			}
		}
		
		return null;
	}
	

	private String extractInternal(InputStream inputStream) throws Exception {

		final BufferedImage barCodeBufferedImage = extractFirstPageAsImage(inputStream);
		if (null == barCodeBufferedImage) return null;
				  
		final LuminanceSource source = new BufferedImageLuminanceSource(barCodeBufferedImage);  
		final BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source)); 
		
		final Reader reader = new MultiFormatReader();  
		final Result result = reader.decode(bitmap);	
		
		return result.getText();

	}
	
	protected abstract BufferedImage extractFirstPageAsImage(InputStream inputStream) throws Exception;
	

}
