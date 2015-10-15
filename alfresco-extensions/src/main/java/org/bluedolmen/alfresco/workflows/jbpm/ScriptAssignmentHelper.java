package org.bluedolmen.alfresco.workflows.jbpm;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.workflow.jbpm.AlfrescoJavaScript;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.workflow.WorkflowException;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jbpm.graph.exe.ExecutionContext;

public final class ScriptAssignmentHelper {
	
	private static Log logger = LogFactory.getLog(ScriptAssignmentHelper.class);
	
    private ServiceRegistry services;
    private DictionaryService dictionaryService;
    private NodeService nodeService;
    private AuthorityService authorityService;
	
	public String getActor(String expression, ExecutionContext executionContext) {
		
		if (null == expression || expression.isEmpty()) return null;
		if (!expression.startsWith("#{")) return expression;
		
        expression = expression.substring(2, expression.length() -1);
        final Object eval = AlfrescoJavaScript.executeScript(executionContext, services, expression, null, null);
        if (null == eval) return null;        

        return mapAuthorityToName(eval, false);
        
	}
	
	public Collection<String> getPooledActors(String expression, ExecutionContext executionContext) {
		
		if (null == expression || expression.isEmpty()) return null;
		if (!expression.startsWith("#{")) return Collections.singleton(expression);
		
		expression = expression.substring(2, expression.length() -1);
		final Object eval = AlfrescoJavaScript.executeScript(executionContext, services, expression, null, null);
		if (null == eval) return Collections.emptySet();
		
		if (eval instanceof ScriptNode[]) {
		    //ScriptNode[] nodes = (ScriptNode[]) eval;
		    final List<ScriptNode> nodes = Arrays.asList((ScriptNode[]) eval);
		    return getPooledActors(nodes);		    
		}
		
		if (eval instanceof Collection) {
			return getPooledActors((Collection<?>) eval);			
		}
		
		if (eval instanceof ScriptNode) {
		    final ScriptNode node = (ScriptNode) eval;
		    return getPooledActors(Collections.singleton(node));
		}
		
		if (eval instanceof String) {
			return Collections.singleton((String) eval);
		}
		
		throw new WorkflowException("pooledactors expression does not evaluate to a collection of authorities");
		
	}
	
	private Set<String> getPooledActors(Collection<?> nodes) {
		
		final Set<String> assignedPooledActors = new LinkedHashSet<String>();
	    for (final Object node : nodes) {
	    	
	        final String theActor = mapAuthorityToName(node, true);
	        if (theActor == null) {
	            throw new WorkflowException("pooledactors expression does not evaluate to a collection of authorities");
	        }
	        assignedPooledActors.add(theActor);
	    }
	    
	    return assignedPooledActors;
		
	}
	
	ScriptAssignmentHelper(ServiceRegistry serviceRegistry) {
		
		this.services = serviceRegistry;
        dictionaryService = services.getDictionaryService();
        nodeService = services.getNodeService();
        authorityService = services.getAuthorityService();
		
	};

    /**
     * Convert Alfresco authority to actor id
     *  
     * @param authority
     * @return  actor id
     */
    String mapAuthorityToName(Object authority, boolean allowGroup) {
    	
    	NodeRef authorityRef = null;
    	
    	if (authority instanceof ScriptNode) {
    		authorityRef = ((ScriptNode) authority).getNodeRef();
    	}
    	else if (authority instanceof String) {
    		authorityRef = authorityService.getAuthorityNodeRef((String) authority);
    	}
        
    	if (null == authorityRef) {
    		logger.warn(String.format("Authority '%s' did not map to any valid authority.", authority));
    	}
    	
    	return getAuthorityNameChecked(authorityRef, allowGroup);
    	
    }	
	
    String getAuthorityName(NodeRef authorityRef) {
    	return getAuthorityNameChecked(authorityRef, true);
    }
    
    private String getAuthorityNameChecked(NodeRef authorityRef, boolean allowGroup) {
    	
    	if (null == authorityRef) return null;
    	
    	if (!nodeService.exists(authorityRef)) return null;
    	final QName type = nodeService.getType(authorityRef);
    	
        if (dictionaryService.isSubClass(type, ContentModel.TYPE_PERSON)) {
            return (String) nodeService.getProperty(authorityRef, ContentModel.PROP_USERNAME);
        }
        
        if (dictionaryService.isSubClass(type, ContentModel.TYPE_AUTHORITY_CONTAINER)) {
        	
        	final String authorityName = (String) nodeService.getProperty(authorityRef, ContentModel.PROP_AUTHORITY_NAME);
            if (!allowGroup) {
            	throw new WorkflowException(String.format("The authority '%s' despite not allowed.", authorityName));
            }
                
            return authorityName;
        }
        
        return null;
    }
    
    
}
