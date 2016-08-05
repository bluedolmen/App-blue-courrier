Ext.define('Yamma.admin.modules.services.ServiceForm', {

	extend : 'Ext.form.Panel',
	

    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
    	anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [
    	{
			fieldLabel: 'Nom',
			name: 'shortName',
			allowBlank: false,
			vtype : 'alphanum'
	    },
	    {
			fieldLabel: 'Titre',
			name: 'title',
			allowBlank: true
	    },
	    {
	    	xtype : 'textareafield',
	    	grow : true,
			fieldLabel: 'Description',
			name: 'description',
			allowBlank: true
	    },
	    {
			fieldLabel: 'Preset',
			name: 'sitePreset',
			allowBlank: false,
			value : 'site-dashboard',
			hidden : true
	    },
	    {
			fieldLabel: 'Visibilité',
			name: 'visibility',
			allowBlank: false,
			value : 'PRIVATE',
			hidden : true
	    }
	]

});