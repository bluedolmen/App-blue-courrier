package com.bluexml.alfresco.pdf.pdfbox;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.util.PDFMergerUtility;

import com.bluexml.alfresco.pdf.MergeOperation;
import com.bluexml.alfresco.pdf.Merger;
import com.bluexml.alfresco.pdf.MergerException;
import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.PdfOperationException;
import com.bluexml.alfresco.pdf.pdfbox.InputSourceFactory.InputSource;

public class PdfBoxMergeOperation implements MergeOperation {
	
	private final PDFMergerUtility merger = new PDFMergerUtility();
	private final PdfOperationConfig config;
	private final PDDocument destination;
	private final Collection<InputSource> sources;
	
	private final List<MergerListener> mergerListeners = new ArrayList<PdfBoxMergeOperation.MergerListener>();
	private final MergerListener notifier;
		
	
	public PdfBoxMergeOperation(Collection<InputSource> inputs, PdfOperationConfig config) throws MergerException {
		
		this.sources = inputs;
		this.config = config;
		
		try {
			
			this.destination = new PDDocument();
						
			
		} catch (IOException e) {
			throw new MergerException("Cannot create the destination document", e);
		}
		
		notifier = new AbstractMergerListener() {
			
			@Override
			public boolean notifySourceReady(final InputSource source) throws Exception {
				for (final MergerListener mergerListener : mergerListeners) {
					mergerListener.notifySourceReady(source);
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
		
		for (final InputSource inputSource : sources) {
			final PDDocument source = inputSource.getDocument();
			beforeAppend(source);
			notifier.notifySourceReady(inputSource);
			
			merger.appendDocument(this.destination, source);
		}
		
	}
	
	/**
	 * May allow the modification of the source document before it is append
	 * <p>
	 * These changes are not saved in the source document but only in the target
	 * 
	 * @param document
	 * @throws IOException
	 */
	protected void beforeAppend(final PDDocument document) throws Exception {
		
		addBlankPageIfEven(document);
		
	}
	
	private void addBlankPageIfEven(final PDDocument document) {
		
		final int numberOfPages = document.getNumberOfPages();
		
		if (config.getValue(Merger.DOUBLE_SIDED, Boolean.class) && (numberOfPages % 2 != 0)) {
			// double-sided and even number of pages => add a blank page
			final PDPage blankPage = new PDPage();
			document.addPage(blankPage);
		}
		
	}
	
	private void closeSources() throws IOException {
		
		for (InputSource source : sources) {
			source.close();
		}
		
	}
	
	public void merge(final OutputStream destinationStream) throws PdfOperationException {
		
		try {
			
			appendSources();
			
			destination.save(destinationStream);
			
		} 
		catch (PdfOperationException e) {
			throw e;
		}
		catch (Exception e) {
			throw new MergerException("Error during merging of the files", e);
		}
		finally {
			
			try {
				
				closeSources();
				destination.close();
				
			} catch (IOException e) {
				throw new MergerException("Cannot close one of the involved files", e);
			}
			
			
			
		}
		
		
	}

	
	public static interface MergerListener {
		
		boolean notifySourceReady(InputSource source) throws Exception;
		
	}
	
	public static abstract class AbstractMergerListener implements MergerListener {
		
		public boolean notifySourceReady(final InputSource source) throws Exception {
			return true;
		}
		
	}

	
	
}
