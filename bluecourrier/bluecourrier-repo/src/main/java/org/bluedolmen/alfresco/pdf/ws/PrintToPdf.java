/*
 * Copyright (C) 2005-2011 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */
package org.bluedolmen.alfresco.pdf.ws;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.filestore.FileContentWriter;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.thumbnail.ThumbnailException;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.pdf.Merger;
import org.bluedolmen.alfresco.pdf.MergerUtils;
import org.bluedolmen.alfresco.pdf.PdfOperationConfig;
import org.bluedolmen.alfresco.pdf.PdfOperationException;
import org.bluedolmen.alfresco.yamma.cover.MailCoverService;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

/**
 * This webscript takes a list of nodeRef-s (comma-separated list) and returns a
 * single PDF file merging each resulting pdf, including a potential cover and
 * attachments.
 * 
 * @author pajot-b
 * 
 */
public class PrintToPdf extends StreamContent {
	
	public static final String NODEREFS = "nodeRefs";
	public static final String DOUBLE_SIDED = "doubleSided";
	public static final String STAMP = "stamp";
	
	public static final String COVER = "cover";
	public static final String ATTACHMENTS = "attachments";
	
	private static final Log logger = LogFactory.getLog(PrintToPdf.class);
	
	private NodeService nodeService;
	private MailCoverService mailCoverService;
	private Merger pdfMerger;
	private MergerUtils mergerUtils;
	
	private File mergedFile;
	private PdfOperationConfig mergerConfig;

	
	List<NodeRef> nodeRefs = null;
	boolean doubleSided = false;
	String stampValue = null;
	boolean includeCover = false;
	boolean includeAttachments = true;
	
	
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
    	
    	parseParams(req);
    	
    	final List<Object> mergedObjects = new ArrayList<Object>();
    	for (final NodeRef nodeRef : nodeRefs) {
    		
    		// Cover
    		final InputStream coverStream = getCover(nodeRef);
    		if (null != coverStream) {
    			mergedObjects.add(coverStream);
    		}
    		
    		final Collection<NodeRef> sources = new ArrayList<NodeRef>(1);
    		// Main document
    		sources.add(nodeRef);
    		// Attachments
    		sources.addAll(getAttachments(nodeRef));
    		try {
    			final Collection<NodeRef> pdfSources = mergerUtils.getPdfNodeList(sources);
    			mergedObjects.addAll(pdfSources);
    		}
    		catch (ThumbnailException e) {
    			logger.error(String.format("Cannot generate the pdf file for node '%s' or one of its attachments. See the transformer configuration.", nodeRef));
    			res.setStatus(Status.STATUS_EXPECTATION_FAILED);
    			throw e;
    		}
    		
    	}
    	
    	mergerConfig = getMergerConfig(mergedObjects); 
    	final OutputStream tempOutputStream = getOutputStream();
    	merge(mergedObjects, tempOutputStream);

    	streamContent(req, res, mergedFile);
    	
    }
    
    private void parseParams(WebScriptRequest req) {

    	final String nodeRefsParam = req.getParameter(NODEREFS);
    	nodeRefs = NodeRef.getNodeRefs(nodeRefsParam);
    	if (nodeRefs.isEmpty()) throw new WebScriptException("At least one nodeRef has to be provided");
    	
    	final String doubleSidedParam = req.getParameter(DOUBLE_SIDED);
    	if (null != doubleSidedParam) {
    		doubleSided = "true".equals(doubleSidedParam.toLowerCase());
    	}
    	
    	stampValue = req.getParameter(STAMP);
    	
    	final String coverParam = req.getParameter(COVER);
    	if (null != coverParam) {
    		includeCover = "true".equals(coverParam.toLowerCase());
    	}
    	
    	final String attachmentsParam = req.getParameter(ATTACHMENTS);
    	if (null != attachmentsParam) {
    		includeAttachments = "true".equals(attachmentsParam.toLowerCase());
    	}
    	
    }
    
    protected PdfOperationConfig getMergerConfig(List<Object> sources) {
    	
    	final PdfOperationConfig mergerConfig = PdfOperationConfig.emptyConfig();
    	mergerConfig.put(Merger.DOUBLE_SIDED, doubleSided && sources.size() > 1);
    	if (null != stampValue) {
    		mergerConfig.put(Merger.STAMPED, stampValue);
    	}
    	
    	return mergerConfig;
    	
    }
    
    protected InputStream getCover(NodeRef nodeRef) {

    	if (!includeCover) return null;
    	if (null == mailCoverService) return null;
    	
    	final String fileName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
    	final String fileBasename = FilenameUtils.getBaseName(fileName);
    	final String coverFileBasename = fileBasename + "-cover";
    	
    	final File outputFile = TempFileProvider.createTempFile(coverFileBasename, ".pdf");
    	final FileContentWriter output = new FileContentWriter(outputFile); 
    	
    	mailCoverService.generateCover(nodeRef, output, MimetypeMap.MIMETYPE_PDF);
    	
    	final ContentReader reader = output.getReader();
    	if (!reader.exists()) {
    		return null;
    	}
    	
    	return reader.getContentInputStream();

    }
    
    protected List<NodeRef> getAttachments(NodeRef nodeRef) {
    	
    	if (!includeAttachments) return Collections.emptyList();
    	
    	final List<AssociationRef> associations = nodeService.getTargetAssocs(nodeRef, ContentModel.ASSOC_ATTACHMENTS);
    	final List<NodeRef> attachments = new ArrayList<NodeRef>();
    	
    	for (final AssociationRef associationRef : associations) {
    		attachments.add(associationRef.getTargetRef());
    	}
    	
    	return attachments;
    	
    }
    
    protected void merge(List<Object> pdfInputSources, final OutputStream output) {
    	
    	try {
	    	pdfMerger.merge(pdfInputSources, output, mergerConfig);
		} catch (PdfOperationException e) {
			throw new WebScriptException("Cannot merge the provided document references.", e);
		}
    	
    }
    
	private OutputStream getOutputStream() {
		
		mergedFile = TempFileProvider.createTempFile("pdfmerge", ".pdf");
		
		try {
			return new FileOutputStream(mergedFile);
		} catch (FileNotFoundException e1) {
			throw new WebScriptException("Cannot create a temporary file to get the result", e1);
		}
		
	}
	
	/*
	 * Spring IoC/DI material
	 */
    
	public void setMerger(Merger merger) {
		this.pdfMerger = merger;
	}
	
	public void setMailCoverService(MailCoverService mailCoverService) {
		this.mailCoverService = mailCoverService;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setMergerUtils(MergerUtils mergerUtils) {
		this.mergerUtils = mergerUtils;
	}
    
}
