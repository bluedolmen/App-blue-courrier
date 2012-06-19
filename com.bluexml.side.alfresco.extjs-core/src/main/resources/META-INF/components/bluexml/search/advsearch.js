(function() {
   
	if(typeof Bluexml == "undefined" || !Bluexml) {
		Bluexml = {};
	}    
   
   /**
    * Advanced Search constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.AdvancedSearch} The new AdvancedSearch instance
    * @constructor
    */
   Bluexml.AdvancedSearch = function(htmlId)
   {
      Bluexml.AdvancedSearch.superclass.constructor.call(this, htmlId);      
      return this;
   };
       
   YAHOO.extend(Bluexml.AdvancedSearch, Alfresco.AdvancedSearch,
   {
      
      /**
       * Event handler that gets fired when user clicks the Search button.
       *
       * @method onSearchClick
       * @param e {object} DomEvent
       * @param obj {object} Object passed back from addListener method
       */
      onSearchClick: function ADVSearch_onSearchClick(e, obj)
      {
         // retrieve form data structure directly from the runtime
         var formData = this.currentForm.runtime.getFormData();
         
         // add datatype to form data structure
         formData.datatype = this.currentForm.type;
         
         // also add the term value to form-data (will be unfolded later)
         var keywordSearchInput = YAHOO.util.Dom.get(this.id + "-search-text");
         if (keywordSearchInput) {
         	formData.term = keywordSearchInput.value;
         }
         
         // send a custom event to listeners
         if (document.onformaction) {
         	document.onformaction.fire('search', formData);
         }
         
      }
      
   });	
	
})();