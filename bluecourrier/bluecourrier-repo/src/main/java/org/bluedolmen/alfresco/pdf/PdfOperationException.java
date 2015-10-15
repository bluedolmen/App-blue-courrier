package org.bluedolmen.alfresco.pdf;

public class PdfOperationException extends Exception {

	private static final long serialVersionUID = 4194603814390256742L;
	
    public PdfOperationException() {
    	super();
    }

    public PdfOperationException(String message) {
    	super(message);
    }

    public PdfOperationException(String message, Throwable cause) {
        super(message, cause);
    }

    public PdfOperationException(Throwable cause) {
        super(cause);
    }
	

}
