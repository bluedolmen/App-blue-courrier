package com.bluexml.side.repo.jscript;

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
import org.alfresco.repo.jscript.ScriptableHashMap;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.UniqueTag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.extensions.surf.util.ParameterCheck;
import org.springframework.util.FileCopyUtils;

public final class InitHelperScript extends BaseScopableProcessorExtension {
	
	public static enum ResourceState {
		MISSING,
		MODIFIED,
		IDENTICAL,
		UNKNOWN
	};
	
	/** The logger. */
	private final Logger logger = Logger.getLogger(getClass());
	
	/** The path matching resource pattern resolver */
	private PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	
	private FileFolderService fileFolderService;
	private PermissionService permissionService;
	private NodeService nodeService;
	private NamespaceService namespaceService;
	private SearchService searchService;
	
	private final Map<String, Scriptable> registeredInitDefinitions = new HashMap<String, Scriptable>();

	public void registerInitDefinition(Scriptable initDefinition) {
		final Object definitionId = initDefinition.get("id", initDefinition);
		if (UniqueTag.NOT_FOUND == definitionId) {
			throw new IllegalStateException("The provided object does not contain an 'id' property as expected");
		}
		final Object level = initDefinition.get("level", initDefinition);
		if (UniqueTag.NOT_FOUND == level) {
			initDefinition.put("level", initDefinition, Integer.MAX_VALUE);
		}
		
		registeredInitDefinitions.put(String.valueOf(definitionId), initDefinition);
	}
	
	public Scriptable getRegisteredInitDefinitions() {
		
		// Sort Scriptable-s by level
		final List<Scriptable> registeredInitDefinitions_ = new ArrayList<Scriptable>(registeredInitDefinitions.values());
		Collections.sort(registeredInitDefinitions_, new Comparator<Scriptable>() {
			public int compare(Scriptable o1, Scriptable o2) {
				int level1 = Integer.MAX_VALUE;
				int level2 = Integer.MAX_VALUE;
				
				try {
					final Object l1 = o1.get("level", o1);
					level1 = l1 instanceof Integer ? (Integer) l1 : Integer.parseInt(l1.toString());
				} catch(NumberFormatException e) {}
				
				try {
					final Object l2 = o2.get("level", o2);
					level2 = l2 instanceof Integer ? (Integer) l2 : Integer.parseInt(l2.toString());
				} catch(NumberFormatException e) {}
				
				return level2 - level1;
			}
		});
		
    	return Context.getCurrentContext().newArray(
    			getScope(),
    			registeredInitDefinitions_.toArray()
    	);
	}
	
	
	public boolean loadExternalResources(String sourcePath, String xpathTargetPath) throws IOException {
		return loadExternalResources(sourcePath, xpathTargetPath, true);
	}
	
	public boolean loadExternalResources(String sourcePath, String xpathTargetPath, boolean overrideExisting) throws IOException {
		
		ParameterCheck.mandatoryString("sourcePath", sourcePath);
		ParameterCheck.mandatoryString("xpathTargetPath", xpathTargetPath);
		
		final Resource[] sourceResources = resolver.getResources(sourcePath);
		final Iterator<Resource> iterator = Arrays.asList(sourceResources).iterator();
		final NodeRef targetParentRef = getNodeByXPath(xpathTargetPath);
		
		boolean globalSuccess = true;
		while (iterator.hasNext()) {
			
			final Resource sourceResource = iterator.next();
			
			try {
				copyResourceAsChild(sourceResource, targetParentRef, overrideExisting);
			} catch (IOException e) {
				logger.error(String.format("Failed copying the file '%s'", sourcePath), e);
				globalSuccess = false;
			}
			
		}
		
		return globalSuccess;
	}
	
	public Scriptable checkExternalResources(String sourcePath, String xpathTargetPath) throws IOException {
		
		ParameterCheck.mandatoryString("sourcePath", sourcePath);
		ParameterCheck.mandatoryString("xpathTargetPath", xpathTargetPath);
		
		final Resource[] sourceResources = resolver.getResources(sourcePath);
		final Iterator<Resource> iterator = Arrays.asList(sourceResources).iterator();
		final NodeRef targetParentRef = getNodeByXPath(xpathTargetPath);
		
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
	
	private NodeRef getNodeByXPath(String xpathString) throws IOException {

		final ResultSet rs = searchService.query(
			StoreRef.STORE_REF_WORKSPACE_SPACESSTORE,
			SearchService.LANGUAGE_LUCENE,
			"+PATH:\"" + xpathString + "\"" 
		);
		final List<NodeRef> nodeRefs = rs.getNodeRefs();
		
		if (nodeRefs.isEmpty()) {
			throw new IOException(String.format("Cannot find the parent target with xpath expression '%s'", xpathString));
		}
		
		return nodeRefs.get(0);
	}
	
	private void copyResourceAsChild(Resource sourceResource, NodeRef parentNodeRef, boolean overrideExisting) throws IOException {
		
		final String fileName = sourceResource.getFilename();
		final InputStream sourceStream = sourceResource.getInputStream();
		
		NodeRef fileRef = fileFolderService.searchSimple(parentNodeRef, fileName);
		if (null != fileRef) {
			if (overrideExisting) fileFolderService.delete(fileRef);
			else return;
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
		
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}
	
	public void setPermissionService(PermissionService permissionService) {
		this.permissionService = permissionService;
	}
	
	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
}
