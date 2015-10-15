package org.bluedolmen.repo.jscript;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptableHashMap;
import org.alfresco.service.cmr.dictionary.AspectDefinition;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.dictionary.TypeDefinition;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public final class DictionaryScript extends BaseScopableProcessorExtension {
	
	/**
	 * Get the {@link TypeDefinition} of the provided name
	 * 
	 * @param className
	 *            the name of the searched class formatted as an Alfresco
	 *            {@link QName}
	 * @return the {@link TypeDefinition} of the provided type-name (or null if
	 *         it does not exist)
	 */
    public TypeDefinition getType(String className) {
    	
    	final QName qname = QName.resolveToQName(namespaceService, className);
    	return dictionaryService.getType(qname);
    	
    }
    
    public AspectDefinition getAspect(String aspectName) {
    	
    	final QName qname = QName.resolveToQName(namespaceService, aspectName);
    	return dictionaryService.getAspect(qname);
    	
    }

	/**
	 * Get the property-names of the provided class-name
	 * 
	 * @param className
	 *            the name of the searched class formatted as an Alfresco
	 *            {@link QName}
	 * @return an array of property-names as {@link String}s formatted as
	 *         Alfresco prefixed {@link QName}-s
	 */
    public Scriptable getPropertyNames(String className) {

    	final Map<QName, PropertyDefinition> propertyDefinitions = _getPropertyDefinitions(className);
    	
    	final List<String> propertyNames = new ArrayList<String>();
    	for (QName propertyQName : propertyDefinitions.keySet()) {
    		propertyNames.add(propertyQName.toPrefixString());
    	}
    	
    	return Context.getCurrentContext().newArray(
    			getScope(), 
    			propertyNames.toArray()
    	);

    }

    private Map<QName, PropertyDefinition> _getPropertyDefinitions(String className) {
    	
    	final TypeDefinition typeDefinition = getType(className);
    	if (typeDefinition == null) return null;
    	
    	final Map<QName, PropertyDefinition> propertyDefinitions = new HashMap<QName, PropertyDefinition>(typeDefinition.getProperties());
    	
    	final List<AspectDefinition> aspectDefinitions = typeDefinition.getDefaultAspects(true);
    	for (AspectDefinition aspectDefinition : aspectDefinitions) {
    		propertyDefinitions.putAll(aspectDefinition.getProperties());
    	}
    	
    	return propertyDefinitions;
    }

	/**
	 * Get the property-definitions of the provided class-name
	 * 
	 * @param className
	 *            the name of the searched class formatted as an Alfresco
	 *            {@link QName}
	 * @return a {@link Scriptable} (Object) of {@link PropertyDefinition}-s indexed by their
	 *         prefixed {@link QName} (as strings)
	 */
    public Scriptable getPropertyDefinitions(String className) {

    	final Map<QName, PropertyDefinition> propertyDefinitions = _getPropertyDefinitions(className);    	
    	final ScriptableHashMap<String, PropertyDefinition> result = new ScriptableHashMap<String, PropertyDefinition>();

    	for (QName propertyQName : propertyDefinitions.keySet()) {
    		final String propertyName = propertyQName.toPrefixString();
    		result.put(propertyName, propertyDefinitions.get(propertyQName));
    	}
    	
    	return result;
    }

	/**
	 * Get the {@link PropertyDefinition} of the provided name
	 * 
	 * @param name
	 *            the name of the searched property formatted as an Alfresco
	 *            {@link QName}
	 * @return the {@link PropertyDefinition} of the provided property-name (or null if
	 *         it does not exist)
	 */
    public PropertyDefinition getPropertyDefinition(String propertyName) {
    	
    	final QName qname = QName.resolveToQName(namespaceService, propertyName);
    	if (null == qname) return null;
    	
    	return dictionaryService.getProperty(qname);
    	
    }
    
	/**
	 * Exposes Dictionary service for advanced purposes
	 * @return
	 */
	public DictionaryService getDictionaryService() {
		return this.dictionaryService;
	}
    
	/*
	 * Spring IoC definition
	 */
	
	private DictionaryService dictionaryService;
	private NamespaceService namespaceService;

	public void setDictionaryService(DictionaryService dictionaryService) {
		this.dictionaryService = dictionaryService;
	}
	
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}
	
}
