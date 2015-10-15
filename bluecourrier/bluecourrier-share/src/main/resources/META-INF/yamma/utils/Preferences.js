Ext.define('Yamma.utils.Preferences', {

	PREFERED_HEADER_POSITION : 'preferedHeaderPosition', 
	
	singleton : true,
	
	_preferences : {},
	
	_initPreferences : function() {
		this._preferences = this.preferences || {};
		this[this.PREFERED_HEADER_POSITION] = 'top';
	},
	
	constructor : function() {
		
		this.getPV = this.getPreferenceValue;
		this._initPreferences();
		
		return this.callParent(arguments);
		
	},
	
	getPreferenceValue : function(preferenceKey) {
		return this._preferences[preferenceKey];
	}	
	
});