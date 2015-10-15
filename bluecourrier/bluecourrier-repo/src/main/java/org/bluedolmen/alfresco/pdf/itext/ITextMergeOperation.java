package org.bluedolmen.alfresco.pdf.itext;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.bluedolmen.alfresco.pdf.MergeOperation;
import org.bluedolmen.alfresco.pdf.Merger;
import org.bluedolmen.alfresco.pdf.MergerException;
import org.bluedolmen.alfresco.pdf.PdfOperationConfig;
import org.bluedolmen.alfresco.pdf.PdfOperationException;
import org.bluedolmen.alfresco.pdf.itext.InputSourceFactory.InputSource;

import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfCopy.PageStamp;
import com.itextpdf.text.pdf.PdfImportedPage;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfSmartCopy;


public class ITextMergeOperation implements MergeOperation {
	
	public static interface MergerListener {
		
		public static final String FIRST_PAGE = "firstPage";
		public static final String LAST_PAGE = "lastPage";
		
		boolean notifyPageAppended(InputSource inputSource, PageStamp stamper, String eventType) throws Exception;
		
	}	
	

	private final Document document;
	private PdfSmartCopy merger = null;
	private final PdfOperationConfig config;
	private final Collection<InputSource> sources;
	
	private final List<MergerListener> mergerListeners = new ArrayList<ITextMergeOperation.MergerListener>();
	private final MergerListener notifier;
		
	ITextMergeOperation(Collection<InputSource> inputs, PdfOperationConfig config) throws MergerException {
		
		this.sources = inputs;
		this.config = config;
		
		try {
			
			document = new Document();
						
			
		} catch (Exception e) {
			throw new MergerException("Cannot create the destination document", e);
		}
		
		notifier = new MergerListener() {
			
			public boolean notifyPageAppended(InputSource inputSource, PageStamp stamper, String eventType) throws Exception {
				for (final MergerListener mergerListener : mergerListeners) {
					mergerListener.notifyPageAppended(inputSource, stamper, eventType);
				}
				return true;
			}
			
		};
		
	}	

	public void register(MergerListener mergerListener) {
		if (null == mergerListener) {
			throw new IllegalArgumentException("The provided merger-listener is not valid.");
		}
		mergerListeners.add(mergerListener);
	}
			
	private void appendSources() throws Exception {
		
		final Iterator<InputSource> iterator = sources.iterator();
		
		while (iterator.hasNext()) {
			
			final InputSource inputSource = iterator.next();
			final PdfReader reader = new PdfReader(inputSource.getInputStream());
			final int numberOfPages = reader.getNumberOfPages();
			
			for (int pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
				
				final PdfImportedPage pdfImportedPage = merger.getImportedPage(reader, pageNumber);
				
				if (1 == pageNumber) {
					final PageStamp stamper = merger.createPageStamp(pdfImportedPage);
					notifier.notifyPageAppended(inputSource, stamper, MergerListener.FIRST_PAGE);
				}
						
				merger.addPage(pdfImportedPage);
			}

			addBlankPageIfNeeded(reader, !iterator.hasNext());
						
		}
		
	}
	
	/**
	 * Adds a new blank page if double-sided and if the number of pages of the
	 * merged file is odd
	 *  
	 * @param numberOfPages
	 */
	private void addBlankPageIfNeeded(PdfReader reader, boolean isLastDocument) {
		
		final int numberOfPages = reader.getNumberOfPages();
		
		if (
				isLastDocument ||
				!config.getValue(Merger.DOUBLE_SIDED, Boolean.class) || 
				(numberOfPages % 2 != 1)
		) return;
		
		// Use addPage(...) instead of newPage() and setPageEmpty(false) because
		// these last two statements are ineffective! This method has the
		// advantage of being more flexible regarding the format and the
		// rotation of the page
		merger.addPage(reader.getPageSize(numberOfPages), reader.getPageRotation(numberOfPages));
		
	}
	
	private void closeSources() throws IOException {
		
		for (InputSource source : sources) {
			source.close();
		}
		
	}
	
	public void mergeInternal(OutputStream output) throws Exception {
		
		try {
			
			merger = new PdfSmartCopy(document, output);			
			document.open();
			
			appendSources();
			
		} 
		finally {
			
			closeSources();
			if (document.isOpen()) document.close();
			
		}
		
	}
	
	public void merge(final OutputStream destinationStream) throws PdfOperationException {
		
		try {
			mergeInternal(destinationStream);
		}	
		catch (PdfOperationException e) {
			throw e;
		}
		catch (Exception e) {
			throw new MergerException("Cannot merge the provided sources", e);
		}
		
	}

	
	
}
