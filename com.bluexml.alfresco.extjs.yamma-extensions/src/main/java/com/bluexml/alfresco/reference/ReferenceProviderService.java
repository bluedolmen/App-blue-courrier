package com.bluexml.alfresco.reference;

import org.alfresco.service.cmr.repository.NodeRef;

public interface ReferenceProviderService {
	
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
	void setReference(NodeRef nodeRef, String value);
	
	/**
	 * Set (store) the reference on the provided node, if possible by using the
	 * default {@link ReferenceProvider}
	 * 
	 * @param nodeRef
	 *            the node to change the reference of
	 * @param override
	 *            whether to override the reference by a new one, if it is
	 *            already defined
	 * @return true if the reference was actually changed
	 */
	boolean setReference(NodeRef nodeRef, boolean override);
	
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
	 * @return true if the reference was actually changed
	 */
	boolean setReference(NodeRef nodeRef, boolean override, String providerId, Object config);
	
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
