Ext.define('Yamma.view.windows.AssignToWindow', {

	extend : 'Ext.window.Window',
	
	requires : [
	],
	
	statics : {
		TASK_ASSIGN_URL : 'alfresco://bluedolmen/workflows/assign/{taskId}'
	},
	
	title : '(Ré)assigner une tâche',
	layout : 'fit',
	
	height : 400,
    width : 400,
    
    config : {
    	taskId : null
    },
	
	defaults : {
		width : '100%',
		margin : '10'
	},
	
	initComponent : function() {
		
		var
			me = this,
			taskId = this.getTaskId()
		;
		if (!taskId) {
			Ext.Error.raise('IllegalStateException! The window has to be initialized with a valid task-id');
		}
		
		this.items = this._getItems();
		
		this.buttons = [
			{
				text : 'Assigner',
				itemId : 'assign-button',
				tooltip : "(Ré-)assigner la tâche à la personne sélectionnée",
				iconCls : Yamma.Constants.getIconDefinition('link').iconCls,
				handler : this.onAssignClick,
				disabled : true,
				scope : this
				
			},
			{
				text : 'Relâcher',
				itemId : 'release-button',
				tooltip : "Relâcher la tâche et l'affecter à tous les intervenants disponibles",
				iconCls : Yamma.Constants.getIconDefinition('link').iconCls,
				handler : this.onReleaseClick,
				disabled : true,
				scope : this
				
			},
			{
				text : 'Annuler',
				itemId : 'cancel-button',
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	        	handler : function() {
	        		me.close();
	        	},
				scope : this
			}
		];		
		
		this.callParent();
		
//		Ext.defer(this.updateOpenSearchFilters, 100, this);
		
	},
	
	_getItems : function() {
		
		var
			me = this,
			
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
					Yamma.view.windows.AssignToWindow.TASK_ASSIGN_URL.replace(/\{taskId\}/, this.getTaskId())
			),
		
			availableActorsStore = Ext.create('Ext.data.Store', {
			    fields : [
					'userName',
					'firstName',
					'lastName',
					'email',
					{
						name : 'isAssigned',
						type : 'boolean'
					},
					{
						name : 'displayName',
						type : 'string',
						mapping : 'userName',
						convert : function(value, record) {
							var
//								email = record.get('email'),
								firstName = record.get('firstName'),
								lastName = record.get('lastName')
							;
							
							return (
								(firstName? firstName + ' ' : '')
								+ (lastName? lastName + ' ' : '') 
								+ (firstName || lastName ? '(' : '') 
								+ value
								+ (firstName || lastName ? ')' : '')
							);
						}
					}
				],
			    proxy : {
			    	type : 'ajax',
			    	url : url,
			    	reader : {
			    		type : 'json',
			    		root : 'availableActors'
			    	},
			    	extraParams : {
			    		showAvailableActors : true
			    	}
			    }
			}),
			
			availableActorsGrid = Ext.create('Ext.grid.Panel', {
				itemId : 'availableactors',
				title : 'Tâche affectée à',
				store : availableActorsStore,
				hideHeaders : true,
				columns : [
					{
						text : 'Utilisateur',
						dataIndex : 'displayName',
						flex : 1
					}
				],
				
				viewConfig : {
					getRowClass : function(record, rowIndex, rowParams, store) {
						
						var isAssigned = record.get('isAssigned');
						return isAssigned ? 'row-assigned' : '';
						
					}			
				},
				
				listeners : {
					'selectionchange' : me.updateAvailableButtons,
					scope : me
				},
				
				flex : 1
			})
		;
		
		availableActorsStore.load({
			params : {
				taskId : me.getTaskId()
			},
			callback : this.updateAvailableButtons,
			scope : this
		});
		
		return [availableActorsGrid];
		
	},
	
	updateAvailableButtons : function() {
		
		var
			assignButton = this.queryById('assign-button'),
			releaseButton = this.queryById('release-button'),
			availableActorsGrid = this.queryById('availableactors'),
			actorsStore = availableActorsGrid.getStore(),
			firstSelectedActor = null,
			hasAssignedUser = false,
			canReassign = (null != actorsStore) && (null != actorsStore.proxy.reader.jsonData) && actorsStore.proxy.reader.jsonData.canReassign
		;
		
		if (!canReassign) return;
		
		firstSelectedActor = (availableActorsGrid.getSelectionModel().getSelection() || [null])[0];
		hasAssignedUser = actorsStore ? actorsStore.find('isAssigned', true) : false;
		
		assignButton.setDisabled(!firstSelectedActor || true === firstSelectedActor.get('isAssigned'));
		releaseButton.setDisabled(!hasAssignedUser);			
		
	},
	
	getAssignedActor : function() {
		
		var 
			availableActorsGrid = this.queryById('availableactors'),
			firstSelected = (availableActorsGrid.getSelectionModel().getSelection() || [null])[0]
		;
		
		return firstSelected.get('userName');
		
	},	
	
	onAssignClick : function(button) {
		
		var actorId = this.getAssignedActor();
		this._performServerRequest('POST', {userName : actorId});
		
	},
	
	onReleaseClick : function(button) {
		
		this._performServerRequest('DELETE');
		
	},
	
	/**
	 * @private
	 */
	_performServerRequest : function(method, params) {
		
		var
			me = this,
			taskId = this.getTaskId(),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				Yamma.view.windows.AssignToWindow.TASK_ASSIGN_URL.replace(/\{taskId\}/, taskId)
			)
		;
		
		this.setLoading(true);
		
		Bluedolmen.Alfresco.jsonRequest({
			
			method : method || 'POST',
			
			url : url,
			
			dataObj : Ext.apply({}, params),
			
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