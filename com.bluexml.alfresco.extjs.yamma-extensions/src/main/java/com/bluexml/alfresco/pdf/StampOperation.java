package com.bluexml.alfresco.pdf;

import java.io.OutputStream;

public interface StampOperation {
	
	public static final String STAMP_LOCATION = "stampLocation";
	public static final String STAMP_LOCATION_FIRST_PAGE = "firstPage";
	public static final String STAMP_LOCATION_LAST_PAGE = "lastPage";
	public static final String STAMP_LOCATION_ALL_PAGES = "allPages";

	void stamp(OutputStream output) throws PdfOperationException;
	
}
