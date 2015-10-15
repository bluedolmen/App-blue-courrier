package org.bluedolmen.alfresco.resources;

import java.io.File;

import org.alfresco.service.cmr.repository.NodeRef;

public class SimpleAlfrescoResourceFactory implements AlfrescoResourceFactory<AlfrescoResource> {

	@Override
	public ClasspathResource buildClasspathResource(File file, String resourceName) {
		
		if (null == file) return null;
		return new ClasspathResource(file, resourceName);
		
	}

	@Override
	public RepositoryResource buildRepositoryResource(NodeRef nodeRef, String resourceName) {
		
		if (null == nodeRef) return null;
    	return new RepositoryResource(nodeRef, resourceName);
	}
	
	public static abstract class AbstractAlfrescoResource implements AlfrescoResource {
		
		final String resourceName;
		
		protected AbstractAlfrescoResource(String resourceName) {
			this.resourceName = resourceName;
		}
		
		@Override
		public String getResourceName() {
			return resourceName;
		}
		
	}	

	public static class ClasspathResource extends AbstractAlfrescoResource {

		protected final File file;
		
		protected ClasspathResource(File file, String resourceName) {
			super(resourceName);
			this.file = file;
		}

	}
	
	public static class RepositoryResource extends AbstractAlfrescoResource {
		
		protected final NodeRef nodeRef;
		
		protected RepositoryResource(NodeRef nodeRef, String resourceName) {
			super(resourceName);
			this.nodeRef = nodeRef;
		}

	}
	
}
