package com.bluexml.alfresco.pdf.itext;

import java.io.OutputStream;

import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.PdfOperationException;
import com.bluexml.alfresco.pdf.StampOperation;
import com.bluexml.alfresco.pdf.itext.InputSourceFactory.InputSource;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfImportedPage;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;

public abstract class ITextStampOperation implements StampOperation {

	private InputSource source;
	
	protected PdfStamper stamper;
	protected PdfOperationConfig config;
		
	public ITextStampOperation() {
		this(null);
	}
	
	public ITextStampOperation(PdfOperationConfig config) {
		this(null, config);
	}
	
	public ITextStampOperation(InputSource source, PdfOperationConfig config) {
		
		this.source = source;
		this.config = null != config ? config : PdfOperationConfig.emptyConfig();
		
		checkConfig();
	}
	
	private void checkConfig() {
		
		if (config.containsKey(ITextStampOperation.STAMP_LOCATION)) {
			
			final String stampLocation = config.getValue(ITextStampOperation.STAMP_LOCATION, String.class);
			if (!ITextStampOperation.STAMP_LOCATION_FIRST_PAGE.equals(stampLocation)) {
				throw new UnsupportedOperationException("This stamper only operates on the first page");
			}
			
		}
		
	}
	
	/**
	 * Performs stamping and output the result of the stamping to the provided
	 * output stream
	 * <p>
	 * The provided document is not closed at the end of the operation, the
	 * client is in charge of performing this operation
	 */
	public synchronized void stamp(OutputStream output) throws PdfOperationException {
		
		if (null == source) {
			throw new IllegalStateException("The source is not defined correctly");
		}
		
		try {
			stampInternal(output);
		} catch (Exception e) {
			throw new PdfOperationException(e);
		}
		
		
	}
	
	public synchronized void stamp(final InputSource source, OutputStream output) throws PdfOperationException {
		
		this.source = source;
		stamp(output);
		
	}
	
	public synchronized void stamp(final PdfImportedPage page) throws PdfOperationException {
		try {
			stampPage(page, page.getPageNumber());
		} catch (Exception e) {
			throw new PdfOperationException(e);
		}
	}
	
	private void stampInternal(OutputStream output) throws Exception  {
		
		PdfReader reader = null;
		
		try {
			
			reader = new PdfReader(source.getInputStream());
			stamper = new PdfStamper(reader, output);

			final int numberOfPages = reader.getNumberOfPages();
			for (int pageNumber = 0; pageNumber < numberOfPages; pageNumber++) {
				final PdfImportedPage page = stamper.getImportedPage(reader, pageNumber);
				final boolean continueIteration = stampPage(page, pageNumber);
				
				if (!continueIteration) break;
			}
			
			stamper.close();
			
		} 
		finally {
			if (null != reader) reader.close();
			stamper.close();
		}
		
		
		
	}
	
	/**
	 * Stamp the page.
	 * 
	 * @param page
	 * @param pageNumber
	 * @return true if further processing is necessary, false otherwise
	 */
	protected abstract boolean stampPage(PdfContentByte page, int pageNumber) throws Exception;
	
	
	
}
