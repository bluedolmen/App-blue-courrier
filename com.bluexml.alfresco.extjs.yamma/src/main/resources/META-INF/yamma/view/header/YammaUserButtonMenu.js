Ext.define('Yamma.view.header.YammaUserButtonMenu', {
	
	extend : 'Bluexml.utils.alfresco.button.UserButtonMenu',
	alias : 'widget.yammauserbuttonmenu',

	statics : {
		STATISTICS_URL : 'http://www.bluexml.com/bluecourrier/stats',
		LABEL_GENERATOR_URL : 'alfresco://bluexml/yamma/label-generator?pageNumber={pageNumber}'
	},	
	
	getAdditionalMenuItems : function() {
		return [
			this.getStatisticsMenuItemDeclaration(),
			this.getCodeBarGeneratorMenuItemDeclaration()
		];
	},
	
	getStatisticsMenuItemDeclaration : function() {
		
		return ({
			itemId : 'global-statistics',
			text : 'Statistiques',
			iconCls : Yamma.Constants.getIconDefinition('chart_curve').iconCls,
			listeners : {
				click : this.onStatisticsMenuItemClicked
			}			
		});
		
	},
	
    onStatisticsMenuItemClicked : function() {
    	window.open(Yamma.view.header.YammaUserButtonMenu.STATISTICS_URL);
    },
	
	getCodeBarGeneratorMenuItemDeclaration : function() {
		
		return ({
			itemId : 'label-generator',
			text : 'Code barres',
			iconCls : Yamma.Constants.getIconDefinition('stock_id').iconCls,
			listeners : {
				click : this.onCodeBarGeneratorMenuItemClicked
			}			
		});
		
	},
	
	onCodeBarGeneratorMenuItemClicked : function() {
		
		Ext.Msg.prompt(
			'Générateur de code-barres',
			'Combien de pages voulez-vous générer ?',
			function(button, text) {
				if ('ok' != button) return;
				if (isNaN(parseInt(text))) return; // ignore for the moment
				
				var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					Yamma.view.header.YammaUserButtonMenu.LABEL_GENERATOR_URL.replace(
						'\{pageNumber\}', text
					)
				);
				window.open(url);
			},
			this, /* scope */
			false, /* multiline */
			'1' /* default */
		);
		
	}
	
});
