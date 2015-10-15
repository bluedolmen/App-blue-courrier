///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	function checkPosition(position) {
		if (null == position) return;
		if ( /\d*(\.\d*)?;\d*(\.\d*)?/.test(position) ) return;
		return 'The position should be defined as a "[x];[y]" string';
	}
	
	function checkSize(size) {
		if (null == size) return;
		if ( /\d*(\.\d*)?x\d*(\.\d*)?/.test(size) ) return;
		return 'The size should be defined as a "[width]x[height]" string';		
	}
	
	function checkPage(page) {
		if (/\d*/.test(page)) return;
		page = Number(page);
		if (page < 1 ) 'The page has to be a page-number starting from 1';
	}
	
	Yamma.Actions.CertifyDocumentAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		idArg : 'nodeRefs',
		
		eventType : 'certify',
		
		reason : null,
		location : null,
		position : null,
		size_ : null,
		fieldName : null,
		password : null,
		alias : null,
		page : null,
		
		wsArguments : [
  			{ name : 'position', checkValue : checkPosition },
   			{ name : 'size', checkValue : checkSize },
   			{ name : 'page', checkValue : checkPage },
   			'reason',
   			'location',
   			'field-name',
   			{ name: 'password', mandatory : true },
   			'alias'
   		],
   				
   		prepare : function() {
   			
   			if (!signingUtils.hasSigningKey()) {
   				throw {
   					code : 400,
   					message : 'You do not own any signing-key (please set one before)'
   				};
   			}
   			
   			this.reason = Utils.asString(this.parseArgs['reason']);
   			this.location = Utils.asString(this.parseArgs['location']);
   			this.position = Utils.asString(this.parseArgs['position']);
   			this.size = Utils.asString(this.parseArgs['size']);
   			this.fieldName = Utils.asString(this.parseArgs['field-name']);
   			this.password = Utils.asString(this.parseArgs['password']);
   			this.alias = Utils.asString(this.parseArgs['alias']);   			
   			this.page = Number(this.parseArgs['page']);
   			
   			if (this.page <= 0) {
   				throw {
   					code : 400,
   					message : 'The page-number has to be a strictly positive integer (starting from 1)'
   				};
   			}
   			
   			
   		},		

		
		isExecutable : function(node) {
			
			return true;
			
		},
		
		doExecute : function(node) {
		
			signingUtils.sign(node, {
				
				reason : this.reason,
				location : this.location,
				position : this.position,
				size : this.size,
				fieldName : this.fieldName,
				password : this.password,
				alias : this.alias,
				pageNumber : this.page
				
			});
			
		}
		
	});

	Yamma.Actions.CertifyDocumentAction.execute();	
	
})();