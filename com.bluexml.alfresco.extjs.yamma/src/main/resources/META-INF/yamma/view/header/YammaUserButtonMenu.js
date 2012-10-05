Ext.define('Yamma.view.header.YammaUserButtonMenu', {
	
	extend : 'Bluexml.utils.alfresco.button.UserButtonMenu',
	alias : 'widget.yammauserbuttonmenu',
	
	getAdditionalMenuItems : function() {
		return [
			this.getStatisticsMenuItemDeclaration()
		];
	},
	
	getStatisticsMenuItemDeclaration : function() {
		
		return {
			id : 'global-statistics',
			text : 'Statistiques',
			iconCls : 'icon-chart_curve',
			listeners : {
				click : this.onStatisticsMenuItemClicked
			}			
		};
		
	}	
		
});
