Ext.define('Yamma.utils.DeliveryUtils', {
	
	singleton : true,
	
	DEFAULT_PROCESS_KINDS : 'ep',
	
	PROP_SHARES : '{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}shares',
	PROP_SERVICE_ROLE : '{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}serviceRole',
	PROP_SERVICE_NAME : '{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}serviceName',
	PROP_VALIDATE_DELIVERING : '{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}validateDelivering',
	PROP_PROCESS_KIND : '{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}processKind',

	ICON_CLS_BASENAME : {
		'procg' : 'wrench',
		'col'   : 'connect',
		'inf'   : 'newspaper'
	},
	
	ROLE_TITLE : {
		'procg' : 'Traitement',
		'col'   : 'Collaboration',
		'inf'   : 'Information'
	},
	
	ROLE_LEVEL : {
		
		'procg' : 1,
		'col' : 2,
		'inf' : 3
		
	},
	
	getDefaultProcessId : function() {
		
		if (undefined === this._defaultProcessId) {
			this.getProcessKinds();
		}
		
		return this._defaultProcessId;
		
	},
	
	getAllRoles : function() {
		
		return Ext.Object.getKeys(this.ROLE_LEVEL);
		
	},
	
	getRolesForProcessKind : function(processKind) {
		
		var activeRoles = Yamma.config['wf.incoming.process-kind.' + processKind + '.active-roles'] || '';
		if (activeRoles) return activeRoles.split(',');
		
		return this.getAllRoles();
		
	},
	
	/**
	 * @return An Object of elements formatted as
	 * key : {
	 *   id : string,
	 *   label : string,
	 *   iconCls : string
	 * } 
	 * key and id are the same and identify the process-kind
	 */
	getProcessKinds : function() {
		
		var
			me = this,
			result
		;
		
		if (undefined === this.processKinds) {
			
			result = {};
			
			Ext.Array.forEach(this.getProcessKindIds(), function(process) {

				// Try to get label and icon from config
				var 
					label = Yamma.config['wf.incoming.process-kind.' + process + '.label'],
					icon = Yamma.config['wf.incoming.process-kind.' + process + '.icon']
				;
				
				result[process] = {
					id : process,
					label : label,
					iconCls : icon ? Yamma.Constants.getIconDefinition(icon).iconCls : null
				};
				
				if (undefined === me._defaultProcessId) {
					me._defaultProcessId = process;
				}
				
			});
			
			this.processKinds = result;
			
		}
		
		return this.processKinds;
		
	},
	
	getProcessKindIds : function() {
		
		return (Yamma.config['wf.incoming.process-kinds'] || this.DEFAULT_PROCESS_KINDS).split(',');

	},
	
	getTaskShares : function(task) {
		
		if (!task || !task.properties) return null;
		
		var shares = task.properties[this.PROP_SHARES] || '';
		if (!shares) return null;
		
		return this.decodeShares(shares, null);
		
	},
	
	getTaskProcess : function(task) {
		
		if (!task || !task.properties) return null;
		return task.properties[this.PROP_PROCESS_KIND];
		
	},
	
	getNodeShares : function(record) {
		
		if (!record) return null;
		
		var shares = record.get(Yamma.utils.datasources.Documents.SHARES); // may be null or empty
		
		return this.decodeShares(shares);
		
	},
	
	isTaskValidationNeeded : function(task) {
		
		if (!task || !task.properties) return;
		
		var validateDelivering = properties[this.PROP_VALIDATE_DELIVERING];
		return ('false' !== validatedDelivering);
		
	},
	
	decodeShares : function(shares, roleFilter /* [string] */) {
		
		var
			result = {
				services : [],
				localUsers : [],
				externalUsers : []
			}
		;
		
		if (!shares) return result;
		
		if (Ext.isString(shares)) { 
			shares = Ext.JSON.decode(shares, true) || shares;
			// It should be a valid JSON String, but Alfresco seems to encode badly the array and does not include quotes on included strings
			if (Ext.isString(shares)) {
				if ('[' == shares[0]) {
					shares = shares.substring(1, shares.length - 1);
				}
				shares = shares.split(',');
			}
		}
		
		Ext.Array.forEach(shares, function(share) {
			
			var 
				_split = null,
				role = null,
				status = null
			;
			
			if (Ext.String.startsWith(share, 'ser_')) {
				
				_split = share.substr(4).split('|');
				role = _split[1] || 'inf';
				if (roleFilter && (!Ext.Array.contains(roleFilter,role))) return;
				
				result.services.push({
					serviceName : _split[0],
					role : role,
					status : _split[2] || 'none'
				});
				
			}
			else if (Ext.String.startsWith(share, 'loc_')) {
				
				_split = share.substr(4).split('|');
				role = _split[1] || 'inf';
				if (roleFilter && (!Ext.Array.contains(roleFilter,role))) return;
				
				result.localUsers.push({
					userName : _split[0],
					role : role
				});
				
			}
			else if (Ext.String.startsWith(share, 'ext_')) {
				
				result.externalUsers.push(share.substr(4));
				
			}
			else { // default is a service
				
				result.services.push(share);
				
			}
			
		});
		
		return result;
		
	},
	
	decodeSharesJSON : function(shares) {
		
		var
			result = {
				services : [],
				localUsers : [],
				externalUsers : []
			},
			decodedShares = null
		;
		
		if (!shares) return result;
		
		decodedShares = Ext.JSON.decode(shares, true /* safe */);
		
		if (!decodedShares) {
			decodedShares = Yamma.view.mails.gridactions.Distribute.decodeSharesCustom(shares); // old way
		}
		
		Ext.apply( result, decodedShares );
		return result;
		
	},
	
	encodeShares : function(shares) {
		
		shares = shares || {};
		
		return ([]
				.concat( Ext.Array.map(shares.services || [], function(service) { return 'ser_' + service.serviceName + (service.role ? '|' + service.role : ''); }) )
				.concat( Ext.Array.map(shares.localUsers || [], function(user) { return 'loc_' + user.userName + (user.role ? '|' + user.role : ''); }) )
				.concat( Ext.Array.map(shares.externalUsers || [], function(emailAddr) { return 'ext_' + emailAddr; }) )
		).join(',');
		
	},
	
	sortRecordTasks : function(record) {
		
		if (!record) return;
		
		var tasks = record.get(Yamma.view.mails.gridactions.SimpleTaskRefGridAction.TASKS_PROPERTY_NAME);
		if (!tasks) return;
		
		Ext.Array.sort(tasks, function sort(task1, task2) {
			
			var
				levelRole1 = getLevel(task1),
				levelRole2 = getLevel(task2)
			;
			
			function getLevel(task) {
				
				var serviceRole = task.properties[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE];
				return Yamma.utils.DeliveryUtils.ROLE_LEVEL[serviceRole] || 10;
				
			}
			
			if (levelRole1 < levelRole2) {
				return -1;
			}
			else if (levelRole2 < levelRole1) {
				return 1;
			}
			
			return 0;
			
		});
		
	}
	
});