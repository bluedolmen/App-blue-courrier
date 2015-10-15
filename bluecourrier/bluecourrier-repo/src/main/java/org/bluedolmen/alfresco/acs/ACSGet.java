package org.bluedolmen.alfresco.acs;

import java.util.HashMap;
import java.util.Map;

import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class ACSGet extends DeclarativeWebScript {
	
	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
		final String id = req.getServiceMatch().getTemplateVars().get(ACSServiceImpl.P_ID);		
		final Map<String, Object> model = new HashMap<String, Object>(5); 
		
		model.put(ACSServiceImpl.P_ACTIVE, acsService.isActive());
		model.put(ACSServiceImpl.P_REGION, acsService.getRegion(id));
		model.put(ACSServiceImpl.P_SOURCE, acsService.getSource(id));
		model.put(ACSServiceImpl.P_HEIGHT, acsService.getHeight(id));
		model.put(ACSServiceImpl.P_WIDTH, acsService.getWidth(id));
		
		return model;
		
	}

	protected ACSService acsService = null;
	
	public void setAcsService(ACSService acsService) {
		this.acsService = acsService;
	}	
	
}
