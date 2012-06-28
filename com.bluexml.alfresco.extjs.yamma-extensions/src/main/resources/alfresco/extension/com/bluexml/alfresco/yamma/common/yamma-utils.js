///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/trays-utils.js">

const YAMMA_NS_PREFIX = 'yamma-ee';
const YAMMA_PREFIX = '';
const ADMIN_SITE_NAME = 'admin';

const TRAY_TYPE_SHORTNAME = dfn('Tray');

// DOCUMENT TYPE DEFINITION
const DOCUMENT_TYPE_SHORTNAME = dfn('Document');

// MAIL TYPE DEFINITION
const MAIL_TYPE_SHORTNAME = dfn('Mail');
const MAIL_STAMP_DATE_PROPNAME = dfnp(MAIL_TYPE_SHORTNAME, 'stampDate');
const MAIL_DELIVERY_DATE_PROPNAME = dfnp(MAIL_TYPE_SHORTNAME, 'deliveryDate');
const MAIL_WRITING_DATE_PROPNAME = dfnp(MAIL_TYPE_SHORTNAME, 'writingDate');
const MAIL_OBJECT_PROPNAME = dfnp(MAIL_TYPE_SHORTNAME, 'object');

// DATALISTS TYPE DEFINITIONS
const ASSIGNABLE_SITE_TYPE_SHORTNAME = dfn('AssignableSite');
const DELAY_TYPE_SHORTNAME = dfn('Delay');
const PRIVACY_LEVEL_TYPE_SHORTNAME = dfn('PrivacyLevel');
const STATUS_LEVEL_TYPE_SHORTNAME = dfn('Status');

// ASPECTS DEFINITIONS
const COMMENTABLE_ASPECT_SHORTNAME = dfn('Commentable');
const COMMENTABLE_COMMENT_PROPNAME = dfnp(COMMENTABLE_ASPECT_SHORTNAME, 'comment');

const CORRESPONDENT_ASPECT_SHORTNAME = dfn('Correspondent');
const CORRESPONDENT_NAME_PROPNAME = dfnp(CORRESPONDENT_ASPECT_SHORTNAME, 'name');
const CORRESPONDENT_ADDRESS_PROPNAME = dfnp(CORRESPONDENT_ASPECT_SHORTNAME, 'address');
const CORRESPONDENT_CONTACT_EMAIL_PROPNAME = dfnp(CORRESPONDENT_ASPECT_SHORTNAME, 'contactEmail');
const CORRESPONDENT_CONTACT_PHONE_PROPNAME = dfnp(CORRESPONDENT_ASPECT_SHORTNAME, 'contactPhone');

const DIGITIZABLE_ASPECT_SHORTNAME = dfn('Digitizable');
const DIGITIZABLE_DIGITIZED_DATE_PROPNAME = dfnp(DIGITIZABLE_ASPECT_SHORTNAME, 'digitizedDate');

const REFERENCEABLE_ASPECT_SHORTNAME = dfn('Referenceable');
const REFERENCEABLE_REFERENCE_PROPNAME = dfnp(REFERENCEABLE_ASPECT_SHORTNAME, 'reference');

const ASSIGNABLE_ASPECT_SHORTNAME = dfn('Assignable');
const ASSIGNABLE_SERVICE_ASSOCNAME = dfna(ASSIGNABLE_ASPECT_SHORTNAME, ASSIGNABLE_SITE_TYPE_SHORTNAME, 'service');

const DISTRIBUTABLE_ASPECT_SHORTNAME = dfn('Distributable');
const DISTRIBUTABLE_SERVICES_ASSOCNAME = dfna(DISTRIBUTABLE_ASPECT_SHORTNAME, ASSIGNABLE_SITE_TYPE_SHORTNAME, 'services');

const PRIORITIZABLE_ASPECT_SHORTNAME = dfn('Prioritizable');
const PRIORITIZABLE_DELAY_ASSOCNAME = dfna(PRIORITIZABLE_ASPECT_SHORTNAME, DELAY_TYPE_SHORTNAME, 'delay');

const PRIVACY_ASPECT_SHORTNAME = dfn('Privacy');
const PRIVACY_PRIVACY_LEVEL_ASSOCNAME = dfna(PRIVACY_ASPECT_SHORTNAME, PRIVACY_LEVEL_TYPE_SHORTNAME, 'level');

const STATUSABLE_ASPECT_SHORTNAME = dfn('Statusable');
const STATUSABLE_STATUS_ASSOCNAME = dfna(STATUSABLE_ASPECT_SHORTNAME, STATUS_LEVEL_TYPE_SHORTNAME, 'status');

/**
 * Get the declaration full-name based on the composition of the namespace prefix
 * and of the prefix.
 */
function dfn(shortName, prefix) {
	return YAMMA_NS_PREFIX + ':' + YAMMA_PREFIX + shortName;
}

function dfnp(classShortName, attributeName) {
	return classShortName + '_' + attributeName;
}

function dfna(sourceClassShortName, targetClassShortName, assocName) {
	return YAMMA_NS_PREFIX + ':' + localName(sourceClassShortName) + '_' + assocName + '_' + localName(targetClassShortName);
}

function localName(classShortName) {
	if (!classShortName) return classShortName;
	
	var colonPosition = classShortName.indexOf(':');
	if (colonPosition == -1) return classShortName;
	
	return classShortName.substr(colonPosition + 1);
}

function getSite(document) {
	var iterator = document.parent;
	while (iterator) {
		var typeShort = iterator.typeShort;
		if ('st:site' == typeShort) return iterator;

		iterator = iterator.parent;
	}

	return null;
}

/*
 * TODO: Should be refactored to get one enclosing global object YammaUtils
 */

var YammaUtils = {
	
	getSite : getSite,
	
	getAdminSite : function() {
		
		var query = '+TYPE:"st\:site" +' + 
			Utils.getLuceneAttributeFilter('cm:name', ADMIN_SITE_NAME);
			
		var siteNodes = search.luceneSearch(query);
		return Utils.unwrapList(siteNodes);
		
	},
	
	isAdminSite : function(siteNode) {
		
		if (!siteNode || !siteNode.typeShort || 'st:site' != siteNode.typeShort) return false;
		
		var siteName = siteNode.name;
		if (!siteName) return false;
		
		return (ADMIN_SITE_NAME == siteName);
	},
	
	isMailDelivered : function(mailNode) {
		
		if (!this.isDocumentNode(mailNode))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		var enclosingSite = this.getSite(mailNode);
		if (!enclosingSite) return false;
		
		var enclosingSiteName = enclosingSite.name;
			
		var assignedService = this.getAssignedService(mailNode); 
		if (!assignedService) return false;		
		
		var assignedServiceName = assignedService.name;
		if (!assignedServiceName) return false;
		
		return Utils.asString(enclosingSiteName) == Utils.asString(assignedServiceName); // Stirng Object-s
	},
	
	getAssignedService : function(node) {
		if (!this.isDocumentNode(node))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		var assignedService = node.assocs[ASSIGNABLE_SERVICE_ASSOCNAME];
		if (!assignedService || 0 == assignedService.length ) return null;
		
		var firstAssignedService = assignedService[0];
		return firstAssignedService;
	},
	
	getDistributedServices : function(node) {
		if (!this.isDocumentNode(node))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		return node.assocs[DISTRIBUTABLE_SERVICES_ASSOCNAME] || [];
	},
	
	isDocumentNode : function(node) {
		return node && ('undefined' != typeof node.isSubType) && node.isSubType(DOCUMENT_TYPE_SHORTNAME);
	}
	
	
};
