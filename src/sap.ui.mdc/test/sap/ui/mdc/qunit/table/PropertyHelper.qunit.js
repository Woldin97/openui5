/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/table/PropertyHelper",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/util/TypeUtil",
	"sap/base/Log",
	"sap/ui/model/type/String" // in LegacyFree-UI5 used data types needs to be loaded.
], function(PropertyHelper, Column, TypeUtil, Log, StringType) {
	"use strict";

	QUnit.module("Validation", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("Simple property with attribute 'aggregatable'", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String",
			aggregatable: true
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Complex property with attribute 'groupable'", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			name: "complexProp",
			label: "ComplexProperty",
			propertyInfos: ["prop"],
			groupable: true
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Complex property with attribute 'key'", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			name: "complexProp",
			label: "ComplexProperty",
			propertyInfos: ["prop"],
			key: true
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Complex property with attribute 'unit'", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			name: "complexProp",
			label: "ComplexProperty",
			propertyInfos: ["prop"],
			unit: "prop"
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Complex property with attribute 'text'", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			name: "complexProp",
			label: "ComplexProperty",
			propertyInfos: ["prop"],
			text: "prop"
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.module("Defaults", {
		beforeEach: function() {
			this.oSimplePropertyDefaults = {
				name: "prop",
				label: "Property",
				dataType: "String",
				tooltip: "",
				caseSensitive: true,
				exportSettings: {},
				clipboardSettings: {
					template: ""
				},
				filterable: true,
				group: "",
				groupLabel: "",
				groupable: false,
				key: false,
				maxConditions: -1,
				path: "",
				sortable: true,
				text: "",
				formatOptions: null,
				constraints: null,
				unit: "",
				visible: true,
				visualSettings: {
					widthCalculation: {
						defaultWidth: 8,
						excludeProperties: [],
						gap: 0,
						includeLabel: true,
						maxWidth: 19,
						minWidth: 2,
						truncateLabel: true,
						verticalArrangement: false
					}
				}
			};

			this.oComplexPropertyDefaults = {
				name: "complexProp",
				label: "Complex Property",
				tooltip: "",
				exportSettings: {},
				clipboardSettings: {
					template: ""
				},
				filterable: false,
				group: "",
				groupLabel: "",
				groupable: false,
				key: false,
				propertyInfos: ["prop"],
				sortable: false,
				visible: true,
				visualSettings: {
					widthCalculation: {
						defaultWidth: 8,
						excludeProperties: [],
						gap: 0,
						includeLabel: true,
						maxWidth: 19,
						minWidth: 2,
						truncateLabel: true,
						verticalArrangement: false
					}
				}
			};
		},
		afterEach: function() {
			delete this.oSimplePropertyDefaults;
			delete this.oComplexPropertyDefaults;
		}
	});

	QUnit.test("Simple property", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}]);

		assert.deepEqual(oPropertyHelper.getProperties(), [this.oSimplePropertyDefaults]);
		oPropertyHelper.destroy();
	});

	QUnit.test("Complex property", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProp",
			label: "Complex Property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(oPropertyHelper.getProperty("complexProp"), this.oComplexPropertyDefaults);
		oPropertyHelper.destroy();
	});

	QUnit.module("API", {
		beforeEach: function() {
			sinon.stub(PropertyHelper.prototype, "getParent").returns({
				getControlDelegate: sinon.stub().returns({
					getTypeUtil: sinon.stub().returns({
						getTypeConfig: function() {
							return TypeUtil.getTypeConfig.apply(TypeUtil, arguments);
						}
					})
				})
			});

			this.oPropertyHelper = new PropertyHelper([{
				name: "propA",
				label: "Property A",
				dataType: "String",
				visible: false,
				path: "propAPath",
				exportSettings: {
					width: 20,
					label: "Export label",
					type: "Number"
				}
			}, {
				name: "propB",
				path: "propBPath",
				label: "Property B",
				dataType: "String",
				sortable: false,
				filterable: false,
				groupable: true,
				groupLabel: "Group Label"
			}, {
				name: "propC",
				path: "propCPath",
				label: "Property C",
				exportSettings: null,
				clipboardSettings: null
			}, {
				name: "complexPropA",
				path: "complexPropA",
				label: "Complex Property A",
				propertyInfos: ["propA", "propB"],
				exportSettings: {
					template: "{0} ({1})",
					width: 25
				},
				clipboardSettings: {
					template: "{0} ({1})"
				},
				visible: false
			}, {
				name: "complexPropB",
				path: "complexPropB",
				label: "Complex Property B",
				propertyInfos: ["propB"],
				exportSettings: {
					width: 30,
					label: "Complex export label B",
					textAlign: "End"
				}
			}, {
				name: "price",
				path: "price",
				label: "Price",
				dataType: "String",
				exportSettings: {
					type: "Currency",
					displayUnit: true,
					unitProperty: "currency",
					textAlign: "End"
				}
			}, {
				name: "currencyCode",
				label: "Currency",
				dataType: "String",
				path: "currency"
			}, {
				name: "noDataColumn1",
				label: "NoDataColumn1",
				dataType: "String",
				sortable: false,
				filterable: false,
				exportSettings: {
					width: 5
				}
			}, {
				name: "noDataColumn2",
				label: "NoDataColumn2",
				dataType: "String",
				sortable: false,
				filterable: false
			}, {
				name: "complexPropC",
				path: "complexPropC",
				label: "Complex Property C",
				propertyInfos: ["noDataColumn1", "noDataColumn2"],
				exportSettings: {
					width: 30,
					label: "Complex export label C"
				}
			}, {
				name: "complexPropD",
				path: "complexPropD",
				label: "Complex Property D",
				propertyInfos: ["propA", "propB", "propC"]
			}]);
			this.aProperties = this.oPropertyHelper.getProperties();

			this.oColumnPropA = new Column({
				id: "propAColumn",
				dataProperty: "propA"
			});

			this.oColumnPropB = new Column({
				id: "propBColumn",
				header: "Property B",
				dataProperty: "propB",
				hAlign: "End"
			});

			this.oColumnPropC = new Column({
				id: "propCColumn",
				dataProperty: "propC"
			});

			this.oColumnComplexPropA = new Column({
				id: "columnComplexPropA",
				header: "Complex Property A",
				dataProperty: "complexPropA"
			});

			this.oColumnComplexPropB = new Column({
				id: "columnComplexPropB",
				dataProperty: "complexPropB"
			});

			this.oColumnPrice = new Column({
				id: "priceColumn",
				header: "Price",
				dataProperty: "price",
				hAlign: "End"
			});

			this.oInvalidColumn = new Column({
				id: "invalidColumn",
				header: "Invalid",
				dataProperty: "invalidProperty"
			});

			this.oNoDataColumn1 = new Column({
				id: "noDataColumn1",
				header: "NoDataColumn1",
				hAlign: "Begin",
				dataProperty: "noDataColumn1"
			});

			this.oNoDataColumn2 = new Column({
				id: "noDataColumn2",
				header: "NoDataColumn2",
				hAlign: "Begin",
				dataProperty: "noDataColumn2"
			});

			this.oColumnComplexPropC = new Column({
				id: "columnComplexPropC",
				header: "Complex Property C",
				dataProperty: "complexPropC"
			});

			this.oColumnComplexPropD = new Column({
				id: "columnComplexPropD",
				header: "Complex Property D",
				dataProperty: "complexPropD"
			});
		},
		afterEach: function() {
			PropertyHelper.prototype.getParent.restore();
			this.oPropertyHelper.destroy();
			this.aProperties = null;
			this.oColumnPropA.destroy();
			this.oColumnPropB.destroy();
			this.oColumnPropC.destroy();
			this.oColumnComplexPropA.destroy();
			this.oColumnComplexPropB.destroy();
			this.oColumnComplexPropC.destroy();
			this.oColumnComplexPropD.destroy();
			this.oColumnPrice.destroy();
			this.oInvalidColumn.destroy();
			this.oNoDataColumn1.destroy();
			this.oNoDataColumn2.destroy();
		}
	});

	QUnit.test("getGroupableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(), [this.oPropertyHelper.getProperty("propB")]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(), [], "After destruction");
	});

	QUnit.test("getColumnExportSettings", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(), [], "No parameter");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings({}), [], "No column instance passed");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oInvalidColumn), [], "Column pointing to invalid property");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropA), [{
			columnId: "propAColumn",
			label: "Export label",
			property: "propAPath",
			textAlign: "Begin",
			type: "Number",
			width: 20
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPropB), [{
			columnId: "propBColumn",
			label: "Property B",
			textAlign: "End",
			type: "String",
			width: "",
			property: "propBPath"
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropA), [{
			columnId: "columnComplexPropA",
			label: "Complex Property A",
			textAlign: "Begin",
			type: "String",
			width: 25,
			property: ["propAPath", "propBPath"],
			template: "{0} ({1})"
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropB), [{
			columnId: "columnComplexPropB",
			label: "Complex export label B",
			textAlign: "End",
			type: "String",
			width: 30,
			property: ["propBPath"]
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnPrice), [{
			columnId: "priceColumn",
			label: "Price",
			textAlign: "End",
			type: "Currency",
			width: "",
			displayUnit: true,
			property: "price",
			unitProperty: "currency"
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oNoDataColumn1), [{
			columnId: "noDataColumn1",
			label: "NoDataColumn1",
			property: "",
			textAlign: "Begin",
			type: "String",
			width: 5
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oNoDataColumn2), [{
			columnId: "noDataColumn2",
			label: "NoDataColumn2",
			property: "",
			textAlign: "Begin",
			type: "String",
			width: ""
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropC), [{
			columnId: "columnComplexPropC",
			label: "Complex export label C",
			property: ["", ""],
			textAlign: "Begin",
			type: "String",
			width: 30
		}], "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnExportSettings(this.oColumnComplexPropD), [{
			columnId: "columnComplexPropD",
			label: "Export label",
			property: "propAPath",
			textAlign: "Begin",
			type: "Number",
			width: 20
		}, {
			columnId: "columnComplexPropD-additionalProperty1",
			label: "Property B",
			textAlign: "Begin",
			type: "String",
			width: "",
			property: "propBPath"
		}], "Complex property without exportSettings referencing property with exportSettings=null");
	});

	QUnit.test("getColumnClipboardSettings", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getColumnClipboardSettings(this.oInvalidColumn), null, "Column pointing to invalid property");
		assert.deepEqual(this.oPropertyHelper.getColumnClipboardSettings(this.oColumnPropA), {
			properties: ["propAPath"],
			types: [this.oPropertyHelper.getProperty("propA").typeConfig.typeInstance],
			template: "{0}"
		}, "Expected column clipboard settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnClipboardSettings(this.oColumnPropC), null, "Expected column clipboard settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnClipboardSettings(this.oColumnComplexPropA), {
			properties: ["propAPath", "propBPath"],
			types: [
				this.oPropertyHelper.getProperty("propA").typeConfig.typeInstance,
				this.oPropertyHelper.getProperty("propB").typeConfig.typeInstance
			],
			template: "{0} ({1})"
		}, "Expected column export settings returned");
		assert.deepEqual(this.oPropertyHelper.getColumnClipboardSettings(this.oColumnComplexPropD), {
			properties: ["propAPath", "propBPath", "propCPath"],
			types: [
				this.oPropertyHelper.getProperty("propA").typeConfig.typeInstance,
				this.oPropertyHelper.getProperty("propB").typeConfig.typeInstance,
				undefined
			],
			template: "{0} {1} {2}"
		}, "Expected column export settings returned");
	});

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String",
				groupable: true
			}, {
				name: "prop2",
				label: "Property 2",
				dataType: "String",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				name: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}, {
				name: "complexProp3",
				label: "Complex property 3",
				propertyInfos: ["prop"],
				visible: false
			}, {
				name: "complexProp4",
				label: "Complex property 4",
				propertyInfos: ["prop2"],
				visible: false
			}]);
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getGroupableProperties", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getGroupableProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getGroupableProperties(), [oSimpleProperty], "Groupable simple property");
		assert.deepEqual(oComplexProperty.getGroupableProperties(), [oSimpleProperty], "Complex property referencing groupable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getGroupableProperties(), [], "Non-groupable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getGroupableProperties(), [],
			"Complex property referencing non-groupable properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getGroupableProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getGroupableProperties(), [oSimpleProperty], "After destruction");
	});

	QUnit.module("Extension attributes", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("Property with extension when no extension attributes are defined", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String",
			extension: {}
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Set 'extension' attribute", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String",
			extension: {
				newAttribute: "test"
			}
		}], null, {
			newAttribute: {type: "string"}
		});

		assert.deepEqual(oPropertyHelper.getProperty("foo").extension, {
			newAttribute: "test"
		});

		oPropertyHelper.destroy();
	});

	QUnit.test("'extension' attribute has default value", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String"
		}], null, {
			newAttribute: {type: "string", "default": {value: "myValue"}}
		});

		assert.deepEqual(oPropertyHelper.getProperty("foo").extension, {
			newAttribute: "myValue"
		});

		oPropertyHelper.destroy();
	});

	QUnit.test("Attributes cannot be mandatory", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String"
		}], null, {
			newAttribute: {type: "string", mandatory: true}
		}).destroy();
		assert.ok(true, "No error thrown if an extension attribute is declared as mandatory and not provided in the property infos.");
	});

	QUnit.test("Complex property", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String"
		}, {
			name: "complexFoo",
			label: "Complex Foo",
			propertyInfos: ["foo"],
			extension: {
				allowedForComplex: "allowed"
			}
		}], null, {
			allowedForComplex: {type: "string", forComplexProperty: {allowed: true}},
			notAllowedForComplex: {type: "string"},
			notAllowedForComplexWithValue: {type: "string", forComplexProperty: {valueIfNotAllowed: "not allowed"}}
		});

		assert.deepEqual(oPropertyHelper.getProperty("complexFoo").extension, {
			allowedForComplex: "allowed",
			notAllowedForComplexWithValue: "not allowed"
		});

		oPropertyHelper.destroy();

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			dataType: "String"
		}, {
			name: "complexFoo",
			label: "Complex Foo",
			propertyInfos: ["foo"],
			extension: {
				notAllowedForComplex: "allowed?"
			}
		}], null, {
			allowedForComplex: {type: "string", forComplexProperty: {allowed: true}},
			notAllowedForComplex: {type: "string", forComplexProperty: {valueIfNotAllowed: "not allowed"}}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if a complex property contains an extension attribute that is not allowed.");
	});

	QUnit.module("Computed attributes", {
		beforeEach: function() {
			this.oGetTypeConfigStub = sinon.stub().returns("MyFakeTypeConfig");
			sinon.stub(PropertyHelper.prototype, "getParent").returns({
				getControlDelegate: sinon.stub().returns({
					getTypeUtil: sinon.stub().returns({
						getTypeConfig: this.oGetTypeConfigStub
					})
				})
			});

			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String",
				formatOptions: {something: 5},
				constraints: {maxLength: 10}
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}]);
		},
		afterEach: function() {
			PropertyHelper.prototype.getParent.restore();
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("typeConfig", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");

		assert.strictEqual(oSimpleProperty.typeConfig, "MyFakeTypeConfig", "Reading 'typeConfig' is possible");
		assert.ok(this.oGetTypeConfigStub.calledOnceWithExactly(oSimpleProperty.dataType, oSimpleProperty.formatOptions, oSimpleProperty.constraints),
			"'typeConfig' created with a single call to TypeUtil with the correct arguments");
		assert.notOk("typeConfig" in this.oPropertyHelper.getProperty("complexProp"), "No 'typeConfig' on a complex property");
	});
});