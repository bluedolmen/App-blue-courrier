if (console == undefined) {
	// create a fake console object to avoid error (console is provided by
	// firebug)
	var console = {
		log : function(msg) {
		}
	};
}

// This prototype is provided by the Mozilla foundation and
// is distributed under the MIT license.
// http://www.ibiblio.org/pub/Linux/LICENSES/mit.license

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /* , from */) {
		var len = this.length;

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

/**
 * ComboBox component.
 * 
 * @namespace BlueDolmen
 * @class BlueDolmen.ComboBox
 */
(function(BlueDolmen) {

	var 
		lang = YAHOO.lang, 
		Event = YAHOO.util.Event, 
		Dom = YAHOO.util.Dom
	;

	BlueDolmen.ComboBox = function(htmlId, currentValueHtmlId, initialValue) {
		
		BlueDolmen.ComboBox.superclass.constructor.call(
			this,
			"BlueDolmen.ComboBox", 
			htmlId, 
			[ "button", "menu", "container", "resize", "datasource", "datatable" ]
		);
		
		this.htmlid = htmlId;
		this.currentValueHtmlId = currentValueHtmlId;
		this.addedFieldHtmlId = htmlId + "-added";
		this.removedFieldHtmlId = htmlId + "-removed";
		this.selectField = null;
		this.initialValue = "";
		this.widgets.createNew = new BlueDolmen.CreateTarget(this.htmlid, currentValueHtmlId);
		
		if (initialValue) {
			this.initialValue = initialValue;
		}
		
		YAHOO.Bubbling.on("bluedolmen.oncreatenewitem" + this.currentValueHtmlId, this.reloadBehavior, this);

	};

	YAHOO.extend( BlueDolmen.ComboBox, Alfresco.component.Base, {
		
		log : function(msg) {
			console.log("[BlueDolmen.ComboBox] " + msg);
		},

		/**
		 * Object container for initialization options
		 * 
		 * @property options
		 * @type object
		 */
		options : {
			disabled : false,
			itemType : "",
			multipleSelectMode : false,
			mandatory : false,
			filterTerm : "*",
			advancedQuery : "",
			maxResults : -1,
			selectableTypeIsAspect : false,
			searchInSite : true,
			hideSelector : false,
			addNewConfig : {
				disabled : true,
				formconfig : {}
			},
			editConfig : {
				disabled : true,
				formconfig : {}
			},
			labelKey : "name"
		},

		setOptions : function(options) {
			
			BlueDolmen.ComboBox.superclass.setOptions.call(this, options);
			
			this.options.getDataSource = this._getDataSource(options);

			if (this.options.addNewConfig.formconfig.destination) {
				this.options.addNewConfig.formconfig.destination = YAHOO.lang.substitute(
					this.options.addNewConfig.formconfig.destination,
					me.options
				);
			}

			this.widgets.createNew.setOptions(this.options.addNewConfig);
			
		},
		
		_getDataSource : function(options) {
			
			var 
				me = this
			;
			
			if (options.getDataSource) {
				return options.getDataSource;
			} 
				
			return function _getDataSource() {
				
				var 
					url = Alfresco.constants.PROXY_URI
						+ "api/forms/picker/search/children?selectableType="
						+ me.options.itemType
						+ "&searchTerm="
						+ me.options.filterTerm + "&size="
						+ me.options.maxResults
						+ "&advancedQuery="
						+ me.options.advancedQuery
						+ "&selectableTypeIsAspect="
						+ me.options.selectableTypeIsAspect,
					dataSource
				;
				
				if (me.options.searchInSite && Alfresco.constants.SITE) {
					url += "&site=" + Alfresco.constants.SITE;
				}
				
				if (me.options.startLocation) {
					url += "&xpath=" + YAHOO.lang.substitute(
						me.options.startLocation,
						me.options
					);
				}
				
				url = encodeURI(url);
				
				var dataSource = new YAHOO.util.XHRDataSource(url);
				dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
				dataSource.responseSchema = {
					fields : [ "nodeRef", "name", "title" ],
					resultsList : "data.items"
				};
				
				return dataSource;
				
			};
			
		},

		setMessages : function(messages) {
			
			BlueDolmen.ComboBox.superclass.setMessages.call(this, messages);
			this.widgets.createNew.setMessages(messages);
			this.messages = messages;
			
		},
		
		createAddNewControl : function CT_createControl() {
			
			// insert button
			var 
				itemGroupActionsContainerEl = Dom.get(this.htmlid + "-actions"),
				addButtonEl = document.createElement("button")
			;
			
			itemGroupActionsContainerEl.appendChild(addButtonEl);
			this.widgets.addButton = Alfresco.util.createYUIButton(
				this,
				null,
				this.onAddButtonClick,
				{
					label : this.options.selectActionLabel 
						? this.options.selectActionLabel 
						: this.msg("form.control.object-picker.add-item"),
					disabled : false
				}, 
				addButtonEl
			);
		},
		
		onAddButtonClick : function(e, p_obj) {
			// open dialog with create form in
			this.widgets.createNew.onNewItem(e, p_obj);
		},

		load : function() {
			
			var 
				dataSource
			;
			
			if (!this.options.disabled && !this.options.addNewConfig.disabled) {
				this.createAddNewControl();
			}

			dataSource = this.options.getDataSource(this);
			
			if (this.options.disabled) {
				// use object-piker instance
				return this._createObjectFinder();
			} 
			else if (this.options.multipleSelectMode) {
				// cardinality n-n
				return this._createMultiSelectField(dataSource);
			} 
			else {
				// cardinality n-1
			}

		},
		
		_createObjectFinder : function() {
			
			var objectFinder = new Alfresco.ObjectFinder(
					this.htmlid,
					this.currentValueHtmlId
				)
			;
			
			objectFinder.setOptions({
				disabled : true,
				field : this.options.field,
				compactMode : true,
				currentValue : this.initialValue,
				labelKey : this.options.labelKey
			});
			
			objectFinder.setMessages(this.messages);
			
			return objectFinder;
			
		},
		
		_createMultiSelectField : function(dataSource) {
			
			var
				me = this,
				multiselect = new BlueDolmen.MultiSelectField({
					name : "-",
					datasource : dataSource,
					valueKey : "nodeRef",
					labelKey : this.options.labelKey,
					parentEl : this.htmlid,
					currentValueHtmlId : this.currentValueHtmlId,
					editConfig : this.options.editConfig
				}, this.initialValue);
			
			multiselect.setMessages(this.messages);
			multiselect.updatedEvt.subscribe(onUpdatedEvt);
			
			return multiselect;
			
			
			function onUpdatedEvt(e, params) {
				
				var 
					values = params[0],
					toAdd = [],
					toremove = [],
					initialValues = null,
					c, len, oneValue
				;
				
				if (me.initialValue) {
					initialValues = me.initialValue.split(",");
				}
				
				if (initialValues) {
					// compute real nodes to remove
					for (c = 0, len = initialValues.length; c < len; c++) {
						oneValue = initialValues[c];
						// search this value in the
						// new list
						if (values.indexOf(oneValue) == -1) {
							toremove.push(oneValue);
						}
					}
					
					// compute real nodes to add
					for (c = 0, len = values.length; c < len; c++) {
						oneValue = values[c];
						// search this value in the
						// initial list
						if (initialValues.indexOf(oneValue) == -1) {
							toAdd.push(oneValue);
						}
					}
				} 
				else {
					toAdd = values;
				}

				YAHOO.util.Dom.get(me.addedFieldHtmlId).value = toAdd.toString();
				YAHOO.util.Dom.get(me.removedFieldHtmlId).value = toremove.toString();
				YAHOO.util.Dom.get(me.currentValueHtmlId).value = values.toString();
				
				if (me.options.mandatory) {
					YAHOO.Bubbling.fire("mandatoryControlValueUpdated", me);
				}
				
			}
			
		},
		
		_createSelectField : function(dataSource) {
			
			var 
				me = this,
				selectField = new BlueDolmen.SelectField({
					name : "-",
					datasource : dataSource,
					valueKey : "nodeRef",
					labelKey : this.options.labelKey,
					parentEl : this.htmlid,
					currentValueHtmlId : this.currentValueHtmlId,
					editConfig : this.options.editConfig
				}, this.initialValue)
			;

			selectField.updatedEvt.subscribe(onUpdatedEvt);
			return selectField;
			
			
			function onUpdatedEvt(e, params) {
				
				var 
					value = params[0]
				;
				
				if ('valid' == params[1].previousState) {
					
					if (value != me.initialValue) {
						// real change

						// user create or replace
						// association
						// set selected value into
						// hidden field to add
						// association
						YAHOO.util.Dom.get(me.addedFieldHtmlId).value = value;

						if ("" != me.initialValue) {
							// set association to
							// remove
							YAHOO.util.Dom.get(me.removedFieldHtmlId).value = me.initialValue;
						}
						
					} 
					else {
						// cancel change
						YAHOO.util.Dom.get(me.addedFieldHtmlId).value = "";
						YAHOO.util.Dom.get(me.removedFieldHtmlId).value = "";
					}
					
				}
				
				YAHOO.util.Dom.get(me.currentValueHtmlId).value = value.toString();
				
				// update the edit action
				if (selectField.editTarget) {
					if ("" != value) {
						selectField.editTarget.options.formconfig.itemId = value;
						selectField.widgets.editButton.set("disabled", false, false);
					} 
					else {
						selectField.widgets.editButton.set("disabled", true, false);
					}
				}
				
				if (me.options.mandatory) {
					YAHOO.Bubbling.fire("mandatoryControlValueUpdated", me);
				}
				
			}			
			
		},
		
		/**
		 * Fired by YUI when parent element is available for
		 * scripting
		 * 
		 * @method onReady
		 */
		onReady : function ComboBox_onReady() {
			
			var el;
			
			YAHOO.Bubbling.fire("bluedolmen.onready" + this.currentValueHtmlId, this);
			this.selectField = this.load();
			
			if (this.options.hideSelector && !this.options.disabled) {
				this.selectField.el.disabled = true;
				this.selectField.el.style.display = "none";
			}

			YAHOO.Bubbling.fire("bluedolmen.onloaded" + this.currentValueHtmlId, this);
			if (this.options.mandatory && !this.options.disabled) {
				YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);
			}
			
			if (!this.options.disabled && this.initialValue) {
				this.setValue(this.initialValue);
			}
			
			YAHOO.Bubbling.fire("bluedolmen.oninitialized" + this.currentValueHtmlId, this);
			if (!this.options.disabled) {
				// add widget reference on html element
				el = document .getElementById(this.currentValueHtmlId);
				el.widget = this;
			}
			
		},
		
		setValue : function ComboBox_setValue(value) {
			this.selectField.setValue(value);
		},
		
		getValue : function ComboBox_setValue() {
			return this.selectField.getValue();
		},
		
		/**
		 * reload the list and can make selection changes : mode
		 * :[add|replace|keep|cancel] use keep to only reload
		 * the list cancel restore values to initial values This
		 * can be used to manage case like : create a new item,
		 * refresh the list and select the new item
		 */
		reload : function ComboBox_addNew(mode, addNodesToSelection) {
			this.selectField.reload(mode, addNodesToSelection);
		},
		
		/**
		 * this method is used to define a behavior on event
		 * fired to reload the widget.
		 */
		reloadBehavior : function ComboBox_reloadBehavior(event, obj, scope) {
			var context = obj[1];
			this.reload(context.mode, context.values);
		}
		
		/**
		 * example how to call reload and set parameters
		 */
//		,fireReload : function ComboBox_fireReload() {
//			YAHOO.Bubbling.fire(
//				"bluedolmen.oncreatenewitem" + this.currentValueHtmlId,
//				{
//					mode : "add",
//					values : [ "workspace://SpacesStore/7eca31e0-7b33-4f73-b3d3-86e1d9e6fbb2" ]
//				});
//		}
	});
})(window.BlueDolmen = window.BlueDolmen || {});