package com.bluexml.alfresco.pdf.pdfbox;

import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.alfresco.service.cmr.repository.NodeRef;

import com.bluexml.alfresco.pdf.AbstractMerger;
import com.bluexml.alfresco.pdf.Merger;
import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.PdfOperationException;
import com.bluexml.alfresco.pdf.pdfbox.InputSourceFactory.InputSource;
import com.bluexml.alfresco.pdf.pdfbox.PdfBoxMergeOperation.MergerListener;
import com.bluexml.alfresco.reference.ReferenceProviderService;

public final class PdfBoxMerger extends AbstractMerger {

	private ReferenceProviderService referenceProviderService;
	private InputSourceFactory inputSourceFactory;

	protected void doMerge(Collection<NodeRef> inputFiles, OutputStream output, PdfOperationConfig config) throws PdfOperationException {

		List<InputSource> inputSources = new ArrayList<InputSource>();
		
		for (final NodeRef nodeRef : inputFiles) {
			inputSources.add(inputSourceFactory.createNew(nodeRef));
		}
		
		// TODO: Maybe optimized for a single file
		
		final PdfBoxMergeOperation mergeOperation = new PdfBoxMergeOperation(inputSources, config);
		if (config.containsKey(Merger.STAMPED) && config.getValue(Merger.STAMPED, Boolean.class)) {
			
			mergeOperation.register(new MergerListener() {
				
				public boolean notifySourceReady(final InputSource source) throws Exception {
										
					final NodeRef nodeRef = source.getNodeRef();
					final String referenceValue = referenceProviderService.getExistingReference(nodeRef);
					if (null == referenceValue) return true;
					
					final PdfBoxStampOperation pdfBoxStampOperation = new PdfBoxBarcodeStampOperation() {
						@Override
						protected BufferedImage getBarcode() throws Exception {
							return barcodeGenerator.generate(referenceValue);
						}
					};
					
					pdfBoxStampOperation.stamp(source);					
					return true;
					
				}
				
			});
			
		}
		
		
		mergeOperation.merge(output);
		
	}	
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
	public void setInputSourceFactory(InputSourceFactory inputSourceFactory) {
		this.inputSourceFactory = inputSourceFactory;
	}
	
	
}
