package org.bluedolmen.repo.workflow;

import java.io.InputStream;
import java.util.zip.ZipInputStream;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.workflow.jbpm.JBPMEngine;
import org.alfresco.repo.workflow.jbpm.JBPMJpdlXmlReader;
import org.apache.commons.io.IOUtils;
import org.apache.xerces.parsers.DOMParser;
import org.jbpm.graph.def.ProcessDefinition;
import org.jbpm.jpdl.par.ProcessArchive;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

public class WorkflowServiceHelper {
	
	public static String getProcessId(String engineId, InputStream definitionStream, String mimetype) {
		
		if (null == mimetype) {
			mimetype = MimetypeMap.MIMETYPE_XML;
		}
		
		try {
			if (JBPMEngine.ENGINE_ID.equals(engineId)) {
				return getJBPMProcessId(definitionStream, mimetype);
			}
			else if ("activiti".equals(engineId)) {
				return getActivitiProcessId(definitionStream);
			}			
		}
		catch (Exception e) {
			return null;
		}
		finally {
			IOUtils.closeQuietly(definitionStream);
		}
		
		return null;
		
	}

    private static String getJBPMProcessId(InputStream definitionStream, String mimetype) throws Exception {
    	
        final String actualMimetype = (mimetype == null) ? MimetypeMap.MIMETYPE_ZIP : mimetype;
        ProcessDefinition def = null;
        
        // parse process definition from jBPM process archive file
        
        if (actualMimetype.equals(MimetypeMap.MIMETYPE_ZIP)) {
        	
            final ZipInputStream zipInputStream = new ZipInputStream(definitionStream);
            final ProcessArchive reader = new ProcessArchive(zipInputStream);
            def = reader.parseProcessDefinition();
                
        }
        
        // parse process definition from jBPM xml file
        
        else if (actualMimetype.equals(MimetypeMap.MIMETYPE_XML)) {
        	
            final JBPMJpdlXmlReader jpdlReader = new JBPMJpdlXmlReader(definitionStream); 
            def = jpdlReader.readProcessDefinition();
            
        }
        else {
        	return null;
        }
        
        return def.getName();
               
    }
    
    private static String getActivitiProcessId(InputStream workflowDefinition) throws Exception {
    	
        final InputSource inputSource = new InputSource(workflowDefinition);
        final DOMParser parser = new DOMParser();
        parser.parse(inputSource);
        
        final Document document = parser.getDocument();
        final NodeList elements = document.getElementsByTagName("process");
        if (elements.getLength() < 1) {
            return null;
        }
        
        final NamedNodeMap attributes = elements.item(0).getAttributes();
        final Node idAttrib = attributes.getNamedItem("id");
        if (idAttrib == null) {
            return null;
        }
        
    	return idAttrib.getNodeValue();
        
    }
	
}
