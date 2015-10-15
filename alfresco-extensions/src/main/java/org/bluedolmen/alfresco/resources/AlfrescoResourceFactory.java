package org.bluedolmen.alfresco.resources;

import java.io.File;

import org.alfresco.service.cmr.repository.NodeRef;

public interface AlfrescoResourceFactory <T extends AlfrescoResource> {

	T buildClasspathResource(File file, String resourceName);
	
	T buildRepositoryResource(NodeRef nodeRef, String resourceName);
	
}
