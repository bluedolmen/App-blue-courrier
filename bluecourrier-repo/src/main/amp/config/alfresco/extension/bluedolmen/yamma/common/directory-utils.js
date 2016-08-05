///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/directory-model.js">
(function() {	

	DirectoryUtils = {
			
		IGNORED_USERNAMES : ['admin', 'guest', 'System'],
			
		synchronizeContacts : function() {
			
			var undefinedPeople = DirectoryUtils.getUndefinedPeople();
			
			Utils.forEach(undefinedPeople, function(person) {
				
				var userName = person.properties['cm:userName'];
				DirectoryUtils.createContact(userName, person);
				
			});
			
		},

		getPeople : function() {
			
			// people.getPeople returns a list of NodeRef and not ScriptNodes (probably a bug)
			
			var people_ = people.getPeople(null);
			return Utils.map(people_, function(personRef) {
				return search.findNode(personRef);
			});
			
		},
			
		getContactsDatalist : function() {
			
			return YammaUtils.getDataListByType(DirectoryModel.PERSON_ENTRY_TYPE_SHORTNAME);
			
		},
				
		getMappedDefinedContacts : function() {
			
			var contacts = this.getDefinedContacts();
			return Utils.mapOfArray(contacts, function keyFunction(contact) {
				var userName = contact.properties[DirectoryModel.PERSON_ENTRY_USER_NAME_PROPNAME];
				return Utils.wrapString(userName);
			});
			
		},
		
		getDefinedContacts : function() {
			
			var contactsDatalist = this.getContactsDatalist();
			if (null == contactsDatalist) return [];
			
			var contacts = contactsDatalist.children;
			
			return Utils.filter(contacts, function(contact) {
				var userName = contact.properties[DirectoryModel.PERSON_ENTRY_USER_NAME_PROPNAME];
				return null != userName;
			});
			
		},
		
		getUndefinedPeople : function() {
			
			var 
				people = this.getPeople(),
				contacts = this.getMappedDefinedContacts()
			;
			
			return Utils.filter(people, function accept(person) {
				
				var userName = person.properties['cm:userName'];
				if (Utils.contains(DirectoryUtils.IGNORED_USERNAMES, userName)) return false;
				
				return null == contacts[userName];
				
			});
			
		},
		
		getContact : function(userName) {
			
			// May also use childrenByXPath on cm:[userName] path
			
			userName = Utils.asString(userName);
			
			var contactsDatalist = this.getContactsDatalist();
			if (null == contactsDatalist) return null;
			
			return (contactsDatalist.childrenByXPath("*[@" + DirectoryModel.PERSON_ENTRY_USER_NAME_PROPNAME + "='" + userName + "']") || [])[0] || null;
			
		},
		
		createContact : function(userName, personNode) {
			
			userName = Utils.asString(userName);
		
			if (null == personNode) {
				personNode = people.getPerson(userName);
			}
			
			var contactsDatalist = this.getContactsDatalist();
			if (null == contactsDatalist) return null;
			
			var contactNode = contactsDatalist.createNode(userName, DirectoryModel.PERSON_ENTRY_TYPE_SHORTNAME);
			DirectoryUtils.copyPerson(userName, personNode, contactNode);
			
			return contactNode;
			
		},
		
		copyPerson : function(userName, personNode, targetNode) {
			
			if (null == personNode) {
				personNode = people.getPerson(userName);
			}
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:userName',
				DirectoryModel.PERSON_ENTRY_USER_NAME_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:firstName',
			 	DirectoryModel.PERSON_FIRST_NAME_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:lastName',
			 	DirectoryModel.PERSON_LAST_NAME_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:jobtitle',
				DirectoryModel.PERSON_JOB_TITLE_PROPNAME 
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:email',
				DirectoryModel.PERSON_EMAIL_PROPNAME 
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:telephone',
				DirectoryModel.PERSON_TELEPHONE_PROPNAME 
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:mobile',
				DirectoryModel.PERSON_MOBILE_PROPNAME 
			));
			
			// Also map address if not yet filled
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getJoinMapOperation(
				[
				 	'cm:companyaddress1',
				 	'cm:companyaddress2',
				 	'cm:companyaddress3'
				],
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME,
				'\n'
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:companypostcode',
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME 
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				'cm:location',	
				DirectoryModel.ADDRESS_CITY_PROPNAME 
			));
			
			Utils.Alfresco.CopyPropertyUtils.executeCopy(personNode, targetNode, mapFunctions);
			
		},
		
			
		/**
		 * 
		 * @param source an OrganizationEntry element
		 * @param target a Sender "aspect-ed" node
		 */
		fillSenderOrganization : function(source, target) {
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_NAME_PROPNAME, 
				YammaModel.SENDER_ORGANIZATION_NAME_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_EMAIL_PROPNAME, 
				YammaModel.SENDER_EMAIL_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_TELEPHONE_PROPNAME, 
				YammaModel.SENDER_TELEPHONE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME, 
				YammaModel.SENDER_ADDRESS_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME, 
				YammaModel.SENDER_POSTCODE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_CITY_PROPNAME, 
				YammaModel.SENDER_CITY_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_COUNTRY_PROPNAME, 
				YammaModel.SENDER_COUNTRY_PROPNAME
			));
			
			Utils.Alfresco.CopyPropertyUtils.executeCopy(source, target, mapFunctions);

		},
		
		/**
		 * 
		 * @param source an OrganizationEntry element
		 * @param target a Sender "aspect-ed" node
		 */
		fillRecipientOrganization : function(source, target) {
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_NAME_PROPNAME, 
				YammaModel.RECIPIENT_ORGANIZATION_NAME_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_EMAIL_PROPNAME, 
				YammaModel.RECIPIENT_EMAIL_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ORGANIZATION_TELEPHONE_PROPNAME, 
				YammaModel.RECIPIENT_TELEPHONE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME, 
				YammaModel.RECIPIENT_ADDRESS_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME, 
				YammaModel.RECIPIENT_POSTCODE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_CITY_PROPNAME, 
				YammaModel.RECIPIENT_CITY_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_COUNTRY_PROPNAME, 
				YammaModel.RECIPIENT_COUNTRY_PROPNAME
			));

			Utils.Alfresco.CopyPropertyUtils.executeCopy(source, target, mapFunctions);
			
		},
		
		/**
		 * 
		 * @param source a PersonEntry element
		 * @param target 
		 */
		fillInstructor : function(source, target) {
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getJoinMapOperation(
				[
				 	DirectoryModel.PERSON_FIRST_NAME_PROPNAME,
				 	DirectoryModel.PERSON_LAST_NAME_PROPNAME
				],
				YammaModel.SENDER_INSTRUCTOR_NAME_PROPNAME,
				' ' /* separator */
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_JOB_TITLE_PROPNAME, 
				YammaModel.SENDER_INSTRUCTOR_JOB_TITLE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_EMAIL_PROPNAME, 
				YammaModel.SENDER_INSTRUCTOR_EMAIL_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_TELEPHONE_PROPNAME, 
				YammaModel.SENDER_INSTRUCTOR_TELEPHONE_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_MOBILE_PROPNAME, 
				YammaModel.SENDER_INSTRUCTOR_MOBILE_PROPNAME
			));
			
			// Also map address if not yet filled
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME, 
				YammaModel.SENDER_ADDRESS_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME, 
				YammaModel.SENDER_POSTCODE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_CITY_PROPNAME, 
				YammaModel.SENDER_CITY_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_COUNTRY_PROPNAME, 
				YammaModel.SENDER_COUNTRY_PROPNAME
			));
			
			
			Utils.Alfresco.CopyPropertyUtils.executeCopy(source, target, mapFunctions);
			
		},

		
		/**
		 * 
		 * @param source a PersonEntry element
		 * @param target 
		 */
		fillSignator : function(source, target) {
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getJoinMapOperation(
				[
				 	DirectoryModel.PERSON_FIRST_NAME_PROPNAME,
				 	DirectoryModel.PERSON_LAST_NAME_PROPNAME
				],
				YammaModel.SENDER_SIGNATOR_NAME_PROPNAME,
				' ' /* separator */
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_JOB_TITLE_PROPNAME, 
				YammaModel.SENDER_SIGNATOR_JOB_TITLE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_EMAIL_PROPNAME, 
				YammaModel.SENDER_SIGNATOR_EMAIL_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_TELEPHONE_PROPNAME, 
				YammaModel.SENDER_SIGNATOR_TELEPHONE_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_MOBILE_PROPNAME, 
				YammaModel.SENDER_SIGNATOR_MOBILE_PROPNAME
			));
			
			// Also map address if not yet filled
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME, 
				YammaModel.SENDER_ADDRESS_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME, 
				YammaModel.SENDER_POSTCODE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_CITY_PROPNAME, 
				YammaModel.SENDER_CITY_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_COUNTRY_PROPNAME, 
				YammaModel.SENDER_COUNTRY_PROPNAME
			));
			
			Utils.Alfresco.CopyPropertyUtils.executeCopy(source, target, mapFunctions);
			
		},

		/**
		 * 
		 * @param source a PersonEntry element
		 * @param target 
		 */
		fillRecipient : function(source, target) {
			
			var
				mapFunctions = []
			;
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getJoinMapOperation(
				[
				 	DirectoryModel.PERSON_FIRST_NAME_PROPNAME,
				 	DirectoryModel.PERSON_LAST_NAME_PROPNAME
				],
				YammaModel.RECIPIENT_RECIPIENT_NAME_PROPNAME,
				' ' /* separator */
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_JOB_TITLE_PROPNAME, 
				YammaModel.RECIPIENT_JOB_TITLE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_EMAIL_PROPNAME, 
				YammaModel.RECIPIENT_EMAIL_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.PERSON_TELEPHONE_PROPNAME, 
				YammaModel.RECIPIENT_TELEPHONE_PROPNAME
			));

			
			// Also map address if not yet filled
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_ADDRESS_BODY_PROPNAME, 
				YammaModel.RECIPIENT_ADDRESS_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_POSTCODE_PROPNAME, 
				YammaModel.RECIPIENT_POSTCODE_PROPNAME
			));
			
			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_CITY_PROPNAME, 
				YammaModel.RECIPIENT_CITY_PROPNAME
			));

			mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
				DirectoryModel.ADDRESS_COUNTRY_PROPNAME, 
				YammaModel.RECIPIENT_COUNTRY_PROPNAME
			));
			
			Utils.Alfresco.CopyPropertyUtils.executeCopy(source, target, mapFunctions);
			
		}
			
	};
	
})();