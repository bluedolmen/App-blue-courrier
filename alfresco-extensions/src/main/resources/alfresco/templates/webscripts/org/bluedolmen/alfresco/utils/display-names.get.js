///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">

(function() {

	var
		userNames = [],
		displayIds = false
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs('userNames','displayIds'),
			userNames_ = Utils.asString(parseArgs['userNames']),
			displayIds_ = Utils.asString(parseArgs['displayIds'])
		;
		
		if (userNames_) {
			userNames = Utils.String.splitToTrimmedStringArray(userNames_);
		}
		
		displayIds = 'true' == displayIds_;
		 
		main();
		
	});
	
	function main() {
		
		setModel();
		
	}
	
	
	function setModel() {
		
		var displayNames = {};
		
		Utils.forEach(userNames, function(userName) {
			
			if (!userName) return;
			displayNames[userName] = Utils.Alfresco.getPersonDisplayName(userName, displayIds);
			
		});
			
		model.displayNames = displayNames;
		
	}
	
})();