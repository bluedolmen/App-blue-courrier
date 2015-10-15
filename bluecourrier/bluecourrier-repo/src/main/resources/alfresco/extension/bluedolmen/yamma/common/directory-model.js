var DirectoryModel = new (function(){
	
	var me = this;
	
	this.DIRECTORY_NS_PREFIX = 'directory';
	this.DIRECTORY_PREFIX = '';
	
	this.ORGANIZATION_ASPECT_SHORTNAME = dfn('organization');
	this.ORGANIZATION_NAME_PROPNAME = dfn('organizationName');
	this.ORGANIZATION_EMAIL_PROPNAME = dfn('organizationEmail');
	this.ORGANIZATION_TELEPHONE_PROPNAME = dfn('organizationTelephone');
	this.ORGANIZATION_FAX_PROPNAME = dfn('organizationFax');
	
	this.PERSON_ASPECT_SHORTNAME = dfn('person');
	this.PERSON_FIRST_NAME_PROPNAME = dfn('personFirstName');
	this.PERSON_LAST_NAME_PROPNAME = dfn('personLastName');
	this.PERSON_JOB_TITLE_PROPNAME = dfn('personJobtitle');
	this.PERSON_EMAIL_PROPNAME = dfn('personEmail');
	this.PERSON_TELEPHONE_PROPNAME = dfn('personTelephone');
	this.PERSON_MOBILE_PROPNAME = dfn('personMobile');
	
	this.ADDRESS_ASPECT_SHORTNAME = dfn('address');
	this.ADDRESS_ADDRESS_BODY_PROPNAME = dfn('addressBody');
	this.ADDRESS_POSTCODE_PROPNAME = dfn('postcode');
	this.ADDRESS_CITY_PROPNAME = dfn('city');
	this.ADDRESS_COUNTRY_PROPNAME = dfn('country');
	
	this.ORGANIZATION_ENTRY_TYPE_SHORTNAME = dfn('organizationEntry');
	this.PERSON_ENTRY_TYPE_SHORTNAME = dfn('personEntry');
	this.PERSON_ENTRY_USER_NAME_PROPNAME = dfn('userName');
	
	
	/**
	 * Get the declaration full-name based on the composition of the namespace prefix
	 * and of the prefix.
	 */
	function dfn(shortName, prefix) {
		return me.DIRECTORY_NS_PREFIX + ':' + me.DIRECTORY_PREFIX + shortName;
	}
	
	function dfnp(classShortName, attributeName) {
		return classShortName + '_' + attributeName;
	}
	
	function dfna(sourceClassShortName, targetClassShortName, assocName) {
		return me.YAMMA_NS_PREFIX + ':' + localName(sourceClassShortName) + '_' + assocName + '_' + localName(targetClassShortName);
		
		function localName(classShortName) {
			if (!classShortName) return classShortName;
			
			var colonPosition = classShortName.indexOf(':');
			if (colonPosition == -1) return classShortName;
			
			return classShortName.substr(colonPosition + 1);
		}
		
	}

	
	
});


