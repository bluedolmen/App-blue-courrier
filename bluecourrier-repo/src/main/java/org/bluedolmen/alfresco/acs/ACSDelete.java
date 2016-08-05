package org.bluedolmen.alfresco.acs;

import java.util.Map;

import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public final class ACSDelete extends ACSGet {

	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
		String pageId = req.getServiceMatch().getTemplateVars().get(ACSServiceImpl.P_ID);
		if ("default".equals(pageId)) {
			pageId = null;
		}
		final String property = req.getServiceMatch().getTemplateVars().get(ACSServiceImpl.P_PROPERTY);
		
		acsService.resetValue(pageId, property);
		
		return super.executeImpl(req, status, cache);
		
	}
	
}
