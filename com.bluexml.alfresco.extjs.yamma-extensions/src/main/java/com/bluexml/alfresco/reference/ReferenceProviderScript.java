package com.bluexml.alfresco.reference;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;

public class ReferenceProviderScript extends BaseScopableProcessorExtension  {

	private ServiceRegistry serviceRegistry;
	private ReferenceProviderService referenceProviderService;
	

	public ScriptNode getNode(String reference) {
		return getNode(reference, null);		
	}
	
	public ScriptNode getNode(String reference, String typeShort) {
		final NodeRef existingReference = referenceProviderService.getMatchingReferenceNode(reference, typeShort);
		return new ScriptNode(existingReference, serviceRegistry, this.getScope());
	}
	
	public void setReference(ScriptNode node, String value) {
		referenceProviderService.setReference(node.getNodeRef(), value);
	}
	
	public String setReference(ScriptNode node, boolean override) {
		return referenceProviderService.setReference(node.getNodeRef(), override);
	}
	
	public String setReference(ScriptNode node, boolean override, String providerId, Object config) {
		return referenceProviderService.setReference(node.getNodeRef(), override, providerId, config);
	}
	
	public String getExistingReference(ScriptNode node) {
		return referenceProviderService.getExistingReference(node.getNodeRef());
	}
	
	public String getNewReference() {
		return referenceProviderService.getNewReference();
	}
	
	public String getNewReference(String providerId, Object config) {
		return referenceProviderService.getNewReference(providerId, config);
	}
	

	/*
	 * Spring IoC/DI material
	 */
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
}
