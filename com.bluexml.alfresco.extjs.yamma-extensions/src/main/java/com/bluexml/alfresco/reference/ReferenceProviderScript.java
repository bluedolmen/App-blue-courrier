package com.bluexml.alfresco.reference;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;

public class ReferenceProviderScript extends BaseScopableProcessorExtension  {

	private ReferenceProviderService referenceProviderService;
	

	
	public void setReference(ScriptNode node, String value) {
		referenceProviderService.setReference(node.getNodeRef(), value);
	}
	
	boolean setReference(ScriptNode node, boolean override) {
		return referenceProviderService.setReference(node.getNodeRef(), override);
	}
	
	boolean setReference(ScriptNode node, boolean override, String providerId, Object config) {
		return referenceProviderService.setReference(node.getNodeRef(), override, providerId, config);
	}
	
	String getExistingReference(ScriptNode node) {
		return referenceProviderService.getExistingReference(node.getNodeRef());
	}
	
	String getNewReference() {
		return referenceProviderService.getNewReference();
	}
	
	String getNewReference(String providerId, Object config) {
		return referenceProviderService.getNewReference(providerId, config);
	}
	

	/*
	 * Spring IoC/DI material
	 */
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
}
