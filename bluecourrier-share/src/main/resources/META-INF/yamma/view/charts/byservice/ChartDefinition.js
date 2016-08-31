Ext.define('Yamma.view.charts.byservice.ChartDefinition', {
	
	extend : 'Yamma.view.charts.GroupBasedChartDefinition',

	title : i18n.t('view.charts.byservice.definition.title'),
	
	groupFieldName : 'enclosingService',
	
	getGroupValuesLabelTitle : function(value) {
		
		return Yamma.utils.ServicesManager.getDisplayName(value);
		
	},
	
	getSeries : function() {
		
		var MAX_BAR_HEIGHT = 76;
		
		return [{
	        type: 'bar',
	        axis: 'top',
	        gutter: 80,
	        xField: this.groupFieldName,
	        yField: this.aggregatedFields,
	        title : this.aggregatedFieldTitles,
	        stacked: true,
	        tips: {
	            trackMouse: true,
	            width : 100,
	            renderer: function(storeItem, item) {
	                this.setTitle(String(item.value[1]) + i18n.t('view.charts.byservice.definition.tips.part0') + (item.value[1] > 1 ? i18n.t('view.charts.byservice.definition.tips.part1') : ''));
	            }
	        },
	        renderer : function(sprite, record, attributes, index, store) {
	        	
	        	// Set the maximum height of a bar
				var mid_y = attributes.y + (attributes.height / 2);
				attributes.height = attributes.height > MAX_BAR_HEIGHT ? MAX_BAR_HEIGHT : attributes.height;
				attributes.y = mid_y - (attributes.height / 2);
				
	        	return attributes;
	        	
	        }
	    }];

	}
		
});
