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
package org.bluedolmen.alfresco.barcode.ws;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.SocketException;

import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.ContentIOException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import org.bluedolmen.alfresco.barcode.BarcodeGenerator;
import org.bluedolmen.alfresco.barcode.BarcodeGenerator.BarcodeGeneratorException;
import org.bluedolmen.alfresco.reference.ReferenceProviderService;

public class BarcodeWebscript extends StreamContent {
	
	private static final Log logger = LogFactory.getLog(BarcodeWebscript.class);
	public static final String P_VALUE = "value";
	public static final String P_ENGINE = "engine";
	public static final String P_MIMETYPE = "mimetype";
	public static final String D_MIMETYPE = "image/jpeg";
	
	private BarcodeGenerator barcodeGenerator;
	private ReferenceProviderService referenceProviderService;
	

    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException  {
    	    	
    	final String value = req.getParameter(P_VALUE);
    	NodeRef nodeRef = null;
		if (null != value && NodeRef.isNodeRef(value)) {
			nodeRef = new NodeRef(value); 
		}
    	
    	final String engine = req.  getParameter(P_ENGINE);
    	
    	String mimetype = req.getParameter(P_MIMETYPE);
    	mimetype = null == mimetype ? D_MIMETYPE : mimetype;

    	final ByteArrayOutputStream output = new ByteArrayOutputStream();
    	
    	if (req.getServerPath().contains("/new")) {
    		
    		final String reference = referenceProviderService.getNewReference(engine, null);
    		generateBarcode(reference, output, mimetype);
    		
    	}
    	else {
    		
    		String barcodeValue = value;
    		
    		if (null != nodeRef) {
    			barcodeValue = referenceProviderService.getExistingReference(nodeRef);
        	}
    		
        	if (null != value && !value.isEmpty()) {
        		generateBarcode(barcodeValue, output, mimetype);
        	} else {
        		logger.debug(String.format("No barcode generated for value '%s'", value));
        	}
        	    		
    	}
    	    	
    	
        res.setContentType(mimetype);
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

    private void generateBarcode(String barcodeValue, OutputStream output, String mimetype) {
    	try {
			barcodeGenerator.generate(barcodeValue, output, mimetype);
		} catch (BarcodeGeneratorException e) {
			throw new WebScriptException(
				String.format("Cannot generate the barcode for value '%s'", barcodeValue)
			);
		}
    }
    
	/*
	 * Spring IoC/DI material
	 */
    
	
	public void setBarcodeGenerator(BarcodeGenerator barcodeGenerator) {
		this.barcodeGenerator = barcodeGenerator;
	}
    
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
}
