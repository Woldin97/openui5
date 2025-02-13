/*
 * !${copyright}
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/base/Log"
], function (Element, Log) {
    "use strict";

    /**
     * Constructor for a new <code>Item</code>.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] initial settings for the new control
     * @class The <code>Item</code> control for the chart/property metadata used within MDC Chart. An instance can be created to override the default/metadata behavior.
     * @extends sap.ui.core.Element
     * @author SAP SE
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.88
     * @alias sap.ui.mdc.chart.Item
     */
    var Item = Element.extend("sap.ui.mdc.chart.Item", /** @lends sap.ui.mdc.chart.Item.prototype */
        {
            metadata: {
                "abstract": false, //TODO: see comment at the end.
                library: "sap.ui.mdc",
                properties: {
                    /**
                     * The unique identifier of the chart item that reflects the name of the data property in the resulting data set.
                     */
                    name: {
                        type: "string"
                    },
                    /**
                     * Label for the item, either as a string literal or by a pointer, using the binding to some property containing the label.
                     */
                    label: {
                        type: "string"
                    },
                    /**
                     * Specifies the type of the item for the chart (groupable and aggregateable).
                     * This is specific for the used chart library.
                     */
                    type: {
                        type: "string",
                        defaultValue: ""
                    },
                    /**
                     * Specifies the role of the item for the chart (category, axis1...).
                     * This is specific for the used chart library.<br>
                     * <b>NOTE:</b> This property must not be changed after initialization.
                     */
                    role: {
                        type: "string"
                    }
                }

            }
        });

    return Item;

});
