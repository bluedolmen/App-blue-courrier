Ext.define('Yamma.utils.LicenseManager', {

	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	ENTERPRISE_EDITION : 'enterprise',
	COMMUNITY_EDITION : 'community',
	
    singleton : true,
    
    _expired : false,
    
	constructor: function (config) {
		
		var me = this;
		
		this._licenseDesc = 
		
		this.mixins.observable.constructor.call(this, config);

		this.addEvents(
			'expired',
			'invalid'
		);
		
		if ("undefined" == typeof BCLIC_) return;
		this._initLicenseDescription();
			
	},
	
	_initLicenseDescription : function() {
		
		var 
			me = this,
			_licenseDescr = {
		    	licenseMode : 'community' === '${licensemode}' ? 'community' : 'enterprise',
		    	validUntil : 'unlimited'
		    },
			holderOrganisation = BCLIC_["holder-organisation"],
			holder = BCLIC_["holder"] + (holderOrganisation ? '(' + holderOrganisation + ')' : ''),
			licenseMode = BCLIC_["license-mode"] || _licenseDescr.licenseMode || this.COMMUNITY_EDITION,
			_valid,
			validUntil = BCLIC_["valid-until"], validUntilDate
		;

		_valid = (this.COMMUNITY_EDITION == licenseMode) || !!BCLIC_["isValid"];
		
		if (validUntil) {
			if ("unlimited" != validUntil) {
				// Verify the valid-until date
				validUntilDate = Ext.Date.parse(validUntil, "c");
			}
		}
		
		Ext.apply(_licenseDescr, {
			
			licenseMode : licenseMode,
			holder : holder,
			validUntil : validUntil,
			validUntilDate : validUntilDate,
			licenseId : BCLIC_["id"]
			
		});
		
		this._getLicenseDescr = function() {
			
			return Ext.apply({}, _licenseDescr);
			
		}
		
		this.isLicenseValid = function(silent) {
			
			if (!_valid && silent !== true) {
				this.fireEvent('invalid', this._getLicenseDescr());
			}
			
			return _valid && !me.isLicenseExpired(silent);
			
		}
		
		this.getValidUntil = function() {
			
			return _licenseDescr.validUntil;
			
		}
		
		this.getValidUntilDate = function() {
			
			return _licenseDescr.validUntilDate; 
			
		}
		
		this.isLicenseExpired = function(silent) {
			
			return me._checkExpired(silent);
			
		}
			
		this.isLicenseValid();
		
		if (validUntilDate) {
			
			this._checkExpired();
			
		}
		
	},
	
	_checkExpired : function(silent) {

		var
			validUntilDate = this.getValidUntilDate(),
			_expired,
			me = this
		;
		
		_expired = validUntilDate ? new Date(validUntilDate) /* copy */.setHours(24) < Ext.Date.now() : false;
		
		if (_expired && silent !== true) {
			this.fireEvent('expired', validUntilDate);
		}
		
		
		return _expired;
		
	},
	
	getHolder : function() {
		
		return this._getLicenseDescr().holder;
		
	},
	
	getLicenseId : function() {
		
		return this._getLicenseDescr().licenseId;
		
	},
	
	isEnterpriseEdition : function() {
		
		return this.ENTERPRISE_EDITION == this._getLicenseDescr().licenseMode;
		
	}

});