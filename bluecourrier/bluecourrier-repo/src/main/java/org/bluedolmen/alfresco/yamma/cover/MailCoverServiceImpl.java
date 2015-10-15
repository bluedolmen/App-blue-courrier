package org.bluedolmen.alfresco.yamma.cover;

import java.util.ArrayList;
import java.util.List;

import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.bluedolmen.alfresco.yamma.cover.MailCoverGenerator.MailCoverGeneratorException;

public class MailCoverServiceImpl implements MailCoverService {
	
	private boolean skipOnException;
	private List<MailCoverGenerator> generators = new ArrayList<MailCoverGenerator>();

	public void generateCover(NodeRef nodeRef, ContentWriter output, String mimetype) {
		
		for (final MailCoverGenerator mailCoverGenerator : generators) {
			
			try {
				
				final boolean canGenerate = mailCoverGenerator.generate(nodeRef, output, mimetype);
				if (canGenerate) return;
				
			} catch (final MailCoverGeneratorException e) {
				
				if (skipOnException) continue;
				throw new MailCoverServiceException(e);
				
			}
			
		}
		
	}

	public void register(MailCoverGenerator mailCoverGenerator) {
		
		if (null == mailCoverGenerator) {
			throw new IllegalArgumentException("The provided generator is null");
		}
		
		generators.add(mailCoverGenerator);
		
	}

	public void setSkipOnException(boolean skipOnException) {
		this.skipOnException = skipOnException;
	}
	
}
