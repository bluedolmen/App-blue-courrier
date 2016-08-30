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
			fieldLabel: i18n.t('admin.modules.services.serviceform.items.shortName.text'),
			name: 'shortName',
			allowBlank: false,
			vtype : 'alphanum'
	    },
	    {
			fieldLabel: i18n.t('admin.modules.services.serviceform.items.title.text'),
			name: 'title',
			allowBlank: true
	    },
	    {
	    	xtype : 'textareafield',
	    	grow : true,
			fieldLabel: i18n.t('admin.modules.services.serviceform.items.description.text'),
			name: 'description',
			allowBlank: true
	    },
	    {
			fieldLabel: i18n.t('admin.modules.services.serviceform.items.sitePreset.text'),
			name: 'sitePreset',
			allowBlank: false,
			value : 'site-dashboard',
			hidden : true
	    },
	    {
			fieldLabel: i18n.t('admin.modules.services.serviceform.items.visibility.text'),
			name: 'visibility',
			allowBlank: false,
			value : 'PRIVATE',
			hidden : true
	    }
	]

});