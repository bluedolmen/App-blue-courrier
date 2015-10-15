package org.bluedolmen.alfresco.app;

import java.util.Map;


public interface ConfigService {
	
	Object getValue(final String context, final String configId);
	
	void setValue(final String context, final String configId, final Object value);	
	
	Map<String, Object> getConfigTree(String context, String configId);
	
	void register(ConfigProvider configProvider);
	
	void clearCache();
	
}
