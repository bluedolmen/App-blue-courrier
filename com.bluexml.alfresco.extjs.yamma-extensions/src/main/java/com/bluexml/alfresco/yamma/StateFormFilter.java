package com.bluexml.alfresco.yamma;

import java.util.List;
import java.util.Map;

import org.alfresco.repo.forms.Form;
import org.alfresco.repo.forms.FormData;
import org.alfresco.repo.forms.processor.AbstractFilter;
import org.alfresco.service.cmr.repository.NodeRef;

public final class StateFormFilter extends AbstractFilter<Object, NodeRef> {

	public void beforeGenerate(Object item, List<String> fields,
			List<String> forcedFields, Form form, Map<String, Object> context) {
		System.out.println("Calling beforeGenerate!!");
		
	}

	public void afterGenerate(Object item, List<String> fields,
			List<String> forcedFields, Form form, Map<String, Object> context) {
		// TODO Auto-generated method stub
		
	}

	public void beforePersist(Object item, FormData data) {
		// TODO Auto-generated method stub
		
	}

	public void afterPersist(Object item, FormData data, NodeRef persistedObject) {
		// TODO Auto-generated method stub
		
	}


}
