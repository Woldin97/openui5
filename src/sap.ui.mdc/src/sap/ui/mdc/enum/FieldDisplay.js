/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines the output of a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} control.
	 *
	 * For the {@link sap.ui.mdc.Field Field} control it defines how the <code>value</code> and <code>additionalValue</code> properties are formatted.
	 *
	 * For the {@link sap.ui.mdc.MultiValueField MultiValueField} control it defines how the <code>key</code> and <code>description</code> properties of the items are formatted.
	 *
	 * For the {@link sap.ui.mdc.FilterField FilterField} control it defines how key and description of equal conditions are formatted.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.48.0
	 * @alias sap.ui.mdc.enum.FieldDisplay
	 */
	var FieldDisplay = {
		/**
		 * Only the value (key) is displayed
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Value: "Value",
		/**
		 * Only the description is displayed
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Description: "Description",
		/**
		 * The value (key) and the description are displayed in the field. The description is displayed after the value (key) in brackets.
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		ValueDescription: "ValueDescription",
		/**
		 * The description and the value (key) are displayed in the field. The value (key) is displayed after the description in brackets.
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		DescriptionValue: "DescriptionValue"
	};

	return FieldDisplay;

}, /* bExport= */ true);
