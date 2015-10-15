package org.bluedolmen.alfresco.app;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.cache.TransactionalCache;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class GlobalConfig {
	
	private static final Log logger = LogFactory.getLog(GlobalConfig.class);
	private static final String CONFIG_ROOT_PATH = "sys:system/sys:config";

	private static final class InternalConfigProperty {
		private NodeRef configObject;
		private QName propertyName;
		
		private InternalConfigProperty(NodeRef configObject, QName propertyName) {
			this.configObject = configObject;
			this.propertyName = propertyName;
		}
	}	
	
	private TransactionalCache<String, InternalConfigProperty> cache;
	private DictionaryService dictionaryService;
	private NodeService nodeService;
	private PermissionService permissionService;
	private NamespacePrefixResolver namespacePrefixResolver;

	private NodeRef getConfigRoot() {
		
		final NodeRef workspaceSpacesStore = nodeService.getRootNode(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
		
		final Collection<String> pathToObject = Arrays.asList(CONFIG_ROOT_PATH.split("\\/"));
		return createPath(pathToObject, workspaceSpacesStore, true /* public */);		
		
	}
	
	public interface ConfigNodeVisitor {
		
		void visit(ConfigContainer container);
		
		void visit(ConfigProperty property);
		
	}
	
	public static abstract class ConfigNode {
		
		public final String id;
		
		private ConfigNode(String id) {
			this.id = id;
		}
		
		public abstract void accept(ConfigNodeVisitor visitor);
				
	}
	
	public static final class ConfigContainer extends ConfigNode {
		
		public final List<ConfigNode> children;
		
		private ConfigContainer(String id, List<ConfigNode> children) {
			super(id);
			this.children = children;
		}

		@Override
		public void accept(ConfigNodeVisitor visitor) {
			visitor.visit(this);
		}

		public Map<String, Object> toMap() {
			
			final Map<String, Object> map = new HashMap<String, Object>();
			for (final ConfigNode configNode : children) {
				
				if (configNode instanceof ConfigProperty) {
					map.put(configNode.id, ((ConfigProperty) configNode).value);
				}
				else { // ConfigContainer
					map.put(configNode.id, ((ConfigContainer) configNode).toMap());
				}
				
			}
			
			return map;
			
		}
		
		
		
	}
	
	public static final class ConfigProperty extends ConfigNode {
		
		public final Serializable value;
		
		private ConfigProperty(String id, Serializable value) {
			super(id);
			this.value = value;
		}
		
		@Override
		public void accept(ConfigNodeVisitor visitor) {
			visitor.visit(this);
		}
		
		
	}
	
	public ConfigContainer getConfigTree(String rootId, boolean includeValues) {

		final Deque<String> splitPath = getCheckedPathParts(rootId);
		final NodeRef configObject = getOrCreateConfigObject(splitPath, ContentModel.TYPE_CONTAINER /* objectType */, false /* create */, false /* public_ */);
		if (null == configObject) return null;
		
		return (ConfigContainer) getConfigChildren(configObject, includeValues);
		
	}

	private ConfigNode getConfigChildren(NodeRef rootNode, boolean includeValues) {
		
		final List<ConfigNode> children = new ArrayList<ConfigNode>();
		final String configName = nodeService.getPrimaryParent(rootNode).getQName().getLocalName();

		final Map<QName, Serializable> properties = nodeService.getProperties(rootNode);
		// Find all residual properties (those that aren't model defined)
		for (final QName propertyQName : properties.keySet()) {
			if (null != dictionaryService.getProperty(propertyQName)) continue;
			children.add(new ConfigProperty(propertyQName.getLocalName(), includeValues ? properties.get(propertyQName) : null));
		}
		
		final List<ChildAssociationRef> childAssocRefs = nodeService.getChildAssocs(rootNode, ContentModel.ASSOC_CHILDREN, RegexQNamePattern.MATCH_ALL);
		for (final ChildAssociationRef childAssociationRef : childAssocRefs) {
			
			final NodeRef childRef = childAssociationRef.getChildRef();
			if (!AccessStatus.ALLOWED.equals(permissionService.hasReadPermission(childRef))) continue;
			
			children.add(getConfigChildren(childRef, includeValues));
			
		}
		
		return new ConfigContainer(configName, children);
		
	}
	
	
	private Deque<String> getCheckedPathParts(String path) {
		
		final Deque<String> splitPath = new LinkedList<String>(Arrays.asList(path.split("\\.")));
		if (splitPath.isEmpty()) {
			throw new IllegalArgumentException("The provided path has to be non-empty!");
		}
		
		return splitPath;
		
	}
	
	public NodeRef getOrCreateSubContainer(NodeRef parentContainer, String containerName, boolean public_) {
		
		return getOrCreateSubObject(parentContainer, containerName, ContentModel.TYPE_CONTAINER, true /* create */, public_);
		
	}

	public NodeRef getOrCreateSubObject(NodeRef parentContainer, String objectName, QName objectType, boolean create, boolean public_) {
		
		final NodeRef configContainer = null == parentContainer ? getConfigRoot() : parentContainer;
		
		final QName assocQName = objectName.contains(":") ?
				QName.createQName(objectName, namespacePrefixResolver) :
				QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, objectName, namespacePrefixResolver)
		;

		final List<ChildAssociationRef> result = nodeService.getChildAssocs(configContainer, ContentModel.ASSOC_CHILDREN, assocQName, 1, true);
		final NodeRef subContainer = result.isEmpty() ? null : result.get(0).getChildRef();		
		if (null != subContainer) return subContainer;
		
		if (!create) return null;
		
		return createContainer(parentContainer, objectName, objectType, public_);
		
	}
	
	private NodeRef createContainer(NodeRef parentContainer, String objectName, QName objectType, boolean public_) {
				
		final QName assocQName = objectName.contains(":") ?
				QName.createQName(objectName, namespacePrefixResolver) :
				QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, objectName, namespacePrefixResolver)
		;
		final ChildAssociationRef createdContainerAssoc = nodeService.createNode(parentContainer, ContentModel.ASSOC_CHILDREN, assocQName, objectType);
		
		if (null == createdContainerAssoc) {
			throw new AlfrescoRuntimeException("Cannot create the config object '" + objectName + "' of type '" + objectType.getLocalName() + "'");
		}
		
		final NodeRef containerRef = createdContainerAssoc.getChildRef();
		permissionService.setInheritParentPermissions(containerRef, false);
		if (!public_) {
			permissionService.deletePermissions(containerRef);
		}
		
		return containerRef;
		
	}
	
	
	private NodeRef getOrCreateConfigObject(Collection<String> pathToObject, QName objectType, boolean create, boolean public_) {
		
		objectType = null == objectType ? ContentModel.TYPE_BASE : objectType;
		final List<String> copiedPath = new ArrayList<String>(pathToObject);
		
		final String configObjectName = copiedPath.remove(copiedPath.size() - 1);
		final NodeRef parentFolder = createPath(copiedPath, null, true /* public */); 		
		
		final NodeRef configObject = getOrCreateSubObject(parentFolder, configObjectName, objectType, create, public_);
		return configObject;
		
	}
	
	private NodeRef createPath(Collection<String> pathToObject, NodeRef root, boolean public_) {
		
		NodeRef containerIterator = null != root ? root : getConfigRoot();
		for (final String containerName : pathToObject) {
			containerIterator = getOrCreateSubContainer(containerIterator, containerName, public_);
		}
		
		return containerIterator;
		
	}
	
	private InternalConfigProperty getOrCreateConfigProperty(String pathToProperty, boolean create) {
		
		return getOrCreateConfigProperty(pathToProperty, create, true);
		
	}
	
	private InternalConfigProperty getOrCreateConfigProperty(String pathToProperty, boolean create, boolean public_) {
		
		if (! cache.contains(pathToProperty)) {			
		
			final Deque<String> splitPath = getCheckedPathParts(pathToProperty);
			final String propertyName = splitPath.removeLast(); // The path now contains the parent path parts
			final NodeRef configObject = getOrCreateConfigObject(splitPath, ContentModel.TYPE_CONTAINER /* objectType */, create, public_);
			if (null == configObject) return null;
			
			final QName propertyQName = propertyName.contains(":") ?
					QName.createQName(propertyName, namespacePrefixResolver) :
					QName.createQName(NamespaceService.SYSTEM_MODEL_PREFIX, propertyName, namespacePrefixResolver)
			;
			
			cache.put(pathToProperty, new InternalConfigProperty(configObject, propertyQName));
		
		}
		
		return cache.get(pathToProperty);

	}
	
	public void removeValue(String pathToProperty) {
		
		final InternalConfigProperty configProperty = getOrCreateConfigProperty(pathToProperty, false /* create */);
		if (null == configProperty) return;
		
		nodeService.removeProperty(configProperty.configObject, configProperty.propertyName);
		
	}
	
	public void setValue(String pathToProperty, Serializable value) {
		
		setValue(pathToProperty, value, true);
		
	}
	
	public void setValue(String pathToProperty, Serializable value, boolean public_) {
		
		final InternalConfigProperty configProperty = getOrCreateConfigProperty(pathToProperty, true /* create */, public_);
		nodeService.setProperty(configProperty.configObject, configProperty.propertyName, value);
		
	}
	
	public Object getValue(String pathToProperty) {
		
		final InternalConfigProperty configProperty = getOrCreateConfigProperty(pathToProperty, false /* create */);		
		if (null == configProperty) return null;
		
		return nodeService.getProperty(configProperty.configObject, configProperty.propertyName);
		
	}
	
	public void clearCache() {
		
		cache.clear();
		
	}
	
	/*
	 * Spring IoC/DI material
	 */	
	
	public void setDictionaryService(DictionaryService dictionaryService) {
		this.dictionaryService = dictionaryService;
	}
		
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	protected NodeService getNodeService() {
		return nodeService;
	}
	
	public void setPermissionService(PermissionService permissionService) {
		this.permissionService = permissionService;
	}
	
	public void setNamespacePrefixResolver(NamespacePrefixResolver namespacePrefixResolver) {
		this.namespacePrefixResolver = namespacePrefixResolver;
	}
	
	public void setCache(TransactionalCache<String, InternalConfigProperty> transactionalCache) {
		this.cache = transactionalCache;
	}

}
