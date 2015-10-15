package org.bluedolmen.alfresco.app;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.NativeMap;
import org.alfresco.repo.jscript.ValueConverter;
import org.alfresco.service.ServiceRegistry;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONObject;
import org.mozilla.javascript.Scriptable;

public class AppConfigScript extends BaseScopableProcessorExtension {

	private static final Log logger = LogFactory.getLog(AppConfigScript.class);
	protected final static ValueConverter VALUE_CONVERTER = new ValueConverter();
	
	private ConfigService configService;
	private ServiceRegistry services;
	private String context;
	
	public Object getValue(String configId) {
		
		final Object value = configService.getValue(context, configId);
		if (null == value) return null;
		
		if (!(value instanceof Serializable)) {
			logger.warn(String.format("Value '%s' is not of type Serializable, returning null", value));
			return null;
		}
		
		return VALUE_CONVERTER.convertValueForScript(services, getScope(), null, (Serializable) value);
		
	}
	
	public void setValue(String configId, Object value) {
		
		final Object value_ = VALUE_CONVERTER.convertValueForJava(value);
		configService.setValue(context, configId, value_); 
		
	}

	public String getJsonStringConfig() {
		
		return getJsonStringConfig(null);
		
	}
	
	public String getJsonStringConfig(String configId) {
		
		final Map<String, Object> tree = configService.getConfigTree(context, configId);		
		return JSONObject.toJSONString(tree);
		
	}
	
	public Scriptable getFlatConfig() {
		
		return getFlatConfig(null);
		
	}
	
	public Scriptable getFlatConfig(String configId) {
		
		final Map<String, Object> tree = configService.getConfigTree(context, configId);
		final Map<Object, Object> properties = new HashMap<Object, Object>();
		
		getFlatConfig(properties, "", tree.entrySet());
		
		return NativeMap.wrap(getScope(), properties);
		
	}
	
	@SuppressWarnings("unchecked")
	private void getFlatConfig(Map<Object, Object> properties, String prefix, Set<Entry<String, Object>> set) {
	
		if (!StringUtils.isEmpty(prefix)) {
			prefix += ".";
		}
		
		final Iterator<Entry<String, Object>> it = set.iterator();
		while (it.hasNext()) {
			
			final Entry<String, Object> entry = it.next();
			final String key = entry.getKey();
			final Object value = entry.getValue();
			
			if (value instanceof Map) {
				getFlatConfig(properties, prefix + key, ((Map<String, Object>) value).entrySet());
			}
			else {
				properties.put(prefix + key, value);
			}
			
		}
		
	}

	public void setConfigService(ConfigService configService) {
		this.configService = configService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.services = serviceRegistry;
	}
	
	public void setContext(String context) {
		this.context = context;
	}
	
	@Override
	public void register() {
		
		if (StringUtils.isBlank(context)) {
			throw new IllegalStateException("You have to provide a valid context.");
		}
		
		if (StringUtils.isBlank(getExtensionName())) {
			this.setExtensionName(context + "Config");
		}
		
		super.register();
		
	}
	
}
