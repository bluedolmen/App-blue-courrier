package org.bluedolmen.repo.defaults;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.AssociationDefinition;
import org.alfresco.service.cmr.dictionary.ClassDefinition;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class DefaultsServiceImpl implements DefaultsService {
	
	private static Log logger = LogFactory.getLog(DefaultsServiceImpl.class);
	private Map<QName, Map<QName, String>> defaults;

	@Override
	public void updateNode(NodeRef nodeRef) {
		
		final NodeService nodeService = serviceRegistry.getNodeService();
		
		final QName nodeType = nodeService.getType(nodeRef);
		
		final Map<QName, String> defaults = this.defaults.get(nodeType);
		if (null == defaults) return;
		
		for (final QName defaultProp : defaults.keySet()) {
			
			final String defaultValue = defaults.get(defaultProp);
			if (isAssociation(defaultProp)) {
				
				
				
			}
			
		}

	}
	
	private boolean isAssociation(final QName qName) {
		
		final DictionaryService dictionaryService = serviceRegistry.getDictionaryService();
		return null != dictionaryService.getAssociation(qName);
		
	}
	
	// TODO : The implementation shouldn't be based on Lucene: this will not be portable
	// through indexing method switching
	private NodeRef getTargetAssociationNode(QName associationName, String id) {
		
		final DictionaryService dictionaryService = serviceRegistry.getDictionaryService();
		final AssociationDefinition associationDefinition = dictionaryService.getAssociation(associationName);
		
		final ClassDefinition targetClassDefinition = associationDefinition.getTargetClass();
		final QName targetQName = targetClassDefinition.getName();
		
		final SearchService searchService = serviceRegistry.getSearchService();
//		searchService.query(searchParameters);
		
		return null;
		
	}
	
	public void addDefinition(QName target, Map<QName, String> defaults) {
		
		if (this.defaults.containsKey(target)) {
			logger.warn(String.format("Target '%s' will be overridden. Make sure this is intentional.", target));
		}
		
		this.defaults.put(target, defaults);
		
	}
	
	public void updateDefinition(QName target, Map<QName, String> defaults) {
		
		if (!this.defaults.containsKey(target)) {
			this.defaults.put(target, new HashMap<QName, String>(defaults.size()));
		}
		
		this.defaults.get(target).putAll(defaults);
		
	}
	
	// Spring IoC
	
	private ServiceRegistry serviceRegistry;
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}

}
