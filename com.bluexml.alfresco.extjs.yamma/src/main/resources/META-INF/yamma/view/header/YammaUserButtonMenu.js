Ext.define('Yamma.view.header.YammaUserButtonMenu', {
	
	extend : 'Bluexml.utils.alfresco.button.UserButtonMenu',
	alias : 'widget.yammauserbuttonmenu',

	statics : {
		STATISTICS_URL : 'http://www.bluexml.com/bluecourrier/stats'
	},	
	
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
		
	},
	
    onStatisticsMenuItemClicked : function() {
    	window.open(Yamma.view.header.YammaUserButtonMenu.STATISTICS_URL);
    }
		
});
