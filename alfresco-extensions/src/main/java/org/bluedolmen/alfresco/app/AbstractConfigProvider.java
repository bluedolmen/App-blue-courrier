package org.bluedolmen.alfresco.app;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.InitializingBean;


public abstract class AbstractConfigProvider implements ConfigProvider, InitializingBean {

	private ConfigService configService;
	protected String context;
	
	public void setContext(String context) {
		
		if (StringUtils.isBlank(context)) {
			throw new IllegalArgumentException("The context has to be a non-null and non-empty string");
		}
		
		this.context = context;
		
	}
	
	@Override
	public String getContext() {
		
		return context;
		
	}
	
	@Override
	public void afterPropertiesSet() throws Exception {
		
		if (StringUtils.isBlank(context)) {
			throw new IllegalStateException("The context is not set. Please use the context bean-property.");
		}
		
		configService.register(this);
		
	}	
	
	public void setConfigService(ConfigService configService) {
		
		this.configService = configService;
		
	}
	
//	<T extends Serializable> T getValue(final String appName, final String configId, Class<T> class_) {
//		
//		final Object result = getValue(appName, configId);
//		return class_.cast(result);
//		
//	}
//	
//	abstract Serializable getValue(final String appName, final String configId);
//	
//	abstract void setValue(final String appName, final String configId, final Serializable value);	
//	
//	abstract Map<String, Object> getConfigTree(String appName);

}
