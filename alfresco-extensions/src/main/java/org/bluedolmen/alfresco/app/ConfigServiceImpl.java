package org.bluedolmen.alfresco.app;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.app.ConfigProvider.CachingConfigProvider;

public class ConfigServiceImpl implements ConfigService {
	
	private final Log logger = LogFactory.getLog(ConfigServiceImpl.class);
	private final Map<String, ConfigProvider> configProviders = new HashMap<String, ConfigProvider>(8);

	@Override
	public Object getValue(String context, String configId) {
		
		final ConfigProvider configProvider = getConfigProvider(context);
		if (null == configProvider) return null;
		
		return configProvider.getValue(configId);
		
	}

	@Override
	public void setValue(String context, String configId, Object value) {
		
		final ConfigProvider configProvider = getConfigProvider(context);
		if (null == configProvider) return;
		
		configProvider.setValue(configId, value);

	}
	
	@Override
	public Map<String, Object> getConfigTree(String context, String configId) {
		
		final ConfigProvider configProvider = getConfigProvider(context);
		if (null == configProvider) return null;
		
		return configProvider.getConfigTree(configId);
		
	}
	
	public final void register(ConfigProvider configProvider) {
		
		final String context = configProvider.getContext();
		final ConfigProvider existingConfigProvider = getConfigProvider(context);
		
		if (null != existingConfigProvider) {
			configProviders.put(context, new CompositeProvider(existingConfigProvider).compose(configProvider));
		}
		else {
			configProviders.put(context, configProvider);
		}
		
	}

	private ConfigProvider getConfigProvider(String context) {
		
		final ConfigProvider configProvider = configProviders.get(context);
		if (null != configProvider) return configProvider;
		
		if (logger.isDebugEnabled()) {
			logger.debug("Provider for context '" + context + "' does not exist");
		}
		return null;
		
	}

	@Override
	public void clearCache() {
		
		for(Map.Entry<String, ConfigProvider> entry : configProviders.entrySet()) {
			
			final ConfigProvider configProvider = entry.getValue();
			if (configProvider instanceof CachingConfigProvider) {
				((CachingConfigProvider) configProvider).clearCache();
			}
			
		}
		
	}

}
