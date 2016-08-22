Ext.define('Yamma.view.mails.ExportButton', {
	
	extend : 'Ext.button.Button',
	
	iconCls : Yamma.Constants.getIconDefinition('table_go').iconCls,
	tooltip : i18n.t('view.mails.exportbutton.tooltip'),
	
	config : {
		store : null,
	},
	
	constructor : function(config) {
		
//		if (null == this.store) {
//			Ext.Error.raise('This button has to be associated with a valid store');
//		}
		
		this.initConfig(config);
		this.handler = this.exportAsCSV;
		this.callParent();
		
	},
	
	_dateRenderer : Ext.util.Format.dateRenderer('Y-m-d-Hi'),
	
	exportAsCSV : function() {
		
		var store = this.getStore();
	
		if (!store || !store.proxy) return;
		
		var
			operation = new Ext.data.Operation(store.lastOptions),
			request = store.proxy.buildRequest(operation),
			params = request.params,
			
			csvReqParams = {
				omitTitleLine : false,
				format : 'csv'
			},
			
			filenamePrefix = 'export-mails',
			filename = this._dateRenderer(new Date()) + '.csv',
			
			queryString,
			datasource = Yamma.config.client['export.csv.datasource'],
			
			withBOM = 'true' == Yamma.config.client['export.csv.with-bom'],
		
			url = store.proxy.url
			
		;
	
		if (params.query) {
			csvReqParams.query = params.query;
			csvReqParams.term = params.term;
		}
	
		if (params.filter) {
			csvReqParams.filter = params.filter;
		}
		
		if (params.sort) {
			csvReqParams.sort = params.sort;
		}
		
		if (withBOM) {
			csvReqParams['with-bom'] = true;
		}
		
		if (datasource) {
			url = url.replace(/datasource\/Mails\/data/, 'datasource/' + datasource + '/data');
			filenamePrefix = datasource;
		}
		
		queryString = Ext.Object.toQueryString(csvReqParams);
		url = url + '/' + filenamePrefix + '-' + filename + '?' + queryString;
		
		window.open(url, '_blank');
		
	},
	
	getStore : function() {
		
		if (Ext.isFunction(this.store)) return this.store.call(this);
		return this.store;
		
	}
	
});