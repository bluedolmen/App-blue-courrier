Ext.define('Yamma.view.categories.CategoryForm', {

	extend : 'Ext.form.Panel',
	
    statics : {
    	API_URL : 'alfresco://bluedolmen/category/{categoryref}'
    },
    
    categoryRef : null,
    buttonText : '',
    waitingMessage : 'Opération en cours...',
    httpMethod : 'POST',
    
    layout: 'anchor',
    defaults: {
    	anchor: '100%',
    	margin : 5,
    	labelWidth : 50
    },
    
    height : 80,
    width : 250,

    padding : '5',
    
    // The fields
    defaultType: 'textfield',
    items: [
    	{
			fieldLabel: 'Nom',
			itemId : 'name-field',
			name: 'name',
			allowBlank: false,
			vtype : 'alphanum'
	    }
    ],
    
    onSuccess : Ext.emptyFn,
    
	initComponent : function() {
		
		var
			me = this
		;
		
		this.buttons = [
		    {
				text: me.buttonText,
				formBind: true, // only enabled once the form is valid
				disabled: true,
				handler: onCreateButtonClicked
		    }
		];
		
		this.loadingMask = new Ext.LoadMask(me, {msg : me.waitingMessage});
		
		this.callParent(arguments);
		
		var nameField = this.queryById('name-field');
		nameField.focus(false, 200);
		
		function onCreateButtonClicked() {
			
			if (!me.categoryRef) return;
			
			var
				form = this.up('form').getForm(),
				url = Yamma.view.categories.CategoryForm.API_URL
					.replace(/\{categoryref\}/, me.categoryRef.replace(/\:\/\//, '/'));
			;
			
			if (!form.isValid()) return;
	
			var 
				values = form.getValues(false),
				name = values['name']
			;
	
			me.loadingMask.show();
			
			Bluedolmen.Alfresco.jsonRequest({
				
				method : me.httpMethod,
				
				url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(url),
				
				dataObj : values,
				
				onSuccess : me.onSuccess,
				
				'finally' : function() {
					me.loadingMask.hide();
				}
			
			});
			
		}
		
	}
    

});