package com.bluexml.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface IncrementalIdProvider <T> {
		
	public T getNext();
	
	public void reset();
	
	public T getTypeNext(NodeRef nodeRef);
	
	public void resetType(NodeRef nodeRef);
	
	public void resetType(String typeLocalName);
	
}
