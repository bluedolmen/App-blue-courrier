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
package com.bluexml.alfresco.barcode.ws;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.SocketException;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.ContentIOException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument;
import com.bluexml.alfresco.barcode.pdf.AbstractBarcodeLabelPdfDocument.GenerateException;

public class BarcodePageGenerator extends StreamContent {
	
	private static final Log logger = LogFactory.getLog(BarcodePageGenerator.class);
	public static final String P_PAGE_NUMBER = "pageNumber";
	public static final String P_NUMBER = "nb";
	
	private AbstractBarcodeLabelPdfDocument barcodeLabelPdfDocument;
	private int pageNumber = 1;
	private int labelNumber = -1;
	

    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
    	
    	final String pageNumberParam = req.getParameter(P_PAGE_NUMBER);
    	if (null != pageNumberParam) {
    		pageNumber = Integer.parseInt(pageNumberParam);
    		if (pageNumber <= 0) {
    			throw new WebScriptException("The page-number has to be a positive integer");
    		}
    	}
    	
    	final String numberParam = req.getParameter(P_NUMBER);
    	if (null != numberParam) {
    		labelNumber = Integer.parseInt(numberParam);
    	}
    	
    	final ByteArrayOutputStream output = new ByteArrayOutputStream();
    	
    	try {
	    	if (labelNumber > 0) {
	    		barcodeLabelPdfDocument.generateNLabels(output, labelNumber);
	    	}
	    	else {
	    		barcodeLabelPdfDocument.generateNPages(output, pageNumber);
	    	}
    	} catch (GenerateException e) {
    		throw new WebScriptException("Problem while generating the label page(s)", e);
    	}
    	
        res.setContentType(MimetypeMap.MIMETYPE_PDF);
        //res.setContentEncoding(reader.getEncoding());
        res.setHeader("Content-Length", Long.toString(output.size()));
        
        
        // get the content and stream directly to the response output stream
        // assuming the repository is capable of streaming in chunks, this should allow large files
        // to be streamed directly to the browser response stream.
        try
        {
        	res.getOutputStream().write(output.toByteArray());
        }
        catch (SocketException e1)
        {
            // the client cut the connection - our mission was accomplished apart from a little error message
            if (logger.isInfoEnabled())
                logger.info("Client aborted stream read.");
        }
        catch (ContentIOException e2)
        {
            if (logger.isInfoEnabled())
                logger.info("Client aborted stream read.");
        }
    	
    	
    }   


	protected void streamContent(WebScriptRequest req, WebScriptResponse res, String resourcePath, boolean attach) throws IOException {
		streamContent(req, res, resourcePath, attach, null);
	}    
	
	/*
	 * Spring IoC/DI material
	 */
    
	
	public void setBarcodeLabelPdfDocument(AbstractBarcodeLabelPdfDocument barcodeLabelPdfDocument) {
		this.barcodeLabelPdfDocument = barcodeLabelPdfDocument;
	}
	    
}
