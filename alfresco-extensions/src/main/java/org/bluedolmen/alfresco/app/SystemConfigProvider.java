package org.bluedolmen.alfresco.app;

import java.io.Serializable;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.bluedolmen.alfresco.app.ConfigProvider.CachingConfigProvider;
import org.bluedolmen.alfresco.app.GlobalConfig.ConfigContainer;

class SystemConfigProvider extends AbstractConfigProvider implements CachingConfigProvider {

	protected static final String APPCONFIG_PATTERN = "{appName}.appconfig";  
	
	@Override
	public Serializable getValue(final String configId) {
		
		final String actualConfigId = getActualConfigId(configId);
		return (Serializable) globalConfig.getValue(actualConfigId);

	}
	
	@Override
	public void setValue(final String configId, final Object value) {
		
		final String actualConfigId = getActualConfigId(configId);
		if (! (value instanceof Serializable)) {
			throw new UnsupportedOperationException("Does not support setting non serializable values.");
		}
		
		globalConfig.setValue(actualConfigId, (Serializable) value, true /* public */);
		
	}
	
	@Override
	public Map<String, Object> getConfigTree(String configId) {
		
		return getConfigTreeInternal(
			APPCONFIG_PATTERN.replace("{appName}", getContext().replaceAll("\\/", "\\."))
			+ (null != configId ? configId : "")
		);
		
	}
	
	Map<String, Object> getConfigTreeInternal(final String path) {
		
		final ConfigContainer configContainer = globalConfig.getConfigTree(path, true);
		if (null == configContainer) return null;
		
		return configContainer.toMap();
		
	}
	
	protected String getActualConfigId(String configId) {
		
		String context = getContext();
		final int firstSlashIndex = context.indexOf("/");
		
		if (-1 != firstSlashIndex) {
			context = context.substring(0, firstSlashIndex);
			configId = context.substring(firstSlashIndex + 1).replaceAll("\\/", "\\.") + "." + configId; 
		}
		
		if (StringUtils.isBlank(configId)) {
			throw new IllegalArgumentException("The aconfig-id has to be a valid non-empty and non-null string value");
		}
		
		return APPCONFIG_PATTERN.replace("{appName}", context) + "." + configId;
		
	}	

	@Override
	public void clearCache() {
		
		globalConfig.clearCache();
		
	}	
	
	/*
	 * Spring IoC/DI material
	 */
	
	private GlobalConfig globalConfig;
	
	public void setGlobalConfig(GlobalConfig globalConfig) {
		this.globalConfig = globalConfig;
	}

}
