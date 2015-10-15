package org.bluedolmen.repo.jscript;

import java.io.IOException;
import java.io.Writer;

import org.apache.commons.lang.StringUtils;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.Format;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class ScriptContentGet extends AbstractWebScript {

	private ScriptContentGetHelper scriptContentGetHelper;
	
	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
		
		final String script = req.getParameter("script");
		
		if (StringUtils.isEmpty(script)) {
			throw new WebScriptException("Please provide the <script> parameter.");
		}
		
		final String scriptContent = scriptContentGetHelper.getScriptContent(script);
		
		res.setStatus(Status.STATUS_OK);
		res.setContentType(Format.TEXT.mimetype());
		
		final Writer writer = res.getWriter();
		writer.write(scriptContent);
		writer.flush();

	}

	public void setHelper(ScriptContentGetHelper helper) {
		this.scriptContentGetHelper = helper;
	}
	
	
}
