package com.bluexml.alfresco.pdf;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.util.PDFMergerUtility;

public final class PdfBoxMerger extends AbstractMerger {
	
	private FileFolderService fileFolderService;

	public void merge(Collection<NodeRef> inputFiles, OutputStream output, MergerConfig config) throws MergerException {
		final List<NodeRef> checkedInputFiles = getMergerUtils().getPdfNodeList(inputFiles, true);

		// TODO: Maybe optimized for a single file
		final MergeOperation mergeOperation = new MergeOperation(checkedInputFiles, config);
		mergeOperation.merge(output);
	}
	
	private final class MergeOperation {
		
		private final Collection<NodeRef> inputFiles;
		private final PDFMergerUtility merger = new PDFMergerUtility();
		private final MergerConfig config;
		private final PDDocument destination;
		private final List<PDDocument> sources = new ArrayList<PDDocument>();
		
		public MergeOperation(Collection<NodeRef> inputFiles, MergerConfig config) throws MergerException {
			this.inputFiles = inputFiles;
			this.config = config;
			try {
				this.destination = new PDDocument();
			} catch (IOException e) {
				throw new MergerException("Cannot create the destination document", e);
			}
		}
				
		private void appendSources() throws IOException {
			
			for (final NodeRef nodeRef : inputFiles) {
				final ContentReader contentReader = PdfBoxMerger.this.fileFolderService.getReader(nodeRef);
				final InputStream sourceIS = contentReader.getContentInputStream();
				final PDDocument source = PDDocument.load(sourceIS);
				final int numberOfPages = source.getNumberOfPages();
				
				if (this.config.getValue(MergerConfig.DOUBLE_SIDED, Boolean.class) && (numberOfPages % 2 != 0)) {
					// double-sided and even number of pages => add a blank page
					final PDPage blankPage = new PDPage();
					source.addPage(blankPage);
				}
				
				sources.add(source);
				
				merger.appendDocument(this.destination, source);
			}
			
		}
		
		private void closeSources() throws IOException {
			for (PDDocument source : sources) {
				source.close();
			}
		}
		
		public void merge(final OutputStream destinationStream) throws MergerException {
			
			try {
				
				appendSources();
				
				destination.save(destinationStream);
				
			} catch (Exception e) {
				
				throw new MergerException("Error during merging of the files", e);
				
			} finally {
				
				try {
					
					closeSources();
					destination.close();
					
				} catch (IOException e) {
					throw new MergerException("Cannot close one of the involved files", e);
				}
				
				
				
			}
			
			
		}
		
		
	}
	
	/*
	 * Spring IoC/DI material
	 */
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
}
