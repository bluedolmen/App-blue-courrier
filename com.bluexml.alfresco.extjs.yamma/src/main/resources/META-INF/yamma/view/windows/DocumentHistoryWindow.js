Ext.define('Yamma.view.windows.DocumentHistoryWindow', {
	
	extend : 'Ext.window.Window',
	alias : 'widget.documenthistory',
	
	requires : [
		'Yamma.view.windows.DocumentHistoryList'
	],
	
	title : 'Historique du courrier',
	width : 800,
	height : 300,
	layout : 'fit',
	headerPosition : 'right',
	renderTo : Ext.getBody(),
	
	items : [
		{
			xtype : 'documenthistorylist',
			border : false,
			preventHeader : true
		}		
	],
	
	config : {
		nodeRef : null
	},
	
	initComponent : function() {
				
		this.callParent(arguments);
		
		var nodeRef = this.getNodeRef();
		if (!nodeRef) return;
		
		this.fillList('documenthistorylist');
			
	},
	
	fillList : function(query) {
		var matchingLists = this.query(query);
		if (!matchingLists || 0 == matchingLists.length) return;
		
		var list = matchingLists[0];
		list.load({
			filters : [
				{
					property : 'nodeRef',
					value : this.getNodeRef()
				}
			]
		});
	}

});