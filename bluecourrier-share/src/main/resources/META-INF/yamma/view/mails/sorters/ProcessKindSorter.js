Ext.define('Yamma.view.mails.sorters.ProcessKindSorter', {
	
	extend : 'Ext.util.Sorter',
	
	uses : [
	   'Yamma.utils.DeliveryUtils'
	],
	
	constructor : function(){
		
		var 
			position = {}, 
			pkid = null, 
			i = 0
		;
		
		for (pkid in Yamma.utils.DeliveryUtils.getProcessKindIds()) {
			position[pkid] = ++i;
		}
		
		this.position = position;
		
		this.callParent();
		
	},
	
	property : Yamma.utils.datasources.Documents.PROCESS_KIND_QNAME, 
	text : i18n.t('view.mails.sorter.processkind.text'),//"Processus",
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
	
	renderGroup : function(processKind) {
		
		processKind = processKind || 'UNKNOWN';
		
		var 
			processKindDef = Yamma.utils.DeliveryUtils.getProcessKinds()[processKind] || {},
			title = processKindDef.label ||  i18n.t('view.mails.sorter.processkind.default'),
			iconCls = processKindDef.iconCls || '',
			template = new Ext.Template(
				'<span class="grouping-header-icon {iconCls}">',
				'{title}',
				'</span>'
			)
		;
		
		return template.apply({
			title : title,
			iconCls : iconCls
		});
		
	}

	
});