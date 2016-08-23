Ext.define('Yamma.store.DeliveryRoles', {
	
	extend : 'Ext.data.Store',
	
	statics : {
		
		isProcessingFamily : function(family) {
			return 'procg' == family;
		},
		
		isCollaborationFamily : function(family) {
			return 'col' == family;
		},
		
		isInformationFamily : function(family) {
			return 'inf' == family;
		},
		
		INSTANCE : null // instanciated hereaftetr
		
	},
	
	familyIcons : {
		
		'procg' : 'cog',
		'col' : 'comment',
		'inf' : 'newspaper'
		
	},
	
	personRoles : [
   	    {
   	    	id : 'opinion',
   	    	name : i18n.t('store.deliveryrole.personrole.opinion'),
   	    	role : 'op',
   	    	icon : 'comment'
   	    },
   	    {
   	    	id : 'information',
   	    	name : i18n.t('store.deliveryrole.personrole.information'),
   	    	role : 'inf',
   	    	icon : 'newspaper'
   	    }
   	],
	       	
   	serviceRoles : [
   	    {
   	    	id : 'expected-processing',
   	    	name : i18n.t('store.deliveryrole.servicerole.expected-processing'),
   	    	role : 'ep/procg'
   	    },
   	    {
   	    	id : 'collaboration',
   	    	name : i18n.t('store.deliveryrole.servicerole.collaboration'),
   	    	role : 'col/col'
   	    },
   	    {
   	    	id : 'information',
   	    	name : i18n.t('store.deliveryrole.servicerole.information'),
   	    	role : 'inf/inf'
   	    } 
   	],
   	
   	processingRoles : [],
   	collaborationRoles : [],
   	informationRoles : [],
		
	fields: ['id', 'name', 'role', 'family', 'icon', 'kind'],
	
	proxy : {
		type : 'memory',
		reader : {
			type : 'json'
		}
	},
	
	autoLoad : true,
	
	remoteFilter : false,
	remoteSort : false,
	
	constructor : function() {
		
		this.buildData();
		this.callParent();
		
	},
	
	buildData : function() {
		
		var
			me = this,
			roleEntries = []
		;
		
		roleEntries = roleEntries.concat(
			Ext.Array.map(me.personRoles, function(personRole) {
				return {
					id : 'person-' + personRole.id,
					name : personRole.name,
					icon : personRole.icon,
					role : personRole.role,
					family : personRole.role,
					kind : 'user'
				};
			})
		);
		
		if (Yamma.config.client['service-roles']) {
			roleEntries = roleEntries.concat(
				Ext.Array.map(Yamma.config.client['service-roles'].split(','), function(serviceRole) {
					// role[/family]|title
					var 
						elems = serviceRole.split('|'),
						roleSplit = elems[0].split('/'),
						role = roleSplit[0],
						family = roleSplit[1] || 'inf',
						icon = me.familyIcons[family]
					;
					return {
						id : 'service-' + role,
						name : elems[1],
						icon : icon,
						role : role,
						family : family,
						kind : 'service'
					};						
				})
			);
		}
		else {
			roleEntries = roleEntries.concat(
				Ext.Array.map(me.serviceRoles, function(serviceRole) {
					var 
						roleSplit = serviceRole.role.split('/'),
						role = roleSplit[0],
						family = roleSplit[1] || 'inf',
						icon = me.familyIcons[family]
					;
					return {
						id : 'service-' + serviceRole.id,
						name : serviceRole.name,
						icon : icon,
						role : serviceRole.role,
						kind : 'service'
					};						
				})
			);
		}
		
		this.data = Ext.Array.clean(roleEntries);
		
		this.processingRoles = Ext.Array.clean(Ext.Array.map(this.data, function(item) {
			return ('service' == item['kind'] && 'procg' == item['family'] ? item['role'] : null); 
		}));
		
		this.collaborationRoles = Ext.Array.clean(Ext.Array.map(this.data, function(item) {
			return ('service' == item['kind'] && 'col' == item['family'] ? item['role'] : null); 
		}));
		
		this.informationRoles = Ext.Array.clean(Ext.Array.map(this.data, function(item) {
			return ('service' == item['kind'] && 'inf' == item['family'] ? item['role'] : null); 
		}));
		
	},
	
	getName : function(role) {
		var entry = this.findRecord('role', role);
		if (null == entry) return null;
		
		return entry.get('name');		
	},
	
	getFamily : function(role) {
		
		var entry = this.findRecord('role', role);
		if (null == entry) return null;
		
		return entry.get('family');
		
	},
	
	isProcessingRole : function(role) {
		if (!role) return false;
		return Ext.Array.contains(this.processingRoles, role);
	},
	
	getRank : function(role) {
		
		if (!role) return 99;
		
		if (undefined === this._rank[role]) {
			var family = this.getFamily(role);
			this._rank[role] = ({
				'procg' : 1,
				'col' : 2,
				'inf' : 3
			})[family];
		}
		
		return this._rank[role];
		
	},
	
	_rank : {} // cache
	
	
}, function() {
	
	Yamma.store.DeliveryRoles.INSTANCE = new Yamma.store.DeliveryRoles();
	
});
