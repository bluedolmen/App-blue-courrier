Ext.define('Yamma.view.mails.ServiceFiltersCombo', {

	extend : 'Ext.ux.TreePicker',
	alias : 'widget.servicefilterscombo',
	
    name: 'serviceFilter',
    autoScroll: true,
    width : 150,
    labelWidth : 50,
    displayField : 'title',
    
    grow : true,
    fieldLabel: i18n.t('view.mails.servicefilters.treestore.fieldLabel'),
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
				text : '<b>'+i18n.t('view.mails.servicefilters.treestore.root.text')+'</b>',
				iconCls : Yamma.Constants.getIconDefinition('cog_email').iconCls,
				filters : {
					type : null,
					state : null
				},
				children : [
					{
						id : 'incoming',
						text : i18n.t('view.mails.servicefilters.treestore.incoming.text'),
						title : i18n.t('view.mails.servicefilters.treestore.incoming.text'),
						iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						filters : {
							type : 'inbound',
							state : null
						},
						children : [
							{
								id : 'incoming!delivering',
								text : i18n.t('view.mails.servicefilters.treestore.incoming-delivering.text'),
								title : i18n.t('view.mails.servicefilters.treestore.incoming-delivering.title'),
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['delivering'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'delivering'
								}
							},
							{
								id : 'incoming!processing',
								text : i18n.t('view.mails.servicefilters.treestore.incoming-processing.text'),
								title : i18n.t('view.mails.servicefilters.treestore.incoming-processing.title'),
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processing'
								}
							},
							{
								id : 'incoming!processed',
								text : i18n.t('view.mails.servicefilters.treestore.incoming-processed.text'),
								title : i18n.t('view.mails.servicefilters.treestore.incoming-processed.title'),
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
						text : i18n.t('view.mails.servicefilters.treestore.outgoing.text'),
						title : i18n.t('view.mails.servicefilters.treestore.outgoing.text'),
						iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						filters : {
							type : 'outbound',
							state : null
						},
						children : [
							{
								id : 'outgoing!processing',
								text : i18n.t('view.mails.servicefilters.treestore.outgoing-processing.text'),//'Elaboration',
								title : i18n.t('view.mails.servicefilters.treestore.outgoing-processing.title'),//'Sortant en élaboration',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processing'
								}
							},
							{
								id : 'outgoing!validating',
								text : i18n.t('view.mails.servicefilters.treestore.outgoing-validating.text'),//'Validation',
								title : i18n.t('view.mails.servicefilters.treestore.outgoing-validating.title'),//'Sortant en validation',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['validating!processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'validating!processed'
								}
							},
							{
								id : 'outgoing!sending',
								text : i18n.t('view.mails.servicefilters.treestore.outgoing-sending.text'),//'Envoi',
								title : i18n.t('view.mails.servicefilters.treestore.outgoing-sending.title'),//'Sortant en envoi',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['sending'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'sending'
								}
							},
							{
								id : 'outgoing!processed',
								text : i18n.t('view.mails.servicefilters.treestore.outgoing-processed.text'),//'Traité',
								title : i18n.t('view.mails.servicefilters.treestore.outgoing-processed.title'),//'Sortant traité',
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