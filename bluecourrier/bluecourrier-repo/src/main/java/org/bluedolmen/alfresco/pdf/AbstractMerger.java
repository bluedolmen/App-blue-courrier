package org.bluedolmen.alfresco.pdf;

import java.io.OutputStream;
import java.util.Collection;

public abstract class AbstractMerger implements Merger {
	
	private PdfOperationConfig config;
	private MergerUtils mergerUtils;

	
	public AbstractMerger() {
		this.setConfig(null);
	}
	
	public AbstractMerger(final PdfOperationConfig config) {
		
		this.setConfig(config);
		
	}

	public void merge(Collection<?> inputFiles, OutputStream output) throws PdfOperationException {
		
		this.merge(inputFiles, output, this.config);
		
	}
	
	public void merge(Collection<?> inputFiles, OutputStream output, PdfOperationConfig config) throws PdfOperationException {
		
//		final List<NodeRef> checkedInputFiles = mergerUtils.getPdfNodeList(inputFiles);
//		doMerge(checkedInputFiles, output, config);
		
		doMerge(inputFiles, output, config);
		
	}	
	
	protected abstract void doMerge(Collection<?> inputFiles, OutputStream output, PdfOperationConfig config) throws PdfOperationException;

	public void setConfig(final PdfOperationConfig config) {
		
		if (null == config) {
			this.config = PdfOperationConfig.emptyConfig();
		}
		
		this.config = config;
		
	}	
	
	/*
	 * Spring IoC/DI material
	 */

	
	public void setMergerUtils(MergerUtils mergerUtils) {
		this.mergerUtils = mergerUtils;
	}
	
	protected MergerUtils getMergerUtils() {
		return this.mergerUtils;
	}

}
