package com.bluexml.alfresco.pdf.pdfbox;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.edit.PDPageContentStream;

import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.PdfOperationException;
import com.bluexml.alfresco.pdf.StampOperation;
import com.bluexml.alfresco.pdf.pdfbox.InputSourceFactory.InputSource;

public abstract class PdfBoxStampOperation implements StampOperation {

	private InputSource source;
	
	protected PDDocument document;
	protected PdfOperationConfig config;
	protected boolean rotate;
	protected float pageWidth;
	protected float pageHeight;
	
	public PdfBoxStampOperation() {
		this(null);
	}
	
	public PdfBoxStampOperation(PdfOperationConfig config) {
		this(null, config);
	}
	
	public PdfBoxStampOperation(InputSource source, PdfOperationConfig config) {
		
		this.source = source;
		this.config = null != config ? config : PdfOperationConfig.emptyConfig();
		
		checkConfig();
	}
	
	private void checkConfig() {
		
		if (config.containsKey(PdfBoxStampOperation.STAMP_LOCATION)) {
			
			final String stampLocation = config.getValue(PdfBoxStampOperation.STAMP_LOCATION, String.class);
			if (!PdfBoxStampOperation.STAMP_LOCATION_FIRST_PAGE.equals(stampLocation)) {
				throw new UnsupportedOperationException("This stamper only operates on the first page");
			}
			
		}
		
	}
	
	/**
	 * Performs stamping of the provided document
	 * <p>
	 * The provided document is not closed at the end of the operation, the
	 * client is in charge of performing this operation
	 */
	public void stamp() throws PdfOperationException {
		
		if (null == source) {
			throw new IllegalStateException("There is no source defined.");
		}
		
		stamp((OutputStream) null);
		
	}

	/**
	 * Performs stamping and output the result of the stamping to the provided
	 * output stream
	 * <p>
	 * The provided document is not closed at the end of the operation, the
	 * client is in charge of performing this operation
	 */
	public void stamp(OutputStream output) throws PdfOperationException {
		
		try {
			
			stampInternal();
			
			if (null != output) {
				document.save(output);
			}
			
		} catch (Exception e) {
			throw new PdfOperationException(e);
		}
		
	}
	
	public synchronized void stamp(final InputSource source) throws PdfOperationException {
		
		this.source = source;
		stamp();
		
	}
	
	private void stampInternal() throws Exception  {
		
		document = source.getDocument();
		
		final List<?> allPages = document.getDocumentCatalog().getAllPages();
		if (allPages.isEmpty()) return;
		
		final PDPage page = (PDPage)allPages.get(0);
        final PDRectangle pageSize = page.findMediaBox();
        
        // calculate to center of the page
        int rotation = page.findRotation(); 
        rotate = rotation == 90 || rotation == 270;
        pageWidth = rotate ? pageSize.getHeight() : pageSize.getWidth();
        pageHeight = rotate ? pageSize.getWidth() : pageSize.getHeight();
                
        // append the content to the existing stream
        final PDPageContentStream contentStream = new PDPageContentStream(document, page, true, true,true);
        addStampToStream(contentStream);
        contentStream.close();
        
        document.save(new FileOutputStream("/tmp/test.pdf"));
        
        //document.save();
			
	}
	
	protected abstract void addStampToStream(PDPageContentStream contentStream) throws Exception;
	
	
	
}
