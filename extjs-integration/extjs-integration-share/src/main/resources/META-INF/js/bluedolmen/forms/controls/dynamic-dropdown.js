(function(BlueDolmen) {
	
	var Dom = YAHOO.util.Dom,
	Event = YAHOO.util.Event;
	var $html = Alfresco.util.encodeHTML;

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /* , from */) {
			var len = this.length >>> 0;

			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0)
				from += len;

			for (; from < len; from++) {
				if (from in this && this[from] === elt)
					return from;
			}
			return -1;
		};
	}

	BlueDolmen.DynamicDropdown = function(htmlId) {
		
		var 
			componentName = "BlueDolmen.DynamicDropdown"
		; 
		
		return BlueDolmen.DynamicDropdown.superclass.constructor.call(this, componentName, htmlId, "BlueDolmen.DynamicDropdown");
		
	};
	
	YAHOO.extend(BlueDolmen.DynamicDropdown, Alfresco.component.Base, {
		
		options : {
			itemId       : "",
			siteName     : "",
			picklistName : "",
			initialValue : "",
			includeBlank : true,
			datasourceUrl: Alfresco.constants.PROXY_URI + 'bluedolmen/forms/datalist/{siteName}/{picklistName}/items'
		},
		
		onReady : function() {
			
			this.inputField = Dom.get(this.id);
			this.addedField = Dom.get(this.id + '-added');
			this.removedField = Dom.get(this.id + '-removed');
			
        	YAHOO.util.Event.addListener(this.id, "change", this._onChange, this, true);
        	
        	if (this.inputField.form) {
        		YAHOO.util.Event.addListener(this.inputField.form, "submit", this._onSubmit, this, true);
        	}
			
			this.loadValues();
			
		},        
        
		loadValues : function() {
			
    		var 
    			me = this,
    			selectEl = me.inputField
    		;
    		
			// success handler, populate the dropdown
            function onSuccess(response) {
            	
            	clearOptions();
            	_parseResponse(response);
            	
				YAHOO.Bubbling.fire("mandatoryControlValueUpdated", me);
				
            };
            
    		function clearOptions() {
    			
            	//clear selected item
            	selectEl.selectedIndex = -1;
            	
            	//clear the current dropdown options
            	while (selectEl.hasChildNodes()) {
            		selectEl.removeChild(selectEl.lastChild);
            	}
            	    			
    		}
    		
            function _parseResponse(response) {
            	
            	var
            		json = response.json, 
            		items = json ? json.items : null,
            		i, len, optionElement
            	;
            	
            	if (!items) return;
            	
            	if (me.options.includeBlank) {
            		optionElement = _buildOptionElement({label : "", value : ""});
            		selectEl.appendChild(optionElement);
            	}
            	
            	//response is the already parsed JSON response
				for (i=0, len = items.length; i<len; i++) {
					optionElement = _buildOptionElement(items[i]);
					selectEl.appendChild(optionElement);
				}
            	
            }
            
            function _buildOptionElement(item) {
            	
            	var optionElement = document.createElement("option");
				optionElement.innerHTML = item.label;
				optionElement.value = item.value;
				
				if (_isOptionSelected(item.value) ) {
					optionElement.selected = "selected";
				}
            	
				return optionElement;
				
            }
            
            function _isOptionSelected(value) {
            	return ( me.options.initialValue instanceof Array && me.options.initialValue.indexOf(value) !== -1 )
					|| (me.options.initialValue === value);
            }
			
            // failure handler, display alert
            function onFailure(response) {
            	
            	clearOptions();
            	
            	// hide the whole field so incorrect content does not get re-submitted
            	_hideField();
               
            	if (Alfresco.logger.isDebugEnabled()) {
            		Alfresco.logger.debug("Hidden field '" + me.id + "' as content retrieval failed");
            	}
               
            };
            
            function _hideField() {
            	
            	selectEl.hidden = true;
            	
            }

            url = me.options.datasourceUrl
            	.replace(/\{siteName\}/, me.options.siteName)
            	.replace(/\{picklistName\}/, me.options.picklistName)
            ;
            
            Alfresco.util.Ajax.request({
            	
               url: url,
               method: "GET",
               responseContentType : "application/json",
               
               successCallback: {
                  fn: onSuccess,
                  scope: this
               },
               
               failureCallback: {
                  fn: onFailure,
                  scope: this
               }
               
            });

		},
		
		_onChange : function() {
			
    		var 
    			htmlId = this.id,
				itemValue = this.inputField.value
			;
			
			if (this.addedField && this.removedField) {
				this.removedField.value = this.options.initialValue;
				this.addedField.value = itemValue;
			}
	
			//input value changed, fire a bubbling event with our fieldId, value
			YAHOO.Bubbling.fire("bluedolmen.changed", { itemId : htmlId, itemValue : itemValue} );
			
		},
		
		_onSubmit : function() {
			
			this.inputField.disabled = true;
			
		}
		
   });
	
})(window.BlueDolmen = window.BlueDolmen || {});