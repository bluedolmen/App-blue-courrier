package org.bluedolmen.repo.jscript;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Iterator;

import org.alfresco.error.AlfrescoRuntimeException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;

public class RhinoScriptProcessor extends org.alfresco.repo.jscript.RhinoScriptProcessor {

	private static final Log logger = LogFactory.getLog(RhinoScriptProcessor.class);
	private PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	
	@Override
	public String loadScriptResource(String resource) {
		
		if (resource.contains("*")) return loadMultipleScriptResource(resource);
		
		return super.loadScriptResource(resource);
		
	}
	
	private String loadMultipleScriptResource(String resource) {
		
		try {
			
			final StringBuilder result = new StringBuilder();
			final Resource[] sourceResources = resolver.getResources(resource);
			final Iterator<Resource> iterator = Arrays.asList(sourceResources).iterator();
			
			while (iterator.hasNext()) {
				
				final Resource sourceResource = iterator.next();
				InputStream sourceStream = null;
				
				try {
					
					sourceStream = sourceResource.getInputStream();
					
	                if (sourceStream == null) {
	                    throw new AlfrescoRuntimeException("Unable to load included script classpath resource: " + sourceResource.getURL());
	                }
	                
	                final ByteArrayOutputStream os = new ByteArrayOutputStream();
	                FileCopyUtils.copy(sourceStream, os);  // both streams are closed
	                final byte[] bytes = os.toByteArray();
	                
	                // create the string from the byte[] using encoding if necessary
	                result.append(new String(bytes, "UTF-8"));

				} catch (IOException e) {
					logger.error(String.format("Failed copying the file '%s'", sourceResource.getURL()), e);
				}
				finally {
					IOUtils.closeQuietly(sourceStream);
				}
				
			}
			
			return result.toString();
			
		} catch (IOException e) {
			throw new AlfrescoRuntimeException("Unable to locate included script classpath resource: " + resource, e);
		}

	}
	
}
