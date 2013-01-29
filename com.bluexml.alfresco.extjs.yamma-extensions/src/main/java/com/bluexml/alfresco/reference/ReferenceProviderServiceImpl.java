package com.bluexml.alfresco.reference;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bluexml.alfresco.reference.ReferenceProviderService.Registerable;

public class ReferenceProviderServiceImpl implements ReferenceProviderService, Registerable {
	
	private static final String ID_DEFAULT = "default";
	private static Log logger = LogFactory.getLog(ReferenceProviderServiceImpl.class);
	private Map<String, ReferenceProvider> referenceProviders = new HashMap<String, ReferenceProvider>();
	private ReferenceProvider defaultReferenceProvider = null;

	public String getReference(NodeRef nodeRef) {
		return getReference(nodeRef, null);
	}
	
	public String getReference(String providerId, NodeRef nodeRef, Object config) {
		
		ReferenceProvider referenceProvider = null;
		
		if ( null == providerId || providerId.isEmpty() ) {
			referenceProvider = getDefaultReferenceProvider();
		} 
		else if (referenceProviders.containsKey(providerId) ) {
			referenceProvider = referenceProviders.get(providerId);
		} 
		else {
			throw new IllegalStateException(
				String.format("There is no reference provider width id='%s'", providerId)
			);			
		}
		
		return referenceProvider.getReference(nodeRef, config);
		
	}

	public String getReference(NodeRef nodeRef, Object config) {
		
		return getReference(null, nodeRef, config);
		
	}

	public void register(ReferenceProvider referenceProvider) {
		
		String id = referenceProvider.getId();
		if (null == id) {
			logger.warn(String.format("The ReferenceProvider %s does not define any id", referenceProvider));
			id = ID_DEFAULT;
		}
		
		if (referenceProviders.containsKey(id)) {
			logger.warn(String.format("The ReferenceProvider %s hides an existing", referenceProvider));
		}
		
		referenceProviders.put(id, referenceProvider);
		
	}
	
	private ReferenceProvider getDefaultReferenceProvider() {
		
		if (null == defaultReferenceProvider) {
			
			if (referenceProviders.containsKey(ID_DEFAULT)) {
				defaultReferenceProvider = referenceProviders.get(ID_DEFAULT);
			} else if (referenceProviders.isEmpty()) {
				throw new IllegalStateException("There is no reference provider defined");
			} else {
				defaultReferenceProvider = referenceProviders.values().iterator().next(); // first defined
			}
			
		}
		
		return defaultReferenceProvider;
		
	}

	/*
	 * Spring IoC/DI material
	 */
	
	public void setReferenceProvider(ReferenceProvider referenceProvider) {
		this.defaultReferenceProvider = referenceProvider;
	}
	
}
