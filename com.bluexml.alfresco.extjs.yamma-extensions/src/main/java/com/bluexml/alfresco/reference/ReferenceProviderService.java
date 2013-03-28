package com.bluexml.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface ReferenceProviderService {
	
	public static final class NotUniqueException extends RuntimeException {

		private static final long serialVersionUID = -6863312808265432670L;
		private String duplicateReference;
		private NodeRef nodeRef;
		
		NotUniqueException(String duplicateReference, NodeRef nodeRef) {
			super();
			
			if (null == duplicateReference || duplicateReference.isEmpty()) {
				throw new IllegalArgumentException("The duplicate reference cannot be null nor empty");
			}
			
			this.duplicateReference = duplicateReference;
			this.nodeRef = nodeRef;
		}
		
		@Override
		public String getLocalizedMessage() {
			return String.format("The reference '%s' already exists for node '%s'", 
					duplicateReference,
					nodeRef
			); 
		}
		
	}
	
	/**
	 * Get the node corresponding to the provided reference
	 * 
	 * @param reference the reference value
	 * @param typeShort (optional) the type on which research should be restricted (null for any)
	 * @return the existing nodeRef, or null if it does not exists
	 */
	NodeRef getMatchingReferenceNode(String reference, String typeShort);	
	
	/**
	 * Set (store) the reference on the provided node, if possible by using the
	 * default {@link ReferenceProvider}
	 * 
	 * @param nodeRef
	 *            the node to change the reference of
	 * @param value
	 *            the value of the reference
	 * @return true if the reference was actually changed
	 */
	void setReference(NodeRef nodeRef, String value) throws NotUniqueException;
	
	/**
	 * Set (store) the reference on the provided node, if possible by using the
	 * default {@link ReferenceProvider}
	 * 
	 * @param nodeRef
	 *            the node to change the reference of
	 * @param override
	 *            whether to override the reference by a new one, if it is
	 *            already defined
	 * @return The (new) reference
	 */
	String setReference(NodeRef nodeRef, boolean override) throws NotUniqueException;
	
	/**
	 * Set (store) the reference on the provided node, if possible by using a
	 * specific {@link ReferenceProvider}
	 * 
	 * @param nodeRef
	 *            the node to change the reference of
	 * @param override
	 *            whether to override the reference by a new one, if it is
	 *            already defined
	 * @param providerId
	 *            the provider used to generate the reference
	 * @param config
	 *            the configuration of the reference-provider
	 * @return The (new) reference 
	 */
	String setReference(NodeRef nodeRef, boolean override, String providerId, Object config) throws NotUniqueException;
	
	/**
	 * Get the reference of the previously set node, using the default
	 * {@link ReferenceProvider}
	 * 
	 * @param nodeRef
	 *            the node to get the reference of
	 * @return the previously set reference of the provided node, or null if it
	 *         is not set
	 */
	String getExistingReference(NodeRef nodeRef);
	
	/**
	 * Get a new (unbound) reference using the default {@link ReferenceProvider}
	 * 
	 * @return the newly-generated reference
	 */
	String getNewReference();
	
	/**
	 * Get a new (unbound) reference using a specific {@link ReferenceProvider}
	 * 
	 * @param providerId
	 *            the provider used to generate the reference
	 * @param config
	 *            the configuration of the reference-provider
	 * @return the newly-generated reference
	 */
	String getNewReference(String providerId, Object config);
		
	/**
	 * Implemented by classes that are able to behave as a
	 * {@link ReferenceProvider} register
	 * 
	 * @author pajot-b
	 * 
	 */
	public interface Registerable {
		
		public void register(ReferenceProvider referenceProvider);
		
	}
	
}
