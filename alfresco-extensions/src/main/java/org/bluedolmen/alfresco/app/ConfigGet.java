package org.bluedolmen.alfresco.app;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Match;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class ConfigGet extends DeclarativeWebScript {
	
	private static final Log logger = LogFactory.getLog(ConfigGet.class);
	private static final String APP_NAME_PARAM = "appName";
	private static final String PATH_TO_RESOURCE_PARAM = "pathToResource";
	
	private ConfigService configService;
	
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
    	final Match match = req.getServiceMatch();
    	final Map<String, String> templateVars = match.getTemplateVars();
    	final String appName = templateVars.get(APP_NAME_PARAM);
    	final String configId = templateVars.get(PATH_TO_RESOURCE_PARAM);
    	
//    	final String configId = pathToResource.replaceAll("\\/", ".");
		
    	return getModel(appName, configId);
    	
	}
	
	protected Map<String, Object> getModel(String appName, String configId) {
		
    	final Map<String, Object> result = getConfigValue(appName, configId);
    	final Map<String, Object> model = new HashMap<String, Object>(1);
    	model.put("result", result);
    	
    	return model;
		
	}
	
	protected Map<String, Object> getConfigValue(String appName, String configId) {
		
//    	final Object value = configService.getValue(appName, configId);
    	final Object config = configService.getConfigTree(appName, configId);
    	
    	final Map<String, Object> model = new HashMap<String, Object>(3);
    	model.put("appName", appName);
    	model.put("id", configId);
    	model.put("config", config);
		
    	return model;
    	
	}
	
	public void setConfigService(ConfigService configService) {
		this.configService = configService;
	}

}
