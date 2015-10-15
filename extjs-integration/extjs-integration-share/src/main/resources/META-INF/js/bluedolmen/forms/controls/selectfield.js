if (console == undefined) {
	// create a fake console object to avoid error (console is provided by
	// firebug)
	var console = {
		log : function(msg) {
		}
	};
}

if (Alfresco == undefined) {
	var Alfresco = {
		logger : {
			debug : function(msg) {
			}
		}
	}
}

(function(BlueDolmen) {

	var 
		Dom = YAHOO.util.Dom
	;
	
	/**
	 * Create a select field from a datasource
	 * 
	 * @class BlueDolmen.SelectField
	 * @extends inputEx.SelectField
	 * @constructor
	 * @param {Object}
	 *            options Added options:
	 *            <ul>
	 *            <li>options: list of option elements configurations</li>
	 *            <li>datasource: the datasource</li>
	 *            <li>valueKey: value key</li>
	 *            <li>labelKey: label key</li>
	 *            </ul>
	 * @param {String}
	 *            initialValue value to select on widget creation
	 * 
	 */
	BlueDolmen.SelectField = function(options, initialValue) {
		
		this.widgets = {};
		this.initialValue = initialValue;
		
		if (!options.editConfig.disabled) {
			this.parentEl = options.parentEl;
			this.currentValueHtmlId = options.currentValueHtmlId;
			this.editTarget = new BlueDolmen.CreateTarget(this.parentEl, this.currentValueHtmlId);
			this.editTarget.setOptions(options.editConfig);
		}
		
		BlueDolmen.SelectField.superclass.constructor.call(this, options);
		
	};

	YAHOO.lang.extend(BlueDolmen.SelectField, inputEx.DSSelectField, {
		
		log : function(msg) {
			var logmsg = "[BlueDolmen.SelectField] " + msg;
			console.log(logmsg);
			Alfresco.logger.debug(logmsg);
		},
		
		/**
		 * Build a select tag with options
		 */
		renderComponent : function() {
			
			var 
				itemGroupActionsContainerEl,
				editButtonEl
			;
			
			BlueDolmen.SelectField.superclass.renderComponent.call(this);
			
			if (this.editTarget) {
				itemGroupActionsContainerEl = Dom.get(this.parentEl + "-actions");
				editButtonEl = document.createElement("button");
				itemGroupActionsContainerEl.appendChild(editButtonEl);
				this.widgets.editButton = Alfresco.util.createYUIButton(
					this, 
					null, 
					this.onEditButtonClick, 
					{
						label : this.options.selectActionLabel ? this.options.selectActionLabel : "edit",
						disabled : true
					}, 
					editButtonEl
				);
			}
			
		},

		onEditButtonClick : function(e, p_obj) {
			// open dialog with edit form in
			this.editTarget.onNewItem(e, p_obj);
		},

		
		/**
		 * Send the datasource request for reload and preserve selected value
		 */
		reload : function(mode, addedValue) {
			
			// modes ::[add|replace|keep|cancel]
			var 
				newValue = ''
			;
			
			if (mode == "add" || mode == "replace") {
				newValue = addedValue[0];
			} 
			else if (mode == "keep") {
				newValue = this.getValue();
			} 
			else if (mode == "cancel" && this.initialValue) {
				newValue = this.initialValue;
			}

			this.reloadData = {
				added : newValue,
				mode : mode ? mode : 'keep'
			};
			
			this.sendDataRequest(null);
			
		},
		/**
		 * Callback for request success
		 */
		onDatasourceSuccess : function(oRequest, oParsedResponse, oPayload) {
			
			var value = '';
			
			this.choicesList = [];
			this.populateSelect(oParsedResponse.results);
			this.addChoice({
				value : '',
				label : '',
				position : 0,
				selected : false
			});

			if (this.reloadData) {
				value = this.reloadData.added;
				this.reloadData = null;
			} 
			else if (this.initialValue) {
				value = this.initialValue;
			}

			this.setValue(value);
			this.previousState = 'valid';
			
		}
	});

	// Register this class as "sidedsselect" type
	inputEx.registerType("bluedolmen.selectfield", BlueDolmen.SelectField);

}(window.BlueDolmen = window.BlueDolmen || {}));