package org.bluedolmen.alfresco.webscripts;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.web.scripts.content.ContentStreamer;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.NodeRef;
import org.bluedolmen.alfresco.resources.RepositoryHelper;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.ResourceLoader;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

/**
 * @author pajot-b
 * 
 */
public class DynResourceGet extends StreamContent implements ResourceLoaderAware {
	
	protected static final NodeRef NOT_AVAILABLE_NODEREF = new NodeRef("", "", "");
	
	private final String RELOAD_PARAMETER = "reload";
	
	protected RepositoryHelper repositoryHelper = null;
	
	protected List<String> resourceRepositoryLocations = Collections.emptyList();
	protected String resourceClassPathLocation = "";
	
	private NodeRef cachedNodeRef = null;
	
	protected ContentStreamer delegate;
	protected ResourceLoader resourceLoader;
	
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
    	
    	parseParams(req);
    	
    	final NodeRef resourceNodeRef = getResourceNodeRef();
    	if (null != resourceNodeRef) {
    		streamContent(req, res, resourceNodeRef, ContentModel.PROP_CONTENT, false /* attach */, null, null);
    	}
    	else {
    		// Use the supposed classpath resource location
    		delegate.streamContent(req, res, resourceClassPathLocation, false /* attach */, null);
    	}
    	
    }
    
    protected void parseParams(WebScriptRequest req) {

    	final String reloadParam = req.getParameter(RELOAD_PARAMETER);
    	
    	if (null != reloadParam && "true".equals(reloadParam.toLowerCase())) {
    		cachedNodeRef = null;
    	}
    	
    }

	private NodeRef getResourceNodeRef() {
		
		if (NOT_AVAILABLE_NODEREF.equals(cachedNodeRef)) return null;
		if (null != cachedNodeRef) return cachedNodeRef;
		
		cacheResourceNodeRef();
		return getResourceNodeRef();
		
	}
	
	private void cacheResourceNodeRef() {
		
		for (final String repositoryLocation : resourceRepositoryLocations) {
			
	    	final List<NodeRef> nodeRefs = repositoryHelper.getResourcesByXpath(repositoryLocation);
	    	
	    	if (null != nodeRefs && !nodeRefs.isEmpty()) {
		    	cachedNodeRef = nodeRefs.get(0);
		    	return;
	    	}
	    	
		}
    	
		cachedNodeRef = NOT_AVAILABLE_NODEREF;
		
	}
    
	/*
	 * Spring IoC/DI material
	 */
    
    public void setRepositoryHelper(RepositoryHelper repositoryHelper) {
    	this.repositoryHelper = repositoryHelper;
    }
    
	public void setResourceClasspathLocation(String logoLocation) {
		this.resourceClassPathLocation = logoLocation;
	}
	
	public void setResourceRepositoryLocations(List<String> repositoryLocations) {
		this.resourceRepositoryLocations = repositoryLocations;
	}
	
	public void setDelegate(ContentStreamer delegate) {
		
		this.delegate = delegate;
		super.setDelegate(this.delegate);
		
	}

	@Override
	public void setResourceLoader(ResourceLoader resourceLoader) {
		this.resourceLoader = resourceLoader;
	}	

//	@Override
//	public void setResourceLoader(ResourceLoader resourceLoader) {
//		this.resourceLoader = resourceLoader;
//	}

	
}
