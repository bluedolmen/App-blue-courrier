///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/init/init-common.js">
(function() {

	var TestInit = Utils.Object.create(Init.InitDefinition, {
			
		id : 'test',

		/**
		 * Initialization method
		 */
		init : function() {
			// do nothing
		},
		
		/**
		 * Clear method
		 */
		clear : function() {
			// do nothing
		},
		
		/**
		 * Check whether the module is already installed
		 * @returns {String} the installation state 
		 */
		checkInstalled : function() {
			
			return Init.InstallationStates.NO; // see init-utils.lib.js
			
		},
		
		/**
		 * May return details as string on the installation state
		 * @returns {String} details as a string
		 */
		getDetails : function() {
			
			return '';
			
		}
		
	});
	
	bdInitHelper.registerInitDefinition(TestInit);

})();