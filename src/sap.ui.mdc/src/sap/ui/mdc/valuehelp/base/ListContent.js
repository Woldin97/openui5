/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Content',
	'sap/ui/mdc/enum/ConditionValidated'
], function(
	Content,
	ConditionValidated
) {
	"use strict";

	/**
	 * Constructor for a new <code>ListContent</code>.
	 *
	 * This is the basis for different value help list contents. It cannot be used directly.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element.
	 * @extends sap.ui.mdc.valuehelp.base.Content
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.base.ListContent
	 */
	var ListContent = Content.extend("sap.ui.mdc.valuehelp.base.ListContent", /** @lends sap.ui.mdc.valuehelp.base.ListContent.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * If this property is set to <code>true</code>, the filtering for user input is always case-sensitive.
				 * Otherwise user input is checked case-insensitively.
				 * If <code>$search</code> is used, this property has no effect on the <code>$search</code> request.
				 *
				 * If the used back-end service supports a case-insensitive search, set this property to <code>false</code>.
				 */
				caseSensitive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * If set, <code>getItemForValue</code> returns the first item that matches the text.
				 *
				 * This is the case if the text of the item starts with the text entered.
				 */
				 useFirstMatch: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * If set, the List is also opened if the ValueHelp icon is pressed.
				 */
				 useAsValueHelp: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true // TODO - right default?
				}
			},
			aggregations: {
			},
			events: {
			}
		}
	});

	ListContent.prototype.init = function() {

		Content.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			properties: ["caseSensitive"]
		});

	};

	ListContent.prototype.observeChanges = function(oChanges) {

		if (oChanges.name === "caseSensitive") {
			this.handleFilterValueUpdate(oChanges);
		}

		Content.prototype.observeChanges.apply(this, arguments);

	};

	ListContent.prototype.getCount = function (aConditions) {
		var iCount = 0;

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.Validated) {
				iCount++;
			}
		}
		return iCount;
	};

	/**
	 * Gets the <code>ListBinding</code> of the content
	 * @returns {sap.ui.model.ListBinding} ListBinding
	 * @protected
	 */
	ListContent.prototype.getListBinding = function () {
		throw new Error("ListContent: Every listcontent must implement this method.");
	};

	return ListContent;

});
