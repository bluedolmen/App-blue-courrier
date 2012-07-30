(function() {
   
	var Dom = YAHOO.util.Dom,
	    Event = YAHOO.util.Event;
	
	if ('undefined' == typeof Bluexml) Bluexml = {};
   
   /**
    * Advanced Search constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.AdvancedSearch} The new AdvancedSearch instance
    * @constructor
    */
	Bluexml.SocketAdvancedSearch = function(htmlId) {
		Bluexml.SocketAdvancedSearch.superclass.constructor.call(this, htmlId);      
		return this;
	};
       
	YAHOO.extend(Bluexml.SocketAdvancedSearch, Alfresco.AdvancedSearch, {
   	
		/**
   		 * Replace original implementation to fix a bug that occurs on IE when
   		 * the keywords-box is not displayed...
   		 */
		renderFormTemplate : function ADVSearch_renderFormTemplate(form,repopulate) {
			
			// update current form state
			this.currentForm = form;
			this.currentForm.repopulate = repopulate;

			var containerDiv = Dom.get(this.id + "-forms");

			var visibleFormFn = function() {
				
				// hide visible form if any
				for (var i = 0, c = containerDiv.children, len = c.length; i < len; i++) {
					if (!Dom.hasClass(c[i], "hidden")) {
						Dom.addClass(c[i], "hidden");
						break;
					}
				}

				// display cached form element
				Dom.removeClass(form.htmlid, "hidden");

				// reset focus to search input textbox
				try {
					Dom.get(this.id + "-search-text").focus();
				} catch (e) {
					// Patch for IE. IE does not want to focus on hidden elements
					// Since the keywords-box is not necessarily displayed, we need to ignore this...
				}
			};

			if (!form.htmlid) {
				// generate child container div for this form
				var htmlid = this.id + "_" + containerDiv.children.length;
				var formDiv = document.createElement("div");
				formDiv.id = htmlid;
				Dom.addClass(formDiv, "hidden");
				Dom.addClass(formDiv, "share-form");

				// cache htmlid so we know the form is present on the form
				form.htmlid = htmlid;

				// load the form component for the appropriate type
				var formUrl = YAHOO.lang
						.substitute(
								Alfresco.constants.URL_SERVICECONTEXT
										+ "components/form?itemKind=type&itemId={itemId}&formId={formId}&mode=edit&showSubmitButton=false&showCancelButton=false",
								{
									itemId : form.type,
									formId : form.id
								});
				var formData = {
					htmlid : htmlid
				};
				Alfresco.util.Ajax.request({
					url : formUrl,
					dataObj : formData,
					successCallback : {
						fn : function ADVSearch_onFormTemplateLoaded(response) {
							// Inject the template from the XHR request into the
							// child container div
							formDiv.innerHTML = response.serverResponse.responseText;
							containerDiv.appendChild(formDiv);

							visibleFormFn.call(this);
						},
						scope : this
					},
					failureMessage : "Could not load form component '"
							+ formUrl + "'.",
					scope : this,
					execScripts : true
				});
			} else {
				visibleFormFn.call(this);
			}
		},

		/**
		 * Event handler that gets fired when user clicks the Search button.
		 * 
		 * @method onSearchClick
		 * @param e
		 *            {object} DomEvent
		 * @param obj
		 *            {object} Object passed back from addListener method
		 */
		onSearchClick : function ADVSearch_onSearchClick(e, obj) {
			
			// retrieve form data structure directly from the runtime
			var formData = this.currentForm.runtime.getFormData();

			// add datatype to form data structure
			formData.datatype = this.currentForm.type;

			// also add the term value to form-data (will be unfolded later)
			var keywordSearchInput = YAHOO.util.Dom.get(this.id + "-search-text");
			var term = keywordSearchInput.value;

			// send a custom event to listeners
			// maintained for backward-compatibility
			if ('undefined' != typeof document.onformaction) {
				document.onformaction.fire('search', [formData, term]);
			}

			var message = {
				eventType : 'search',
				formData : formData				
			};
			if (term) message.term = term;
			
			Bluexml.Socket.Default.postMessage(message);

		}

	});	
	
})();