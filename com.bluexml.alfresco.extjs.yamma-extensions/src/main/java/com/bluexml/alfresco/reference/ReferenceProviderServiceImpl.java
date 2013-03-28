package com.bluexml.alfresco.reference;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.search.impl.lucene.LuceneQueryParser;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bluexml.alfresco.reference.ReferenceProviderService.Registerable;

public class ReferenceProviderServiceImpl implements ReferenceProviderService, Registerable {
	
	private static final String ID_DEFAULT = "default";
	private static Log logger = LogFactory.getLog(ReferenceProviderServiceImpl.class);
	
	private Map<String, ReferenceProvider> referenceProviders = new HashMap<String, ReferenceProvider>();
	private ReferenceProvider defaultReferenceProvider = null;
	
	private SearchService searchService;
	private NodeService nodeService;
	private QName encodedProperty;

	public NodeRef getMatchingReferenceNode(String reference, String typeShort) {
		
		final String query = (
			"+\\@" + LuceneQueryParser.escape(encodedProperty.toString()) + ":\"" + reference + "\""
			+ (typeShort != null ? "+TYPE:\"" + typeShort + "\"": "")
		);
		
		final ResultSet result = searchService.query(
				StoreRef.STORE_REF_WORKSPACE_SPACESSTORE, 
				SearchService.LANGUAGE_LUCENE, 
				query
		);
		
		if (result.length() == 0) return null;
		if (result.length() > 1) {
			logger.warn("The reference is inconistant since it refers to several nodes. Only the first will be returned!");
		}
		
		return result.getNodeRef(0);
		
	}
	
	public void setReference(NodeRef nodeRef, String value) {
		
		final NodeRef existingNodeRef = getMatchingReferenceNode(value, null);
		
		if (existingNodeRef != null) {
			if (existingNodeRef.equals(nodeRef)) return;
			else throw new NotUniqueException(value, existingNodeRef);
		}
		
		nodeService.setProperty(nodeRef, encodedProperty, value);
	}

	public String setReference(NodeRef nodeRef, boolean override) {
		return setReference(nodeRef, override, null, null);
	}

	public String setReference(NodeRef nodeRef, boolean override, String providerId, Object config) {
		final ReferenceProvider referenceProvider = getReferenceProvider(providerId);
		
		final String existingReference = getExistingReference(nodeRef, null);
		if (null != existingReference && !override) return existingReference;
		
		final String newReference = referenceProvider.getReference(nodeRef, config);
		if (newReference.equals(existingReference)) return existingReference;
		
		setReference(nodeRef, newReference);
		return newReference;
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
			String.format("There is no reference provider with id='%s'", providerId)
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
	
	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

}
