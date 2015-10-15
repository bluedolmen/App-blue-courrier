package org.bluedolmen.alfresco.init;

import java.util.List;
import java.util.Map;

import org.bluedolmen.alfresco.webscripts.ExtraAuthenticatedDeclarativeWebscript.ExtraAuthenticatedDelegate;
import org.mozilla.javascript.Scriptable;

public interface InitRegistry {
	
	public abstract void registerInitDefinitions(InitScriptBootstrap initScriptBootstrap);

	public abstract String registerInitDefinition(String classpathResource);

	/**
	 * Get a (filtered wrt. Access) list of registered init definitions
	 * @return
	 */
	public abstract List<Scriptable> getRegisteredInitDefinitions();

	public abstract ExtraAuthenticatedDelegate getAuthenticatedDelegate(String definitionId);

	public abstract void reload();
	
	public abstract Map<String, Object> prepareScriptParameters(Map<String, Object> model);

}