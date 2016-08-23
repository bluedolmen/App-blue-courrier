Ext.define('Yamma.view.windows.LinkToWindow', {

	extend : 'Ext.window.Window',
	
	requires : [
	],
	
	title : i18n.t('view.window.linktowindow.title'),//'Créer un lien',
	layout : 'fit',
	
	height : 400,
    width : 600,
    
    config : {
    	documentNodeRef : null
    },
	
	defaults : {
		width : '100%',
		margin : '10'
	},
	
	initComponent : function() {
		
		var
			me = this,
			documentNodeRef = this.getDocumentNodeRef()
		;
		if (!documentNodeRef) {
			Ext.Error.raise(i18n.t('view.window.linktowindow.errors.noderef'));
		}
		
		this.items = this._getItems();
		
		this.buttons = [
			{
				text : i18n.t('view.window.linktowindow.buttons.link'),//'Associer',
				itemId : 'link-button',
				iconCls : Yamma.Constants.getIconDefinition('link').iconCls,
				handler : this.onLinkClick,
				disabled : true,
				scope : this
				
			},
			{
				text : i18n.t('view.window.linktowindow.buttons.cancel'),//'Annuler',
				itemId : 'cancel-button',
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	        	handler : function() {
	        		me.close();
	        	},
				scope : this
			}
		];		
		
		this.callParent();
		
		Ext.defer(this.updateOpenSearchFilters, 100, this);
		
	},
	
	_getItems : function() {
		
		var
			me = this,
		
			linkTypeStore = Ext.create('Ext.data.Store', {
			    fields: ['id', 'title', 'filter'],
			    data : [
			        {
			        	"id" : "reply-to", 
			        	"title" : i18n.t('view.window.linktowindow.items.reply-to'),//"une réponse à",
			        	"filter" : { name : 'kind', value : 'outbound'}
			        }
			    ]
			}),
			
			linkTypeCombo = Ext.create('Ext.form.ComboBox', {
				itemId : 'linktype',
				fieldLabel : i18n.t('view.window.linktowindow.items.linktype'),//'Ce courrier est',
				store : linkTypeStore,
				queryMode : 'local',
				valueField : 'id',
				displayField : 'title',
				allowBlank : false,
				autoSelect : true,
				forceSelection : true,
				originalValue : "reply-to"
			}),
			
			searchCombo = Ext.create('Yamma.view.header.OpenSearch', {
				itemId : 'target-document',
				fieldLabel :  i18n.t('view.window.linktowindow.items.target'),//'Courrier',
			    labelClsExtra : null,
			    labelWidth : 100,
			    forceSelection : true,
				allowBlank : false,
			    autoSelect : true,
			    anchor : '100%',
			    displayField : 'textDisplay'
			    
			}),
		
			items  = [
			          
				linkTypeCombo,

				searchCombo,
				
				{
					xtype : 'textareafield',
					itemId : 'comment',
					grow : true,
					name : 'comment',
					fieldLabel : i18n.t('view.window.linktowindow.items.comment'),//'Commentaire',
					anchor : '100%'
			    }
			          
			]
		;
		
		linkTypeCombo.on('select', function() {
			me.updateOpenSearchFilters();
		});
		linkTypeCombo.setValue('reply-to');
		
		searchCombo.on('select', function() {
    		var linkToButton = me.queryById('link-button');
    		linkToButton.setDisabled(false);	
		});
		
		return [
			Ext.create('Ext.form.Panel', {
				bodyPadding : 10,
				defaults : {
					margin : '5 0 5 0'
				},
				items : items
			})
		];
		
	},
	
	updateOpenSearchFilters : function() {
		
		var 
			linkTypeCombo = this.queryById('linktype'),
			targetDocumentCombo = this.queryById('target-document'),
			linkType = linkTypeCombo.findRecord(linkTypeCombo.getValue())
		;
		
		if (null == linkType) return;
		var filter = linkType.get('filter');
		
		var store = targetDocumentCombo.getStore();
		if (null == store) return;
		
		store.clearFilter(true);
		store.addFilter({
			property : filter.name,
			value : filter.value
		}, false);
		
	},
	
	getLinkType : function() {
		
		var linkTypeCombo = this.queryById('linktype');
		return linkTypeCombo.getValue();
		
	},	
	
	getTargetDocument : function() {
		
		var targetDocumentCombo = this.queryById('target-document');
		return targetDocumentCombo.getValue();
		
	},
	
	getComment : function() {
		
		var commentTextArea = this.queryById('comment');
		return commentTextArea.getValue();
		
	},
	
	onLinkClick : function(button) {
		
		var
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/link-to'),
			targetRef = this.getTargetDocument(),
			linkType = this.getLinkType()
		;
		
		this.setLoading(true);
		
		Bluedolmen.Alfresco.jsonPost({
			
			url : url,
			
			dataObj : {
				nodeRef : this.documentNodeRef,
				targetRef : targetRef,
				linkType : linkType
			},
			
			onSuccess : function(response, options) {
				me.setLoading(false);
				me.onSuccess();
			},
			
			onFailure : function(response, options) {
				me.setLoading(false);
				Bluedolmen.Alfresco.genericFailureManager(response);
			}
			
		});
		
	},
	
	onSuccess : function() {
		
	}
	
});