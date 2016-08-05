package org.bluedolmen.alfresco.xdocreport;

import java.io.IOException;

import org.alfresco.service.cmr.repository.NodeRef;

import fr.opensagres.xdocreport.core.XDocReportException;

public interface XDocReportGenerator {

	public void generate(NodeRef nodeRef, Destination output) throws XDocReportException, IOException;
	
	public String getTemplateMimetype();
	
	public String getTemplateExtension();
	
	public static interface Destination {};
	
}
