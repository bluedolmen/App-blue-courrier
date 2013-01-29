package com.bluexml.alfresco.app;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.cache.TransactionalCache;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class GlobalConfig {
	
	private static final Log logger = LogFactory.getLog(GlobalConfig.class);
	private static final String ROOT_PATH = "sys:system";
	private static final String BLUEXML_CONTAINER_NAME = "config";

	private static final class ConfigProperty {
		private NodeRef configObject;
		private QName propertyName;
		
		private ConfigProperty(NodeRef configObject, QName propertyName) {
			this.configObject = configObject;
			this.propertyName = propertyName;
		}
	}	
	
	private TransactionalCache<String, ConfigProperty> cache;
	private NodeService nodeService;
	private NamespacePrefixResolver namespacePrefixResolver;
	private SearchService searchService;
	
	public NodeRef getConfigContainer() {
			
		final NodeRef configRoot = getConfigRoot();
		final NodeRef bluexmlContainer = nodeService.getChildByName(configRoot, ContentModel.ASSOC_CHILDREN, BLUEXML_CONTAINER_NAME);					
		if (null != bluexmlContainer) return bluexmlContainer;
		
		return createContainer(configRoot, BLUEXML_CONTAINER_NAME, ContentModel.TYPE_CONTAINER);
		
	}
	
	private NodeRef getConfigRoot() {
		
		final NodeRef workspaceSpacesStore = nodeService.getRootNode(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
		
		final Collection<String> pathToObject = Arrays.asList(ROOT_PATH.split("\\/"));
		return createPath(pathToObject, workspaceSpacesStore);		
		
	}
	
	public NodeRef getOrCreateSubContainer(NodeRef parentContainer, String containerName) {
		
		return getOrCreateSubObject(parentContainer, containerName, ContentModel.TYPE_CONTAINER, true /* create */);
		
	}

	public NodeRef getOrCreateSubObject(NodeRef parentContainer, String objectName, QName objectType, boolean create) {
		
		final NodeRef configContainer = null == parentContainer ? getConfigContainer() : parentContainer;
		
		final QName assocQName = objectName.contains(":") ?
				QName.createQName(objectName, namespacePrefixResolver) :
				QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, objectName, namespacePrefixResolver)
		;

		final List<ChildAssociationRef> result = nodeService.getChildAssocs(configContainer, ContentModel.ASSOC_CHILDREN, assocQName, 1, true);
		final NodeRef subContainer = result.isEmpty() ? null : result.get(0).getChildRef();		
		if (null != subContainer) return subContainer;
		
		if (!create) return null;
		
		return createContainer(parentContainer, objectName, objectType);
		
	}
	
	private NodeRef createContainer(NodeRef parentContainer, String objectName, QName objectType) {
				
		final QName assocQName = objectName.contains(":") ?
				QName.createQName(objectName, namespacePrefixResolver) :
				QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, objectName, namespacePrefixResolver)
		;
		final ChildAssociationRef createdContainer = nodeService.createNode(parentContainer, ContentModel.ASSOC_CHILDREN, assocQName, objectType);
		
		if (null == createdContainer) {
			throw new AlfrescoRuntimeException("Cannot create the config object '" + objectName + "' of type '" + objectType.getLocalName() + "'");
		}
		
		return createdContainer.getChildRef();
		
	}
	
	
	private NodeRef getOrCreateConfigObject(Collection<String> pathToObject, QName objectType, boolean create) {
		
		objectType = null == objectType ? ContentModel.TYPE_BASE : objectType;
		final List<String> copiedPath = new ArrayList<String>(pathToObject);
		
		final String configObjectName = copiedPath.remove(copiedPath.size() - 1);
		final NodeRef parentFolder = createPath(copiedPath, null); 		
		
		final NodeRef configObject = getOrCreateSubObject(parentFolder, configObjectName, ContentModel.TYPE_BASE, create);
		return configObject;
		
	}
	
	private NodeRef createPath(Collection<String> pathToObject, NodeRef root) {
		
		NodeRef containerIterator = null != root ? root : getConfigContainer();
		for (String containerName : pathToObject) {
			containerIterator = getOrCreateSubContainer(containerIterator, containerName);
		}
		
		return containerIterator;
		
	}
	
	private ConfigProperty getOrCreateConfigProperty(String pathToProperty, boolean create) {
		
		if (! cache.contains(pathToProperty)) {			
		
			final Deque<String> splittenPath = new LinkedList<String>(Arrays.asList(pathToProperty.split("\\.")));
			if (splittenPath.isEmpty()) {
				throw new IllegalArgumentException("The provided path has to be non-empty!");
			}
			
			final String propertyName = splittenPath.removeLast();
			final QName propertyQName = propertyName.contains(":") ?
					QName.createQName(propertyName, namespacePrefixResolver) :
					QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, propertyName, namespacePrefixResolver)
			;
			
			final NodeRef configObject = getOrCreateConfigObject(splittenPath, null /* objectType */, true /* create */);
			cache.put(pathToProperty, new ConfigProperty(configObject, propertyQName));
		
		}
		
		return cache.get(pathToProperty);

	}
	
	public void setValue(String pathToProperty, Serializable value) {		
		
		final ConfigProperty configProperty = getOrCreateConfigProperty(pathToProperty, true /* create */);
		nodeService.setProperty(configProperty.configObject, configProperty.propertyName, value);
		
	}
	
	public Object getValue(String pathToProperty) {
		
		final ConfigProperty configProperty = getOrCreateConfigProperty(pathToProperty, false /* create */);		
		if (null == configProperty) return null;
		
		return nodeService.getProperty(configProperty.configObject, configProperty.propertyName);
		
	}
	
	/*
	 * Spring IoC/DI material
	 */	
		
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	protected NodeService getNodeService() {
		return nodeService;
	}
	
	public void setNamespacePrefixResolver(NamespacePrefixResolver namespacePrefixResolver) {
		this.namespacePrefixResolver = namespacePrefixResolver;
	}
	
	public void setCache(TransactionalCache<String, ConfigProperty> transactionalCache) {
		this.cache = transactionalCache;
	}

}
