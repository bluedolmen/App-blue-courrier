Ext.define('Yamma.view.dialogs.ForwardDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.forwarddialog',
	
	requires : [
		'Yamma.view.services.ServicesView',
		'Ext.form.field.Checkbox'
	],
	
	title : 'Transmettre',
	height : 400,
	width : 400,
	layout : 'vbox',
	headerPosition : 'right',
	renderTo : Ext.getBody(),
	
	initialSelection : null,
		
	
	initComponent : function() {
		
		var me = this;
		
		this.servicesView = Ext.create('Yamma.view.services.ServicesView', {
			xtype : 'servicesview',
			itemId : 'services-tree',
			border : false,
			preventHeader : true,
			initialSelection : this.initialSelection,
			width : '100%',
			flex : 1
		});
			
		this.items = [
			this.servicesView,
			{
				xtype : 'checkbox',
				itemId : 'approbe-checkbox',
				boxLabel : "Apposer un visa d'approbation",
				boxLabelAlign : 'after',
				checked : true,
				width : '100%',
				height : '30px',
				padding : '5 0 5 15'
			}
		];
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button', 
		        	text: 'Transmettre',
		        	handler : function() {

		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	text: 'Annuler',
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
		
		this.callParent();
	},
	
	forward : function() {
		
	}
	
});