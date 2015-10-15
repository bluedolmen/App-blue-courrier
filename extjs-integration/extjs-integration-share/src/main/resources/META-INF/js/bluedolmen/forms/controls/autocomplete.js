(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      KeyListener = YAHOO.util.KeyListener;

   /**
    * Alfresco.widget.MultiSelectAutoComplete constructor.
    * Should not be created directly, but via the Alfresco.util.createBalloon static function.
    *
    * @param p_context {object}
    * @param p_params {object}
    * @return {Alfresco.widget.MultiSelectAutoComplete} The new instance
    * @constructor
    */
   Alfresco.widget.MultiSelectAutoComplete = function(p_context, p_params)
   {
      this.context = Dom.get(p_context);
      this.params = YAHOO.lang.merge(Alfresco.util.deepCopy(this.params), p_params);
      this.markupGenerated = false;
      this.hiddenInput = null;
      this.itemIds = null;
      this.newInput = null;
      this.newInputUsed = false;
      this.itemContainer = null;
      this.autoComplete = null;
      this.queuedPasteEvent = false;
      if(!this.context || !this.params.itemUrl)
      {
         throw new Error("Parameter p_context and p_params.itemUrl must be provided.");
      }

      this._generateMarkup();

      return this;
   };

   Alfresco.widget.MultiSelectAutoComplete.prototype =
   {
      context: null,

      params:
      {
         /**
          *
          */
         value: "",

         /**
          * The url to retrieve the auto complete data including a query substitute token to insert the actual query term.
          * I.e. "proxy/alfresco/api/people?filter={query}"
          *
          * @property itemUrl
          * @type string
          */
         itemUrl: null,


         /**
          * The path to the items array in the server response
          *
          * @property itemPath
          * @type string
          */
         itemPath: "data",

         /**
          *
          *
          * @property itemId
          * @type string
          */
         itemId: "id",

         /**
          * This is the field that will be displayed once an item is selected.
          * It will also be used in the suggested items menu as long as itemTemplate hasn't been defined.
          *
          * @property itemName
          * @type string
          */
         itemName: "name",

         /**
          * For more complex displays of the suggested items a template can be provided.
          * I.e. "<b>{firstName}</b> {lastName}"
          *
          * @property itemTemplate
          * @type string
          */
         itemTemplate: null,

         /**
          * Item ids that not will be displayed in the result
          *
          * @property forbiddenItemIds
          * @type array
          */
         forbiddenItemIds: [],

         /**
          * A form instance to add the validations to.
          *
          */
         form: null,

         /**
          * Decides how the selected values shall be stored.
          * "single" - stores them in 1 single hidden input element (with the selected items ids in a comma separated string)
          * "multiple" - stores them in multiple hidden input elements (one per selected value)
          *
          * @property formInputMode
          * @type string
          */
         formInputMode: "multiple",

         /**
          * The value of the hidden input elements name attribute, i.e. something like
          * "emails" when formInputMode is "single" or "emails[]" when formInputMode is "multiple".
          *
          * @property formInputName
          * @type string
          */
         formInputName: "-",

         /**
          * Standard callback object to add in custom behaviour when a new item is created.
          *
          * @property onItemInputCreate
          * @type object
          */
         onItemInputCreate: null,

         /**
          * Standard callback object to add in custom behaviour when escape is clicked.
          *
          * @property onItemInputEscape
          * @type object
          */
         onItemInputEscape: null,

         /**
          * The key codes that will make the typed word into a box.
          * By default just enter, but a comma could also be used by setting it to:
          * [YAHOO.util.KeyListener.KEY.ENTER, 44]
          *
          * @property delimiterKeyCodes
          * @type Array
          * @default []
          */
         delimiterKeyCodes: [ YAHOO.util.KeyListener.KEY.ENTER ],

         /**
          * When pasting in text to the control the usual delimiterKeyCodes act as delimiters against the pasted string.
          * However when the paste is done newline characters are transformed to space characters.
          * To make newline characters act as delimiters on paste set this to [ YAHOO.util.KeyListener.KEY.SPACE ]
          *
          * @property pasteDelimiterKeyCodes
          * @type Array
          * @default []
          */
         pasteDelimiterKeyCodes: [],

         /**
          * The number of characters that must be entered before sending a request for auto complete suggestions
          *
          * @property minQueryLength
          * @type int
          * @default 1
          */
         minQueryLength: 1
      },

      /**
       *
       */
      focus: function()
      {
         if (Alfresco.util.isVisible(this.newInput))
         {
            this.newInput.focus();
         }
      },

      /**
       * Generate mark-up
       *
       * @method _generateMarkup
       * @protected
       */
      _generateMarkup: function MultiSelectAutoComplete__generateMarkup()
      {
         // Reset the array of persisted item ids...
         this.itemIds = [];

         if (this.markupGenerated)
         {
            this._generateCurrentItemMarkup();
            return;
         }

         Dom.addClass(this.context, "input");

         var eAutoCompleteWrapper = document.createElement("span"),
            eAutoComplete = document.createElement("div");

         if (this.params.formInputMode == "single")
         {
            // Create a hidden input field - the value of this field is what will be used to update the
            this.hiddenInput = document.createElement("input");
            YUIDom.setAttribute(this.hiddenInput, "type", "hidden");
            YUIDom.setAttribute(this.hiddenInput, "name", this.params.formInputName);
         }

         // Create a new input field for entering new items (this will also allow the user to select items from
         // an auto-complete list...
         this.newInput = document.createElement("input");
         YUIDom.setAttribute(this.newInput, "type", "text");
         YUIDom.setAttribute(this.newInput, "tabindex", "0");

         // Add the new item input field and the auto-complete drop-down DIV element to the auto-complete wrapper
         eAutoCompleteWrapper.appendChild(this.newInput);
         eAutoCompleteWrapper.appendChild(eAutoComplete);

         // Create a new edit box (this contains all item spans, as well as the auto-complete enabled input field for
         // adding new items)...
         var editBox = document.createElement("div");
         YUIDom.addClass(editBox, "inlineItemEdit"); // This class should make the span look like a text input box
         this.itemContainer = document.createElement("span");
         editBox.appendChild(this.itemContainer);
         editBox.appendChild(eAutoCompleteWrapper); // Add the auto-complete wrapper (this contains the input field for typing items)

         // Add any previously applied items to the edit box, updating the array of applied item nodeRefs as we go...
         this._generateCurrentItemMarkup();

         // Add the main edit box to the form (all the items go in this box)
         this.context.appendChild(editBox);

         YUIDom.addClass(eAutoCompleteWrapper, "inlineItemEditAutoCompleteWrapper");
         YUIDom.addClass(eAutoComplete, "inlineItemEditAutoComplete");

         if (this.hiddenInput)
         {
            // Set the current items in the hidden field and add it to the dom...
            YUIDom.setAttribute(this.hiddenInput, "value", this.itemIds.toString());
            this.context.appendChild(this.hiddenInput);
         }


         /* ************************************************************************************
          *
          * This section of code deals with setting up the auto-complete widget for the new item
          * input field. We need to set up a data source for retrieving the existing items and
          * which we will need to filter on the client.
          *
          **************************************************************************************/
         var oDS = new YAHOO.util.XHRDataSource();
         oDS.connXhrMode = "cancelStaleRequests";
         oDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
         oDS.maxCacheEntries = 10;
         // This schema indicates where to find the item name in the JSON response
         oDS.responseSchema =
         {
            /*fields : [this.params.itemName, this.params.itemId],*/
            resultsList : this.params.itemPath
         };
         this.autoComplete = new YAHOO.widget.AutoComplete(this.newInput, eAutoComplete, oDS);
         this.autoComplete.questionMark = false;     // Removes the question mark on the query string (this will be ignored anyway)
         var url = this.params.itemUrl;
         this.autoComplete.generateRequest = function(query)
         {
            return YAHOO.lang.substitute(url, { query: query });
         };
         this.autoComplete.applyLocalFilter = false;  // Filter the results on the client
         this.autoComplete.queryDelay = 0.2;           // Throttle requests sent
         this.autoComplete.animSpeed = 0.08;
         this.autoComplete.minQueryLength = this.params.minQueryLength;
         this.autoComplete.itemSelectEvent.subscribe(function(type, args)
         {
            // If the user clicks on an entry in the list then apply the selected item
            var itemName = args[2][1][this.params.itemName],
                itemId = args[2][1][this.params.itemId];
            this._applyItem(itemName, itemId, { type: "change" });
            if (YUIDom.isAncestor(this.itemContainer, this.newInput))
            {
               // We must have just finished editing a item, therefore we need to move
               // the auto-complete box out of the current items...
               YUIDom.insertAfter(this.newInput.parentNode, this.itemContainer);
            }
         }, this, true);
         // Update the result filter to remove any results that have already been used...
         this.autoComplete.dataReturnEvent.subscribe(function(type, args)
         {
            var results = args[2], currentItemId;
            for (i = 0, j = results.length; i < j; i++)
            {
               currentItemId = results[i][this.params.itemId];
               if (Alfresco.util.arrayContains(this.itemIds, currentItemId) || Alfresco.util.arrayContains(this.params.forbiddenItemIds, currentItemId))
               {
                  results.splice(i, 1); // Remove the result because it's already been used
                  i--;                  // Decrement the index because it's about to get incremented (this avoids skipping an entry)
                  j--;                  // Decrement the target length, because the arrays got shorter
               }
            }
         }, this, true);

         // User custom template if provided
         if (this.params.itemTemplate)
         {
            this.autoComplete.formatResult = Alfresco.util.bind(function(oResultData, sQuery, sResultMatch)
            {
               return YAHOO.lang.substitute(this.params.itemTemplate, oResultData[1], function(key, value)
               {
                  return Alfresco.util.encodeHTML(value);
               });
            }, this);
         }
         /* **************************************************************************************
          *
          * This section of code deals with handling enter keypresses in the new item input field.
          * We need to capture ENTER keypresses and prevent the form being submitted, but instead
          * make a request to create the item provided and then add it to the hidden variable that
          * will get submitted when the "Save" link is used.
          *
          ****************************************************************************************/
         var _this = this;
         Event.addListener(this.newInput, "keyup", function(e)
         {
            _this.newInputUsed = true;
            if (this.value.length > 0)
            {
               // Remove error indications since have started to type something
               Dom.removeClass(_this.itemContainer.parentNode, "mandatory");
               Dom.removeClass(_this.context, "invalid");

               if (_this.queuedPasteEvent)
               {
                  _this.queuedPasteEvent = false;
                  var inputValue = this.value,
                     c, code,
                     values = [],
                     value = '';

                  for(var i = 0; i < inputValue.length; i++)
                  {
                     c = inputValue.charAt(i);
                     code = c.charCodeAt(0);
                     if (Alfresco.util.arrayContains(_this.params.delimiterKeyCodes, code) || Alfresco.util.arrayContains(_this.params.pasteDelimiterKeyCodes, code))
                     {
                        value = YAHOO.lang.trim(value);
                        if (value.length > 0)
                        {
                           values.push(value);
                        }
                        value = '';
                     }
                     else
                     {
                        value += c;
                     }
                  }
                  value = YAHOO.lang.trim(value);
                  if (value.length > 0)
                  {
                     values.push(value);
                  }

                  this.value = "";
                  for (i = 0; i < values.length; i++)
                  {
                     value = YAHOO.lang.trim(values[i]);
                     _this._createItem(value, value, null);
                     YUIDom.insertAfter(_this.newInput.parentNode, _this.itemContainer);
                  }

                  YAHOO.lang.later(50, _this.newInput, function()
                  {
                     // Focus the input element for IE
                     this.focus();
                     _this._triggerFormValidation({ type: "keyup" }, _this.context);
                  });
               }
            }
         });
         Event.addListener(this.newInput, "paste", function(e)
         {
            _this.queuedPasteEvent = true;
         });
         Event.addListener(this.newInput, "keypress", function(e)
         {
            if (Alfresco.util.hasKeyCode(e, _this.params.delimiterKeyCodes) && this.value.length > 0)
            {
               Event.stopEvent(e); // Prevent the surrounding form from being submitted
               _this._createItem(this.value, this.value, { type: "change"});
               YUIDom.insertAfter(_this.newInput.parentNode, _this.itemContainer);
               YAHOO.lang.later(50, _this.newInput, function()
               {
                  // Focus the input element for IE
                  this.focus();
               });
            }
         });

         // This section of code handles deleting configured items through the use of the backspace key....
         Event.addListener(this.newInput, "keydown", function(e)
         {
            if (Alfresco.util.hasKeyCode(e, 8) && this.newInput.value.length == 0)
            {
               if (this._editingItemIndex >= 0)
               {
                  // If a item is being edited then we just need to remove the item and reset the input field
                  this.itemIds.splice(this._editingItemIndex, 1); // Remove the item, the item span has already been removed
                  YUIDom.insertAfter(this.newInput.parentNode, this.itemContainer); // Return the auto-complete elements to their correct position
                  this._hideFormErrorContainer();
               }
               else if (!this._itemPrimedForDelete && this.itemContainer.children.length > 0)
               {
                  this._itemPrimedForDelete = true;
                  var lastItem = YUIDom.getLastChild(this.itemContainer);
                  YUIDom.addClass(lastItem, "inlineItemEditItemPrimed");
                  YUIDom.addClass(lastItem.children[2], "hidden");
                  YUIDom.removeClass(lastItem.children[3], "hidden");
                  this._hideFormErrorContainer(lastItem);
               }
               else
               {
                  // The backspace key was used when there are no more characters to delete
                  // so we need to delete the last item...
                  if (this.itemIds.length > 0)
                  {
                     this.itemIds.pop();
                     if (this.hiddenInput)
                     {
                        YUIDom.setAttribute(this.hiddenInput, "value", this.itemIds.toString());
                     }
                     var itemEl = YUIDom.getLastChild(this.itemContainer);
                     this.itemContainer.removeChild(itemEl);
                     this._hideFormErrorContainer(itemEl);
                  }
                  this._itemPrimedForDelete = false; // If we've deleted a item then we're no longer primed for deletion...
               }
            }
            else if (this._itemPrimedForDelete == true)
            {
               // If any key other than backspace is pressed and the last item has been primed for deletion
               // then we should put it back to the normal state...
               this._itemPrimedForDelete = false;
               if (this.itemContainer.children.length > 0)
               {
                  var lastItem = YUIDom.getLastChild(this.itemContainer);
                  YUIDom.removeClass(lastItem, "inlineItemEditItemPrimed");
                  YUIDom.addClass(lastItem.children[3], "hidden");
                  YUIDom.removeClass(lastItem.children[2], "hidden");
               }
            }
         }, this, true);

         this.autoComplete.textboxBlurEvent.subscribe(function(type, args)
         {
            this.newInputUsed = true;
            var value = YAHOO.lang.trim(args[0].getInputEl().value);
            if (value.length > 0)
            {
               this._createItem(value, value, { type: "blur" });
            }
            else
            {
               YAHOO.lang.later(50, this, function()
               {
                  // Delay validation since blur event sometimes happens before other events that might change the value
                  this._triggerFormValidation({ type: "blur" }, this.context);
               });
            }
            YUIDom.insertAfter(this.newInput.parentNode, this.itemContainer);
         }, this, true);

         Event.addListener(this.newInput, "focus", function(type, args)
         {
            this._triggerFormValidation({ type: "focus" }, this.context);
         }, this, true);

         Event.addListener(editBox, "click", function(e)
         {
            YAHOO.lang.later(50, this, function()
            {
               // Select the input element for IE
               if (document.activeElement != this.newInput)
               {
                  this.newInput.select();
               }
            });
            Event.stopEvent(e);

         }, this, true);

         // Key Listener for [Escape] to cancel
         var escapeKeyListener = new KeyListener(this.newInput,
         {
            keys: [KeyListener.KEY.ESCAPE]
         },
         {
            fn: function(id, keyEvent)
            {
               Event.stopEvent(keyEvent[1]);
               this.newInput.value = "";
               if (this.params.onItemInputEscape && YAHOO.lang.isFunction(this.params.onItemInputEscape))
               {
                  this.params.onItemInputEscape.fn.call(this.params.onItemInputEscape.scope);
               }
            },
            scope: this,
            correctScope: true
         });
         escapeKeyListener.enable();

         // Connect to form if available
         if (this.params.form)
         {
            // Add our internal validator methods that will make sure all the validators in the formValidations param are used.
            this.params.form.addValidation(this.context, Alfresco.util.bind(this.isValid, this), {}, "blur", Alfresco.util.bind(this.getTitle, this), Alfresco.util.bind(this.getValidationConfig, this));
         }

         this.markupGenerated = true;
      },

      _itemIdValidations: {},
      _validations: [],

      /**
       * @method addValidation
       * @param validationHandler {function} Function to call to handle the actual validation
       * @param validationArgs {object} Optional object representing the arguments to pass to the validation handler function
       * @param message {string} Message to be displayed when validation fails
       */
      addValidation: function(validationHandler, validationArgs, message)
      {
         this._validations.push(
         {
            handler: validationHandler,
            args: validationArgs,
            message: message
         });
      },

      _triggerFormValidation: function(event, field)
      {
         if (this.params.form)
         {
            // So getTitle() will be correct since messages is called before isValid()
            this.isValid();

            // Call forms runtime so it can call our callbacks: getTitle(), isValid() & getValidationConfig()
            this.params.form.validate(event, field.id);
         }
      },

      _hideFormErrorContainer: function(field)
      {
         this._errorContainer = null;

         if (this.params.form)
         {
            if (field)
            {
               this.params.form.hideErrorContainer(field);
            }
            this.params.form.hideErrorContainer(this.context);
         }
      },

      isValid: function()
      {
         if (!this.newInputUsed)
         {
            // handle the mandatory case by ourselves
            if (this.params.mandatory && this.params.value.length == 0)
            {
               Dom.addClass(this.itemContainer.parentNode, "mandatory");
            }
            return true;
         }
         Dom.removeClass(this.itemContainer.parentNode, "mandatory");

         // First check all itemIds validation state
         var itemEls = YAHOO.util.Selector.query(".inlineItemEditItem", this.context),
            value;
         for (var i = 0; i < itemEls.length; i++)
         {
            value = YAHOO.util.Selector.query("input", itemEls[i], true).value;
            if (!(this._itemIdValidations[value] || 0) == (this._validations || []).length)
            {
               if (!Dom.get(this._errorContainer))
               {
                  this._errorContainer = itemEls[i]; // this.context;
               }
               Dom.addClass(this.itemContainer.parentNode.parentNode, "suppress-validation");
               return false;
            }
         }

         if (this.itemIds.length == 0 && this.params.mandatory)
         {
            Dom.removeClass(this.itemContainer.parentNode.parentNode, "suppress-validation");
            this._errorContainer = this.context;
            this._errorMessage = Alfresco.util.message("Alfresco.forms.validation.mandatory.message");
            return false;
         }

         this._errorMessage = null;
         this._errorContainer = null;
         return true;
      },

      getTitle: function()
      {
         return (this._errorMessage ? this._errorMessage : (this.params.title || ""));
      },

      getValidationConfig: function()
      {
         return {};
      },

      /**
       * Called after a new item has been added, will
       */
      _validateItem: function(itemValue, itemName, container)
      {
         var valid = true;
         if (YAHOO.lang.isArray(this._validations))
         {
            var v;
            for (var i = 0; i < this._validations.length; i++)
            {
               v = this._validations[i];

               // Call validator by faking the fieldId parameter pretending its a hidden input field
               var result = v.handler({ value: itemValue, type: "hidden" }, v.args, {}, this.params.form);
               if (YAHOO.lang.isBoolean(result) && result)
               {
                  // Validation was ok
                  this._itemIdValidations[itemValue] = (this._itemIdValidations[itemValue] || 0) + 1;
               }
               else
               {
                  // The value was invalid
                  valid = false;
                  this._errorContainer = container; //this.context;;
                  this._errorMessage = v.message;

                  if (YAHOO.lang.isNumber(result))
                  {
                     // The result is a transaction id waiting for server response
                     this._errorMessage = Alfresco.util.message("Alfresco.widget.MultiSelectAutoComplete.pending");
                  }
               }
            }
         }

         // We got here then all items have valid values
         return valid;
      },

      _createItem: function MultiSelectAutoComplete__createItem(itemName, itemId, triggerFormValidationEvent)
      {
         this._applyItem(itemName, itemId, triggerFormValidationEvent);

         if (YUIDom.isAncestor(this.itemContainer, this))
         {
            // We must have just finished editing a item, therefore we need to move
            // the auto-complete box out of the current items...
            YUIDom.insertAfter(this.newInput.parentNode, this.itemContainer);
         }

         if (this.params.onItemCreate && YAHOO.lang.isFunction(this.params.onItemCreate))
         {
            this.params.onItemCreate.fn.call(this.params.onItemCreate.scope, itemId);
         }
      },

      /**
       * Adds a new span that represents an applied item. This span contains an icon that can
       * be clicked on to remove the item.
       *
       * @method _addItem
       * @param itemName The name of the item
       * @param itemId The id of the item
       */
      _addItem: function MultiSelectAutoComplete__addItem(itemName, itemId)
      {
         var item = Alfresco.util.encodeHTML(itemName),
            invalidIcon = document.createElement("img"),
            span = document.createElement("span"),
            label = document.createElement("span"),
            hiddenItemInput = document.createElement("input"),
            removeIcon = document.createElement("img"),
            removeIconEdit = document.createElement("img");

         Alfresco.util.generateDomId(span);
         YUIDom.addClass(span, "inlineItemEditItem");
         //span.setAttribute("tabindex", "0");
         label.innerHTML = item;
         YUIDom.setAttribute(invalidIcon, "src", Alfresco.constants.URL_RESCONTEXT + "components/images/warning-16.png");
         YUIDom.setAttribute(removeIcon, "src", Alfresco.constants.URL_RESCONTEXT + "components/images/delete-item-off.png");
         YUIDom.setAttribute(removeIcon, "width", 16);
         YUIDom.setAttribute(removeIconEdit, "src", Alfresco.constants.URL_RESCONTEXT + "components/images/delete-item-on.png");
         YUIDom.setAttribute(removeIconEdit, "width", 16);
         YUIDom.addClass(removeIconEdit, "hidden");
         span.appendChild(invalidIcon);
         span.appendChild(label);
         span.appendChild(removeIcon);
         span.appendChild(removeIconEdit);

         var result = this._validateItem(itemId, itemName, span);
         if (YAHOO.lang.isBoolean(result))
         {
            if (result)
            {
               YUIDom.addClass(invalidIcon, "hidden");
            }
            else
            {
               Dom.addClass(span, "invalid");
            }
         }
         else if (YAHOO.lang.isNumber(result))
         {
            YUIDom.addClass(invalidIcon, "hidden");
         }

         if (this.params.formInputMode == "multiple")
         {
            YUIDom.setAttribute(hiddenItemInput, "type", "hidden");
            YUIDom.setAttribute(hiddenItemInput, "name", this.params.formInputName);
            YUIDom.setAttribute(hiddenItemInput, "value", itemId);
            span.appendChild(hiddenItemInput);
         }

         // Make sure we add the item in the right place...
         if (YUIDom.isAncestor(this.itemContainer, this.newInput))
         {
            // An existing item has been edited, so insert it before the input item...
            YUIDom.insertBefore(span, this.newInput.parentNode);
         }
         else
         {
            // Add the new item at the end of the list...
            this.itemContainer.appendChild(span);
         }
         this._editingItemIndex = -1; // If we've just added a item then we're not editing one


         // Function for deterining the index of a item...
         var findItemIndex = function InsituEditor_itemEditor_findItemIndex(itemSpan)
         {
            // Get the index of where the span ended up, needed to insert the nodeRef in the correct place...
            var spanIndex = 0,
                tmp = itemSpan;
            while((tmp = tmp.previousSibling) != null)
            {
               spanIndex++;
            }
            return spanIndex;
         };

         var _this = this;

         // Function for removing a itemId from the array of itemids...
         var removeItemId = function MultiSelectAutoComplete_removeItemId(itemId)
         {
            var index = Alfresco.util.arrayIndex(_this.itemIds, itemId);
            if (index != -1)
            {
               _this.itemIds.splice(index, 1);
            }
         };

         // Handler the user choosing to remove a item...
         Event.addListener(removeIcon, "click", function(e)
         {
            removeItemId(itemId);
            if (this.hiddenInput)
            {
               YUIDom.setAttribute(_this.hiddenInput, "value", _this.itemIds.toString());
            }
            _this.itemContainer.removeChild(span);

            // Make sure ballons are updated
            _this._hideFormErrorContainer(span);
         });

         // Handle the user choosing to edit a item...
         Event.addListener(label, "click", function(e)
         {
            // When the item label is clicked we need to make it editable. The new item box needs to
            // replace the item span and have it's value set to the item being edited.
            YUIDom.insertBefore(_this.newInput.parentNode, span);
            _this.itemContainer.removeChild(span);
            _this.newInput.value = itemName;

            removeItemId(itemId);
            _this._editingItemIndex = findItemIndex(span); // Set the index of the span being edited.

            _this._hideFormErrorContainer(span);

            _this.newInput.select();

            Event.stopEvent(e);
         });

         return findItemIndex(span);
      },

      /**
       * Applies a item to the document being edited. This will add a new span to represent
       * the applied item, update the the overall hidden input field that will be submitted
       * and reset the new item input field.
       *
       * @method _applyItem
       * @param itemName The name of the item
       * @param itemId The ItemId of the item
       */
      _applyItem: function MultiSelectAutoComplete__applyItem(itemName, itemId, triggerFormValidationEvent)
      {
         var index = this._addItem(itemName, itemId);
         this.newInput.value = "";

         // Add the itemId of the item into the hidden value field...
         this.itemIds.splice(index, 0, itemId);
         if (this.hiddenInput)
         {
            YUIDom.setAttribute(this.hiddenInput, "value", this.itemIds.toString());
         }

         // Ensure that auto-complete drop-down is hidden...
         this.autoComplete.collapseContainer();

         // Make sure balloons are updated
         if (triggerFormValidationEvent)
         {
            this._triggerFormValidation(triggerFormValidationEvent, this.context);
         }
      },

      /**
       * Generates the markup that displays the currently applied items. This function
       * can be called once the main markup has been created to allow only item changes
       * to be rendered.
       *
       * @method _generateCurrentItemMarkup
       */
      _generateCurrentItemMarkup: function MultiSelectAutoComplete__generateCurrentItemMarkup()
      {
         // Clear any previously created span items...
         if (this.itemContainer.hasChildNodes())
         {
             while (this.itemContainer.childNodes.length >= 1)
             {
                this.itemContainer.removeChild( this.itemContainer.firstChild );
             }
         }

         // Add any previously applied items to the edit box, updating the array of applied item itemIds as we go...
         this.params.value = this.params.value || [];
         // Need to check that the value param has been set because if the node did not have
         // a cm:itemgable option then it would be undefined.
         for (i = 0, j = this.params.value.length; i < j; i++)
         {
            this._addItem(this.params.value[i][this.params.itemName], this.params.value[i][this.params.itemId]);
            this.itemIds.push(this.params.value[i][this.params.itemId]);
         }
      }

   };

})();
