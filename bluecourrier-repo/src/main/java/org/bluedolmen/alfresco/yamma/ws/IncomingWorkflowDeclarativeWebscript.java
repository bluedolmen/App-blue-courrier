package org.bluedolmen.alfresco.yamma.ws;

import java.util.Map;

import org.bluedolmen.alfresco.yamma.wf.IncomingWorkflowHelper;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class IncomingWorkflowDeclarativeWebscript extends DeclarativeWebScript {
	
	
	private IncomingWorkflowHelper incomingWorkflowHelper;
	
	@Override
	protected Map<String, Object> createScriptParameters(WebScriptRequest req,
			WebScriptResponse res, ScriptDetails script,
			Map<String, Object> customParams) {
		
		final Map<String, Object> scriptParameters = super.createScriptParameters(req, res, script, customParams);
		scriptParameters.put(IncomingWorkflowHelper.HELPER_SCRIPT_BINDING_NAME, incomingWorkflowHelper.getScriptInstance());
		
		return scriptParameters;
		
	}

	
	public void setIncomingWorkflowHelper(IncomingWorkflowHelper incomingWorkflowHelper) {
		this.incomingWorkflowHelper = incomingWorkflowHelper;
	}

}
