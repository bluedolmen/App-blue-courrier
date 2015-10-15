package org.bluedolmen.alfresco.resources;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.bluedolmen.alfresco.resources.SimpleAlfrescoResourceFactory.ClasspathResource;
import org.bluedolmen.alfresco.resources.SimpleAlfrescoResourceFactory.RepositoryResource;

public class AlfrescoReadableResourceFactory implements AlfrescoResourceFactory<AlfrescoReadableResource> {
	
	private ContentService contentService;

	@Override
	public ReadableClasspathResource buildClasspathResource(File file, String resourceName) {
		
		if (null == file) return null;
		return new ReadableClasspathResource(file, resourceName);
		
	}

	@Override
	public ReadableRepositoryResource buildRepositoryResource(NodeRef nodeRef, String resourceName) {
		
		if (null == nodeRef) return null;
    	return new ReadableRepositoryResource(nodeRef, resourceName);
	}
	
	public static class ReadableClasspathResource extends ClasspathResource implements AlfrescoReadableResource {

		protected ReadableClasspathResource(File file, String resourceName) {
			super(file, resourceName);
		}

		@Override
		public InputStream getInputStream() throws IOException {
			return new BufferedInputStream(new FileInputStream(file));
		}

	}
	
	public class ReadableRepositoryResource extends RepositoryResource implements AlfrescoReadableResource {
		
		protected ReadableRepositoryResource(NodeRef nodeRef, String resourceName) {
			super(nodeRef, resourceName);
		}

		@Override
		public InputStream getInputStream() throws IOException {
			
			 final ContentReader contentReader = contentService.getReader(nodeRef, ContentModel.PROP_CONTENT);
			 if (!contentReader.exists()) return null;
			 
			 return contentReader.getContentInputStream();
			 
		}

	}
	
	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
	
}
