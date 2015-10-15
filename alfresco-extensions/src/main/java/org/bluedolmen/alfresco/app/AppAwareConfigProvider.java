package org.bluedolmen.alfresco.app;

import java.io.Serializable;
import java.util.Map;

public interface AppAwareConfigProvider {

	public Serializable getValue(final String configId);
	
	public void setValue(final String configId, final Serializable value);
	
	public Map<String, Object> getConfigTree();
	
}
