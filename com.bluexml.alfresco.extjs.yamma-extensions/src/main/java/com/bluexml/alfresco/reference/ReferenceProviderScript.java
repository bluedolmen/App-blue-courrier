package com.bluexml.alfresco.reference;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.service.cmr.repository.NodeRef;

public class ReferenceProviderScript extends BaseScopableProcessorExtension  {

	private ReferenceProviderService referenceProviderService;
	
	public String getReference() {
		return referenceProviderService.getReference(null);
	}
	
	public String getReference(ScriptNode node) {
		return getReference(null, node, null);
	}
	
	public String getReference(ScriptNode node, Object config) {
		return getReference(null, node, config);
	}
	
	public String getReference(String providerId, ScriptNode node, Object config) {

		final NodeRef nodeRef = node.getNodeRef();
		return referenceProviderService.getReference(providerId, nodeRef, config);
		
	}


	/*
	 * Spring IoC/DI material
	 */
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
}
