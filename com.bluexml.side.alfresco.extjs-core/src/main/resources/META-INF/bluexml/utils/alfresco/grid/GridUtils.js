Ext.define('Bluexml.utils.alfresco.grid.GridUtils', {

	singleton : true,
	
	uses : [
		'Ext.util.MixedCollection'
	],
	
	/**
	 * Get a Ext.util.MixedCollection associating the keyIndex value and the
	 * list of matching records
	 * 
	 * @param {Array}
	 *            records
	 * @param {Object}
	 *            keyIndex
	 * @returns {Ext.util.MixedCollection}
	 */
	getCommons : function(records, keyIndex) {
		
		Ext.isIterable(records) || 
			Ext.Error.raise('IllegalArgumentException! The provided records are not iteratble');
			
		undefined !== keyIndex ||
			Ext.Error.raise('IllegalArgumentException! The provided keyIndex is invalid');
			
		
		var result = new Ext.util.MixedCollection();
		
		Ext.Array.forEach(records, function(record) {
			var value = record.get(keyIndex);
			if (undefined === value) return; // continue
			
			if (!result.containsKey(value)) {
				result.add(value, []);
			}
			
			var existings = result.get(value);
			existings.push(record);
		});
		
		return result;
		
	}
	
});