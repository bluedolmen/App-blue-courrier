Ext.define('Yamma.view.comments.PromptDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.promptcommentdialog',
	
	uses : [
	    'Ext.form.field.HtmlEditor'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('comment_add').icon,
		ICON_CANCEL : Yamma.Constants.getIconDefinition('cancel').icon,
		COMMENT_POST : 'alfresco://api/node/{nodeRef}/comments',
		PEOPLE_GET : 'alfresco://bluedolmen/yamma/datasource/ServicePeople/data',
		OPERATION_ADD : 'ADD',
		OPERATION_EDIT : 'EDIT'
	},
	
	title : i18n.t('view.comments.promptdialog.title'),
	width : 500,
	height : 300,
	modal : true,
	
	operation : 'ADD',
	nodeRef : null,
	comment : null, // preset comment
	permissions : null, // preset permissions
	
	layout : 'border',
	
	defaults : {
		margin : 5,
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initComponent : function() {
		
		var
		
			me = this,
			
			presetActors = me.permissions && false === me.permissions.inherits ? 
				Ext.Array.map(me.permissions.details || [], function(perm) {
					if (true !== perm.allowed) return;
					
					return {
						id : perm.authority,
						title : perm.authorityDisplayName
					};
				})
				: []
			,
			
			actorsStore = Ext.create('Ext.data.Store', {
			    storeId:'actorsStore',
			    fields:[
					'id', 
					'title'
				],
			    data:{'items': presetActors},
			    proxy: {
			        type: 'memory',
			        reader: {
			            type: 'json',
			            root: 'items'
			        }
			    }

			}),
			
			currentUserName = Bluedolmen.Alfresco.getCurrentUserName()
			
		;
		
		if (!this.nodeRef) {
			Ext.Error.raise(i18n.t('view.comments.promptdialog.errors.invalidnoderef'));
		}
		
		function isSetAsActor(id) {
			
			return -1 != actorsStore.findExact('id', id);
			
		}
		
	    function addActorChecked(id, title) {
	    	
	    	if (isSetAsActor(id)) return;
	    	if (id == currentUserName) return; // do not add the current actor
	    	
			actorsStore.add({
				id : id,
				title : title
			});
			
			me.fireEvent('actorschanged', id);
	    	
	    }
	    
	    function removeActorChecked(id) {
	    	
	    	var record = id;
	    	
	    	if (Ext.isString(id)) {
		    	if (!isSetAsActor(id)) return;
		    	record = actorsStore.findRecord('id', id);
	    	}
	    	
	    	actorsStore.remove(record);	    		
	    	me.fireEvent('actorschanged', record.getId());
	    	
	    }
	    		
		this.htmlEditor = Ext.create('Ext.form.field.HtmlEditor', {
			value : me.comment ? me.comment : null,
	    	region : 'center',
	    	flex : 1			
		});
		
		this.personCombo = Ext.create('Ext.form.field.ComboBox', {
			
			minChars : 3,
		    labelWidth : 30,
		    queryMode: 'remote',
		    queryParam: 'filter',
		    displayField : 'displayName',
		    valueField: 'userName',
		    hideTrigger : true,
		    grow : true,
		    fieldLabel: '&nbsp',
		    labelSeparator : '',
		    labelClsExtra : Yamma.Constants.getIconDefinition('user_add').iconCls,
		    labelStyle : 'background-repeat:no-repeat ; background-position:center',
		    
		    listConfig: {
				loadingText: i18n.t('view.comments.promptdialog.personCombo.listconfig.loadingtext'),
				emptyText: i18n.t('view.comments.promptdialog.personCombo.listconfig.emptyText')
			},
			
			store : Ext.create('Bluedolmen.store.PersonStore'),
			
			listeners : {
				
				select : function(combo, records, e) {
					
					if (records.length == 0) return;
					
					var 
						firstRecord = records[0],
						userName = firstRecord.get('userName'),
						displayName = firstRecord.get('displayName')
					;
					
					combo.clearValue();
					addActorChecked(userName /* id */, displayName /* title */);
					
				}
				
			},
			
			margin : '2px 2px 2px 0px'
			
		});
		
		this.actorsGrid = Ext.create('Ext.grid.Panel', {
			
		    title: i18n.t('view.comments.promptdialog.actorsgrid.title'),
		    header : false,
		    hideHeaders : true,
		    store: actorsStore,
		    flex : 1,
		    border : 0,
		    
		    columns: [
		        { 
		        	text: i18n.t('view.comments.promptdialog.actorsgrid.columns.title.text'),
		        	dataIndex: 'title', 
		        	flex: 1 
		        },
		        {
		        	text : i18n.t('view.comments.promptdialog.actorsgrid.columns.actioncolumn.text'),
		        	xtype : 'actioncolumn',
		        	width : 30,
		        	items: [
						{
			                iconCls: Yamma.Constants.getIconDefinition('cross').iconCls,
			                tooltip: i18n.t('view.comments.promptdialog.actorsgrid.columns.actioncolumn.items.remove.tooltip'),
			                handler: function(grid, rowIndex, colIndex) {
			                	
			                    var record = grid.getStore().getAt(rowIndex);
			                	removeActorChecked(record);
			                	
			                }
			            }
		        	]
		        	
		        }
		        
		    ]
		
		});
		
		this.items = [
		    this.htmlEditor,
			{
				xtype : 'panel',
				collapsible : true,
				collapsed : true,
				region : 'east',
				width : 180,
				title : i18n.t('view.comments.promptdialog.actorsgrid.items.htmlEditor.title'),
				layout : 'vbox',
				align : 'stretch',
				pack : 'center',
				defaults : {
					width : '100%',
					border : 0
				},
				items : [
					this.personCombo,
					this.actorsGrid
				]
			}
		];
		
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { 
		    	minWidth: Ext.panel.Panel.minButtonWidth 
		    },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'comment-button',
		        	text: i18n.t('view.comments.promptdialog.actorsgrid.dockedItems.items.comment-button.text'),
		        	icon : Yamma.view.comments.PromptDialog.ICON,
		        	handler : function() {
		        		
		        		var
		        			message = me.htmlEditor.getValue(),
		        			privateActors = Ext.Array.map(actorsStore.getRange(), function(authority) {
		        				return authority.get('id');
		        			})
		        		;
		        		
		        		if (Yamma.view.comments.PromptDialog.OPERATION_ADD == me.operation) {
		        			me.addDocumentComment(message, privateActors);
		        		}
		        		else if (Yamma.view.comments.PromptDialog.OPERATION_EDIT == me.operation) {
		        			me.editDocumentComment(message, privateActors);
		        		}
		        		
		        		
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: i18n.t('view.comments.promptdialog.actorsgrid.dockedItems.items.cancel-button.text'),
		        	icon : Yamma.view.comments.PromptDialog.ICON_CANCEL,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
		this.callParent();
		
	},
	
	addDocumentComment : function(message, privateActors) {
		
		if (!message || !message.trim()) return;
		
		var
			me = this,
			nodeRef = me.nodeRef,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				'alfresco://bluedolmen/node/' + nodeRef.replace(/:\//,'') + '/comments'
			)
		;
		
		me.setLoading(true);
		
		Bluedolmen.Alfresco.jsonRequest({
			
			method : 'POST',
			
			url : url,
			
			dataObj : {
				
				nodeRef : nodeRef,
				content : message,
				permissions : privateActors
				
			},
			
			onSuccess : function() {
				
				me.fireEvent('success');
				me.close();
				
			},
			
			'finally' : function() {
				
				me.setLoading(false);
				
			}
			
		});	
		
	},
	
	editDocumentComment : function(message, privateActors) {
		
		var
			me = this,
			nodeRef = me.nodeRef,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				'alfresco://bluedolmen/comment/node/' + nodeRef.replace(/:\//,'')
			)
		;
		
		me.setLoading(true);
		
		Bluedolmen.Alfresco.jsonRequest({
			
			method : 'PUT',
			
			url : url,
			
			dataObj : {
				
				nodeRef : nodeRef,
				content : message,
				permissions : privateActors
				
			},
			
			onSuccess : function() {
				
				me.fireEvent('success');
				me.close();
				
			},
			
			'finally' : function() {
				
				me.setLoading(false);
				
			}
			
		});	
		
	},
	
	show: function() {
				
		this._validateOperation();
		this.callParent();
		
	},
	
	/**
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this
		;
				
		function isValid() {
			return true;
		}
		
		this._setCanComment(isValid());
	},
	
	_setCanComment : function(canComment) {
		
		var commentButton = this.queryById('comment-button');
		commentButton.setDisabled(!canComment);
		
	}
	
});