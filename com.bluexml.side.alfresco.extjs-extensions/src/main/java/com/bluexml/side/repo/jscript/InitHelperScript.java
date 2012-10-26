package com.bluexml.side.repo.jscript;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.Path;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PermissionService;
import org.apache.log4j.Logger;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.extensions.surf.util.ParameterCheck;
import org.springframework.util.FileCopyUtils;

public final class InitHelperScript extends BaseScopableProcessorExtension {
	
	/** The logger. */
	private final Logger logger = Logger.getLogger(getClass());
	
	/** The path matching resource pattern resolver */
	private PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	
	private FileFolderService fileFolderService;
	private PermissionService permissionService;
	private NodeService nodeService;
	private SearchService searchService;

	public boolean loadExternalFile(String sourcePath, String xpathTargetPath) throws IOException {
		return loadExternalFile(sourcePath, xpathTargetPath, true);
	}
	
	public boolean loadExternalFile(String sourcePath, String xpathTargetPath, boolean overrideExisting) throws IOException {
		
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
				logger.debug(String.format("Created resource '%s' succesfully.", pathString));
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
