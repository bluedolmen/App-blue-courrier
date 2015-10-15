package org.bluedolmen.alfresco.workflows.jbpm;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.alfresco.service.cmr.repository.ScriptService;
import org.alfresco.service.cmr.security.PersonService;

public class ReassignCredentialJavascriptTester extends ReassignCredentialTester {

	@Override
	public boolean canReassign(String taskId, String userName) {
		
		final Map<String, Object> model = new HashMap<String, Object>(1);
		model.put("taskId", taskId);
		
		final PersonService personService = getServiceRegistry().getPersonService();
		final NodeRef personRef = personService.getPerson(userName);
		model.put("person", personRef);
		
		final ScriptService scriptService = getServiceRegistry().getScriptService();
		Object result = scriptService.executeScript(scriptLocation, model);
		
		return (result instanceof Boolean) ? ((Boolean) result).booleanValue() : false; 
		
	}
	
	private ScriptLocation scriptLocation;

	public void setLocation(ScriptLocation location) {
		scriptLocation = location;
	}
	
}
