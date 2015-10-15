(function(BlueDolmen){

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
	
    BlueDolmen.LoadLabel = function(htmlId) {
    	
		var 
			componentName = "BlueDolmen.LoadLabel",
			returnObject = BlueDolmen.LoadLabel.superclass.constructor.call(this, componentName, htmlId, "BlueDolmen.LoadLabel")
		; 
		
		return returnObject;
		
	};
	
	YAHOO.extend(BlueDolmen.LoadLabel, Alfresco.component.Base, {
		
		options : {
			itemId       : "",
			siteName     : "",
			picklistName : "",
			initialValue : "",
			includeBlank : true,
			datasourceUrl: Alfresco.constants.PROXY_URI + 'bluedolmen/forms/datalist/{siteName}/{picklistName}/items'
		},
		
		onReady : function() {
			
			this.spanEl = Dom.get(this.id);
			this.loadValues();
			
		}, 

		loadValues : function() {
			
    		var 
    			me = this
    		;
    		
			// success handler, populate the dropdown
            function onSuccess(response) {
            	
            	_parseResponse(response);
            	
            };
            
            function _parseResponse(response) {
            	
            	var
            		json = response.json, 
            		items = json ? json.items : null,
            		i, len, item
            		labels
            	;
            	
            	if (!items) return;
            	
            	var labels;
            	
            	//response is the already parsed JSON response
				for (i=0, len = items.length; i<len; i++) {
					item = items[i];
					if (me.options.initialValue == item.value) {
						setLabel(item.label);
						break;
					}
				}            	
            	
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
            
            function setLabel(label) {
            	me.spanEl.innerHTML = label;
            }
            
            function _hideField() {
                me.spanEl.hidden = true;
            }

            url = me.options.datasourceUrl
            	.replace(/\{siteName\}/, me.options.siteName)
            	.replace(/\{picklistName\}/, me.options.picklistName)
            	.replace(/\/\//,'/') // if siteName is not defined
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

		}		
		
   });
	
}(window.BlueDolmen = window.BlueDolmen || {}));
