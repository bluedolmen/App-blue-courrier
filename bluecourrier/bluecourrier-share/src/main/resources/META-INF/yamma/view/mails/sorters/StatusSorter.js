Ext.define('Yamma.view.mails.sorters.StatusSorter', {
	
	extend : 'Ext.util.Sorter',
	
	constructor : function(){
		
		var 
			position = {}, 
			stateName = null, 
			i = 0
		;
		
		for (stateName in Yamma.Constants.DOCUMENT_STATE_DEFINITIONS) {
			position[stateName] = ++i;
		}
		
		this.position = position;
		
		this.callParent();
		
	},
	
	property : Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME, 
	text : "Statut", 
	iconCls : Yamma.Constants.getIconDefinition('cog_email').iconCls,
	
	sorterFn : function(o1, o2) {
	   
		var
			me = this,
			pos1 = getPosition(o1),
	   		pos2 = getPosition(o2)
	   	;
		
		function getPosition(o) {
			var state = o.get(me.property) || '';
			return me.position[state] || 0;
		}
	   
		return pos1 - pos2;
		
	},
	
	renderGroup : function(documentState) {
		
		documentState = documentState || 'UNKNOWN';
		
		var 
			documentStateDef = Yamma.utils.Constants.DOCUMENT_STATE_DEFINITIONS[documentState],
			stateTitle = documentStateDef.title,
			stateIconCls = documentStateDef.iconCls,
			template = new Ext.Template(
				'<span class="grouping-header-icon {iconCls}">',
				'{title}',
				'</span>'
			)
		;
		
		return template.apply({
			title : stateTitle,
			iconCls : stateIconCls
		});
		
	}

	
});