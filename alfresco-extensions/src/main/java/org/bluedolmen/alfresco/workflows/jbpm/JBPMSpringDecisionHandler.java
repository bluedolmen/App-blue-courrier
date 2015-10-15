package org.bluedolmen.alfresco.workflows.jbpm;

import org.alfresco.repo.workflow.jbpm.AlfrescoJavaScript;
import org.jbpm.graph.exe.ExecutionContext;
import org.jbpm.graph.node.DecisionHandler;

public abstract class JBPMSpringDecisionHandler extends AlfrescoJavaScript implements DecisionHandler {

	private static final long serialVersionUID = -6223904647777712620L;
	
	@Override
	public void execute(ExecutionContext executionContext) throws Exception {
		throw new UnsupportedOperationException("A decision handler cannot be used as an action handler, please use instead " + AlfrescoJavaScript.class.getCanonicalName());
	}
    
}
