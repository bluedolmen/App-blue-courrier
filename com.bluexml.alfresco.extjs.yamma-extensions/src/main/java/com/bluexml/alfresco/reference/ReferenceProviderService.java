package com.bluexml.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface ReferenceProviderService {

	String getReference(NodeRef nodeRef);
	
	String getReference(NodeRef nodeRef, Object config);
	
	String getReference(String engine, NodeRef nodeRef, Object config);
	
	public interface Registerable {
		
		public void register(ReferenceProvider referenceProvider);
		
	}
	
}
