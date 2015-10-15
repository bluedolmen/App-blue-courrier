package org.bluedolmen.alfresco.webscripts;

import java.util.Map;

import org.alfresco.repo.admin.SysAdminParams;
import org.alfresco.util.UrlUtil;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.ScriptContent;

public class UrlAwareWebscript extends DeclarativeWebScript {

	@Override
	protected void executeScript(ScriptContent location, Map<String, Object> model) {
		
		model.put("alfrescoUrl", UrlUtil.getAlfrescoUrl(sysAdminParams));
		model.put("shareUrl", UrlUtil.getShareUrl(sysAdminParams));
		
		super.executeScript(location, model);
		
	}
	
	private SysAdminParams sysAdminParams;
	
	public void setSysAdminParams(SysAdminParams sysAdminParams) {
		this.sysAdminParams = sysAdminParams;
	}
	
}
