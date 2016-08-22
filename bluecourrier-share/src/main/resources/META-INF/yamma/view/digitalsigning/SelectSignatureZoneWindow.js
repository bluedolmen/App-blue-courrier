Ext.define('Yamma.view.digitalsigning.SelectSignatureZoneWindow', {

	extend : 'Ext.window.Window',
	
	WS_PAGE_PREVIEW_URL : 'alfresco://bluedolmen/digital-signing/page-preview?nodeRef={nodeRef}&pageNumber={pageNumber}&resolution=144',
	
	requires : [
		'Yamma.utils.SignatureUtils'
	],
	
	statics : {
	},
	
	title : i18n.t('view.dialog.digitalsigning.selectsignaturezonewindow.title'),
	iconCls : Yamma.Constants.getIconDefinition('shape_handles').iconCls,
	layout : 'fit',
	
	height : window.innerHeight || 450,
    width : 400,
    
    config : {
    },
	
	defaults : {
		width : '100%',
		margin : '10'
	},
	
	initialValues : {
		pageNumber : -1,
		posX : -1,
		posY : -1,
		rectW : -1,
		rectH : -1
	},
	
	nodeRef : null,
	pixelsPerUnit : -1,
	
	initComponent : function() {
		
		this.width = this.height * 0.75; // ratio for A paper series is 0.707 (1/2^(0.5))
		
		if (null == this.nodeRef) {
			throw new Error(i18n.t('view.dialog.digitalsigning.selectsignaturezonewindow.errors.node-init'),);
		}
		
		var
			me = this
		;
		
		this.items = this._getItems();
		
		this.dockedItems = [
			{
		        xtype: 'toolbar',
		        dock: 'top',
		        items: [
					'->',
					{
					    xtype: 'numberfield',
					    fieldLabel: 'Page',
					    name: 'pageNumber',
					    itemId : 'pageNumber',
					    value: 1,
					    minValue: 1,
					    maxValue: 1,
					    labelWidth : 30,
					    labelAlight : 'right',
					    width : 90,
					    listeners : {
					    	'change' : function(cmp, newValue) {
					    		me.loadPage(newValue /* pageNumber */);
					    	}
					    }
					},
					'->',
		            {
		                xtype: 'fieldcontainer',
		                fieldLabel: '&nbsp;',
		                combineErrors: true,
		                msgTarget: 'under',
		                anchor: '100%',
		                layout: {
		                    type: 'hbox',
		                    defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
		                },                
		                defaults: {
		                	labelWidth : 15,
		                	labelAlign : 'right',
		                    width : 60,
		                    readOnly : true
		                },
		                items: [
							{
								xtype : 'textfield',
								fieldLabel : 'x',
								itemId : 'posX',
								fieldStyle: 'text-align: right;'
							},
							{
								xtype : 'displayfield',
								value : 'mm',
								width : 30
							},
							{
								xtype : 'textfield',
								fieldLabel : 'y',
								itemId : 'posY',
								fieldStyle: 'text-align: right;'
							},
							{
								xtype : 'displayfield',
								value : 'mm',
								width : 30
							},
							{
								xtype : 'textfield',
								fieldLabel : 'l',
								itemId : 'rectW',
								fieldStyle: 'text-align: right;'
							},
							{
								xtype : 'displayfield',
								value : 'mm',
								width : 30
							},
							{
								xtype : 'textfield',
								fieldLabel : 'h',
								itemId : 'rectH',
								fieldStyle: 'text-align: right;'
							},
							{
								xtype : 'displayfield',
								value : 'mm',
								width : 30
							}
						]
		            }
					
				]
		    }
		];
		
		this.buttons = [
			{
				text : i18n.t('view.dialog.digitalsigning.selectsignaturezonewindow.buttons.select-button.title'),
				itemId : 'select-button',
				tooltip : i18n.t('view.dialog.digitalsigning.selectsignaturezonewindow.buttons.select-button.tooltip'),
				iconCls : me.iconCls,
				handler : me.onSelectClick,
				scope : this
			},
			{
				text : i18n.t('view.dialog.digitalsigning.selectsignaturezonewindow.buttons.cancel-button.title'),
				itemId : 'cancel-button',
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	        	handler : function() {
	        		me.close();
	        	},
				scope : this
			}
		];		
		
		this.on('change', function(field, newValue, oldValue, eOpts) {
			me.loadPage(newValue);
		});
		
		this.on('afterrender', function() {
			Ext.Array.forEach(['posX','posY','rectW','rectH'], function(prop) {
				me[prop] = me.queryById(prop);
			});
			me.loadPage(me.initialValues.pageNumber > 0 ? me.initialValues.pageNumber : 1);
		});
		
		this.callParent();
		
		me.imagePreview = this.queryById('image-preview');
		
	},
	
	loadPage : function(pageNumber) {
		
		var
			me = this
		;
		
		this.setLoading(true);
		
		Yamma.utils.SignatureUtils.loadPageInformation(
			me.nodeRef,
			pageNumber, 
			function onSuccess(pageInformation) {
				me.pageInformation = pageInformation;
				updateNumberOfPages(); // TODO: makes extra updates
				me.loadPageImage(pageNumber);
			},
			function finally_() {
				me.setLoading(false);
			}
		);
		
		function updateNumberOfPages() {
			
			if (null != me._pageNumber) return; // already initialized
			
			var 
				pageNumberField = me.queryById('pageNumber'),
				maxPageNumber = me.pageInformation.numberOfPages
			;
			
			pageNumberField.setMaxValue(maxPageNumber);
			
			me._pageNumber = maxPageNumber;
			
		}		
		
	},
	
	loadPageImage : function(pageNumber) {

		var 
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				me.WS_PAGE_PREVIEW_URL
					.replace(/\{nodeRef\}/, me.nodeRef)
					.replace(/\{pageNumber\}/, pageNumber)
			)
		;
		
		me.imagePreview.setLoading(true);
		me.imagePreview.setSrc(url);
			
	},
	
	_getItems : function() {
		
		var
			me = this,
			
			wrappedImage = Ext.create('Ext.Img', {
				itemId : 'image-preview',
				border : 2,
				flex : 1,
				style : {
					borderColor : 'gray',
					borderStyle : 'solid',
					backgroundColor : 'white'
				},
				width : '100%',
				listeners : {
					load : {
						element : 'el',
						fn : function(el) {
							me.updatePageDimension();
							me.showSelectionArea();							
							me.updatePosition();
							me.updateSize();
							me.imagePreview.setLoading(false);
						}
					}
				}				
			})
			
		;
		
		return [
			{
				xtype : 'container',
				itemId : 'display-area',
				width : '100%',
				flex : 1,
				overflowY : 'auto',
				items : [wrappedImage]
			}
		];
		
	},
	
//	_updateFromFields : function() {
//		
//		var
//			posXmm = Number(me['posX'].getValue() || -1),
//			posYmm = Number(me['posY'].getValue() || -1),
//			rectWmm = Number(me['rectX'].getValue() || -1),
//			rectHmm = Number(me['rectX'].getValue() || -1)
//		;
//		
//		if (poxXmm > 0 && posYmm > 0) {
//			me.selectionArea.setPosition(
//				Yamma.utils.SignatureUtils.millimetersToUnits(posXmm),
//				Yamma.utils.SignatureUtils.millimetersToUnits(posYmm)
//			);			
//		}
//			
//		if (rectWmm > 0 && rectHmm > 0) {
//			me.selectionArea.setSize(
//				Yamma.utils.SignatureUtils.millimetersToUnits(rectWmm),
//				Yamma.utils.SignatureUtils.millimetersToUnits(rectHmm)
//			);			
//		}
//		
//	},
	
	updatePageDimension : function() {
		
		var
			me = this,
			imagePreview = me.queryById('image-preview')
		;
		if (!imagePreview) return;
		
		var
			size = imagePreview.getSize(),
			page = me.pageInformation ? me.pageInformation.page : null
		;
		
		if (!page) return;
		
		this.heightInPixels = size.height;
		this.pixelsPerUnit = 1. * this.heightInPixels /* pixels */ / page.height /* units */;
		
	},
	
	_updateValue : function(fieldName, valueInPixels) {
		
		this[fieldName].setValue(
			Yamma.utils.SignatureUtils.pixelsToMillimeters(
				valueInPixels, 
				this.pixelsPerUnit
			) // + ' mm'
		);
		
	},
	
	updatePosition : function() {
		
		if (null == this.selectionArea) return;
		
		var 
			me = this,
			position = me.selectionArea.getPosition(true /* local */),
			size = me.selectionArea.getSize()
		;
		
		me._updateValue('posX', position[0]);
		me._updateValue('posY', this.heightInPixels - position[1] - size.height); // translate to the pdf referential (bottom-left origin)
		
	},
	
	updateSize : function() {
		
		if (null == this.selectionArea) return;
		
		var
			me = this,
			size = me.selectionArea.getSize()
		;
		
		me._updateValue('rectW', size.width);
		me._updateValue('rectH', size.height);
		
	},
	
	showSelectionArea : function() {
		
		if (this.pixelsPerUnit < 0) return; // not loaded yet
		if (null != this.selectionArea) return;
		
		var
			me = this,
			displayArea = this.queryById('display-area'),
			width = me.initialValues.rectW > 0 ? Yamma.utils.SignatureUtils.millimetersToPixels(me.initialValues.rectW, me.pixelsPerUnit) : 100,
			height = me.initialValues.rectH > 0 ? Yamma.utils.SignatureUtils.millimetersToPixels(me.initialValues.rectH, me.pixelsPerUnit) : 50,
			posX = me.initialValues.posX > 0 ? Yamma.utils.SignatureUtils.millimetersToPixels(me.initialValues.posX, me.pixelsPerUnit) : -1,
			posY = me.initialValues.posX > 0 ? Yamma.utils.SignatureUtils.millimetersToPixels(me.initialValues.posY, me.pixelsPerUnit) : -1
		;
				
		me.selectionArea = Ext.create('Ext.draw.Component', {
	        width: width,
	        height: height,
	        cls: 'cursor-dragme',
	        draggable: {
	            constrain: true,
	            constrainTo: displayArea.getEl(),
	            listeners : {
	            	'mousemove' : function(comp, e, eOpts) {
	            		me.updatePosition();
	            	}
	            }
	        },
	        resizable : {
		        pinned :true,
		        minWidth :50,
		        minHeight : 50,
		        transparent : true,
		        listeners : {
		        	'resize' : function(resizer, width, height) {
		        		me.updateSize();
		        		me.updatePosition();
		        	}
		        }
	        },
	        border: 2,
	        style: {
	            borderColor: 'red',
	            borderStyle: 'dotted'
	        },
	        floating: true,
	        renderTo : displayArea.getEl()
		});
		
		if (posX > 0 && posY > 0) {
			me.selectionArea.setPosition(posX, posY);
		}
		
		me.selectionArea.show(); // bring to front
		
	},
	
	updateAvailableButtons : function() {
		
		var
			selectButton = this.queryById('select-button')
		;
		
		selectButton.setDisabled(false);
		
	},
	
	onSelectClick : function(button) {
		
		
	}
	
	
});