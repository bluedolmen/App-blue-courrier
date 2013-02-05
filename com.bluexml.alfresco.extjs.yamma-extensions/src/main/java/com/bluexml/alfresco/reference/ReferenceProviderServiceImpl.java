package com.bluexml.alfresco.reference;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bluexml.alfresco.reference.ReferenceProviderService.Registerable;

public class ReferenceProviderServiceImpl implements ReferenceProviderService, Registerable {
	
	private static final String ID_DEFAULT = "default";
	private static Log logger = LogFactory.getLog(ReferenceProviderServiceImpl.class);
	private Map<String, ReferenceProvider> referenceProviders = new HashMap<String, ReferenceProvider>();
	private ReferenceProvider defaultReferenceProvider = null;
	private NodeService nodeService;
	private QName encodedProperty;

	public void setReference(NodeRef nodeRef, String value) {
		nodeService.setProperty(nodeRef, encodedProperty, value);
	}

	public boolean setReference(NodeRef nodeRef, boolean override) {
		return setReference(nodeRef, override, null, null);
	}

	public boolean setReference(NodeRef nodeRef, boolean override, String providerId, Object config) {
		final ReferenceProvider referenceProvider = getReferenceProvider(providerId);
		
		final String existingReference = getExistingReference(nodeRef, null);
		if (null != existingReference && !override) return false;
		
		final String newReference = referenceProvider.getReference(nodeRef, config);
		if (newReference.equals(existingReference)) return false;
		
		setReference(nodeRef, newReference);
		return true;
	}

	public String getExistingReference(NodeRef nodeRef) {
		return getExistingReference(nodeRef, null); 
	}

	public String getNewReference() {
		return getNewReference(null, null);
	}

	public String getNewReference(String providerId, Object config) {
		final ReferenceProvider referenceProvider = getReferenceProvider(providerId);		
		return referenceProvider.getUnboundReference(config);
	}
	
	private String getExistingReference(final NodeRef nodeRef, String defaultValue) {
		
		final String value = (String) nodeService.getProperty(nodeRef, encodedProperty);
		if (null != value && !value.isEmpty()) return value;
		
		if (null != defaultValue && !defaultValue.isEmpty()) return defaultValue;
		
		return null;
		
	}
	
	private ReferenceProvider getReferenceProvider(String providerId) {
		
		if ( null == providerId || providerId.isEmpty() ) return getDefaultReferenceProvider();
		if (referenceProviders.containsKey(providerId) ) return referenceProviders.get(providerId);
		throw new IllegalStateException(
			String.format("There is no reference provider width id='%s'", providerId)
		);			
		
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

	public void setEncodedProperty(String propertyQName) {
		this.encodedProperty = QName.createQName(propertyQName);
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	

}
