package org.bluedolmen.alfresco.resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.util.MaxSizeMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

public class AlfrescoResourceResolver implements ResourceLoaderAware {
	
	private static final Log logger = LogFactory.getLog(AlfrescoResourceResolver.class);
	
	protected RepositoryHelper repositoryHelper = null;
	
	protected List<String> resourceRepositoryLocations = Collections.emptyList();
	protected List<String> resourceClasspathLocations = Collections.emptyList();
	
	protected ResourceLoader resourceLoader;
	
	// Should we be using a transactional cache for better portability?
	private final MaxSizeMap<String, NodeRef> cachedNodeRefResources = new MaxSizeMap<String, NodeRef>(100, true);
	private final MaxSizeMap<String, File> cachedFileResources = new MaxSizeMap<String, File>(100, true);
	private boolean cacheMissingResources = true;
	
	private NodeService nodeService;
	private AlfrescoResourceFactory<? extends AlfrescoResource> resourceFactory;

	public AlfrescoResource resolveResource(String pathToResource) {
		
		if (null == resourceFactory) {
			throw new IllegalStateException("This helper cannot be used without providing a valid resource-factory");
		}
		
		return resolveResource(pathToResource, resourceFactory);
		
	}
	
    public <T extends AlfrescoResource> T resolveResource(String pathToResource, AlfrescoResourceFactory<T> resourceFactory) {
    	
    	if (null == resourceFactory) {
    		throw new NullPointerException("The resource-factory is not defined.");
    	}
    	
    	T resource = resolveRepositoryResource(pathToResource, resourceFactory);
    	if (null != resource) return resource;
    	
    	resource = resolveClasspathResource(pathToResource, resourceFactory);
    	
    	return resource; // may be null
    	
    }
    
    public <T extends AlfrescoResource> T resolveRepositoryResource(String pathToResource, AlfrescoResourceFactory<T> resourceFactory) {
    	
    	if (null == resourceFactory) {
    		throw new NullPointerException("The resource-factory is not defined.");
    	}
    	
    	final NodeRef nodeRef = getRepositoryResource(pathToResource);    	
    	if (null == nodeRef) return null;
    	
		return resourceFactory.buildRepositoryResource(nodeRef, pathToResource);
		
    }

    public <T extends AlfrescoResource> T resolveClasspathResource(String pathToResource, AlfrescoResourceFactory<T> resourceFactory) {
    	
    	if (null == resourceFactory) {
    		throw new NullPointerException("The resource-factory is not defined.");
    	}
    	
    	final File file = getClasspathResource(pathToResource);
    	if (null == file) return null;
    	
		return resourceFactory.buildClasspathResource(file, pathToResource);
		
    }
    
	private NodeRef getRepositoryResource(String pathToResource) {
		
		NodeRef resolvedNodeRef;
		
		if (!cachedNodeRefResources.containsKey(pathToResource)) {
			
			resolvedNodeRef = resolveRepositoryResource(pathToResource);
			if (null == resolvedNodeRef && !cacheMissingResources) return null;
			
			cachedNodeRefResources.put(pathToResource, resolvedNodeRef);
			
			return resolvedNodeRef; // no further checkings
			
		}
		
		resolvedNodeRef = cachedNodeRefResources.get(pathToResource);
		if (null != resolvedNodeRef && !nodeService.exists(resolvedNodeRef)) {
			// Node has been removed from the repository
			cachedNodeRefResources.remove(pathToResource);
			resolvedNodeRef = getRepositoryResource(pathToResource);
		}
		
		return resolvedNodeRef;
		
	}
	
    
	private NodeRef resolveRepositoryResource(String pathToResource) {
		
		pathToResource = getXPathEquivalentPath(pathToResource);
		
		for (final String repositoryLocation : resourceRepositoryLocations) {
			
	    	final List<NodeRef> nodeRefs = repositoryHelper.getResourcesByXpath(repositoryLocation + "/" + pathToResource);
	    	
	    	if (null != nodeRefs && !nodeRefs.isEmpty()) {
		    	return nodeRefs.get(0);
	    	}
	    	
		}
		
		return null;
		
	}
	
	private String getXPathEquivalentPath(String pathToResource) {
		
		final StringBuilder sb = new StringBuilder();
		final String[] splitPath = pathToResource.split("/");
		final Iterator<String> it = Arrays.asList(splitPath).iterator();
		
		while (it.hasNext()) {
			final String pathElement = it.next();
			if (!pathElement.contains(":")) {
				sb.append("cm:");
			}
			sb.append(pathElement);
			if (it.hasNext()) {
				sb.append("/");
			}
		}
		
		return sb.toString();
		
	}
	
	private File getClasspathResource(String pathToResource) {
		
		if (!cachedFileResources.containsKey(pathToResource)) {
			
			File resolvedFile = null;
			
			try {
				resolvedFile = resolveClasspathResource(pathToResource);
			}
			catch (FileNotFoundException e) {
				if (logger.isDebugEnabled()) {
					logger.debug(String.format("The resource with classpath '%s' cannot be found.", pathToResource));
				}
			}
			catch (IOException e) {
				logger.warn(String.format("Error while trying to resolve classpath resource '%s'", pathToResource));
				return null;
			}
				
			if (null == resolvedFile && !cacheMissingResources) return null;
			cachedFileResources.put(pathToResource, resolvedFile);
			
		}
		
		return cachedFileResources.get(pathToResource);
		
	}
	
	private File resolveClasspathResource(String pathToResource) throws IOException {
		
		for (final String classpathLocation : resourceClasspathLocations) {
			
	        final String classpathResource = "classpath:" + classpathLocation + (classpathLocation.endsWith("/") ? "" : "/") + pathToResource;      
	        final Resource resource = resourceLoader.getResource(classpathResource);
	        
	        if (resource.exists()) {
	        	return resource.getFile();
	        }
        
		}
		
		return null;
		
	}
	
    public void clearCache() {
    	cachedNodeRefResources.clear();
    	cachedFileResources.clear();
    }
    
    public void setRepositoryHelper(RepositoryHelper repositoryHelper) {
    	this.repositoryHelper = repositoryHelper;
    }
    
    // This one is provided for backward-compatibility purposes
	public void setResourceClasspathLocation(String classpathLocation) { 
		this.resourceClasspathLocations = Collections.singletonList(classpathLocation);
	}
	
	public void addResourceClasspathLocation(String classpathLocation) {
		this.resourceClasspathLocations = new ArrayList<String>(this.resourceClasspathLocations); 
		this.resourceClasspathLocations.add(classpathLocation);
	}

	public void setResourceClasspathLocations(List<String> classpathLocations) {
		this.resourceClasspathLocations = classpathLocations;
	}

	public void setResourceRepositoryLocations(List<String> repositoryLocations) {
		this.resourceRepositoryLocations = repositoryLocations;
	}
	
	public void addResourceRepositoryLocation(String repositoryLocation) {
		this.resourceRepositoryLocations = new ArrayList<String>(this.resourceRepositoryLocations);
		this.resourceRepositoryLocations.add(repositoryLocation);
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	@Override
	public void setResourceLoader(ResourceLoader resourceLoader) {
		this.resourceLoader = resourceLoader;
	}
	
	public void setResourceFactory(AlfrescoResourceFactory<? extends AlfrescoResource> resourceFactory) {
		this.resourceFactory = resourceFactory;
	}
	
}
