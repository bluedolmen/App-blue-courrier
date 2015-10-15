package org.bluedolmen.alfresco.reference;

import org.alfresco.service.namespace.QName;

public interface IncrementalIdProvider <T> {
		
	public T getNext();
	
	public void reset();
	
	public T getTypeNext(QName typeQName);
	
	public void resetType(QName typeQName);
	
	
}
