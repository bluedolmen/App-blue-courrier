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
package com.bluexml.alfresco.pdf.ws;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.util.TempFileProvider;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import com.bluexml.alfresco.pdf.Merger;
import com.bluexml.alfresco.pdf.PdfOperationConfig;
import com.bluexml.alfresco.pdf.PdfOperationException;
public class MergeToPdf extends StreamContent
{
	public static final String NODEREFS = "nodeRefs";
	public static final String DOUBLE_SIDED = "doubleSided";
	public static final String STAMPED = "stamped";
	
	private Merger pdfMerger;
	private File mergedFile;

    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
    	
    	final String nodeRefsParam = req.getParameter(NODEREFS);
    	final List<NodeRef> nodeRefs = NodeRef.getNodeRefs(nodeRefsParam);
    	
    	final String doubleSidedParam = req.getParameter(DOUBLE_SIDED);
    	final boolean doubleSided = "true".equals(doubleSidedParam) && nodeRefs.size() > 1;
    	
    	final String stampedParam = req.getParameter(STAMPED);
    	final boolean stamped = "true".equals(stampedParam); 
    	
    	if (nodeRefs.isEmpty()) throw new WebScriptException("At least one nodeRef has to be provided");
    	
    	final OutputStream tempOutputStream = getOutputStream();

    	final PdfOperationConfig mergerConfig = PdfOperationConfig.emptyConfig();
    	mergerConfig.put(Merger.DOUBLE_SIDED, doubleSided);
    	mergerConfig.put(Merger.STAMPED, stamped);
    	
    	try {
			pdfMerger.setConfig(mergerConfig);
	    	pdfMerger.merge(nodeRefs, tempOutputStream);
		} catch (PdfOperationException e) {
			throw new WebScriptException("Cannot merge the provided document references.", e);
		}
    	

    	streamContent(req, res, mergedFile, false);
    	
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
    
}
