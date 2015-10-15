package org.bluedolmen.alfresco.yamma.cover;

import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;

public interface MailCoverService {

	/**
	 * Generate a cover from the given {@link NodeRef}.
	 * 
	 * Notice the use of {@link ContentWriter} as output, which clearly gives an
	 * Alfresco flavor. Another architectural choice may have chosen to get an
	 * OutputDestination type to be more independent and flexible, but may lead
	 * to some pieces of additional material which is unnecessary in a first
	 * time.
	 * 
	 * @param nodeRef
	 * @param output
	 * @param mimetype
	 * @throws MailCoverServiceException
	 */
	void generateCover(NodeRef nodeRef, ContentWriter output, String mimetype) throws MailCoverServiceException;
	
	void register(MailCoverGenerator mailCoverGenerator);

	public static final class MailCoverServiceException extends RuntimeException {

		private static final long serialVersionUID = 5546627885008004529L;
		
		public MailCoverServiceException(Throwable t) {
			super(t);
		}
		
		public MailCoverServiceException(String message, Throwable t) {
			super(message, t);
		}
		
	}
	
	
}
