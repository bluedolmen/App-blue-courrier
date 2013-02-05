package com.bluexml.alfresco.reference;

import com.bluexml.alfresco.reference.ReferenceProviderService.Registerable;


public abstract class AbstractReferenceProvider implements
		ReferenceProvider {

	public void register() {
		
		if (referenceProviderService instanceof Registerable) {
			((Registerable) referenceProviderService).register(this);
		}
		
	}
	
	public String getUnboundReference(Object context) {
		
		return getReference(null, context);
		
	}
	
	/*
	 * Spring IoC/DI material
	 */
	
	private ReferenceProviderService referenceProviderService;
	
	public void setReferenceProviderService(ReferenceProviderService referenceProviderService) {
		this.referenceProviderService = referenceProviderService;
	}
	
	
}
