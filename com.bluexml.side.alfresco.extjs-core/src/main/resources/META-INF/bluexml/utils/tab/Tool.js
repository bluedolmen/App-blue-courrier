/**
 * @class Bluexml.utils.tab.Tool
 * @extends Ext.AbstractPlugin
 * @ptype itstabtool
 * @version 1.0
 * @author Nguyen Truong Sinh (vietits@yahoo.com)
 *
 * Add a toolbar before or after the tab bar.
 * 
 *    @example
 *
 *    Ext.create('Ext.tab.Panel', {
 *        ...
 *        plugins: [{
 *            ptype : 'itstabtool',
 *            position: 'before',
 *            items : [{
 *                xtype: 'button',
 *                iconCls: 'icon-timer'
 *            },{
 *                xtype: 'button',
 *                iconCls: 'icon-reload'
 *            }]
 *        }],
 *        ...
 *     });
 *
 * @update 2012-01-28 09:48:12
 *  Release version 1.0
 * @update 2012-02-15 10:48:04
 *  Release version 1.1 with the following fixes
 *  - Fix the bug of appearing border around tabbar when resizing plain tabpanel
 * @update 2012-07-17 (bpajot@bluexml.com)
 *  - Refactoring of the code
 *  - Added cls capabilities
 */
Ext.define('Bluexml.utils.tab.Tool', {
    extend: 'Ext.AbstractPlugin',
    alias : 'plugin.itstabtool',
    /**
     * @cfg {String} position The position of toolbar in relation to the tabbar.  
	 * It can be 'before' or 'after'.
     * Default to: 'after'
	 */
    /**
     * @cfg {Object/Object[]} items
     * A single item, or an array of child Components to be added to this toolbar
	 */
	init: function(tab) {
		var 
			me  = this,
			items = me.items,
			bar = tab.getTabBar()
		;
		if (!items) return;
			
		bar.flex = 1;
		if(bar.plain){
			bar.on({
				resize: function(){
					bar.setUI(me.ui + '-plain');
				}
			});
		}
		
		var buttonsMenu = {
			xtype : 'container',
			layout : 'hbox',
			items : Ext.isArray(items) ? items : [items],
			cls : Ext.baseCSSPrefix + 'tab-bar',
			
			listeners : {
				'beforeadd' : function(menu, component) {
					component.ui = component.ui + '-toolbar';
				}
			}
		};
		
		tab.removeDocked(bar, false);
		var newBarItems = me.position == 'before' ? [buttonsMenu].concat(bar) : [bar].concat(items) ;
		
		tab.addDocked({
			xtype: 'toolbar',
			dock : bar.dock || 'top',
			items: newBarItems 
		});
		
	}
});