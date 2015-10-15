Ext.define('Bluedolmen.store.PersonStore', {
	
	extend : 'Ext.data.Store',
	requires : [
	],
	
	fields : [
		'id',
		'url',
		'name',
		'title',
		'description',
		'isActive',
		'startDate',
		'priority',
		'message',
		'endDate',
		'dueDate',
		'context',
		'package',
		'initiator',
		'definitionUrl'
	],
	
//	   "id": "jbpm$1",
//	   "url": "api\/workflow-instances\/jbpm$1",
//	   "name": "jbpm$bcwfincoming:IncomingDocument",
//	   "title": "IncomingDocument",
//	   "description": "",
//	   "isActive": true,
//	   "startDate": "2013-09-30T17:24:22.000+02:00",
//	   "priority": 2,
//	   "message": "Un document entrant doit \u00eatre trait\u00e9.",
//	   "endDate": null,
//	   "dueDate": null,
//	   "context": "workspace:\/\/SpacesStore\/5625241a-75f1-48b8-88bd-082cf3d698ed",
//	   "package": "workspace:\/\/SpacesStore\/9cf54c10-6037-4e4e-99c9-efb73c775c4b",
//	   "initiator": 
//	   {
//	      "userName": "bpajot",
//	      "firstName": "Brice",
//	      "lastName": "PAJOT"
//	   },
//	   "definitionUrl": "api\/workflow-definitions\/jbpm$12"}
//	      
//	   ]
	
	constructor : function(nodeRef) {
		
		if (!Bluedolmen.Alfresco.isNodeRef(nodeRef)) {
			Ext.Error.raise('This Store has to be initialized with a valid nodeRef');
		}
	
		var url = 
			Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				'alfresco://api/node/{nodeRef}/workflowInstances'
					.replace(/\{nodeRef\}/, nodeRef)
			)
		;
		
		this.proxy = {
			type : 'ajax',
			url : url, 
		    reader: {
		        type: 'json',
		        root: 'data'
		    }
		};
		
		this.callParent();
		
	}
	
});