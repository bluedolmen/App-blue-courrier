package org.bluedolmen.alfresco.pdf.pdfbox;

import java.awt.image.BufferedImage;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.alfresco.service.cmr.repository.NodeRef;

import org.bluedolmen.alfresco.pdf.AbstractMerger;
import org.bluedolmen.alfresco.pdf.Merger;
import org.bluedolmen.alfresco.pdf.PdfOperationConfig;
import org.bluedolmen.alfresco.pdf.PdfOperationException;
import org.bluedolmen.alfresco.pdf.pdfbox.InputSourceFactory.InputSource;
import org.bluedolmen.alfresco.pdf.pdfbox.PdfBoxMergeOperation.MergerListener;
import org.bluedolmen.alfresco.reference.ReferenceProviderService;

public final class PdfBoxMerger extends AbstractMerger {

	private ReferenceProviderService referenceProviderService;
	private InputSourceFactory inputSourceFactory;

	protected void doMerge(Collection<?> inputFiles, OutputStream output, PdfOperationConfig config) throws PdfOperationException {

		List<InputSource> inputSources = new ArrayList<InputSource>();
		
		for (final Object inputFile : inputFiles) {
			inputSources.add(inputSourceFactory.createNew(inputFile));
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
