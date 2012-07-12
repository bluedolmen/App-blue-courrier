package com.bluexml.side.alfresco.datasource;

import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;

import org.alfresco.service.cmr.repository.NodeService;
import org.apache.log4j.Logger;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.csvreader.CsvReader;


public final class DatasourceInitializer {

	/** The logger. */
	private Logger logger = Logger.getLogger(getClass());
	
	/** The path matching resource pattern resolver */
	private PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	
	
	public void loadResource(Resource resource) {
		try {
			InputStream inputStream = resource.getInputStream();
			FileReader fileReader = new FileReader(resource.getFile());
			CsvReader csvReader = new CsvReader(fileReader);
		} catch (IOException e) {
			logger.warn(String.format("Cannot load resource '%s'", resource.getDescription()));
		}
	}
	
	
	public void setResourcePattern(String resourcePattern) {
		try {
			Resource[] resources = resolver.getResources(resourcePattern);
			for (Resource resource : resources) {
				if (logger.isDebugEnabled()) logger.debug("Loading resource " + resource.getDescription());
				loadResource(resource);
			}
		} catch (IOException e) {
			logger.error(e);
		}
	}
	
	
}
