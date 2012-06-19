Ext.define('Bluexml.model.Person.Group', {
	extend : 'Ext.data.Model',
	
	fields : [
		'itemName',
		'displayName'
	],
	
	belongsTo : 'Bluexml.model.Person'	
});


Ext.define('Bluexml.model.Person', {
	
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
		}
		
	],
	
	hasMany : [
		{
			model : 'Bluexml.model.Person.Group',
			name : 'groups'
		},
		{
			model : 'Bluexml.model.Person.Capabilities',
			name : 'capabilities'
		}
	],
	
	proxy : {
		type : 'rest',
		url : Bluexml.Alfresco.getProxyURL() + 'api/people',
		reader : 'json',
		extraParams : {
			'groups' : true
		}
	},
	
	belongsToGroup : function(groupName) {
		var belongsTo = false;
		
		Ext.Array.forEach(this.groups().data.items,function(item) {
			var groupName_ = item.get('displayName');
			if (groupName_ == groupName) {
				belongsTo = true;
				return false; // stop iteration
			}
		});
		
		return belongsTo;		
	},
	
	isAdmin : function() {
		return this.get('isAdmin');
	}
	
});
