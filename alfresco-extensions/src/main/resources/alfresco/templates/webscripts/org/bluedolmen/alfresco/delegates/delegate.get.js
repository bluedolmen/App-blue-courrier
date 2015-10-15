///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">

(function() {

	var
		authorityName = null,
		delegates = []
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs({ name : 'authority', mandatory : true});
		authorityName = parseArgs['authority'];
		
		main();
		
	});
	
	function main() {

		this.delegates = delegates.getDirectDelegates(this.authorityName);
		setModel();
		
	}	
	
	function setModel() {
		
		model.delegates = this.delegates;
		
	}
	
})();