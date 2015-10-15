package org.bluedolmen.repo.jscript;

import java.util.List;

import org.alfresco.repo.i18n.MessageService;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ValueConverter;
import org.mozilla.javascript.Scriptable;

public class MessageScript extends BaseScopableProcessorExtension {
	
	private final ValueConverter valueConverter = new ValueConverter();

	public String get(String messageKey) {
		return getMessage(messageKey);
	}
	
	public String getMessage(String messageKey) {
		return messageService.getMessage(messageKey);
	}
	
	public String get(String messageKey, Scriptable params) {
		return getMessage(messageKey, params);
	}
	
	public String getMessage(String messageKey, Scriptable params) {
		
		final Object convertedValue = valueConverter.convertValueForJava(params);
		if (!(convertedValue instanceof List<?>)) return null;
		
		final List<?> paramsList = (List<?>) convertedValue;
		final Object[] paramsArray = paramsList.toArray();
		return messageService.getMessage(messageKey, paramsArray);
		
	}
	
	// IoC
	
	private MessageService messageService;
	
	public void setMessageService(MessageService messageService) {
		this.messageService = messageService;
	}
	
}
