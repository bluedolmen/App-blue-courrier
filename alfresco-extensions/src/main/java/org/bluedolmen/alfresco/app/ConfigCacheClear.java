package org.bluedolmen.alfresco.app;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class ConfigCacheClear extends AbstractWebScript {
	
	private static final Log logger = LogFactory.getLog(ConfigCacheClear.class);
	private ConfigService configService;

	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

		configService.clearCache();
		
		res.setStatus(Status.STATUS_OK);
		res.getWriter().close();
	 
	}

	public void setConfigService(ConfigService configService) {
		this.configService = configService;
	}
	
}
