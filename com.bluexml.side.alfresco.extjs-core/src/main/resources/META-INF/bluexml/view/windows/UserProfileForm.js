Ext.define('Bluexml.view.windows.UserProfileForm', {

	extend : 'Ext.form.Panel',
	alias : 'widget.userprofileform',
	requires : [
		Bluexml.model.PersonFactory
	],
	
    frame: true,
    title: 'Profil utilisateur',
    bodyPadding: 5,
	defaultType: 'textfield',
    
    fieldDefaults: {
        labelAlign: 'left',
        msgTarget: 'side',
        readOnly : true
    },
    
    defaults : {
    	width : 380
    },
    
    items: [
    	{
            fieldLabel: 'Prénom',
            name: 'firstName'
        },
    	{
            fieldLabel: 'Nom',
            name: 'lastName'
        },
    	{
            fieldLabel: 'Nom utilisateur',
            name: 'userName'
        },
    	{
            fieldLabel: 'Adresse mail',
            name: 'email'
        },
    	{
            fieldLabel: 'Fonction',
            name: 'jobtitle'
        }
    
	],
    
    initComponent : function() {
    	
    	var me = this;
    	this.callParent();
    	
    	var currentUserName = Bluexml.Alfresco.getCurrentUserName();
    	Bluexml.model.PersonFactory.getPerson(currentUserName, onPersonAvailable);
    	
    	function onPersonAvailable(person) {
    		me.loadRecord(person);
    		me.add({
    			title : 'Groupes',
    			xtype : 'fieldset',
    			layout : 'fit',
    			padding : 5,
    			items : [{
		            xtype : 'gridpanel',
		            title : '',
		            hideHeaders : true,
		            store : person.groupsStore,
		            height : 100,
		
		            columns: [
		                {
		                    id :'groupName',
		                    text : 'Groupes',
		                    flex : 1,
		                    sortable : true,
		                    dataIndex: 'displayName'
		                }
					]    				
    			}]
    		});
    	}
    	
    }
	
})