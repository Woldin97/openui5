/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"./AggregationBaseDelegate",
	"./util/loadModules",
	"./library",
	"sap/ui/model/Sorter",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(
	AggregationBaseDelegate,
	loadModules,
	library,
	Sorter,
	coreLibrary,
	Core
) {
	"use strict";

	var P13nMode = library.TableP13nMode;
	var TableType = library.TableType;

	/**
	 * Base delegate for {@link sap.ui.mdc.Table}.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/TableDelegate
	 * @extends module:sap/ui/mdc/AggregationBaseDelegate
	 * @experimental
	 * @since 1.60
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var TableDelegate = Object.assign({}, AggregationBaseDelegate);

	/**
	 * Provides a hook to update the binding info object that is used to bind the table to the model.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.filters = [];
		oBindingInfo.sorter = [];

		if (oTable._oMessageFilter) {
			oBindingInfo.filters = [oTable._oMessageFilter];
		}

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			var oGroupedProperty = oTable._getGroupedProperties()[0];

			if (oGroupedProperty) {
				var oSorter = this.getGroupSorter(oTable, oGroupedProperty.name);

				if (oSorter) {
					oBindingInfo.sorter.push(oSorter);
				}
			}
		}

		oBindingInfo.sorter = oBindingInfo.sorter.concat(
			oBindingInfo.sorter.length === 1
				? oTable._getSorters().filter(function(oSorter) {
					return oSorter.sPath !== oBindingInfo.sorter[0].sPath;
				})
				: oTable._getSorters()
		);
	};

	/**
	 * Creates a new sorter for the grouping functionality.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {string} sPropertyName Property to group
	 * @returns {sap.ui.model.Sorter | undefined} New sorter
	 * @protected
	 */
	TableDelegate.getGroupSorter = function(oTable, sPropertyName) {
		var oSortedProperty = oTable._getSortedProperties().find(function(oProperty) {
			return oProperty.name === sPropertyName;
		});
		var sPath = oTable.getPropertyHelper().getProperty(sPropertyName).path;
		var bDescending = oSortedProperty ? oSortedProperty.descending : false;

		if (!oTable._mFormatGroupHeaderInfo || oTable._mFormatGroupHeaderInfo.propertyName !== sPropertyName) {
			oTable._mFormatGroupHeaderInfo = {
				propertyName: sPropertyName,
				formatter: function(oContext) {
					return this.formatGroupHeader(oTable, oContext, sPropertyName);
				}.bind(this)
			};
		}

		return new Sorter(sPath, bDescending, oTable._mFormatGroupHeaderInfo.formatter);
	};

	/**
	 * Updates the row binding of the table.
	 *
	 * The default implementation rebinds the table, but model-specific subclasses must call dedicated binding methods to update the binding instead
	 * of using {@link #rebind}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @protected
	 */
	TableDelegate.updateBinding = function(oTable, oBindingInfo, oBinding) {
		this.rebind(oTable, oBindingInfo);
	};

	/**
	 * Formats the title text of a group header row of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sProperty The name of the grouped property
	 * @returns {string | undefined} The group header title. If <code>undefined</code> is returned, the default group header title is set.
	 * @protected
	 */
	TableDelegate.formatGroupHeader = function(oTable, oContext, sProperty) {
		var oProperty = oTable.getPropertyHelper().getProperty(sProperty);
		var oTextProperty = oProperty.textProperty;
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var sResourceKey = "table.ROW_GROUP_TITLE";
		var aValues = [oProperty.label, oContext.getProperty(oProperty.path, true)];

		if (oTextProperty) {
			sResourceKey = "table.ROW_GROUP_TITLE_FULL";
			aValues.push(oContext.getProperty(oTextProperty.path, true));
		}

		return oResourceBundle.getText(sResourceKey, aValues);
	};

	TableDelegate.validateState = function(oControl, oState, sKey) {
		if (sKey == "Filter" && oControl._oMessageFilter) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			return {
				validation: coreLibrary.MessageType.Information,
				message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP")
			};
		}

		return AggregationBaseDelegate.validateState.apply(this, arguments);
	};

	/**
	 * Rebinds the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.rebind = function(oTable, oBindingInfo) {
		oTable._getType().bindRows(oBindingInfo);
	};

	/**
	 * Returns the filter delegate of the table that provides basic filter functionality, such as adding filter fields.
	 * <b>Note:</b> The functionality provided in this delegate acts as a subset of a <code>FilterBarDelegate</code> to enable the table for inbuilt
	 * filtering.
	 *
	 * @example <caption>Example usage of <code>getFilterDelegate</code></caption>
	 * oFilterDelegate = {
	 * 		addItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 * @returns {{addItem: (function(string, sap.ui.mdc.Table): Promise<sap.ui.mdc.FilterField>)}} Object for the tables filter personalization
	 * @protected
	 */
	TableDelegate.getFilterDelegate = function() {
		return {
			/**
			 * Creates an instance of a <code>sap.ui.mdc.FilterField</code>.
			 *
			 * @param {string} sPropertyName The property name
			 * @param {sap.ui.mdc.Table} oTable Instance of the table
			 * @returns {Promise<sap.ui.mdc.FilterField>} A promise that resolves with an instance of <code>sap.ui.mdc.FilterField</code>.
			 * @see sap.ui.mdc.AggregationBaseDelegate#addItem
			 */
			addItem: function(sPropertyName, oTable) {
				return Promise.resolve(null);
			},

			/**
			 * This method is called during the appliance of the add condition change.
			 * The intention is to update the propertyInfo property.
			 *
			 * @param {string} sPropertyName The name of a property
			 * @param {sap.ui.mdc.Control} oControl - the instance of the mdc control
			 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility change API
			 * @returns {Promise} Promise that is resolved once the propertyInfo property has been updated
			 */
			addCondition: function(sPropertyName, oControl, mPropertyBag) {
				return Promise.resolve();
			},

			/**
			 * This method is called during the appliance of the remove condition change.
			 * The intention is to update the propertyInfo property.
			 *
			 * @param {string} sPropertyName The name of a property
			 * @param {sap.ui.mdc.Control} oControl - the instance of the mdc control
			 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility change API
			 * @returns {Promise} Promise that is resolved once the propertyInfo property has been updated
			 */
			removeCondition: function(sPropertyName, oControl, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	/**
	 * Returns the feature set for exporting data in the MDC Table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @returns {Promise} Export capabilities with specific features
	 * @protected
	 */
	TableDelegate.fetchExportCapabilities = function(oTable) {
		return Promise.resolve({XLSX: {}});
	};

	/**
	 * Expands all nodes.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @protected
	 */
	TableDelegate.expandAll = function(oTable) {
		throw Error("Unsupported operation: TableDelegate does not support #expandAll");
	};

	/**
	 * Collapses all nodes.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @protected
	 */
	TableDelegate.collapseAll = function(oTable) {
		throw Error("Unsupported operation: TableDelegate does not support #collapseAll");
	};

	/**
	 * This is called after the table has loaded the necessary libraries and modules and initialized its content, but before it resolves its
	 * <code>initialized</code> Promise. It can be used to make changes to the content as part of the initialization.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @returns {Promise} A promise that resolves after the content is initialized
	 * @private
	 */
	TableDelegate.initializeContent = function(oTable) {
		return this.initializeSelection(oTable);
	};

	/**
	 * This is called after the table has loaded the necessary libraries and modules and initialized its content, but before it resolves its
	 * <code>initialized</code> Promise. It can be used to make changes to the selection as part of the initialization.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @returns {Promise} A promise that resolves after the content is initialized
	 * @private
	 */
	TableDelegate.initializeSelection = function(oTable) {
		if (oTable._isOfType(TableType.Table, true)) {
			return initializeGridTableSelection(oTable);
		} else {
			return initializeResponsiveTableSelection(oTable);
		}
	};

	function initializeGridTableSelection(oTable) {
		var mSelectionModeMap = {
			Single: "Single",
			SingleMaster: "Single",
			Multi: "MultiToggle"
		};

		return loadModules("sap/ui/table/plugins/MultiSelectionPlugin").then(function(aModules) {
			var MultiSelectionPlugin = aModules[0];

			oTable._oTable.addPlugin(new MultiSelectionPlugin({
				limit: "{$sap.ui.mdc.Table#type>/selectionLimit}",
				enableNotification: true,
				showHeaderSelector: "{$sap.ui.mdc.Table#type>/showHeaderSelector}",
				selectionMode: {
					path: "$sap.ui.mdc.Table>/selectionMode",
					formatter: function(sSelectionMode) {
						return mSelectionModeMap[sSelectionMode];
					}
				},
				enabled: {
					path: "$sap.ui.mdc.Table>/selectionMode",
					formatter: function(sSelectionMode) {
						return sSelectionMode in mSelectionModeMap;
					}
				},
				selectionChange: function(oEvent) {
					// TODO: Add something sililar like TableTypeBase#callHook -> move to reusable util? Use here and in other places in delegates.
					oTable._onSelectionChange({
						selectAll: oEvent.getParameter("selectAll")
					});
				}
			}));
		});
	}

	function initializeResponsiveTableSelection(oTable) {
		var mSelectionModeMap = {
			Single: "SingleSelectLeft",
			SingleMaster: "SingleSelectMaster",
			Multi: "MultiSelect"
		};
		var mMultiSelectModeMap = {
			Default: "SelectAll",
			ClearAll: "ClearAll"
		};

		oTable._oTable.bindProperty("mode", {
			path: "$sap.ui.mdc.Table>/selectionMode",
			formatter: function(sSelectionMode) {
				return mSelectionModeMap[sSelectionMode]; // Default is "None"
			}
		});

		oTable._oTable.bindProperty("multiSelectMode", {
			path: "$sap.ui.mdc.Table>/multiSelectMode",
			formatter: function(sMultiSelectMode) {
				return mMultiSelectModeMap[sMultiSelectMode] || "SelectAll"; // Default is "Default"
			}
		});

		oTable._oTable.attachSelectionChange(function(oEvent) {
			oTable._onSelectionChange({
				selectAll: oEvent.getParameter("selectAll")
			});
		});

		return Promise.resolve();
	}

	/**
	 * Gets the selected contexts.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {sap.ui.model.Context[]} The selected contexts
	 * @private
	 */
	TableDelegate.getSelectedContexts = function(oTable) {
		if (!oTable._oTable) {
			return [];
		}

		if (oTable._isOfType(TableType.Table, true)) {
			var oGridTable = oTable._oTable;
			var oMultiSelectionPlugin = oGridTable.getPlugins().find(function(oPlugin) {
				return oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin");
			});

			if (!oMultiSelectionPlugin) {
				return [];
			}

			return oMultiSelectionPlugin.getSelectedIndices().map(function(iIndex) {
				return oGridTable.getContextByIndex(iIndex);
			}, this);
		}

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			return oTable._oTable.getSelectedContexts();
		}

		return [];
	};

	/**
	 * Clears the selection.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @private
	 */
	TableDelegate.clearSelection = function(oTable) {
		if (!oTable._oTable) {
			return;
		}

		if (oTable._isOfType(TableType.Table, true)) {
			var oSelectionPlugin = oTable._oTable.getPlugins().find(function(oPlugin) {
				return oPlugin.isA("sap.ui.table.plugins.SelectionPlugin");
			});

			if (oSelectionPlugin) {
				oSelectionPlugin.clearSelection();
			}
		}

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			oTable._oTable.removeSelections(true);
		}
	};

	/**
	 * Gets the features that are supported by the combination of this delegate and the current table state (e.g. type).
	 *
	 * @param {sap.ui.mdc.Table} oTable
	 * @returns {object} The supported features
	 * @private
	 */
	TableDelegate.getSupportedFeatures = function(oTable) {
		return {
			"export": true,
			expandAll: false,
			collapseAll: false
		};
	};

	/**
	 * Gets the p13n modes that are supported by the combination of this delegate and the current table state (e.g. type).
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table.
	 * @returns {sap.ui.mdc.TableP13nMode[]} The supported p13n modes.
	 * @private
	 */
	TableDelegate.getSupportedP13nModes = function(oTable) {
		var aSupportedModes = [P13nMode.Column, P13nMode.Sort, P13nMode.Filter];

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			aSupportedModes.push(P13nMode.Group);
		}

		return aSupportedModes;
	};

	return TableDelegate;
});
