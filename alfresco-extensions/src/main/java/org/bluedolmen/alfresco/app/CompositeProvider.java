package org.bluedolmen.alfresco.app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.app.ConfigProvider.CachingConfigProvider;
import org.springframework.beans.factory.InitializingBean;

public class CompositeProvider implements ConfigProvider, CachingConfigProvider, InitializingBean {
	
	private final static Log logger = LogFactory.getLog(CompositeProvider.class);

	private final List<ConfigProvider> configProviders = new ArrayList<>(2);
	
	CompositeProvider(ConfigProvider configProvider) {
		compose(configProvider);
	}
	
	CompositeProvider compose(ConfigProvider configProvider) {
		
		final String thisContext = getContext();
		final String otherContext = configProvider.getContext();
		
		if (null != thisContext && null != otherContext) { // not yet initialized
			if (!thisContext.equals(otherContext)) {
				throw new UnsupportedOperationException("Cannot compose config-providers with different names");
			}
		}
		
		if (configProvider instanceof CompositeProvider) {
			configProviders.addAll(((CompositeProvider) configProvider).configProviders);
		}
		else {
			configProviders.add(configProvider);
		}
		
		return this;
		
	}	

	@Override
	public String getContext() {
		
		if (configProviders.isEmpty()) return null;
		return configProviders.get(0).getContext();
		
	}

	@Override
	public Object getValue(String configId) {
		
		for (ConfigProvider configProvider : configProviders) {
			final Object value = configProvider.getValue(configId);
			if (null != value) return value;
		}
		
		return null;
		
	}

	@Override
	public void setValue(String configId, Object value) {
		
		// Set it in the first provider unless operation is unsupported
		for (ConfigProvider configProvider : configProviders) {
			
			try {
				configProvider.setValue(configId, value);
				return;
			}
			catch (UnsupportedOperationException e) {
				logger.info("Provider '" + configProvider.getClass().getCanonicalName() + "' does not support setting value, ignoring!");
			}
			
		}
		
		
	}

	@Override
	public Map<String, Object> getConfigTree(String context) {
		
		final Map<String, Object> result = new HashMap<>(configProviders.size());
		
		for (ConfigProvider configProvider : configProviders) {
			final Map<String, Object> configTree = configProvider.getConfigTree(context);
			if (null == configTree) continue;
			
			result.putAll(configTree);
		}
		
		return result;
		
	}
	
	@Override
	public void clearCache() {
		
		for (ConfigProvider configProvider : configProviders) {
			if (configProvider instanceof CachingConfigProvider) {
				((CachingConfigProvider) configProvider).clearCache();
			}
		}
		
	}	
	
	public void setConfigProviders(List<ConfigProvider> configProviders) {
		
		this.configProviders.addAll(configProviders);
		
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		
		if (configProviders.isEmpty()) return;
		final String context = configProviders.get(0).getContext();
		
		for (ConfigProvider configProvider : configProviders) {
			
			if (!context.equals(configProvider.getContext())) {
				throw new IllegalStateException("When building a composite provider, the composed providers must have the same context");
			}
			
		}
		
	}

}
