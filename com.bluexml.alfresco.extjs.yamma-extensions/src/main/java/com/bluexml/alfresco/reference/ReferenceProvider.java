package com.bluexml.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface ReferenceProvider {

	String getId();
	
	String getReference(NodeRef nodeRef, Object context);
	
}
