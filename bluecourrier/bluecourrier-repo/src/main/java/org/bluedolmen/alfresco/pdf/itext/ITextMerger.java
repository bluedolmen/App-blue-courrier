package org.bluedolmen.alfresco.pdf.itext;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.bluedolmen.alfresco.pdf.AbstractMerger;
import org.bluedolmen.alfresco.pdf.PdfOperationConfig;
import org.bluedolmen.alfresco.pdf.PdfOperationException;
import org.bluedolmen.alfresco.pdf.itext.ITextMergeOperation.MergerListener;
import org.bluedolmen.alfresco.pdf.itext.InputSourceFactory.InputSource;

public final class ITextMerger extends AbstractMerger {

	private InputSourceFactory inputSourceFactory;
	private final List<AbstractITextExtension> extensions = new ArrayList<AbstractITextExtension>();
	
	void register(AbstractITextExtension extension) {
		
		if (null == extension) throw new IllegalArgumentException(new NullPointerException("Extension is null"));
		extensions.add(extension);
		
	}

	protected void doMerge(Collection<?> inputFiles, OutputStream output, PdfOperationConfig config) throws PdfOperationException {

		List<InputSource> inputSources = new ArrayList<InputSource>();
		
		for (final Object inputFile : inputFiles) {
			inputSources.add(inputSourceFactory.createNew(inputFile));
		}
		
		// TODO: Maybe optimized for a single file
		
		final ITextMergeOperation mergeOperation = new ITextMergeOperation(inputSources, config);
		
		for (AbstractITextExtension extension : extensions) {
			if (!extension.isActive(config)) continue;
			
			if (extension instanceof MergerListener) {
				mergeOperation.register((MergerListener) extension);
			}
		}
		
		mergeOperation.merge(output);
		
		
	}	
	
	public void setInputSourceFactory(InputSourceFactory inputSourceFactory) {
		this.inputSourceFactory = inputSourceFactory;
	}
	
	
}
