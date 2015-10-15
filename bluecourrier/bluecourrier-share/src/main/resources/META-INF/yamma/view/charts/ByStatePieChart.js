Ext.define('Yamma.view.charts.ByStatePieChart', {

	extend : 'Yamma.view.charts.ByStateChart',
	alias : 'widget.bystatepiechart',
	
	requires : [
		'Ext.chart.series.Pie'
	],
	
    animate: true,
    shadow: true,
    
    legend: {
        position: 'right'
    },
    insetPadding: 15,
    theme: 'Base:gradients',
    
    getSeriesDefinition : function() {
    	
    	return [
    		this.getPieChartDefinition()
    	];
    	
    },
    
    getPieChartDefinition : function() {
    	
		return {
			
            type: 'pie',
            field: 'documentNumber',
            showInLegend: true,
            donut: false,
            
            highlight: {
              segment: {
                margin: 20
              }
            },
            
            label: this.getLabelDefinition(), 
            
			tips : this.getTipsDefinition()            
            
        };
    	
    },
    
    getLabelDefinition : function() {
    	
    	return {
            field: 'title',
            display: 'rotate',
            contrast: true,
            font: '14px Arial',
            renderer : function(value) {
            	return '';
            }
		};
		
    },    
    
    getTipsDefinition : function() {
    	var me = this;
    	
		return {
			trackMouse : true,
			width : 150,
			height : 28,
			renderer : function(record, item) {
				
				var 
					documentNumber = record.get('documentNumber'),
					stateLabel = record.get('title'),
					totalDocumentNumber = me.getTotalDocumentNumber()
				;
				
				this.setTitle(stateLabel + ' : ' + documentNumber + '/' + totalDocumentNumber);
				
			}
		};    	
    } 	
    
 	
	    
});