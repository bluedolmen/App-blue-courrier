Ext.define('Yamma.view.charts.ChartDefinition', {

	requires : [
		'Ext.chart.Chart'
	],
	
	aggregatedFields : [],
	aggregatedFieldTitles : [],
	legendPosition : 'bottom',	

	dataStore : null, // the store from which data will be aggregated
	chart : null,
	
	buildChart : function(dataStore, chartConfig) {
		
		if (null != this.chart) {
			
			if (this.dataStore == dataStore) return this.chart;
			Ext.Error.raise(i18n.t('view.charts.definition.errors.factoryreuse'));
			
		}
		
		var 
			me = this,
			axes,
			series,
			reasonToFail,
			store
		;
		
		function installFilterChangeListener() {
			
			// If the original dataStore is modified by a filter, we expect the chart to be modified accordingly
			me.dataStore.on('filterchange', function(store, filters) {
				
				if (null == me.chart) return;
				
				var newStore = me.getAggregatedDataStore();
				me.chart.bindStore(newStore);
				
			});
			
		}
		
		/*
		 * Do not keep a reference on a destroyed chart 
		 */
		function installDestroyListener() {
			
			me.chart.on('destroy', function() {
				me.chart = null;
			});
			
		}
		
		this.dataStore = dataStore || this.dataStore;
		
		reasonToFail = this.checkDataStore();
		if (reasonToFail) {
			Ext.Error.raise(reasonToFail);
		}
		
		this.computeAggregatedFields();

		this.prepareDataStore();
		
		axes = this.getAxes();
		
		store = this.getAggregatedDataStore();
		
		series = this.getSeries() || [];
		
		this.chart = Ext.create('Ext.chart.Chart', Ext.apply({
			
			animate : true,
			
			title : this.title,
			
			legend : {
				position : me.legendPosition || 'bottom',
				visible : null != me.legendPosition
			},
			
			axes : axes,
			series : series,
			
			store : store
			
		}, chartConfig) );
		
		installFilterChangeListener();
		installDestroyListener();
		
		return this.chart;
		
	},
	
	/**
	 * @protected
	 */
	checkDataStore : function() {
		
		if (null == this.dataStore) return i18n.t('view.charts.definition.errors.buildtime');
		
	},	
	
	/**
	 * @protected
	 */
	prepareDataStore : function() {
		
	},
	
	/**
	 * @protected
	 */
	getAxes : function() {
		
	},
	
	computeAggregatedFields : function() {
		
		this.aggregatedFields = this.aggregatedFields || [];
		
		this.computeAggregatedFieldTitles();
		
	},
	
	computeAggregatedFieldTitles : function() {
		
		this.aggregatedFieldTitles = this.aggregatedFieldTitles || [];
		
	},
	
	getAggregatedDataStore : function() {
		
		if (null == this.dataStore) return null;
		
		var 
			data = [].concat(this.getAggregatedData(this.dataStore.getRange()))
		;
		
		return Ext.create('Ext.data.JsonStore', {
			
			fields : this.aggregatedFields,
			data : data
			
		});
		
	},
	
	getAggregatedData : function(data /* as an Array of records */) {
		
		return {};
		
	},		
	
	MAX_LINE_WIDTH : 20, // characters
	
	splitToMultiline : function(value) {
		
		var 
			me = this,
			splitValue = value.split(' '),
			count = 0
		;
		return splitValue.reduce(function(previousValue, currentValue, index, array) {
			
			var separator = ' ';
			
			count += currentValue.length;
			if (count > me.MAX_LINE_WIDTH) {
				count = 0;
				separator = '\n';
			}
			
			return previousValue + separator + currentValue;
			
		}, '');
		
	},
	
	getSeries : function() {
		
		return [];

	}
		
});
