package org.bluedolmen.alfresco.pdf;

import java.io.OutputStream;
import java.util.Collection;

public interface Merger {
	
	public static final String DOUBLE_SIDED = "doubleSided";
	public static final String STAMPED = "merger.stamped";

	public void merge(Collection<?> inputFiles,  OutputStream output) throws PdfOperationException;
	
	public void merge(Collection<?> inputFiles,  OutputStream output, PdfOperationConfig config) throws PdfOperationException;

	public void setConfig(PdfOperationConfig config) throws PdfOperationConfigException;
	
};
