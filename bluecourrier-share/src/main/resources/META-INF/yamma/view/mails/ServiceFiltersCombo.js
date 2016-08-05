Ext.define('Yamma.view.mails.ServiceFiltersCombo', {

	extend : 'Ext.ux.TreePicker',
	alias : 'widget.servicefilterscombo',
	
    name: 'serviceFilter',
    autoScroll: true,
    width : 150,
    labelWidth : 50,
    displayField : 'title',
    
    grow : true,
    fieldLabel: 'Filtre',
    labelAlign : 'right',
    labelSeparator : '',
    labelStyle : 'font-size : 1em ; font-weight : bold ; color : #15498B',     
    
    treePanelConfig : {
    	rootVisible : false,
    	displayField : 'text' // override displayField to get a "small" (hierarchically-) contextualized title 
    },
    
    value : '',
	
	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
	},
	
	fieldStyle : {
		'font-size' : '1em',
		'font-style' : 'italic',
		'color' : '#15498B'
	},	
	
	getTreeStore : function() {
		
		var treeStore = Ext.create('Ext.data.TreeStore', {
			
			fields : [
				'id', 'text', 'title', 'iconCls', 'expanded', 'children', 'leaf', 'filters'
			],
			root : {
				expanded : true,
				text : '<b>Statut</b>',
				iconCls : Yamma.Constants.getIconDefinition('cog_email').iconCls,
				filters : {
					type : null,
					state : null
				},
				children : [
					{
						id : 'incoming',
						text : 'Entrant',
						title : 'Entrant',
						iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						filters : {
							type : 'inbound',
							state : null
						},
						children : [
							{
								id : 'incoming!delivering',
								text : 'Distribution',
								title : 'Entrant en distribution',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['delivering'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'delivering'
								}
							},
							{
								id : 'incoming!processing',
								text : 'Traitement',
								title : 'Entrant en traitement',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processing'
								}
							},
							{
								id : 'incoming!processed',
								text : 'Traité',
								title : 'Entrant traité',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processed'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processed'
								}
							}
						]
					},
					{
						id : 'outgoing',
						text : 'Sortant',
						title : 'Sortant',
						iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						filters : {
							type : 'outbound',
							state : null
						},
						children : [
							{
								id : 'outgoing!processing',
								text : 'Elaboration',
								title : 'Sortant en élaboration',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processing'
								}
							},
							{
								id : 'outgoing!validating',
								text : 'Validation',
								title : 'Sortant en validation',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['validating!processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'validating!processed'
								}
							},
							{
								id : 'outgoing!sending',
								text : 'Envoi',
								title : 'Sortant en envoi',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['sending'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'sending'
								}
							},
							{
								id : 'outgoing!processed',
								text : 'Traité',
								title : 'Sortant traité',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processed'
								}
							}
						]
					}
//					{
//						id : 'copies',
//						text : 'Copies',
//						title : 'Copies',
//						iconCls : Yamma.Constants.getIconDefinition('page_white_stack').iconCls,
//						leaf : true,
//						filters : {
//							type : 'copy!inbound'
//						}
//						
//					}
				]
			}
		});
		
		return treeStore;
		
	}
	
});