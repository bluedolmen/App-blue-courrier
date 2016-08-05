Ext.define('Yamma.view.digitalsigning.SignDocumentPanel', {
	
	extend : 'Ext.form.Panel',
	alias : 'widget.signdocumentpanel',
	
	requires : [
	    'Yamma.utils.SignatureUtils',
		'Yamma.view.digitalsigning.SelectSignatureZoneWindow'
	],
	
	WS_DS_IMAGE_URL : 'alfresco://bluedolmen/digital-signing/signature/image',
	WD_DS_SIGNATURE_URL : 'alfresco://bluedolmen/digital-signing/signature',
	
	title: 'Certification du document',

	/**
	 * @config
	 */
	nodeRef : null,
	showPositioning : true,
	hideButtons : false,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	frame : true, // framed to avoid the blank background and border style set to 0 to avoid the double border with the window one
	
	defaults : {
		width : '100%',
		padding : 4
	},		    
	
	keyType : "",
	keyAlias : "",
	keySubject : "",
	keyFirstValidity : "",
	keyLastValidity : "",
	hasImage : false,
	
	initComponent : function() {
		
		var 
			me = this,
			items = [
			    {
			    	xtype : 'fieldset',
			    	title : 'Informations',
			    	flex : 1,
					margin : 5,
					padding : 5,
			    	items : [
	    				{
	    					xtype : 'signaturedisplaybox',
	    					itemId : 'signature-information',
	    					signatureMissingMessage : "<strong>Pas encore de signature.</strong><br/>" + 
	    						"Merci d'en ajouter une en utilisant le panneau de gestion de la signature électronique"
	    					,
	    					listeners : {
	    						'signatureavailable' : function(keyDescr) {
	    							me.queryById('signature-available').setValue(keyDescr['keyAlias']);
	    						}
	    					}
	    				},
	    				{
	    					xtype : 'textfield',
	    					itemId : 'signature-available',
	    					value : '',
	    					allowBlank : false
	    				}
					]
			    },
				
				{
					xtype : 'textfield',
					name : 'password',
					inputType : 'password',
					fieldLabel : 'Mot de passe',
					allowBlank : false
				},
				
				{
					xtype : 'textfield',
					name : 'location',
					fieldLabel : 'Localisation',
					allowBlank : true
				},

				{
					xtype : 'textfield',
					name : 'reason',
					fieldLabel : 'Raison',
					allowBlank : true
				},			    
			    
				{
					xtype : 'fieldset',
					title : 'Positionnement',
					hidden : false === me.showPositioning,
					layout : 'anchor',
					height : 250,
					margin : 5,				
					padding : 5,
					defaults : {
						anchor : '100%',
						hideEmptyLabel: false,
						hideLabel : true
					},
					items : [
						{
							xtype : 'radio',
							checked : true,
							fieldLabel : 'Type',
							boxLabel : 'Non visible',
							inputValue : 'NONE',
							name : 'signature-location',
							itemId : 'location_not-visible'
						},
						{
			                xtype: 'fieldcontainer',
			                layout: {
			                    type: 'vbox'
			                },
			                items: [
		    					{
		    						xtype : 'radio',
		    						boxLabel : 'Champ',
		    						inputValue : 'FIELD',
		    						name : 'signature-location',
									hideLabel : true,
		    						hideEmptyLabel: false,
		    						itemId : 'location_field',
		    						listeners : {
		    							'change' : function(cmp, newValue) {
		    								
		    								var fieldNameField = me.queryById('field-name');
		    								fieldNameField.setDisabled(!newValue);		    								
		    								fieldNameField.allowBlank = !newValue;
		    								fieldNameField.validate();
	    									
		    							}
		    						}
		    					},
								{
									xtype : 'textfield',
									itemId : 'field-name',
									fieldLabel : 'Nom du champ',
									name : 'field-name',
									margin : '0 0 6 20',
					                disabled : true,
					                allowBlank : false
								}
			                ]						
						},
						{
			                xtype: 'fieldcontainer',
			                layout: {
			                    type: 'hbox'
			                },
			                items: [
		    					{
		    						xtype : 'radio',
		    						boxLabel : 'Page',
		    						inputValue : 'PAGE_NB',
		    						name : 'signature-location',
									hideLabel : true,
		    						hideEmptyLabel: false,
		    						disabled : null == me.nodeRef,
		    						itemId : 'location_page',
		    						listeners : {
		    							'change' : function(cmp, newValue) {
	    									me.queryById('page-parameters').setDisabled(!newValue);
	    									
	    									Ext.Array.forEach(['posX','posY','rectW','rectH'], function(fieldName) {
			    								var field = me.queryById(fieldName);
			    								field.setDisabled(!newValue);		    								
			    								field.allowBlank = !newValue;	    										
			    								field.validate();
	    									});
	    									
		    							}
		    						}	    						
		    					}
			                ]						
						},
						{
			                xtype: 'fieldcontainer',
			                itemId : 'page-parameters',
			                disabled : true,
			                layout: {
			                    type: 'vbox'
			                },
			                defaults : {
								margin : '0 0 6 20'
			                },
			                items: [
								{
									xtype : 'numberfield',
									fieldLabel : 'Num.',
									name : 'page-number',
									itemId : 'pageNumber',
								    value: 1,
								    minValue: 1,
								    maxValue: 1,
								    labelWidth : 30,
								    width : 90
								},
		    		            {
		    		                xtype: 'fieldcontainer',
		    		                fieldLabel: 'Position (mm)',
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
		    		                    width : 90,
		    		                    xtype :  'numberfield',
		    		                    minValue : 0,
		    		                    hideTrigger : true,
		    		                    decimalSeparator : '.',
		    		                    decimalPrecision : 2,
		    		                    value : 0
		    		                },
		    		                items: [
		    							{
		    								fieldLabel : 'x',
		    								itemId : 'posX',
		    								name : 'posX'
		    							},
		    							{
		    								fieldLabel : 'y',
		    								itemId : 'posY',
		    								name : 'posY'
		    							}
		    		                ]
		    		            },
		    		            {
		    		                xtype: 'fieldcontainer',
		    		                fieldLabel: 'Taille (mm)',
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
		    		                    width : 90,
		    		                    xtype :  'numberfield',
		    		                    minValue : 1,
		    		                    hideTrigger : true,
		    		                    decimalSeparator : '.',
		    		                    decimalPrecision : 2
		    		                },
		    		                items: [
		    							{
		    								fieldLabel : 'l',
		    								itemId : 'rectW',
		    								name : 'rectW',
		    								value : 50
		    							},
		    							{
		    								fieldLabel : 'h',
		    								itemId : 'rectH',
		    								name : 'rectH',
		    								value : 20
		    							}
		    		                ]
		    		            },
		    					{
		    						xtype : 'button',
		    						text : 'Sélectionner',
		    						iconCls : Yamma.Constants.getIconDefinition('shape_handles').iconCls,
		    						handler : function() {
		    							
		    							var selectionWindow = Ext.create('Yamma.view.digitalsigning.SelectSignatureZoneWindow', {
		    								nodeRef : me.nodeRef,
		    								initialValues : {
		    									pageNumber : me.queryById('pageNumber') || 1,
		    									posX : Number(me.queryById('posX').getValue() || -1),
		    									posY : Number(me.queryById('posY').getValue() || -1),
		    									rectW : Number(me.queryById('rectW').getValue() || -1),
		    									rectH : Number(me.queryById('rectH').getValue() || -1)
		    								},
		    								onSelectClick : function(button) {
		    									
		    									Ext.Array.forEach(['pageNumber', 'posX','posY','rectW','rectH'], function(prop) {	
		    										var value = selectionWindow.queryById(prop).getValue();
		    										if (Ext.isString(value)) {
		    											value = value.replace(/[^0-9\.]/g,'');
		    										}
		    										me.queryById(prop).setValue(value);
		    									});
		    									selectionWindow.close();
		    									
		    								}
		    							});
		    							
		    							selectionWindow.show();
		    							
		    						}
		    					}	    		            
			                ]						
						},
						
			            
					]
				}

			]
		;
		
		this.items= items;
		
		if (true !== this.hideButtons) {
			this.buttons = this.getButtons();
			this.enableBubble('click');
		} 
			
		me.on('render', function() {
			
			me.queryById('signature-information').load();
			
		});
		
		this.callParent();
		
		(function loadPageInformation() {
			
			if (null == me.nodeRef) return;
			
			me.setLoading(true);
			
			Yamma.utils.SignatureUtils.loadPageInformation(
				me.nodeRef, 
				null,
				function onSuccess(pageInformation) {
					me.pageInformation = pageInformation;
					me.queryById('pageNumber').setMaxValue(pageInformation.numberOfPages);
				},
				function finally_() {
					me.setLoading(false);
				}
			);
			
		})();
		
	},
	
	getButtons: function() {
		
		return [
		        
    		{
    			xtype : 'button',
    			text : 'Signer',
    			tooltip : 'Apposer sa signature pour certifier le document',
    			iconCls : Yamma.Constants.getIconDefinition('rosette').iconCls,
    			operation : 'sign',
    			handler : this._onClick,
    			scope : this,
    			formBind : true
    		}
		        
		];
		
	},	
	
	_onClick : function(button) {
		this.fireEvent('click', button.operation, button);		
	}
	
});
