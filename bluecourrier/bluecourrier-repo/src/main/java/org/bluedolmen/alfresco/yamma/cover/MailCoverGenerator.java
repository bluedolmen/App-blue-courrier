package org.bluedolmen.alfresco.yamma.cover;

import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;

public interface MailCoverGenerator {

	/**
	 * Generate the cover for the provided node into the given output. If the
	 * mimetype is set, then the generator is enforced to generate the output
	 * given the provided mimetype. If the generation cannot be performed, the
	 * method has to return false, true otherwise.
	 * 
	 * @param nodeRef
	 * @param output
	 * @param mimetype
	 * @return whether the output can be generated
	 */
	boolean generate(NodeRef nodeRef, ContentWriter output, String mimetype) throws MailCoverGeneratorException;
	
	public static class MailCoverGeneratorException extends Exception {

		private static final long serialVersionUID = -7799759865740083068L;
		
		public MailCoverGeneratorException(Throwable t) {
			super(t);
		}
		
		public MailCoverGeneratorException(String message, Throwable t) {
			super(message, t);
		}
		
	}
	
}
