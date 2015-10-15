package org.bluedolmen.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface ReferenceProvider {

	/**
	 * Get the id of the reference-provider
	 * 
	 * @return The id as a non-empty {@link String} of the reference-provided
	 */
	String getId();
	
	/**
	 * Get a reference without relying on an existing node.
	 * 
	 * @param context
	 * @return a new reference
	 */
	String getUnboundReference(Object context);
	
	/**
	 * Get a reference based on an existing node.
	 * <p>
	 * Beware! This method is not meant to be idempotent, meaning that the
	 * implementation is not enforced to return the same reference on successive
	 * calls.
	 * <p>
	 * This is the responsability of the caller to know the behavior of the
	 * relying implementation (may depend on the integration)
	 * 
	 * @param nodeRef
	 * @param context
	 * @return a (new) reference for the provided {@link NodeRef}
	 */
	String getReference(NodeRef nodeRef, Object context);
	
}
