package org.bluedolmen.alfresco.init;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.jscript.ScriptableHashMap;
import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.web.scripts.rule.AbstractRuleWebScript;
import org.alfresco.repo.web.scripts.rule.ruleset.RuleRef;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.repository.ScriptService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.rule.Rule;
import org.alfresco.service.cmr.rule.RuleService;
import org.alfresco.service.cmr.search.QueryParameterDefinition;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.bluedolmen.alfresco.webscripts.ExtraAuthenticatedDeclarativeWebscript.ExtraAuthenticatedDelegate;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.UniqueTag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.extensions.surf.util.ParameterCheck;
import org.springframework.extensions.webscripts.json.JSONUtils;
import org.springframework.util.FileCopyUtils;

public final class InitRegistryImpl implements InitRegistry  {
	
	public static enum ResourceState {
		MISSING,
		MODIFIED,
		IDENTICAL,
		UNKNOWN
	};
	
	public static final class InitScriptComparator implements Comparator<Scriptable> {
		
		public static final InitScriptComparator INSTANCE = new InitScriptComparator();
		
		public int compare(Scriptable o1, Scriptable o2) {
			
			int level1 = getLevel(o1);
			int level2 = getLevel(o2);
			
			return level2 - level1;
		}
		
		private int getLevel(Scriptable scriptable) {
			
			int level = Integer.MAX_VALUE;
			
			try {
				final Object level_ = scriptable.get("level", scriptable);
				level = level_ instanceof Integer ? (Integer) level_ : Integer.parseInt(level_.toString());
			} catch(NumberFormatException e) {}
			
			return level;
			
		}
		
	}
	
	public static final String EXTENSION_NAME = "bdInitHelper"; // We do not want to expose it publicly
	
	/** The logger. */
	private final Logger logger = Logger.getLogger(getClass());
	
	private NodeService nodeService;
	private ScriptService scriptService;
	private FileFolderService fileFolderService;
	private SearchService searchService;
	private PermissionService permissionService;
	private NamespaceService namespaceService;
	private RuleService ruleService;
	private ServiceRegistry serviceRegistry;
	
	private Repository repositoryHelper;
	
	private final Map<String, Scriptable> registeredInitDefinitions = new HashMap<String, Scriptable>();
	private final Map<String, ExtraAuthenticatedDelegate> extraAuthenticatedDelegates = new HashMap<String, ExtraAuthenticatedDelegate>();
	// For internal purpose (e.g. reloading)
	private final Map<String, String> registeredInitDefinitionClaspaths = new HashMap<String, String>();
	
	public void resetInitDefinitions() {
		registeredInitDefinitions.clear();
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.init.IInitRegistry#registerInitDefinitions(org.bluedolmen.alfresco.init.InitScriptBootstrap)
	 */
	@Override
	public void registerInitDefinitions(InitScriptBootstrap initScriptBootstrap) {
		
		final ExtraAuthenticatedDelegate extraAuthenticatedDelegate = initScriptBootstrap.getExtraAuthenticatedDelegate();
		
		for (final String classpathResource : initScriptBootstrap.getClasspathResources()) {
			
			final String definitionId = registerInitDefinition(classpathResource);
			if (null == definitionId || null == extraAuthenticatedDelegate) continue;
			
			extraAuthenticatedDelegates.put(definitionId, extraAuthenticatedDelegate);
		}
		
	}

	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.init.IInitRegistry#registerInitDefinition(java.lang.String)
	 */
	@Override
	public String registerInitDefinition(String classpathResource) {
		
		final Scriptable initDefinition = getDefinition(classpathResource);
		if (null == initDefinition) {
			logger.warn(String.format("Could not load init-definition on classpath '%s', since it does not return a valid Javascript Object.", classpathResource));
			return  null;
		}
		
		final String definitionId = registerInitDefinition(initDefinition);
		registeredInitDefinitionClaspaths.put(definitionId, classpathResource);
		
		return definitionId;
		
	}
	
	String registerInitDefinition(Scriptable initDefinition) {
		
		final Object definitionId = initDefinition.get("id", initDefinition);
		if (UniqueTag.NOT_FOUND == definitionId) {
			throw new IllegalStateException("The provided object does not contain an 'id' property as expected");
		}
		final Object level = initDefinition.get("level", initDefinition);
		if (UniqueTag.NOT_FOUND == level) {
			initDefinition.put("level", initDefinition, Integer.MAX_VALUE);
		}
		
		final String definitionId_ = String.valueOf(definitionId);
		if (registeredInitDefinitions.containsKey(definitionId_)) {
			logger.warn(String.format("Init-definition '%s' will be overridden", definitionId_));
		}
		registeredInitDefinitions.put(definitionId_, initDefinition);
		if (logger.isInfoEnabled()) {
			logger.info(String.format("Registered init-definition '%s'", definitionId));
		}
		
		return definitionId_;
		
	}
	
	private Scriptable getDefinition(String scriptClasspath) {
		
		// get the references we need to build the default scripting data-model
		final String userName = AuthenticationUtil.getFullyAuthenticatedUser();
		final NodeRef personRef = userName == null ? null : serviceRegistry.getPersonService().getPerson(userName);
		final NodeRef homeSpaceRef = userName == null ? null : (NodeRef) nodeService.getProperty(personRef, ContentModel.PROP_HOMEFOLDER);
		final NodeRef companyHomeRef = repositoryHelper.getCompanyHome();

		final Map<String, Object> model = scriptService.buildDefaultModel(
			personRef,
			companyHomeRef, 
			homeSpaceRef, 
			null, /* scriptRef */ 
			companyHomeRef, /* documentRef */ 
			companyHomeRef /* spaceRef */
		);
		
		prepareScriptParameters(model);
		
		final Map<String, Object> initMap = new HashMap<String, Object>(1);
		model.put("init", initMap);
		
		scriptService.executeScript(scriptClasspath, model);
		
		final Object initDefinition = initMap.get("definition");
		if (! (initDefinition instanceof Scriptable)) return null;
		
		return (Scriptable) initDefinition;
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.init.IInitRegistry#getRegisteredInitDefinitions()
	 */
	@Override
	public List<Scriptable> getRegisteredInitDefinitions() {
		
		// Sort Scriptable-s by level
		final List<Scriptable> registeredInitDefinitions_ = new ArrayList<Scriptable>(registeredInitDefinitions.size());
		
		// TODO: This would be better implemented in an AOP fashion
		for (final String definitionId : registeredInitDefinitions.keySet()) {
			
			final ExtraAuthenticatedDelegate extraAuthenticatedDelegate = extraAuthenticatedDelegates.get(definitionId);
			if (null != extraAuthenticatedDelegate && !extraAuthenticatedDelegate.hasAccess()) continue;
			
			registeredInitDefinitions_.add(registeredInitDefinitions.get(definitionId));
			
		}
		
		Collections.sort(registeredInitDefinitions_, InitScriptComparator.INSTANCE);
		
		return registeredInitDefinitions_;
		    	
	}
	
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.init.IInitRegistry#getAuthenticatedDelegate(java.lang.String)
	 */
	@Override
	public ExtraAuthenticatedDelegate getAuthenticatedDelegate(String definitionId) {
		return this.extraAuthenticatedDelegates.get(definitionId);
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.init.IInitRegistry#reload()
	 */
	@Override
	public void reload() {
		
		registeredInitDefinitions.clear();
		for (final String definitionId : registeredInitDefinitionClaspaths.keySet()) {
			final String classpath = registeredInitDefinitionClaspaths.get(definitionId);
			registerInitDefinition(classpath);
		}
		
	}
	
	@Override
	public Map<String, Object> prepareScriptParameters(Map<String, Object> model) {
		
		if (null == model) {
			model = new HashMap<String, Object>();
		}
		
		model.put(EXTENSION_NAME, new InitHelperScript());
		
		return model;
		
	}
	
	public final class InitHelperScript extends BaseScopableProcessorExtension {
		
		/** The logger. */
		private final Logger logger = Logger.getLogger(getClass());
		
		/** The path matching resource pattern resolver */
		private PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

		private JSONUtils jsonUtils = new JSONUtils();
		private RuleParser ruleParser = new RuleParser();
		
		public void resetInitDefinitions() {
			InitRegistryImpl.this.reload();
		}

		public void registerInitDefinition(Scriptable initDefinition) {

			throw new UnsupportedOperationException("This method is obsoleted. Use the new way of loading init-scripts with the init-script bootstrap.");
			
		}
		
		public Scriptable getRegisteredInitDefinitions() {
			
	    	return Context.getCurrentContext().newArray(
				getScope(),
				InitRegistryImpl.this.getRegisteredInitDefinitions().toArray()
	    	);
	    	
		}
		
		public Scriptable loadExternalResources(String sourcePath, String xpathTargetPath) throws IOException {
			
			return loadExternalResources(sourcePath, xpathTargetPath, true);
			
		}
		
		public Scriptable loadExternalResources(String sourcePath, String xpathTargetPath, boolean overrideExisting) throws IOException {
			
			ParameterCheck.mandatoryString("sourcePath", sourcePath);
			ParameterCheck.mandatoryString("xpathTargetPath", xpathTargetPath);
			
			final Resource[] sourceResources = resolver.getResources(sourcePath);
			final Iterator<Resource> iterator = Arrays.asList(sourceResources).iterator();
			final NodeRef targetParentRef = getFirstNodeByXPath(xpathTargetPath);
			
			final List<ScriptNode> result = new ArrayList<ScriptNode>();
			
			while (iterator.hasNext()) {
				
				final Resource sourceResource = iterator.next();
				
				try {
					final NodeRef fileRef = copyResourceAsChild(sourceResource, targetParentRef, overrideExisting);
					result.add( new ScriptNode(fileRef, serviceRegistry, this.getScope()) );
				} 
				catch (IOException e) {
					logger.error(String.format("Failed copying the file '%s'", sourcePath), e);
				}
				
			}
			
			return Context.getCurrentContext().newArray(this.getScope(), result.toArray());
			
		}
		
		public Scriptable checkExternalResources(String sourcePath, String xpathTargetPath) throws IOException {
			
			ParameterCheck.mandatoryString("sourcePath", sourcePath);
			ParameterCheck.mandatoryString("xpathTargetPath", xpathTargetPath);
			
			final Resource[] sourceResources = resolver.getResources(sourcePath);
			final Iterator<Resource> iterator = Arrays.asList(sourceResources).iterator();
			final NodeRef targetParentRef = getFirstNodeByXPath(xpathTargetPath);
			
	    	final ScriptableHashMap<String, ResourceState> result = new ScriptableHashMap<String, ResourceState>();
			while (iterator.hasNext()) {
				
				final Resource sourceResource = iterator.next();
				final String sourceResourcePath = sourceResource.getURI().getPath();
				final String sourceFileName = sourceResource.getFilename();
				
				final NodeRef targetFileRef = fileFolderService.searchSimple(targetParentRef, sourceFileName);
				//final String targetFilePath = nodeService.getPath(targetFileRef).toPrefixString(namespaceService);
				
				if (null == targetFileRef) {
					result.put(sourceResourcePath, ResourceState.MISSING);
					continue;
				}		
				

				
				// Now compare the streams
				final ContentReader targetReader = fileFolderService.getReader(targetFileRef);
				InputStream sourceIS = null;
				InputStream targetIS = null;
				
				try {
					sourceIS = sourceResource.getInputStream();
					targetIS = targetReader.getContentInputStream();
					final boolean identical = IOUtils.contentEquals(sourceIS, targetIS);
					
					result.put(targetFileRef.toString(), identical ? ResourceState.IDENTICAL : ResourceState.MODIFIED);
					
				} catch (IOException e) {
					if (null != sourceIS) sourceIS.close();
					if (null != targetIS) targetIS.close();
					result.put(targetFileRef.toString(), ResourceState.UNKNOWN);
				}
				
			}
			
			return result;
		}
		
		private NodeRef getFirstNodeByXPath(String xpathString) throws IOException {
			
			ParameterCheck.mandatoryString("xpathString", xpathString);

			final NodeRef root = nodeService.getRootNode(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
			final List<NodeRef> nodeRefs = searchService.selectNodes(root, xpathString, new QueryParameterDefinition[]{}, namespaceService, false);
			
			if (nodeRefs.isEmpty()) {
				throw new IOException(String.format("Cannot find the parent target with xpath expression '%s'", xpathString));
			}
			
			return nodeRefs.get(0);
			
		}
		
		private NodeRef copyResourceAsChild(Resource sourceResource, NodeRef parentNodeRef, boolean overrideExisting) throws IOException {
			
			final String fileName = sourceResource.getFilename();
			final InputStream sourceStream = sourceResource.getInputStream();
			
			NodeRef fileRef = fileFolderService.searchSimple(parentNodeRef, fileName);
			if (null != fileRef) {
				if (overrideExisting) fileFolderService.delete(fileRef);
				else return fileRef;
			}
			
			final FileInfo fileInfo = fileFolderService.create(parentNodeRef, fileName, ContentModel.TYPE_CONTENT);
			fileRef = fileInfo.getNodeRef();
			
			OutputStream outputStream = null;
			try {
				
				final ContentWriter contentWriter = fileFolderService.getWriter(fileRef);
				outputStream = contentWriter.getContentOutputStream();
				FileCopyUtils.copy(sourceStream, outputStream);
				if (logger.isDebugEnabled()) {
					final Path path = nodeService.getPath(fileRef);
					final String pathString = path.toDisplayPath(nodeService, permissionService);
					logger.info(String.format("Created resource '%s' succesfully.", pathString));
				}
				
			} 
			finally {
				if (null != outputStream) outputStream.close();
				if (null != sourceStream) sourceStream.close();
			}
			
			return fileInfo.getNodeRef();
			
		}
		
		public boolean hasRules(ScriptNode node) {
			
			final NodeRef nodeRef = node.getNodeRef();
			return ruleService.hasRules(nodeRef);
			
		}
		
		public RuleRef addRule(ScriptNode node, Object definition) throws IOException, JSONException {
			
			final String jsonString = jsonUtils.toJSONString(definition);
			final JSONObject jsonObject = new JSONObject(jsonString);
			
			final Rule rule = buildRule(jsonObject);
			final NodeRef ruleTarget = node.getNodeRef();
			
			ruleService.saveRule(ruleTarget, rule);
			final FileInfo owningFileInfo = fileFolderService.getFileInfo(ruleTarget);
			final RuleRef ruleRef = new RuleRef(rule, owningFileInfo);
			
			return ruleRef;
			
		}
		
		private Rule buildRule(final JSONObject jsonRule) throws IOException, JSONException {
			
			// Maybe a YAML or a JSON file
			return ruleParser.parseJsonRule(jsonRule);
			
		}
		
		/**
		 * A Hack to retrieve the JSON parser from the webscript
		 * 
		 * @author pajot-b
		 *
		 */
		private final class RuleParser extends AbstractRuleWebScript {
			
			private RuleParser() {
				this.setActionService(serviceRegistry.getActionService());
				this.setDictionaryService(serviceRegistry.getDictionaryService());
				this.setFileFolderService(serviceRegistry.getFileFolderService());
				this.setNamespaceService(serviceRegistry.getNamespaceService());
				this.setNodeService(serviceRegistry.getNodeService());
				this.setRuleService(serviceRegistry.getRuleService());			
			}
			
			protected Rule parseJsonRule(JSONObject jsonRule) throws JSONException {
				return super.parseJsonRule(jsonRule);
			};
			
		}
		
	}
	
	
	
	
	
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}
	
	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
	public void setPermissionService(PermissionService permissionService) {
		this.permissionService = permissionService;
	}
	
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}
	
	public void setRuleService(RuleService ruleService) {
		this.ruleService = ruleService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
		setNodeService(serviceRegistry.getNodeService());
		setScriptService(serviceRegistry.getScriptService());
		setPermissionService(serviceRegistry.getPermissionService());
		setSearchService(serviceRegistry.getSearchService());
		setFileFolderService(serviceRegistry.getFileFolderService());
		setNamespaceService(serviceRegistry.getNamespaceService());
		setRuleService(serviceRegistry.getRuleService());
	}
	
    public void setRepositoryHelper(Repository repositoryHelper) {
        this.repositoryHelper = repositoryHelper;
    }

}
