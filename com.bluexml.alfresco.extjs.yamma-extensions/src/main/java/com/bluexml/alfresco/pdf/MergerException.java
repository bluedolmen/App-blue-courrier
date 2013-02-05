package com.bluexml.alfresco.pdf;

public class MergerException extends PdfOperationException {

	private static final long serialVersionUID = 4302247317950631275L;
	
    public MergerException() {
	super();
    }

    public MergerException(String message) {
	super(message);
    }

    public MergerException(String message, Throwable cause) {
        super(message, cause);
    }

    public MergerException(Throwable cause) {
        super(cause);
    }
	

}
