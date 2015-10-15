package org.bluedolmen.alfresco.init;

import java.util.Map;

import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class InitDeclarativeWebscript extends DeclarativeWebScript {
	
	private InitRegistry initRegistry;
	
	@Override
	protected Map<String, Object> createScriptParameters(
			WebScriptRequest req, 
			WebScriptResponse res, 
			ScriptDetails script, 
			Map<String, Object> customParams
		) {
		
		final Map<String, Object> params = super.createScriptParameters(req, res, script, customParams);
		initRegistry.prepareScriptParameters(params);
		
		return params;
		
	}
	
	public void setInitRegistry(InitRegistry initRegistry) {
		this.initRegistry = initRegistry;
	}

}
