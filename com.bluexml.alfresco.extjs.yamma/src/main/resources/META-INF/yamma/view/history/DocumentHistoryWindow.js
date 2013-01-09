Ext.define('Yamma.view.history.DocumentHistoryWindow', {
	
	extend : 'Ext.window.Window',
	alias : 'widget.documenthistory',
	
	requires : [
		'Yamma.view.history.DocumentHistoryList'
	],
	
	title : 'Historique du courrier',
	width : 800,
	height : 300,
	layout : 'fit',
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
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