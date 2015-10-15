if (console == undefined) {
   // create a fake console object to avoid error (console is provided by
   // firebug)
   var console = {
      log : function(msg) {
      }
   };
}

(function(BlueDolmen) {

	var 
		lang = YAHOO.lang, 
		Event = YAHOO.util.Event, 
		Dom = YAHOO.util.Dom
	;
	
	/**
	 * Create a multi select field
	 * 
	 * @class BlueDolmen.MultiSelectField
	 * @extends inputEx.SelectField
	 * @constructor
	 * @param {Object}
	 *           options Added options:
	 *           <ul>
	 *           <li>choices: contains the list of choices configs
	 *           ([{value:'usa'}, {value:'fr', label:'France'}])</li>
	 *           </ul>
	 */
	BlueDolmen.MultiSelectField = function(options, initialValue) {
		
		this.name = "BlueDolmen.MultiSelectField";
		this.initialValue = initialValue;
		this.weirdValues = [];
		this.currentValueHtmlId = options.currentValueHtmlId;
		BlueDolmen.MultiSelectField.superclass.constructor.call(this, options);
		
	};

	YAHOO.lang.extend(BlueDolmen.MultiSelectField, inputEx.DSSelectField, {
		
		log : function(msg) {
			console.log("[BlueDolmen.MultiSelectField] " + msg);
		},
		
		setOptions : function(options) {
			
			BlueDolmen.MultiSelectField.superclass.setOptions.call(this, options);
			this.options.editConfig = options.editConfig;
			this.options.keepWeirdValues = options.keepWeirdValues ? options.keepWeirdValues : true;
			this.options.nodoubleValue = options.nodoubleValue != null ? options.nodoubleValue : true;
			this.options.nodoubleLabel = options.nodoubleLabel != null ? options.nodoubleLabel : true;
			
		},

		/**
		 * Set messages for this component.
		 * 
		 * @method setMessages
		 * @param obj
		 *           {object} Object literal specifying a set of messages
		 * @return {object} returns 'this' for method chaining
		 */
		setMessages : function Base_setMessages(obj) {
			
			Alfresco.util.addMessages(obj, this.name);
			this.ddlist.setMessages(obj);
			return this;
			
		},

		/**
		 * Gets a custom message
		 * 
		 * @method msg
		 * @param messageId
		 *           {string} The messageId to retrieve
		 * @return {string} The custom message
		 */
		msg : function Base_msg(messageId) {
			
			return Alfresco.util.message.call(
				this, 
				messageId,
				this.name, 
				Array.prototype.slice.call(arguments).slice(1)
			);
			
		},

		/**
		 * Build the DDList
		 */
		renderComponent : function() {

			BlueDolmen.MultiSelectField.superclass.renderComponent.call(this);

			this.ddlist = new BlueDolmen.DDList({
				parentEl : this.fieldContainer,
				editConfig : this.options.editConfig,
				currentValueHtmlId : this.currentValueHtmlId,
				nodoubleValue : this.options.nodoubleValue,
				nodoubleLabel : this.options.nodoubleLabel
			});

		},

		/**
		 * Register the "change" event
		 */
		initEvents : function() {
			
			YAHOO.util.Event.addListener(this.el, "change", this.onAddNewItem, this, true);
			this.ddlist.itemRemovedEvt.subscribe(this.onItemRemoved, this, true);
			this.ddlist.listReorderedEvt.subscribe(this.fireUpdatedEvt, this, true);
			
		},

		/**
		 * Re-enable the option element when an item is removed by the user
		 */
		onItemRemoved : function(e, params) {

			this.showChoice({
				value : params[0]
			});
			
			this.el.selectedIndex = 0;
			
			this.fireUpdatedEvt();

		},

		/**
		 * Add an item to the list when the select changed
		 */
		onAddNewItem : function() {

			var value, position, choice;
			
			if (this.el.selectedIndex === 0) return;

			// Get the selector value
			value = BlueDolmen.MultiSelectField.superclass.getValue.call(this);

			position = this.getChoicePosition({
				value : value
			});
			choice = this.choicesList[position];

			this.ddlist.addItem({
				value : value,
				label : choice.label
			});

			// hide choice that has just been selected (+ select first
			// choice)
			this.hideChoice({
				position : position
			});
			
			this.el.selectedIndex = 0;
			
			this.fireUpdatedEvt();
			
		},

		/**
		 * Set the value of the list
		 * 
		 * @param {String}
		 *           value The value to set
		 * @param {boolean}
		 *           [sendUpdatedEvt] (optional) Wether this setValue should fire
		 *           the updatedEvt or not (default is true, pass false to NOT
		 *           send the event)
		 */
		setValue : function(value, sendUpdatedEvt) {

			var i, length, position, choice, ddlistValue = [];

			if (!YAHOO.lang.isArray(value)) {
				return;
			}

			// Re-show all choices
			for (i = 0, length = this.choicesList.length; i < length; i += 1) {
				this.showChoice({
					position : i
				});
			}

			// Hide selected choices and fill ddlist value
			for (i = 0, length = value.length; i < length; i += 1) {

				position = this.getChoicePosition({
					value : value[i]
				});

				// check if value exists in available ones
				if (position > -1) {
					choice = this.choicesList[position];

					ddlistValue.push({
						value : choice.value,
						label : choice.label
					});

					this.hideChoice({
						position : position
					});
				} 
				else {
					// the current value do not exists in choiceList
					// this is weird ... so keep it in dedicated array
					this.weirdValues.push(value[i]);
				}
			}

			// set ddlist value
			this.ddlist.setValue(ddlistValue);

			// reset select to first choice
			this.el.selectedIndex = 0;

			if (sendUpdatedEvt !== false) {
				// fire update event
				this.fireUpdatedEvt();
			}
			
		},

		/**
		 * Return the value
		 * 
		 * @return {Any} an array of selected values
		 */
		getValue : function() {
			
			var values = this.ddlist.getValue();
			if (this.options.keepWeirdValues) {
				// ok so be it, we add values stored in weirdValues
				values = values.concat(this.weirdValues);
			}
			
			return values;
			
		},
		/**
		 * Send the datasource request for reload
		 */
		reload : function(mode, addedValues) {
			
			var newValue = [];
			
			if (mode == "add") {
				newValue = newValue.concat(this.getValue());
				newValue = newValue.concat(addedValues);
			} 
			else if (mode == "replace") {
				newValue = addedValues;
			} 
			else if (mode == "keep") {
				newValue = this.getValue();
			} 
			else if (mode == "cancel" && this.initialValue) {
				newValue = this.initialValue.split(',');
			}

			this.reloadData = {
				added : newValue,
				mode : mode
			};
			
			this.sendDataRequest();
			
		},
		
		/**
		 * Callback for request success
		 */
		onDatasourceSuccess : function(oRequest, oParsedResponse, oPayload) {
			
			var values = [];

			this.choicesList = [];
			this.populateSelect(oParsedResponse.results);
			this.addChoice({
				value : '',
				label : '',
				position : 0
			});
			this.el.selectedIndex = 0;

			if (this.reloadData) {
				values = this.reloadData.added;
				this.reloadData = null;
			} 
			else if (this.initialValue) {
				values = this.initialValue.split(",");
			}
			
			this.setValue(values);
			
		}

	});

	// Register this class as "multiselect" type
	inputEx.registerType("bluedolmen.multiselect", BlueDolmen.MultiSelectField);

}(window.BlueDolmen = window.BlueDolmen || {}));


(function() {

	var 
		lang = YAHOO.lang, 
		Event = YAHOO.util.Event, 
		Dom = YAHOO.util.Dom
	;
	
	/**
	 * DDList extension to add edit action
	 */
	BlueDolmen.DDList = function(options) {
		
		this.editLinksTarget = [];
		this.itemsLabels = [];

		this.name = "BlueDolmen.DDList";
		BlueDolmen.DDList.superclass.constructor.call(this, options);
		
	};
	
	YAHOO.lang.extend(BlueDolmen.DDList, inputEx.widget.DDList, {
		
		log : function(msg) {
			console.log("[BlueDolmen.DDList] " + msg);
		},
		
		setOptions : function(options) {
			
			BlueDolmen.DDList.superclass.setOptions.call(this, options);
			this.options.editConfig = options.editConfig;
			this.options.currentValueHtmlId = options.currentValueHtmlId;
			this.options.nodoubleValue = options.nodoubleValue;
			this.options.nodoubleLabel = options.nodoubleLabel;
			
		},

		/**
		 * Set messages for this component.
		 * 
		 * @method setMessages
		 * @param obj
		 *           {object} Object literal specifying a set of messages
		 * @return {object} returns 'this' for method chaining
		 */
		setMessages : function Base_setMessages(obj) {
			
			Alfresco.util.addMessages(obj, this.name);
			return this;
			
		},

		/**
		 * Gets a custom message
		 * 
		 * @method msg
		 * @param messageId
		 *           {string} The messageId to retrieve
		 * @return {string} The custom message
		 */
		msg : function Base_msg(messageId) {
			
			return Alfresco.util.message.call(
					this, 
					messageId,
					this.name, 
					Array.prototype.slice.call(arguments).slice(1)
			);
			
		},

		/**
		 * Add an item to the list
		 * 
		 * @param {String|Object}
		 *           item Either a string with the given value or an object with
		 *           "label" and "value" attributes
		 */
		addItem : function(item) {
			
			var 
				me = this,
				itemValue = (typeof item == "object") ? item.value : item,
				itemLabel = (typeof item == "object") ? item.label : item,
				li, 
				removeLabel, removeLink,
				editLabel, editLink,
				dditem
			;
			
			if (	
				this.options.nodoubleValue && (
					this.items.indexOf(itemValue) !== -1 || this.itemsLabels.indexOf(itemLabel) !== -1
				)
			){
				Alfresco.util.PopupManager.displayPrompt({
					text : this.msg("form.control.lists.item.exists", "")
				});
				return;
			}				
				
			// ok new value
			li = inputEx.cn('li', {
				className : 'inputEx-DDList-item'
			});
			li.appendChild(inputEx.cn('span', null, null, itemLabel));

			// Option for the "remove" link (default: true)
			if (!!this.options.allowDelete) {
				
				removeLabel = this.msg("form.control.object-picker.remove-item");
				if (this.options.editConfig.formconfig != null && this.options.editConfig.formconfig.formId != null) {
					removeLabel = this.msg("form.control.object-picker.remove-subform-item");
				}
				
				removeLink = inputEx.cn('a', null, null, removeLabel);
				li.appendChild(removeLink);
				Event.addListener(
					removeLink,
					'click',
					function(e) {
						var 
							a = Event.getTarget(e),
							li = a.parentNode
						;
						this.removeItem(inputEx.indexOf(li, this.ul.childNodes));
					}, 
					this, 
					true
				);
				
			}

			if (!lang.isUndefined(this.options.editConfig) && !this.options.editConfig.disabled) {
				
				editLabel = this.msg("form.control.object-picker.edit");
				editLink = inputEx.cn('a', null, null, editLabel);
				
				li.appendChild(editLink);
				Event.addListener(
					editLink,
					'click',
					function(e) {
						var editTarget = new BlueDolmen.CreateTarget(
							me.id,
							me.options.currentValueHtmlId
						);
						editTarget.setOptions(me.options.editConfig);
						editTarget.options.formconfig.itemId = item.value;
						editTarget.onNewItem(e, me);
					}, 
					this, 
					true
				);
				
			}
			
			dditem = new inputEx.widget.DDListItem(li);
			dditem._list = this;

			this.items.push(itemValue);
			this.itemsLabels.push(itemLabel);

			this.ul.appendChild(li);
			
		},
		
		/**
		 * private method to remove an item
		 * @param {Integer} index index of item to be removed
		 * @private
		 */
		_removeItem : function(i) {
			
			var itemValue = BlueDolmen.DDList.superclass._removeItem.call(this, i);

			this.itemsLabels[i] = null;
			this.itemsLabels = inputEx.compactArray(this.itemsLabels);

			return itemValue;
			
		}
		
	});
	
}(window.BlueDolmen = window.BlueDolmen || {}));