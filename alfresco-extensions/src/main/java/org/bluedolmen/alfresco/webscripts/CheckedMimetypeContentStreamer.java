package org.bluedolmen.alfresco.webscripts;

import java.io.IOException;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.alfresco.repo.web.scripts.content.ContentStreamer;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class CheckedMimetypeContentStreamer extends ContentStreamer {

	private List<String> filteredMimetypes = null;
	private String forcedMimetype = null;
	
	@Override
	public void streamContentImpl(WebScriptRequest req,
			WebScriptResponse res, ContentReader reader, NodeRef nodeRef,
			QName propertyQName, boolean attach, Date modified,
			String eTag, String attachFileName, Map<String, Object> model)
			throws IOException {
		
    	checkMimetype(reader);
    	
		// Force mimetype if necessary
    	if (!StringUtils.isBlank(forcedMimetype)) {
    		reader.setMimetype(forcedMimetype);
    	}
    	
		super.streamContentImpl(req, res, reader, nodeRef, propertyQName, attach, modified, eTag, attachFileName, model);
	}	
	
    protected void checkMimetype(ContentReader reader) {
    	
    	if (null == filteredMimetypes) return;
    	
        final String mimetype = reader.getMimetype();
        for (final String checkedMimetype : filteredMimetypes) {
        	if (checkedMimetype.equals(mimetype)) return;
        }
        
        final StringBuilder allowedMimetypes = new StringBuilder();
        final Iterator<String> it = filteredMimetypes.iterator();
        while (it.hasNext()) {
        	allowedMimetypes.append(it.next()).append(it.hasNext() ? ", " : "");
        }
        
    	throw new IllegalStateException("The retrieved resource has to be of one of the mimetypes: " + allowedMimetypes);
    	
    }	
    
	public void setFilteredMimetypes(List<String> mimetypes) {
		this.filteredMimetypes = mimetypes;
	}
	
	public void setForcedMimetype(String mimetype) {
		this.forcedMimetype = mimetype;
	}
	
}
