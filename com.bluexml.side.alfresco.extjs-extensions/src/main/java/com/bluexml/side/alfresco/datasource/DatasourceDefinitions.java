package com.bluexml.side.alfresco.datasource;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.jscript.ClasspathScriptLocation;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.alfresco.service.cmr.repository.ScriptService;
import org.apache.log4j.Logger;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.extensions.webscripts.ScriptProcessor;

public final class DatasourceDefinitions {

	
	private ScriptService scriptService;
	private static final String DEFAULT_DEFINITIONS_LOCATION = "classpath*:**/*.definition.js";
	private String datasourceResourcesPattern = DEFAULT_DEFINITIONS_LOCATION;
	private ScriptProcessor scriptProcessor;
	private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	private final Logger logger = Logger.getLogger(DatasourceDefinitions.class);
	
	public void init() throws IOException {
//		try {
//			Resource[] resources = resolver.getResources(DEFAULT_DEFINITIONS_LOCATION);
//			for (Resource r : resources) {
//				if (logger.isDebugEnabled())
//					logger.debug("Loading resource " + r.getDescription());
//				loadResource(r);
//			}
//		} catch (IOException e) {
//			logger.error(e);
//		}
		
	}
	
	private void loadResource(Resource resource) throws IOException {
		final URL scriptLocationURL = resource.getURL();
		final String scriptLocationPath = scriptLocationURL.getPath();
		final Map<String, Object> model = new HashMap<String, Object>();

		final ScriptLocation scriptLocation = new FileSystemResourceLocation(scriptLocationURL);
		final Object script = scriptService.executeScript (scriptLocation, model);
		
		final String datasourceName = scriptLocationPath;		
	}
	
	public void setDatasourcesLocation(String resourcePattern) {
		this.datasourceResourcesPattern = resourcePattern;
	}
	
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}
	
	private static final class FileSystemResourceLocation implements ScriptLocation {

		private final URL resourceURL;
		
		private FileSystemResourceLocation(URL resourceURL) {
			if (null == resourceURL) throw new IllegalArgumentException("The provided URL is not valid (null)");
			this.resourceURL = resourceURL;
		}
		
		public InputStream getInputStream() {
			try {
				return this.resourceURL.openStream();
			} catch (IOException e) {
			}
			return null;
		}

		public String getPath() {
			return resourceURL.getPath();
		}

		public Reader getReader() {
			
			final File resourceFile = new File(this.resourceURL.getFile());
			try {
				return new FileReader(resourceFile);
			} catch (FileNotFoundException e) {
			}
			
			return null;
		}

		public boolean isCachable() {
			return true;
		}

		public boolean isSecure() {
			return true;
		}
		
	}
}
