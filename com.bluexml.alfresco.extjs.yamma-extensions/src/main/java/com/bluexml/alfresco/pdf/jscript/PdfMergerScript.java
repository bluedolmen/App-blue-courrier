package com.bluexml.alfresco.pdf.jscript;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.jscript.ValueConverter;
import org.alfresco.scripts.ScriptException;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.Scriptable;

import com.bluexml.alfresco.pdf.Merger;
import com.bluexml.alfresco.pdf.PdfOperationException;

public final class PdfMergerScript extends BaseScopableProcessorExtension {
	
	private static Log logger = LogFactory.getLog(PdfMergerScript.class);
	
	private ServiceRegistry services;
	private ContentService contentService;
	private FileFolderService fileFolderService;
	private Merger merger;
	private final ValueConverter valueConverter = new ValueConverter();

	public ScriptNode merge(NativeArray inputFiles_, ScriptNode destination) throws PdfOperationException {
		return merge(inputFiles_, destination, null);
	}

	public ScriptNode merge(NativeArray inputFiles_, ScriptNode destination, Scriptable config_) throws PdfOperationException {
		
		final List<NodeRef> inputFiles = getInputFiles(inputFiles_);
		final Map<String, Object> config = getConfig(config_);
		final NodeRef destinationNodeRef = (NodeRef) valueConverter.convertValueForJava(destination); 
		
		final NodeRef outputNodeRef = getOutputNode(destinationNodeRef, config);
		
        final ContentWriter writer = contentService.getWriter(outputNodeRef, ContentModel.PROP_CONTENT, true);
        writer.setMimetype(MimetypeMap.MIMETYPE_PDF);
		final OutputStream contentOutputStream = writer.getContentOutputStream();
		
		try {
			merger.merge(inputFiles, contentOutputStream);
		} finally {
			try {
				contentOutputStream.close();
			} catch (IOException e) {
				logger.error("Cannot close the output file", e);
			}
		}
		
		return (ScriptNode) valueConverter.convertValueForScript(services, getScope(), null, outputNodeRef);
	}
	
	private NodeRef getOutputNode(NodeRef destination, Map<String, Object> config ) {
		
		int maxAttempts = 10;
		String fileName = (String) config.get("name");
		if (fileName == null) {
			fileName = "merged-file.pdf";
		}
		
		int dotIndex = fileName.lastIndexOf(".");
		String prefix = fileName.substring(0, dotIndex);
		String suffix = fileName.substring(dotIndex);
		
		if (suffix.isEmpty()) {
			suffix = ".pdf";
		}
		
		
		
		do {
			
			try {
				FileInfo fileInfo = fileFolderService.create(destination, fileName, ContentModel.ASSOC_CONTAINS);
				return fileInfo.getNodeRef();
			} catch (FileExistsException e) {
				fileName = prefix + "-" + (new Date()).getTime() + suffix;
			}
			
		} while (--maxAttempts > 0);
		
		throw new ScriptException("Cannot get a unique and valid output file-name");
		
	}
	
	private Map<String, Object> getConfig(Scriptable config_){
		final ValueConverter valueConverter = new ValueConverter();
		final HashMap<String, Object> config = new HashMap<String, Object>();
		
		final Object configObject = valueConverter.convertValueForJava(config_);
		if (!(configObject instanceof Map)) {
			throw new IllegalArgumentException("The provided config is not an object as expected");
		}
		final Map<?,?> configMap = (Map<?,?>) configObject;
		for (Object key : configMap.keySet()) {
			if (!(key instanceof String)) {
				throw new IllegalArgumentException("One of the key of the config is not a String as epected");
			}
			config.put((String) key, configMap.get(key));
		}
		
		return config;
	}
	
	private List<NodeRef> getInputFiles(final Object inputFiles_) {
		
		final ValueConverter valueConverter = new ValueConverter();
		
		final Object inputFilesAsObject = valueConverter.convertValueForJava(inputFiles_);
		if (!(inputFilesAsObject instanceof List<?>)) {
			throw new IllegalArgumentException("The provided argument is not an array as expected");
		}
		final List<NodeRef> inputFiles = getCheckedList((List<?>) inputFilesAsObject);
		
		return inputFiles;
	}
	
	public List<NodeRef> getCheckedList(Collection<?> nodeRefList) {
		
		final List<NodeRef> checkedList = new ArrayList<NodeRef>();
		for (final Object obj : nodeRefList) {
			
			if (!(obj instanceof NodeRef)) {
				throw new IllegalArgumentException("The list of files should only contain valid nodes");
			}
			
			checkedList.add((NodeRef) obj);
		}
	
		return checkedList;
	}
	
	
	/*
	 * Spring IoC/DI material
	 */
	
	public void setMerger(Merger merger) {
		this.merger = merger;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.services = serviceRegistry;
		setContentService(services.getContentService());
		setFileFolderService(services.getFileFolderService());
	}
	
	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
}
