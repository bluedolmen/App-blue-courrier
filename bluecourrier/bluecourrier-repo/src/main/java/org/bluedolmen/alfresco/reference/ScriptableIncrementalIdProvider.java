package org.bluedolmen.alfresco.reference;

public interface ScriptableIncrementalIdProvider<T> extends IncrementalIdProvider<T> {

	public Integer getTypeNext(String typeLocalName);
	
	public void resetType(String typeLocalName);
	
}
