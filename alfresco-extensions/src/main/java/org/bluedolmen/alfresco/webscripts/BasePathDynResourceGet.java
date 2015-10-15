package org.bluedolmen.alfresco.webscripts;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.web.scripts.content.ContentStreamer;
import org.alfresco.repo.web.scripts.content.StreamContent;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.resources.AlfrescoResourceResolver;
import org.springframework.extensions.webscripts.Match;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

/**
 * @author pajot-b
 *
 */
public class BasePathDynResourceGet  extends StreamContent {
	
	private static final Log logger = LogFactory.getLog(BasePathDynResourceGet.class);
	private static final String PATH_TO_RESOURCE_PARAM = "pathToResource";
	
	private List<String> filteredExtensions = null;
	private boolean emptyIfMissing;
	
	private AlfrescoResourceResolver alfrescoResourceResolver;
	protected ContentStreamer delegate;

	
	@Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
		
    	final AlfrescoResource alfrescoResource = streamResource(req,res);
    	if (null == alfrescoResource) {
    		res.setStatus(emptyIfMissing ? Status.STATUS_NO_CONTENT : Status.STATUS_NOT_FOUND);
    	}
    	// else do not change the status since it is already set by the streamContent implementation
    	
	}
	
    protected AlfrescoResource streamResource(WebScriptRequest req, WebScriptResponse res) throws IOException {
    	
    	final Match match = req.getServiceMatch();
    	final String pathToResource = match.getTemplateVars().get(PATH_TO_RESOURCE_PARAM);
    	
    	if (StringUtils.isBlank(pathToResource)) return null;
    	
    	checkExtension(pathToResource);
    	
    	final AlfrescoResource resource = alfrescoResourceResolver.resolveResource(pathToResource, new AlfrescoResourceFactory());
    	if (null != resource) {
    		resource.streamContentImpl(req, res);
    	}
    	
    	return resource;
    	
    }
    
    protected class AlfrescoResourceFactory implements org.bluedolmen.alfresco.resources.AlfrescoResourceFactory<AlfrescoResource>  {

		@Override
		public AlfrescoResource buildClasspathResource(File file, String resourceName) {
			return new ClasspathResource(file, resourceName);
		}

		@Override
		public AlfrescoResource buildRepositoryResource(NodeRef nodeRef, String resourceName) {
			return new RepositoryResource(nodeRef, resourceName);
		}
    	
    }
    
    protected static interface Streamable {
    	
    	abstract void streamContentImpl(WebScriptRequest req, WebScriptResponse res) throws IOException;
    	
    }
    
    protected static interface AlfrescoResource extends org.bluedolmen.alfresco.resources.AlfrescoResource, Streamable {
    	
    }
    
    protected class RepositoryResource extends org.bluedolmen.alfresco.resources.SimpleAlfrescoResourceFactory.RepositoryResource implements AlfrescoResource {
    	
    	protected RepositoryResource(NodeRef nodeRef, String resourceName) {
			super(nodeRef, resourceName);
		}

		@Override
		public void streamContentImpl(WebScriptRequest req, WebScriptResponse res) throws IOException {
    		streamContent(req, res, nodeRef, ContentModel.PROP_CONTENT, false /* attach */, null, null);
    	}
    	
    }
    
    protected class ClasspathResource extends org.bluedolmen.alfresco.resources.SimpleAlfrescoResourceFactory.ClasspathResource implements AlfrescoResource {
    	
		protected ClasspathResource(File file, String resourceName) {
			super(file, resourceName);
		}

		@Override
    	public void streamContentImpl(WebScriptRequest req, WebScriptResponse res) throws IOException {
    		streamContent(req, res, file);
    	}
    	
    }
	
    private void checkExtension(String fileName) {
    	
    	if (null == filteredExtensions) return;
    	if (null == fileName) return;
    	
    	final int lastDotPosition = fileName.lastIndexOf(".");
    	if (-1 == lastDotPosition) {
    		throw new IllegalStateException("The retrieved resource does not have a valid extension.");
    	}
    	
    	final String extension = fileName.substring(lastDotPosition + 1);
    	
        for (final String filteredExtension : filteredExtensions) {
        	if (filteredExtension.equals(extension)) return;
        }
        
        final StringBuilder allowedExtensions = new StringBuilder();
        final Iterator<String> it = filteredExtensions.iterator();
        while (it.hasNext()) {
        	allowedExtensions.append(it.next()).append(it.hasNext() ? ", " : "");
        }
        
    	throw new IllegalStateException("The retrieved resource extension must be one of: " + allowedExtensions);
    	
    }
    
	public void setFilteredExtensions(List<String> extensions) {
		this.filteredExtensions = extensions;
	}
	
	public void setEmptyIfMissing(boolean emptyIfMissing) {
		this.emptyIfMissing = emptyIfMissing;
	}
	
	public void setDelegate(ContentStreamer delegate) {
		
		this.delegate = delegate;
		super.setDelegate(this.delegate);
		
	}
	
	public void setAlfrescoResourceResolver(AlfrescoResourceResolver alfrescoResourceResolver) {
		this.alfrescoResourceResolver = alfrescoResourceResolver;
	}

}
