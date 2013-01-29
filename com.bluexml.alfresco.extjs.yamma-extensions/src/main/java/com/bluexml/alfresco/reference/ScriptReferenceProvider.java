package com.bluexml.alfresco.reference;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.alfresco.service.cmr.repository.ScriptService;

public class ScriptReferenceProvider extends AbstractReferenceProvider {

	public String getId() {
		return id;
	}
	
	public String getReference(NodeRef nodeRef, Object context) {
				
		final Map<String, Object> model = new HashMap<String, Object>();
		model.put("document", nodeRef);
		model.put("idprovider", this.incrementalIdProvider);
		
		final Object result = scriptService.executeScript(scriptLocation, model);
		return result.toString();
		
	}

	/*
	 * Spring IoC/DI material
	 */
	
	private String id = "script";
	private ScriptService scriptService;
	private ScriptLocation scriptLocation;
	protected IncrementalIdProvider<?> incrementalIdProvider;
	
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}
	
    public void setLocation(ScriptLocation scriptLocation) 
    {
		this.scriptLocation = scriptLocation;
	}

    public void setProviderId(String id) {
    	this.id = id;
    }
    
	
	public void setIncrementalIdProvider(IncrementalIdProvider<?> incrementalIdProvider) {
		this.incrementalIdProvider = incrementalIdProvider;
	}
	
}
