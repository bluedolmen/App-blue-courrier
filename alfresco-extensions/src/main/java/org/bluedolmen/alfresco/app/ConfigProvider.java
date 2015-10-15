package org.bluedolmen.alfresco.app;

import java.util.Map;

public interface ConfigProvider {

	Object getValue(String configId);
	
	void setValue(String configId, final Object value);	
	
	Map<String, Object> getConfigTree(String context);
	
	String getContext();
	
	public static interface CachingConfigProvider {
		
		void clearCache();
		
	}
	
}
