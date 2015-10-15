Ext.define('Bluedolmen.model.Person.Group', {
	extend : 'Ext.data.Model',
	
	fields : [
		'itemName',
		'displayName'
	],
	
	belongsTo : 'Bluedolmen.model.Person'	
});


Ext.define('Bluedolmen.model.Person', {
	
	extend : 'Ext.data.Model',
	
	/*
	 * These fields are designed for the api/people webscripts The list
	 * of fields provided by this webscript notably change from the
	 * basic cm:person type in the sense where this is an augmented
	 * subset of the existing properties.
	 */
	fields : [
		"url", 
		"userName", 
		"enabled", 
		"firstName", 
		"lastName",
		"jobtitle", 
		"organization", 
		"location", 
		"telephone",
		"mobile", 
		"email", 
		"companyaddress1", 
		"companyaddress2",
		"companyaddress3", 
		"companypostcode", 
		"companytelephone",
		"companyfax", 
		"companyemail", 
		"skype", 
		"instantmsg",
		"userStatus", 
		"userStatusTime", 
		"googleusername", 
		"quota",
		"sizeCurrent", 
		"persondescription",
		"capabilities",
		"avatar",
		{
			name : 'isAdmin',
			type : 'boolean',
			convert : function(value, record) {
				return record.get('capabilities').isAdmin;
			}
		},
		{
			name : 'isGuest',
			type : 'boolean',
			convert : function(value, record) {
				return record.get('capabilities').isGuest;
			}
		},
		{
			name : 'displayName',
			type : 'string',
			convert : function(value, record) {
				var 
					firstName = record.get('firstName'),
					lastName = record.get('lastName'),
					userName = record.get('userName')
				;
				
				return (firstName ? firstName + ' ' : '')
					+ (lastName ? lastName + ' ' : '')
					+ (lastName || firstName ? ' (' + userName + ')' : '')
				;
					
			}
		}
		
	],
	
	hasMany : [
		{
			model : 'Bluedolmen.model.Person.Group',
			name : 'groups'
		},
		{
			model : 'Bluedolmen.model.Person.Capabilities',
			name : 'capabilities'
		}
	],
	
	proxy : {
		type : 'rest',
		url : Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://api/people'),
		reader : 'json',
		extraParams : {
			'groups' : true
		}
	},
	
	belongsToGroup : function(groupName) {
		
		return Ext.Array.some(this.groups().data.items, function(item) {
			return item.get('itemName') == groupName;
		});
		
	},
	
	isAdmin : function() {
		return this.get('isAdmin');
	},
	
	getAvatarUrl : function() {
		var 
			avatar = this.get('avatar'),
			avatarUrl = avatar ?
				'alfresco://' + avatar + '?c=queue&amp;ph=true' :
				Bluedolmen.model.Person.NO_USER_AVATAR_URL
				
		;
		
		return Bluedolmen.Alfresco.resolveAlfrescoProtocol(avatarUrl);
		
	},
	
	statics : {
		
		NO_USER_AVATAR_URL : Alfresco.constants.URL_RESCONTEXT + 'components/images/no-user-photo-64.png' 
		
	}
	
});
