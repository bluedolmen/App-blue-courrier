Ext.define('Bluedolmen.model.Comment', {
	
	extend : 'Ext.data.Model',
	
	fields : [
 	     'url',
	     'nodeRef',
	     'name',
	     'title',
	     'content',
	     'author',
	     { name : 'createdOnISO', type : 'date' },
	     { name : 'modifiedOnISO', type : 'date' },
	     'isUpdated',
	     'permissions',
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
	     },
	     {
	    	 name : 'avatarUrl',
	    	 type : 'string',
	    	 convert : function(value, record) {
	    		 
	    		 var
	    		 	avatarRef = record.get('avatarRef'),
	    		 	url
	    		 ;
	    		 
	    		 if (!avatarRef) return Bluedolmen.model.Person.NO_USER_AVATAR_URL;
	    		 
	    		 url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://api/node/{nodeRef}/content/thumbnails/avatar')
	    		 	.replace(/\{nodeRef\}/, avatarRef.replace(/:\//,''))
	    		 ;
	    		 
	    		 return url;
	    		 
	    	 }
	     }

	]
	
});
