package org.bluedolmen.repo.jscript;

import java.io.InputStream;
import java.util.Collection;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.scripts.ScriptException;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.namespace.NamespaceException;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.MaxSizeMap;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.repo.forum.ForumUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public final class NodeUtilsScript extends BaseScopableProcessorExtension {
	
	private static final Log logger = LogFactory.getLog(NodeUtilsScript.class);
	
	
	
	/**
	 * A cache for enclosing site computation.
	 * 
	 * This emulates the cached property in ScriptNode.
	 * Some caching problems may arise in case a node is moved outside the sites space making 
	 * this cache value obsolete.
	 * Even if the implementation of ScriptNode seems a bit stronger w.r.t. the move operation,
	 * we can suspect it to be incorrect w.r.t. the move operation of an ancestor 
	 * (in the sense of file-hierarchy)
	 * 
	 */
	final MaxSizeMap<ScriptNode, String> siteCache = new MaxSizeMap<ScriptNode, String>(50, true);
	
	public String getSiteShortName(final ScriptNode node) {
		
		return getSiteShortName(node, true);
		
	}
	
	public String getSiteShortName(final ScriptNode node, boolean useCache) {
		
		if (null == node) {
			throw new IllegalArgumentException("The provided node is not valid (null)");
		}
		
		if (useCache && siteCache.containsKey(node)) {
			return siteCache.get(node);
		}
		
		final NodeService nodeService = this.nodeService;
		
		return AuthenticationUtil.runAs(new RunAsWork<String>() {

			@Override
			public String doWork() throws Exception {
				
				NodeRef iter = node.getNodeRef();
				
				while (null != iter) {
					
					final QName nodeType = nodeService.getType(iter);
					if (SiteModel.TYPE_SITE.equals(nodeType)) {
						final String siteName = (String) nodeService.getProperty(iter, ContentModel.PROP_NAME); 
						siteCache.put(node, siteName);
						return siteName;
					}
					
					if (SiteModel.TYPE_SITES.equals(nodeType)) {
						break; // outside site space
					}
					
					final ChildAssociationRef childAssociationRef = nodeService.getPrimaryParent(iter);
					iter = childAssociationRef.getParentRef();
					
				}
				
				return null;
				
			}
			
		}, AuthenticationUtil.getSystemUserName());
		
		
	}

	/**
	 * Get the permission for the provided user
	 * 
	 * @param node
	 * @param permission
	 * @param userName
	 * @return
	 */
	public boolean hasPermission(final ScriptNode node, final String permission, String userName) {
		
		if (null == node) {
			throw new IllegalArgumentException("The provided node is not valid (null)");
		}
		
		if (null == userName || userName.isEmpty()) {
			throw new IllegalArgumentException("The provided userName has to be a valid non-empty String");
		}
		
		if (!node.hasPermission("Read")) {
			throw new ScriptException("You are not allowed to read permissions on an unreadable node");
		}
		
		return AuthenticationUtil.runAs(new RunAsWork<Boolean>() {

			@Override
			public Boolean doWork() throws Exception {
				
				return node.hasPermission(permission);
				
			}
			
		}, userName);		
		
	}

	public boolean moveAndRename(ScriptNode node, ScriptNode destination, String newName) {
		
    	ParameterCheck.mandatory("Node to copy", node);
    	ParameterCheck.mandatory("Destination Node", destination);
    	
    	final NodeRef sourceNodeRef = node.getNodeRef();
    	final NodeRef destinationNodeRef = destination.getNodeRef(); 
      
		if (!destinationNodeRef.getStoreRef().getProtocol().equals(StoreRef.PROTOCOL_WORKSPACE)) {
			throw new UnsupportedOperationException("Only the workspace:// protocol is supported");
		}
      	
		final FileFolderService fileFolderService = this.services.getFileFolderService();
		
		try {
			
			fileFolderService.move(sourceNodeRef, destinationNodeRef, newName);
			return true;
			
		} catch (FileExistsException e) {
			throw new ScriptException("File already exist.", e);
		} catch (FileNotFoundException e) {
			throw new ScriptException("File cannot be found.", e);
		}
		
	}
	
	public ScriptableXMLDocument asXMLDocument(ScriptNode node) {
		
		if (null == node) return null;
		
		final ContentService contentService = services.getContentService();
		
		final ContentReader reader = contentService.getReader(node.getNodeRef(), ContentModel.PROP_CONTENT);
		
		if (reader.isClosed()) {
			logger.warn("The reader is closed, cannot get XML document");
			return null;
		}
		
		InputStream input = null;
		try {
			
			input = reader.getContentInputStream();
			final ScriptableXMLDocument xmlDocument = new ScriptableXMLDocument(input);
			xmlDocument.setScope(getScope());
			
			return xmlDocument;
			
		} catch (Exception e) {
			logger.warn("Cannot build a valid XML Document adapter", e);
		}
		finally {
			IOUtils.closeQuietly(input);
		}
		
		return null;
		
	}
	
	/**
	 * Helper method to remove a property from a node.
	 * <p>
	 * This is particularly useful considering residual properties.
	 * 
	 * @param node
	 * @param propertyName
	 */
	public void removeProperty(ScriptNode node, String propertyName) {
		
		if (null == node) throw new NullPointerException("Cannot remove a property from a null-node");
		
		final NodeRef nodeRef = node.getNodeRef();
		final QName propertyQName = QName.createQName(propertyName);
		
		nodeService.removeProperty(nodeRef, propertyQName);
		
	}
	
	private static final NamespaceService namespaces = new NamespaceService() {
		
		@Override
		public Collection<String> getURIs() {
			return null;
		}
		
		@Override
		public Collection<String> getPrefixes(String namespaceURI) throws NamespaceException {
			return null;
		}
		
		@Override
		public Collection<String> getPrefixes() {
			return null;
		}
		
		@Override
		public String getNamespaceURI(String prefix) throws NamespaceException {
			return null;
		}
		
		@Override
		public void unregisterNamespace(String prefix) {
		}
		
		@Override
		public void registerNamespace(String prefix, String uri) {
		}
	};
	
	public NamespaceService getNamespaces() {
		return namespaces;
	}
	
//    public ScriptNode copyAndRename(ScriptNode node, ScriptNode destination, String newName, boolean deepCopy) {
//    	
//    	ParameterCheck.mandatory("Node to copy", node);
//        ParameterCheck.mandatory("Destination Node", destination);
//        
//        if (!destination.getNodeRef().getStoreRef().getProtocol().equals(StoreRef.PROTOCOL_WORKSPACE)) {
//        	throw new UnsupportedOperationException("Only the workspace:// protocol is supported");
//        }
//        	
//        final NodeRef copyRef = this.services.getCopyService().copyAndRename(
//        		node.getNodeRef(), 
//        		destination.getNodeRef(),
//                ContentModel.ASSOC_CONTAINS, 
//                new AssociationQ null, 
//                deepCopy
//        );
//        
//        return new ScriptNode(copyRef, this.services, this.scope);
//            
//    }

	private ForumUtilsScript forumUtilsScript;
	
	public ForumUtilsScript getComments() {
		
		if (null == forumUtilsScript) {
			forumUtilsScript = new ForumUtilsScript();
		}
		
		return forumUtilsScript;
		
	}
	
	public class ForumUtilsScript {
		
		public void setCommentAsPrivate(final ScriptNode commentNode, final String[] privateAuthorities) {
			
			if (null == commentNode) return;
			final NodeRef nodeRef = commentNode.getNodeRef();
			
			forumUtils.setCommentAsPrivate(nodeRef, privateAuthorities);
			
		}
		
		public boolean isPrivate(final ScriptNode commentNode) {
			
			if (null == commentNode) return false;
			final NodeRef nodeRef = commentNode.getNodeRef();
			
			return forumUtils.isPrivate(nodeRef);
			
		}
		
		public Scriptable getPrivateDeclaredAuthorities(ScriptNode commentNode) {
			
			if (null == commentNode) return null;
			final NodeRef nodeRef = commentNode.getNodeRef();
			
			final List<String> authorities = forumUtils.getPrivateDeclaredAuthorities(nodeRef);
			return Context.getCurrentContext().newArray(NodeUtilsScript.this.getScope(), authorities.toArray());
			
		}
		
	}
	
	
	
	
	// Spring IoC
	
	private NodeService nodeService = null;
	private ServiceRegistry services = null;
	private ForumUtils forumUtils = null;
	
	public void setServiceRegistry(ServiceRegistry services) {
		this.services = services;
		this.setNodeService(services.getNodeService());
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setForumUtils(ForumUtils forumUtils) {
		this.forumUtils = forumUtils;
	}
	
	
}
