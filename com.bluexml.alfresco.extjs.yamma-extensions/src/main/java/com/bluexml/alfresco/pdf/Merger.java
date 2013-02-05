package com.bluexml.alfresco.pdf;

import java.io.OutputStream;
import java.util.Collection;

import org.alfresco.service.cmr.repository.NodeRef;

public interface Merger {
	
	public static final String DOUBLE_SIDED = "doubleSided";
	public static final String STAMPED = "merger.stamped";

	public void merge(Collection<NodeRef> inputFiles,  OutputStream output) throws PdfOperationException;
	
	public void merge(Collection<NodeRef> inputFiles,  OutputStream output, PdfOperationConfig config) throws PdfOperationException;

	public void setConfig(PdfOperationConfig config) throws PdfOperationConfigException;
	
};
