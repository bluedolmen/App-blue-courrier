package org.bluedolmen.alfresco.acs;

import java.util.Map;

import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public final class ACSPost extends ACSGet {

	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
		final String id = req.getServiceMatch().getTemplateVars().get(ACSServiceImpl.P_ID);		
		
		final String active = req.getParameter(ACSServiceImpl.P_ACTIVE);
		setActive(id, active);
		
		final String region = req.getParameter(ACSServiceImpl.P_REGION);
		setRegion(id, region);
		
		final String height = req.getParameter(ACSServiceImpl.P_HEIGHT);
		setHeight(id, height);
		
		final String width = req.getParameter(ACSServiceImpl.P_WIDTH);
		setWidth(id, width);
		
		final String source = req.getParameter(ACSServiceImpl.P_SOURCE);
		setSource(id, source);
		
		return super.executeImpl(req, status, cache);
		
	}
	
	public void setRegion(String pageId, String region) {
		
		if (null == region) return;
		acsService.setRegion(pageId, region);
		
	}
	
	public void setSource(String pageId, String source) {
		
		if (null == source) return;
		acsService.setSource(pageId, source);
		
	}
	
	public void setActive(String pageId, String active) {
		
		if (null == active) return;
		
		acsService.setActive("true".equals(active.toLowerCase()));
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setHeight(java.lang.String)
	 */
	public void setHeight(String pageId, String height) {
		
		if (null == height) return;
		
		acsService.setHeight(pageId, Integer.parseInt(height));
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setWidth(java.lang.String)
	 */
	public void setWidth(String pageId, String width) {
		
		if (null == width) return;
		
		acsService.setWidth(pageId, Integer.parseInt(width));
		
	}	

	
	
}
