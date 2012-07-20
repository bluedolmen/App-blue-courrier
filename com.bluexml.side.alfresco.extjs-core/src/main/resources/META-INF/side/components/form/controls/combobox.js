/**
 * SIDE root namespace.
 * 
 * @namespace SIDE
 */
// Ensure SIDE root object exists
if (typeof SIDE == "undefined" || !SIDE) {
   var SIDE = {};
}
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
 * @namespace SIDE
 * @class SIDE.ComboBox
 */
(function() {

   var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;

   SIDE.ComboBox = function(htmlId, currentValueHtmlId, initialValue) {
      SIDE.ComboBox.superclass.constructor.call(this, "SIDE.ComboBox", htmlId, [ "button", "menu", "container", "resize", "datasource", "datatable" ]);
      this.htmlid = htmlId;
      this.currentValueHtmlId = currentValueHtmlId;
      this.addedFieldHtmlId = htmlId + "-added";
      this.removedFieldHtmlId = htmlId + "-removed";
      this.DSSelectWidget = null;
      this.initialValue = "";
      this.widgets.createNew = new SIDE.CreateTarget(this.htmlid, currentValueHtmlId);
      if (initialValue) {
         this.initialValue = initialValue;
         console.log("field :" + htmlId + " initialValue :" + initialValue);
      }
      YAHOO.Bubbling.on("/side-labs/onCreateNewItem/" + this.currentValueHtmlId, this.reloadBehavior, this);

   };

   YAHOO.extend(SIDE.ComboBox, Alfresco.component.Base, {

      log : function(msg) {
         console.log("[SIDE.ComboBox] " + msg);
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
         this.log("setOptions :" + options);
         SIDE.ComboBox.superclass.setOptions.call(this, options);
         if (options.getDataSource) {
            this.options.getDataSource = options.getDataSource;
         } else {
            var me = this;
            this.options.getDataSource = function _getDataSource(me) {
               var url = Alfresco.constants.PROXY_URI + "api/forms/picker/search/children?selectableType=" + me.options.itemType + "&searchTerm=" + me.options.filterTerm + "&size="
                     + me.options.maxResults + "&advancedQuery=" + me.options.advancedQuery + "&selectableTypeIsAspect=" + me.options.selectableTypeIsAspect;
               if (me.options.searchInSite && Alfresco.constants.SITE != "" && Alfresco.constants.SITE != undefined) {
                  url += "&site=" + Alfresco.constants.SITE;
               }
               if (me.options.startLocation) {
                  url += "&xpath=" + YAHOO.lang.substitute(me.options.startLocation, me.options);
               }
               url = encodeURI(url);
               var myDataSource = new YAHOO.util.XHRDataSource(url);
               myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
               myDataSource.responseSchema = {
                  fields : [ "nodeRef", "name", "title" ],
                  resultsList : "data.items"
               };
               return myDataSource;
            };
         }

         if (this.options.addNewConfig.formconfig.destination) {
            this.options.addNewConfig.formconfig.destination = YAHOO.lang.substitute(this.options.addNewConfig.formconfig.destination, me.options);
         }

         this.widgets.createNew.setOptions(this.options.addNewConfig);
      },

      setMessages : function(messages) {
         SIDE.ComboBox.superclass.setMessages.call(this, messages);
         this.widgets.createNew.setMessages(messages);
         this.messages = messages;
      },
      createAddNewControl : function CT_createControl() {
         // insert button
         var itemGroupActionsContainerEl = Dom.get(this.htmlid + "-actions");
         var addButtonEl = document.createElement("button");
         itemGroupActionsContainerEl.appendChild(addButtonEl);
         this.widgets.addButton = Alfresco.util.createYUIButton(this, null, this.onAddButtonClick, {
            label : this.options.selectActionLabel ? this.options.selectActionLabel : this.msg("form.control.object-picker.add-item"),
            disabled : false
         }, addButtonEl);
      },
      onAddButtonClick : function(e, p_obj) {
         // open dialog with create form in
         this.widgets.createNew.onNewItem(e, p_obj);
      },

      load : function() {
         if (!this.options.disabled && !this.options.addNewConfig.disabled) {
            this.createAddNewControl();
         }

         var myDataSource = this.options.getDataSource(this);
         if (this.options.disabled) {
            // use object-piker instance
            return new Alfresco.ObjectFinder(this.htmlid, this.currentValueHtmlId).setOptions({
               disabled : true,
               field : this.options.field,
               compactMode : true,
               currentValue : this.initialValue,
               labelKey : this.options.labelKey
            }).setMessages(this.messages);
         } else if (this.options.multipleSelectMode) {
            // cardinality n-n
            var multiselect = new SIDE.MyDSMultiSelectField({
               name : "-",
               datasource : myDataSource,
               valueKey : "nodeRef",
               labelKey : this.options.labelKey,
               parentEl : this.htmlid,
               currentValueHtmlId : this.currentValueHtmlId,
               editConfig : this.options.editConfig
            }, this.initialValue);
            multiselect.setMessages(this.messages);
            var me = this;
            multiselect.updatedEvt.subscribe(function(e, params) {
               var values = params[0];
               var toAdd = [];
               var toremove = [];
               var initialValues = null;
               if (me.initialValue) {
                  initialValues = me.initialValue.split(",");
               }
               if (initialValues) {
                  // compute real nodes to remove
                  for ( var c = 0; c < initialValues.length; c++) {
                     var oneValue = initialValues[c];
                     // search this value in the new list
                     if (values.indexOf(oneValue) == -1) {
                        toremove.push(oneValue);
                     }
                  }
                  // compute real nodes to add
                  for ( var c = 0; c < values.length; c++) {
                     var oneValue = values[c];
                     // search this value in the initial list
                     if (initialValues.indexOf(oneValue) == -1) {
                        toAdd.push(oneValue);
                     }
                  }
               } else {
                  toAdd = values;
               }

               me.log("values changed to add :" + toAdd.toString());
               me.log("values changed to remove :" + toremove.toString());
               YAHOO.util.Dom.get(me.addedFieldHtmlId).value = toAdd.toString();
               YAHOO.util.Dom.get(me.removedFieldHtmlId).value = toremove.toString();

               YAHOO.util.Dom.get(me.currentValueHtmlId).value = values.toString();
               if (me.options.mandatory) {
                  YAHOO.Bubbling.fire("mandatoryControlValueUpdated", me);
               }
            });
            return multiselect;
         } else {
            // cardinality n-1
            var DSSelectWidget = new SIDE.MyDSSelectField({
               name : "-",
               datasource : myDataSource,
               valueKey : "nodeRef",
               labelKey : this.options.labelKey,
               parentEl : this.htmlid,
               currentValueHtmlId : this.currentValueHtmlId,
               editConfig : this.options.editConfig
            }, this.initialValue);

            var me = this;
            DSSelectWidget.updatedEvt.subscribe(function(e, params) {
               me.log("updatedEvt :" + e);
               me.log("state :" + params[1].previousState);
               var value = params[0];
               me.log("value :" + value);
               if (params[1].previousState == 'valid') {
                  me.log("value changed to :" + value.toString());
                  me.log("initialValue :" + me.initialValue);
                  if (value != me.initialValue) {
                     // real change

                     // user create or replace association
                     // set selected value into hidden field to add
                     // association
                     me.log("value changed Add :" + value.toString());
                     YAHOO.util.Dom.get(me.addedFieldHtmlId).value = value;

                     if (me.initialValue != "") {
                        // set association to remove
                        me.log("value changed Remove :" + me.initialValue.toString());
                        YAHOO.util.Dom.get(me.removedFieldHtmlId).value = me.initialValue;
                     }
                  } else {
                     me.log("cancel change ...");
                     // cancel change
                     YAHOO.util.Dom.get(me.addedFieldHtmlId).value = "";
                     YAHOO.util.Dom.get(me.removedFieldHtmlId).value = "";
                  }
               }
               YAHOO.util.Dom.get(me.currentValueHtmlId).value = value.toString();
               // update the edit action
               if (DSSelectWidget.editTarget) {
                  if (value != "") {
                     DSSelectWidget.editTarget.options.formconfig.itemId = value;

                     DSSelectWidget.widgets.editButton.set("disabled", false, false);
                  } else {
                     DSSelectWidget.widgets.editButton.set("disabled", true, false);
                  }
               }
               if (me.options.mandatory) {
                  YAHOO.Bubbling.fire("mandatoryControlValueUpdated", me);
               }
            });
            return DSSelectWidget;
         }

      },
      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady : function ComboBox_onReady() {
         YAHOO.Bubbling.fire("/side-labs/onReady/" + this.currentValueHtmlId, this);
         this.DSSelectWidget = this.load();
         if (this.options.hideSelector && !this.options.disabled) {
            this.DSSelectWidget.el.disabled = true;
            this.DSSelectWidget.el.style.display = "none";
         }

         YAHOO.Bubbling.fire("/side-labs/onLoaded/" + this.currentValueHtmlId, this);
         if (this.options.mandatory && !this.options.disabled) {
            YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);
         }
         if (!this.options.disabled && this.initialValue) {
            this.setValue(this.initialValue);
         }
         YAHOO.Bubbling.fire("/side-labs/onInitialized/" + this.currentValueHtmlId, this);
         if (!this.options.disabled) {
            // add widget reference on html element
            var el = document.getElementById(this.currentValueHtmlId);
            el.widget = this;
         }
      },
      setValue : function ComboBox_setValue(value) {
         this.log("before setValue :" + this.getValue());
         this.DSSelectWidget.setValue(value);
         this.log("after setValue :" + this.getValue());
      },
      getValue : function ComboBox_setValue() {
         return this.DSSelectWidget.getValue();
      },
      /**
       * reload the list and can make selection changes : mode
       * :[add|replace|keep|cancel] use keep to only reload the list cancel
       * restore values to initial values This can be used to manage case like :
       * create a new item, refresh the list and select the new item
       */
      reload : function ComboBox_addNew(mode, addNodesToSelection) {
         this.log("mode :" + mode + " addNodesToSelection :" + addNodesToSelection);
         this.DSSelectWidget.reload(mode, addNodesToSelection);
      },
      /**
       * this method is used to define a behavior on event fired to reload the
       * widget.
       */
      reloadBehavior : function ComboBox_reloadBehavior(event, obj, scope) {
         this.log("event :" + event);
         this.log("obj :" + obj);
         this.log("scope :" + scope);
         var context = obj[1];
         this.log("obj[1] :" + context);
         this.reload(context.mode, context.values);
      },
      /**
       * example how to call reload and set parameters
       */
      fireReload : function ComboBox_fireReload() {
         YAHOO.Bubbling.fire("/side-labs/onCreateNewItem/" + this.currentValueHtmlId, {
            mode : "add",
            values : [ "workspace://SpacesStore/7eca31e0-7b33-4f73-b3d3-86e1d9e6fbb2" ]
         });
      }
   });
})();