package org.bluedolmen.alfresco.yamma.forms;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import org.alfresco.repo.forms.Form;
import org.alfresco.repo.forms.FormData;
import org.alfresco.repo.forms.FormData.FieldData;
import org.alfresco.repo.forms.processor.AbstractFilter;
import org.alfresco.repo.forms.processor.AbstractFormProcessor;
import org.alfresco.repo.model.Repository;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public final class StateFormFilter extends AbstractFilter<Object, NodeRef> {
	
    private static final Log logger = LogFactory.getLog(StateFormFilter.class);
	private Repository repository = null;
	
	public void setRepositoryHelper(Repository repository) {
		this.repository = repository;
	}

	public void beforeGenerate(Object item, List<String> fields,
			List<String> forcedFields, Form form, Map<String, Object> context) {
		
	}

	public void afterGenerate(Object item, List<String> fields,
			List<String> forcedFields, Form form, Map<String, Object> context) {
		// TODO Auto-generated method stub
		
	}

	public void beforePersist(Object item, FormData data) {
		
		final FieldData destination = data.getFieldData(AbstractFormProcessor.DESTINATION);
		if (null == destination) return;
		
		final String destinationValue = (String) destination.getValue();
		if (null == destinationValue) return;
		
		if (NodeRef.isNodeRef(destinationValue)) return; // value is ok
		
		final List<String> destinationParts = new ArrayList<String>(Arrays.asList(new String[] {"workspace", "SpacesStore", "Company Home"}));
		final StringTokenizer tokenizer = new StringTokenizer(destinationValue, "/");
		while (tokenizer.hasMoreTokens()) {
			destinationParts.add(tokenizer.nextToken());
		}
		
		final NodeRef targetDestination = repository.findNodeRef("path", destinationParts.toArray(new String[0]));
		if (null == targetDestination) {
			final String message = String.format("Cannot resolve path '%s' to a valid nodeRef", destinationValue);
			logger.warn(message);
			return;
		}
		
		data.addFieldData(AbstractFormProcessor.DESTINATION, targetDestination.toString(), true);
		
	}

	public void afterPersist(Object item, FormData data, NodeRef persistedObject) {
		// TODO Auto-generated method stub
		
	}


}
