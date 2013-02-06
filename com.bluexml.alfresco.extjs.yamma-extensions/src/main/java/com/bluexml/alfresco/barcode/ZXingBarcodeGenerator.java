package com.bluexml.alfresco.barcode;

import java.awt.image.BufferedImage;
import java.io.OutputStream;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.Writer;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

public class ZXingBarcodeGenerator implements BarcodeGenerator {

	private ZXingWriterConfig writerConfig;
	
	public void generate(String barcodeValue, OutputStream output, String format) throws BarcodeGeneratorException {
		
		try {
			final BitMatrix bitMatrix = writerConfig.writer.encode(barcodeValue, writerConfig.format, writerConfig.width, writerConfig.height);
			MatrixToImageWriter.writeToStream(bitMatrix, format, output);
		} catch (Exception e) {
			throw new BarcodeGeneratorException(e);
		}
		
	}

	public BufferedImage generate(String barcodeValue) throws BarcodeGeneratorException {
		
		try {
			final BitMatrix bitMatrix = writerConfig.writer.encode(barcodeValue, writerConfig.format, writerConfig.width, writerConfig.height);
			return MatrixToImageWriter.toBufferedImage(bitMatrix);
		} catch (Exception e) {
			throw new BarcodeGeneratorException(e);
		}
		
	}
	
	public void setWriterConfig(ZXingWriterConfig writerConfig) {
		this.writerConfig = writerConfig;
	}

	public static final class ZXingWriterConfig {
		
		private Writer writer;
		private BarcodeFormat format;
		private int width;
		private int height;
		
		public void setWriter(Writer writer) {
			this.writer = writer;
		}
		
		public void setFormat(BarcodeFormat format) {
			this.format = format;
		}
		
		public void setWidth(int width) {
			this.width = width;
		}
		
		public void setHeight(int height) {
			this.height = height;
		}
		
	}
	
}
