package com.bluexml.alfresco.barcode.pdf;

import java.io.OutputStream;

import com.bluexml.alfresco.barcode.BarcodeGenerator;
import com.bluexml.alfresco.reference.ReferenceProvider;

public abstract class AbstractBarcodeLabelPdfDocument {

	protected BarcodeGenerator barcodeGenerator;
	protected ReferenceProvider referenceProvider;
	protected LabelPageConfiguration pageConfiguration;
	
	
	public void generate(OutputStream output) throws GenerateException {
		
		generateNPages(output, 1);
		
	}
	
	public void generateNPages(OutputStream output, int pageNumber) throws GenerateException {
		
		if (pageNumber <= 0) {
			throw new IllegalArgumentException("The page-number has to be a positive integer");
		}
		
		generateNLabels(output, pageConfiguration.getPageLabelNumber() * pageNumber);
		
	}
	
	public void generateNLabels(OutputStream output, int labelNumber) throws GenerateException {
		
		if (labelNumber <= 0) {
			throw new IllegalArgumentException("The label-number has to be a positive integer");
		}
		
		final GenerateOperation generateOperation = getOperation();
		if (null == generateOperation) {
			throw new IllegalStateException(new NullPointerException("Cannot retrieve a valid generate operation (null)"));
		}
		try {
			generateOperation.execute(output, labelNumber);
		} catch (Throwable e) {
			throw new GenerateException(e);
		}
		
	}
	
	protected abstract GenerateOperation getOperation();
		
	
	public static interface GenerateOperation {
		
		void execute(OutputStream output, int labelNumber) throws Exception;
		
	}
	
	public static final class GenerateException extends Exception {
		
		private static final long serialVersionUID = 6693756598351886858L;

		private GenerateException(Throwable cause) {
			super(cause);
		}
	}
	
	
	/*
	 * Spring IoC/DI material
	 */
	
	public void setBarcodeGenerator(BarcodeGenerator barcodeGenerator) {
		this.barcodeGenerator = barcodeGenerator;
	}
	
	public void setReferenceProvider(ReferenceProvider referenceProvider) {
		this.referenceProvider = referenceProvider;
	}
	
	public void setPageConfiguration(LabelPageConfiguration pageConfiguration) {
		this.pageConfiguration = pageConfiguration;
	}

	
}
