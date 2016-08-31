Ext.define('Yamma.view.windows.DocumentStatisticsWindow', {
	
	extend : 'Ext.window.Window',
	alias : 'widget.documentstatistics',
	
	requires : [
		'Yamma.view.charts.StatesStatsView'
	],
	
	title :  i18n.t('view.window.documentstatisticswinow.title'),//'Statistiques du courrier',
	width : 500,
	height : 300,
	layout : 'fit',
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	renderTo : Ext.getBody(),
	
	tools:[
		{
		    type : 'next',
		    tooltip : i18n.t('view.window.documentstatisticswinow.nextview'),//'Vue suivante',
		    itemId : 'nextView'
		}
	],	
	
	config : {
		filters : []
	},
	
	items : [
		{
			xtype : 'statesstatsview',
			border : false,
			preventHeader : true
		}		
	]
	

});