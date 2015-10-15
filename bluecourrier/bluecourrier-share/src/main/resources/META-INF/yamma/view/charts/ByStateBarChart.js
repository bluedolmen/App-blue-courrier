Ext.define('Yamma.view.charts.ByStateBarChart', {

	extend : 'Yamma.view.charts.ByStateChart',
	alias : 'widget.bystatebarchart',
	
	requires : [
		'Ext.chart.series.Bar'
	],	
	
	STATUSABLE_STATE_QNAME : 'bluecourrier:status',
	LATE_STATE_ONTIME_QNAME : 'onTimeStateNumber',
	LATE_STATE_HURRY_QNAME : 'hurryStateNumber',
	LATE_STATE_LATE_QNAME : 'lateStateNumber',
	LATE_STATE_UNDETERMINED_QNAME : 'undeterminedStateNumber',
	
	animate: true,
	shadow: true,
	
    legend: {
        position: 'right'
    },
    
	initComponent : function() {
		this.axes = this.getAxesDefinition();
		this.callParent(arguments);
	},
	
	getAxesDefinition : function() {
		var me = this;
		
		return [
		    {
		        type : 'Category',
		        position : 'left',
		        fields : [this.STATUSABLE_STATE_QNAME],
		        label : {
		        	renderer : function(value) {
		        		return me.getStateShortTitle(value);
		        	}
		        },
		        title: false
		    },
		
			{
		        type: 'Numeric',
		        position: 'bottom',
		        fields: [this.LATE_STATE_ONTIME_QNAME, this.LATE_STATE_HURRY_QNAME,  this.LATE_STATE_LATE_QNAME, this.LATE_STATE_UNDETERMINED_QNAME],
		        title: false,
		        grid: true,
		        label: {
		            renderer: Ext.util.Format.numberRenderer('0')
		        },
		        majorTickSteps : 1
		    } 
		];		
	},
	
    getSeriesDefinition : function() {
    	return [
    		this.getBarChartDefinition()
    	];
    },
    
    getBarChartDefinition : function() {
    	
		var barChartDefinition = {
	        type: 'bar',
	        axis: 'bottom',
	        gutter: 80,
	        xField: this.STATUSABLE_STATE_QNAME,
	        yField: [this.LATE_STATE_ONTIME_QNAME, this.LATE_STATE_HURRY_QNAME, this.LATE_STATE_LATE_QNAME, this.LATE_STATE_UNDETERMINED_QNAME],
	        title : ['Ok', 'Urgent', 'En retard', 'Indéterminé'],
	        stacked: true,
	        tips: this.getTipsDefinition()
    	};
    	
    	return barChartDefinition;
    	
    },
    
    /**
     * TODO: Refactor this to use Constants (defining titles)
     * @return {}
     */
    getTipsDefinition : function() {
    	
    	var 
    		me = this,
			tipsDefinition = {
				trackMouse : true,
				width : 100,
				height : 70,
				tpl : new Ext.XTemplate(
					'<p><b>{state} : {documentNumber}</b></p>',
					'<p>Ok : {onTimeNumber}</p>',
					'<p>Urgent : {hurryNumber}</p>',
					'<p>Retard : {lateNumber}</p>',
					'<p>Indeterminé : {undeterminedNumber}</p>'
				),
				renderer : function(record, item) {
					
					var 
						documentNumber = record.get('documentNumber'),
						lateNumber = record.get(me.LATE_STATE_LATE_QNAME),
						onTimeNumber = record.get(me.LATE_STATE_ONTIME_QNAME),
						hurryNumber = record.get(me.LATE_STATE_HURRY_QNAME),
						undeterminedNumber = record.get(me.LATE_STATE_UNDETERMINED_QNAME),
						stateLabel = record.get('title')
					;
					
					this.update({
						state : stateLabel,
						documentNumber : documentNumber,
						onTimeNumber : onTimeNumber,
						hurryNumber : hurryNumber,
						lateNumber : lateNumber,
						undeterminedNumber : undeterminedNumber
					});
				}
			}
    	;
		
		return tipsDefinition;
    }    
 	
});