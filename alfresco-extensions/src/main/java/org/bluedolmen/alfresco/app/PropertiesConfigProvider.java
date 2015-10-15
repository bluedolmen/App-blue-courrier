package org.bluedolmen.alfresco.app;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.alfresco.repo.cache.DefaultSimpleCache;
import org.alfresco.repo.cache.SimpleCache;
import org.alfresco.util.Pair;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.app.ConfigProvider.CachingConfigProvider;
import org.bluedolmen.alfresco.resources.AlfrescoReadableResource;
import org.bluedolmen.alfresco.resources.AlfrescoReadableResourceFactory;
import org.bluedolmen.alfresco.resources.AlfrescoResourceResolver;
import org.springframework.extensions.surf.util.I18NUtil;

public class PropertiesConfigProvider extends AbstractConfigProvider implements CachingConfigProvider {
	
	private static final Log logger = LogFactory.getLog(PropertiesConfigProvider.class);
	private static final String DOT_PROPS = ".properties";
	private static final String OVERRIDE_SUFFIX_SEPARATOR = "_";
	
	private AlfrescoResourceResolver alfrescoResourceResolver;
	private AlfrescoReadableResourceFactory alfrescoReadableResourceFactory;
	
	private final SimpleCache<Serializable, Properties> propertiesCache = new DefaultSimpleCache<>(100, "config-properties");
	
	private List<String> overrideSuffixes = new ArrayList<String>();
	
	public void clearCache() {
		
		propertiesCache.clear();
		alfrescoResourceResolver.clearCache();
		
	}
	
	@Override
	public Serializable getValue(String configId) {
		
		if (null == configId) {
			throw new NullPointerException("The config-id has to be a valid non-null string");
		}
		
		final Pair<String, String> path = getActualPathToResource(configId);
		final String pathToResource = path.getFirst();
		configId = path.getSecond();
		
		final Properties properties = getProperties(pathToResource);
		if (null == properties) return null;
		
		return (Serializable) properties.get(configId);
		
	}
	
	/**
	 * Get the actual path to resource taking into account a slash-defined
	 * config-id. Returns the path as the first element of the pair, the second
	 * element provides the resulting config-id.
	 * 
	 * @param configId
	 * @return
	 */
	private Pair<String, String> getActualPathToResource(String configId) {
		
		final int lastSlashIndex = configId.lastIndexOf("/");
		String pathToResource = getContext();
		
		if (-1 != lastSlashIndex) {
			pathToResource += "/" + configId.substring(0, lastSlashIndex);
			configId = configId.substring(lastSlashIndex + 1); 
		}
		
		if (!pathToResource.endsWith(DOT_PROPS)) {
			pathToResource += DOT_PROPS;
		}
		
		return new Pair<String, String>(pathToResource, configId);
		
	}
	
	/**
	 * This method supports internationalization of the properties file.
	 * 
	 * @param pathToResource
	 * @return
	 */
	private Properties getProperties(String pathToResource) {
		
		final Locale locale = I18NUtil.getLocale();
		final String key = pathToResource + '|' + locale;
		
		if (!propertiesCache.contains(key)) {
			
			try {
				
				final Properties properties = new Properties();
				
				final Set<String> localePathList = buildLocalePathList(pathToResource, locale);
				final Set<String> overridePathList = buildOverridePathList(pathToResource);
				for (final String overridePath : overridePathList) {
					localePathList.addAll(buildLocalePathList(overridePath, locale));
				}
				
				for (final String pathToResource_ : localePathList) {
					
					// Default properties from the classpath resources
					AlfrescoReadableResource alfrescoResource = alfrescoResourceResolver.resolveClasspathResource(pathToResource_, alfrescoReadableResourceFactory);
					if (null != alfrescoResource) {
						loadProperties(pathToResource_, alfrescoResource, properties);
					}
					
					// Then the repository resource for potential orverloading
					alfrescoResource = alfrescoResourceResolver.resolveRepositoryResource(pathToResource_, alfrescoReadableResourceFactory);
					if (null != alfrescoResource) {
						loadProperties(pathToResource_, alfrescoResource, properties);
					}
					
				}
				
				propertiesCache.put(key, properties); // may be an empty Properties object
				
			} catch (IOException e) {
				logger.error(e);
				return null;
			}
			
		}
		
		return propertiesCache.get(key);
		
	}
	
    private Set<String> buildLocalePathList(String path, final Locale locale) {
    	
    	if (path.endsWith(DOT_PROPS)) {
    		path = path.substring(0, path.length() - DOT_PROPS.length());
    	}
    	
        final LinkedHashSet<String> pathSet = new LinkedHashSet<String>();
        pathSet.add(path + DOT_PROPS);
        
        // Add the paths for the current locale...
        pathSet.add(path + '_' + locale.toString() + DOT_PROPS);
        if (locale.getCountry().length() != 0) {
            pathSet.add(path + '_' + locale.getLanguage() + '_' + locale.getCountry() + DOT_PROPS);
        }
        pathSet.add(path + '_' + locale.getLanguage() + DOT_PROPS);
        
        if (!locale.equals(Locale.getDefault())) {
            // Use the default locale to add some more possible paths...
            final Locale defLocale = Locale.getDefault();
            pathSet.add(path + '_' + defLocale.toString() + DOT_PROPS);
            if (defLocale.getCountry().length() != 0) {
                pathSet.add(path + '_' + defLocale.getLanguage() + '_' + defLocale.getCountry() + DOT_PROPS);
            }
            pathSet.add(path + '_' + defLocale.getLanguage() + DOT_PROPS);
        }
        
        // Finally add a path with no locale information...
        
        return pathSet;
        
    }
    
    private Set<String> buildOverridePathList(String path) {
    	
    	if (path.endsWith(DOT_PROPS)) {
    		path = path.substring(0, path.length() - DOT_PROPS.length());
    	}
    	
        final LinkedHashSet<String> pathSet = new LinkedHashSet<String>();
        pathSet.add(path + DOT_PROPS);
        
		for (final String overrideSuffix : overrideSuffixes) {
			pathSet.add(path + OVERRIDE_SUFFIX_SEPARATOR + overrideSuffix);
		}
		
		return pathSet;
        
    }

	
	private void loadProperties(String pathToResource, AlfrescoReadableResource alfrescoResource, Properties properties) throws IOException {
		
		InputStream inputStream = null; 
		try {
			inputStream = alfrescoResource.getInputStream();
			properties.load(inputStream);
		}			
		finally {
			IOUtils.closeQuietly(inputStream);
		}
		
	}

	@Override
	public void setValue(String configId, Object value) {
		
		throw new UnsupportedOperationException("Cannot yet set value when using Properties file");

	}

	@Override
	public Map<String, Object> getConfigTree(String configId) {
		
		final String pathToResource = (StringUtils.isBlank(configId) ? getContext() : configId).replaceAll("\\.", "\\/") + ".properties";
		
		final Properties properties = getProperties(pathToResource);
		if (null == properties) return null;
		
		final Map<String, Object> result = new HashMap<>(properties.size());
		for (String propertyName : properties.stringPropertyNames()) {
			result.put(propertyName, properties.getProperty(propertyName));
		}
		
		return result;
		
	}
	
	public void setOverrideSuffixes(List<String> overrideSuffixes) {
		
		if (null == overrideSuffixes) return;
		this.overrideSuffixes = overrideSuffixes;
		
	}
	
	public void addOverrideSuffix(String suffix) {
		
		this.overrideSuffixes.add(suffix);
		
	}
	
	public void setAlfrescoResourceResolver(AlfrescoResourceResolver alfrescoResourceResolver) {
		
		this.alfrescoResourceResolver = alfrescoResourceResolver;
		
	}
	
	public void setAlfrescoResourceFactory(AlfrescoReadableResourceFactory alfrescoResourceFactory) {
		
		this.alfrescoReadableResourceFactory = alfrescoResourceFactory;
		
	}


}
