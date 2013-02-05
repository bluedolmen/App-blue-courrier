package com.bluexml.alfresco.pdf;

import java.util.HashMap;

public class PdfOperationConfig extends HashMap<String, Object> {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3475046805154542367L;

	public static final PdfOperationConfig emptyConfig() {
		return new PdfOperationConfig();
	}
	
	public <T> T getValue(String key, Class<T> type) {
		
		if (!this.containsKey(key)) return null;			
		return type.cast(this.get(key));
		
	}
	
	
}
