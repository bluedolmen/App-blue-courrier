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

(function() {

	var Event = YAHOO.util.Event, lang = YAHOO.lang, Dom = YAHOO.util.Dom;

	SIDE.MyMultiAutoCompleteField = function(options, initialValue) {
		SIDE.MyMultiAutoCompleteField.superclass.constructor.call(this, options);

		this.log("DSS initial value :" + initialValue);
		Dom.addClass(this.divEl, "inputEx-typeInvite");
		this.el.value = this.options.typeInvite;
	};

	YAHOO.lang.extend(SIDE.MyMultiAutoCompleteField, inputEx.MultiAutoComplete, {
		log : function(msg) {
			console.log("[SIDE.MyMultiAutoCompleteField] " + msg);
		},
		setValuesAndLabels : function(oDatas) {
			var itemsId = [];
			for ( var x = 0; x < oDatas.length; x++) {
				var aData = oDatas[x];
				this.log("setValuesAndLabels :" + aData);
				var value = lang.isFunction(this.options.returnValue) ? this.options.returnValue(aData) : aData[0];
				var label = lang.isFunction(this.options.returnLabel) ? this.options.returnLabel(aData) : value;
				itemsId.push({
					value : value,
					label : label
				});
			}
			this.setValue(itemsId);
		}
	});

	inputEx.registerType("mymultiautocomplete", SIDE.MyMultiAutoCompleteField);

}());