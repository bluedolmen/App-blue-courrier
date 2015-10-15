package org.bluedolmen.alfresco.app;

import java.io.Reader;
import java.io.Serializable;
import java.util.Collections;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.parser.JSONParser;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.Match;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class ConfigPost extends ConfigGet {
	
	private static final Log logger = LogFactory.getLog(ConfigPost.class);
	private static final String APP_NAME_PARAM = "appName";
	private static final String PATH_TO_RESOURCE_PARAM = "pathToResource";
	
	private ConfigService configService;
	
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
    	final Match match = req.getServiceMatch();
    	final Map<String, String> templateVars = match.getTemplateVars();
    	final String appName = templateVars.get(APP_NAME_PARAM);
    	final String pathToResource = templateVars.get(PATH_TO_RESOURCE_PARAM);
    	
    	final String configId = pathToResource.replaceAll("\\/", ".");
		final Content content = req.getContent();
		if (null == content) return Collections.emptyMap();

		Reader reader = null;
		try {
			reader = content.getReader();
	    	final Object value = new JSONParser().parse(reader);
	    	
	    	if (!(value instanceof Serializable)) {
	    		logger.warn(String.format("Cannot serialize value '%s' because it is not a serializable value", value));
	    	}
	    	
	    	configService.setValue(appName, configId, (Serializable) value);			
		} catch (Exception e) {
			throw new WebScriptException("Could not set config value", e);
		}
		finally {
			IOUtils.closeQuietly(reader);
		}

    	return getModel(appName, configId);
    	
	}
	

	public void setConfigService(ConfigService configService) {
		this.configService = configService;
	}

}
