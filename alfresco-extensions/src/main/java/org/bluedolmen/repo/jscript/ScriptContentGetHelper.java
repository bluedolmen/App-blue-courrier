package org.bluedolmen.repo.jscript;

import org.alfresco.scripts.ScriptResourceHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

final class ScriptContentGetHelper extends RhinoScriptProcessor {

	private Log logger = LogFactory.getLog(ScriptContentGetHelper.class);

	public void register() {
		// do nothing to avoid registering processor
	}
	
	String getScriptContent(String script) {
		
		script = loadScriptResource(script);
		if (null == script) throw new IllegalArgumentException("The provided script is not a recognized format");
		
		return ScriptResourceHelper.resolveScriptImports(script, this, logger );
		
	}

}
