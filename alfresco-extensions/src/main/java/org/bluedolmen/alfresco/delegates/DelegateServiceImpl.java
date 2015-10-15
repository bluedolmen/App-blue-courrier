package org.bluedolmen.alfresco.delegates;

import java.io.Serializable;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ParameterCheck;

public class DelegateServiceImpl implements DelegateService {	
	
	public void addDelegate(String authorityName, String delegateAuthorityName) {
		addDelegate(authorityName, new Delegate(delegateAuthorityName, null, false));
	}
	
	private NodeRef getDelegateAuthorityNodeRef(String delegateAuthorityName) {
		
		ParameterCheck.mandatoryString("delegateAuthorityName", delegateAuthorityName);
		
		final NodeRef delegateAuthorityNodeRef = authorityService.getAuthorityNodeRef(delegateAuthorityName);
		if (null == delegateAuthorityNodeRef) {
			throw new IllegalStateException(
				String.format("Cannot find or access the node definining authority '%s'", delegateAuthorityName)
			);
		}
		
		return delegateAuthorityNodeRef;
		
	}
	
	private NodeRef getAuthorityNodeRef(String authorityName) {
		
		if (null == authorityName || authorityName.isEmpty()) {
			authorityName = authenticationService.getCurrentUserName();
		}
		
		final NodeRef authorityNodeRef = authorityService.getAuthorityNodeRef(authorityName);
		if (null == authorityNodeRef) {
			throw new IllegalStateException(
				String.format("Cannot find or access the node definining authority '%s'", authorityName)
			);
		}
		
		return authorityNodeRef;
	}

	public void addDelegate(String authorityName, Delegate delegate) {
		
		final NodeRef authorityNodeRef = getAuthorityNodeRef(authorityName);
		final String delegateAuthorityName = delegate.getName();
		final NodeRef delegateAuthorityNodeRef = getDelegateAuthorityNodeRef(delegateAuthorityName);
		final Serializable delegateUserName = nodeService.getProperty(delegateAuthorityNodeRef, ContentModel.PROP_USERNAME);
		
		if (!nodeService.hasAspect(authorityNodeRef, DelegateModel.ASPECT_DELEGATING)) {
			nodeService.addAspect(authorityNodeRef, DelegateModel.ASPECT_DELEGATING, null);
		}
		
		final Map<QName, Serializable> properties = new HashMap<QName, Serializable>();
		final Date fromDate = delegate.getStartDate();
		if (null != fromDate) {
			properties.put(DelegateModel.PROP_FROM_DATE, fromDate);
		}
		
		final QName assocQName = QName.createQName(DelegateModel.DGT_MODEL_1_0_URI, (String) delegateUserName);
		final ChildAssociationRef newChildAssociationRef = nodeService.createNode(authorityNodeRef, DelegateModel.ASSOC_DELEGATES, assocQName, DelegateModel.TYPE_DELEGATE, properties);
		final NodeRef delegateNodeRef = newChildAssociationRef.getChildRef();
		
		nodeService.createAssociation(delegateNodeRef, delegateAuthorityNodeRef, DelegateModel.ASSOC_AUTHORITY);

	}

	public void removeDelegate(String authorityName, String delegateAuthorityName) {
		
		final NodeRef authorityNodeRef = getAuthorityNodeRef(authorityName);
		final NodeRef delegateAuthorityNodeRef = getDelegateAuthorityNodeRef(delegateAuthorityName);
		
		nodeService.removeChild(authorityNodeRef, delegateAuthorityNodeRef);
		
	}

	private Set<String> getDelegateNames(String authorityName, AuthorityType authorityType, boolean immediate) {
		
		final NodeRef authorityNodeRef = getAuthorityNodeRef(authorityName);
		
		final List<ChildAssociationRef> delegateAssociations = nodeService.getChildAssocs(authorityNodeRef, DelegateModel.ASSOC_DELEGATES, null, 1000, true);
		if (delegateAssociations.isEmpty()) return Collections.emptySet();
		
		final Set<String> delegates = new LinkedHashSet<String>();
		for (final ChildAssociationRef car : delegateAssociations) {
			
			final NodeRef childRef = car.getChildRef();
			final String delegateAuthorityName = (String) nodeService.getProperty(childRef, ContentModel.PROP_AUTHORITY_NAME);
			
			if (null != delegateAuthorityName) {
				// this is an authorityContainer
				final Set<String> delegateAuthorities = authorityService.getContainedAuthorities(authorityType, delegateAuthorityName, immediate);
				delegates.addAll(delegateAuthorities);
			} else {
				delegates.add(car.getQName().getLocalName());
			}
			
		}
		
		return delegates;
		
	}
	
	
	public Set<Delegate> getDelegates(String authorityName, AuthorityType authorityType, boolean immediate) {
		
		final Set<Delegate> delegates = new LinkedHashSet<Delegate>();
		final Set<String> delegateNames = getDelegateNames(authorityName, authorityType, immediate);
		
		for (final String delegateName : delegateNames) {
			final NodeRef authorityNodeRef = authorityService.getAuthorityNodeRef(delegateName);
			
			final Date startDate = (Date) nodeService.getProperty(authorityNodeRef, DelegateModel.PROP_FROM_DATE);
			final boolean isDefaultAssignee = (Boolean) nodeService.getProperty(authorityNodeRef, DelegateModel.PROP_DEFAULT_ASSIGNEE);
			
			delegates.add(new Delegate(delegateName, startDate, isDefaultAssignee));
		}
		
		return Collections.unmodifiableSet(delegates);
		
	}
	
	public Set<Delegate> getDelegatedPersons(String userName) {
		return getDelegates(userName, AuthorityType.USER, false);
	}
	

	public boolean isDelegate(String authorityName, String delegateAuthorityName) {
		
		if (null == delegateAuthorityName || delegateAuthorityName.isEmpty()) return false;

		final NodeRef authorityNodeRef = getAuthorityNodeRef(authorityName);
		final QName assocQName = QName.createQName(DelegateModel.DGT_MODEL_1_0_URI, (String) delegateAuthorityName);
		
		final List<ChildAssociationRef> delegateAssociations = nodeService.getChildAssocs(authorityNodeRef, DelegateModel.ASSOC_DELEGATES, assocQName, 1, true);
		return !delegateAssociations.isEmpty();
		
	}

	// Spring IoC injection
	
	private NodeService nodeService;
	private AuthenticationService authenticationService;
	private AuthorityService authorityService;

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}
	
	public void setAuthenticationService(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}

}
