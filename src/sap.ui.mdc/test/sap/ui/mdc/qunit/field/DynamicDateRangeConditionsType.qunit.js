/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"delegates/odata/v4/FieldBaseDelegate",
	"sap/ui/mdc/condition/Condition",
	'sap/ui/mdc/condition/ConditionValidateException',
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/core/date/UI5Date",
	"sap/m/DynamicDateUtil"
], function (
		DynamicDateRangeConditionsType,
		FieldBaseDelegate,
		Condition,
		ConditionValidateException,
		FilterOperatorUtil,
		Operator,
		OperatorDynamicDateOption,
		ConditionValidated,
		DateType,
		DateTimeOffsetType,
		FilterOperator,
		FormatException,
		ParseException,
		ValidateException,
		UI5Date,
		DynamicDateUtil
		) {
	"use strict";

	// var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	var oDynamicDateRangeConditionsType;
	var oType;

	// create customOperator (only once as it is stored in global configuration)
	var oOperator = new Operator({
		name: "MyDate",
		filterOperator: FilterOperator.EQ,
		tokenParse: "^#([^=].*)$",
		tokenFormat: "#{0}",
		valueTypes: [Operator.ValueType.Self]
	});
	FilterOperatorUtil.addOperator(oOperator);
	var oOperatorDynamicDateOption = new OperatorDynamicDateOption({
		key: "Date-MyDate",
		operator: oOperator,
		type: new DateType({style: "long", calendarType: "Gregorian"}),
		valueTypes: ["custom"]
	});
	DynamicDateUtil.addOption(oOperatorDynamicDateOption);

	// custom operator to enable Date for DateTime types
	var oMyDateOperator = new Operator({
		name: "MYDATE2",
		alias: {Date: "DATE", DateTime: "DATE"},
		filterOperator: FilterOperator.EQ,
		tokenParse: "^=([^=].*)$",
		tokenFormat: "{0}",
		valueTypes: [{name: "sap.ui.model.odata.type.Date"}] // use date type to have no time part
	});
	FilterOperatorUtil.addOperator(oMyDateOperator);

	var fnTeardown = function() {
		oDynamicDateRangeConditionsType.destroy();
		oDynamicDateRangeConditionsType = undefined;
		oType.destroy();
		oType = undefined;
	};

	var fnInitDate = function() {
		oType = new DateType({style: "long", calendarType: "Gregorian"});
		oDynamicDateRangeConditionsType = new DynamicDateRangeConditionsType({valueType: oType, maxConditions: 1, delegate: FieldBaseDelegate, payload: {}});
	};

	var fnInitDateTime = function() {
		oType = new DateTimeOffsetType({style: "long", calendarType: "Gregorian", UTC: true}, {V4:true}); // UTC to check conversion
		oDynamicDateRangeConditionsType = new DynamicDateRangeConditionsType({valueType: oType, maxConditions: 1, delegate: FieldBaseDelegate, payload: {}});
	};

	function _createCondition(sOperator, aValues) {
		var oCondition = Condition.createCondition(sOperator, aValues, undefined, undefined, ConditionValidated.NotValidated);
		oCondition.isEmpty = false;
		return oCondition;
	}

	QUnit.module("Formatting Date", {
		beforeEach: fnInitDate,
		afterEach: fnTeardown
	});

	QUnit.test("nothing", function(assert) {

		var sResult = oDynamicDateRangeConditionsType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("empty array", function(assert) {

		var vResult = oDynamicDateRangeConditionsType.formatValue([]);
		assert.equal(vResult, undefined, "Result of formatting");

	});

	QUnit.test("invalid value", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof FormatException, "FormatException fired");

	});

	QUnit.test("invalid condition", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.formatValue([{x: "X"}]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof FormatException, "FormatException fired");

	});

	QUnit.test("invalid maxConditions", function(assert) {

		var oException;
		oDynamicDateRangeConditionsType.setFormatOptions({valueType: oType, maxConditions: -1});

		try {
			oDynamicDateRangeConditionsType.formatValue([]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof FormatException, "FormatException fired");

	});

	QUnit.test("normal operators", function(assert) {

		var oCondition = _createCondition("EQ", ["2021-10-04"]);
		var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "DATE", values: [UI5Date.getInstance(2021, 9, 4)]}, "Result of formatting: " + oCondition.operator); // DynamicDateRange works with local dates

		oCondition = _createCondition("BT", ["2021-10-04", "2021-10-05"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "DATERANGE", values: [UI5Date.getInstance(2021, 9, 4), UI5Date.getInstance(2021, 9, 5)]}, "Result of formatting: " + oCondition.operator);

		oCondition = _createCondition("GE", ["2021-10-04"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "FROM", values: [UI5Date.getInstance(2021, 9, 4)]}, "Result of formatting: " + oCondition.operator);

		oCondition = _createCondition("LE", ["2021-10-04"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "TO", values: [UI5Date.getInstance(2021, 9, 4)]}, "Result of formatting: " + oCondition.operator);

	});

	QUnit.test("RangeOperators - static", function(assert) {

		var aOperators = ["TODAY", "YESTERDAY", "TOMORROW", "LASTWEEK", "THISWEEK", "NEXTWEEK", "LASTMONTH", "THISMONTH", "NEXTMONTH", "LASTQUARTER", "THISQUARTER", "NEXTQUARTER",
							"QUARTER1", "QUARTER2", "QUARTER3", "QUARTER4", "LASTYEAR", "THISYEAR", "NEXTYEAR", "YEARTODATE"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, []);
			var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
			assert.deepEqual(oResult, {operator: sOperator, values: []}, "Result of formatting: " + sOperator);
		}

	});

	QUnit.test("RangeOperators - integer (one value)", function(assert) {

		var aOperators = ["LASTDAYS", "NEXTDAYS", "LASTWEEKS", "NEXTWEEKS", "LASTMONTHS", "NEXTMONTHS", "LASTQUARTERS", "NEXTQUARTERS", "LASTYEARS", "NEXTYEARS", "SPECIFICMONTH"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, [2]);
			var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
			assert.deepEqual(oResult, {operator: sOperator, values: [2]}, "Result of formatting: " + sOperator);
		}

	});

	QUnit.test("RangeOperators - integer (two values)", function(assert) {

		var aOperators = ["TODAYFROMTO"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, [2, 3]);
			var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
			assert.deepEqual(oResult, {operator: sOperator, values: [2, 3]}, "Result of formatting: " + sOperator);
		}

	});

	QUnit.test("unknown operator", function(assert) {

		var oException;

		var oCondition = _createCondition("X", []);
		try {
			oDynamicDateRangeConditionsType.formatValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("custom operators", function(assert) {

		var oCondition = _createCondition("MyDate", ["2021-10-04"]);
		var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "Date-MyDate", values: ["2021-10-04"]}, "Result of formatting: " + oCondition.operator); // original value is used as type is used formatting and parsing

	});

	QUnit.module("Formatting DateTime", {
		beforeEach: fnInitDateTime,
		afterEach: fnTeardown
	});

	QUnit.test("normal operators", function(assert) {

		var oCondition = _createCondition("EQ", ["2022-02-01T09:08:30Z"]); // for Type UTC is used
		var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "DATETIME", values: [UI5Date.getInstance(2022, 1, 1, 9, 8, 30, 0)]}, "Result of formatting: " + oCondition.operator); // DynamicDateRange uses local date

		oCondition = _createCondition("BT", ["2022-02-01T09:08:30Z", "2022-02-02T09:08:30Z"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "DATETIMERANGE", values: [UI5Date.getInstance(2022, 1, 1, 9, 8, 30, 0), UI5Date.getInstance(2022, 1, 2, 9, 8, 30)]}, "Result of formatting: " + oCondition.operator);

		oCondition = _createCondition("GE", ["2022-02-08T12:22:30Z"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "FROMDATETIME", values: [UI5Date.getInstance(2022, 1, 8, 12, 22, 30, 0)]}, "Result of formatting: " + oCondition.operator);

		oCondition = _createCondition("LE", ["2022-02-08T12:22:30Z"]);
		oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "TODATETIME", values: [UI5Date.getInstance(2022, 1, 8, 12, 22, 30)]}, "Result of formatting: " + oCondition.operator);

	});

	QUnit.test("custom Date operator", function(assert) {

		var oCondition = _createCondition("MYDATE2", ["2023-02-09"]);
		var oResult = oDynamicDateRangeConditionsType.formatValue([oCondition]);
		assert.deepEqual(oResult, {operator: "DATE", values: [UI5Date.getInstance(2023, 1, 9)]}, "Result of formatting: " + oCondition.operator);

	});

	QUnit.module("Parsing Date", {
		beforeEach: fnInitDate,
		afterEach: fnTeardown
	});

	QUnit.test("empty", function(assert) {

		var aConditions = oDynamicDateRangeConditionsType.parseValue();
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 0, "no conditions returned");

	});

	QUnit.test("invalid value", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.parseValue({operator: "PARSEERROR", values: ["MyError"]});
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ParseException, "ParseException fired");
		assert.equal(oException.message, "MyError", "Error message");

	});

	QUnit.test("invalid maxConditions", function(assert) {

		var oException;
		oDynamicDateRangeConditionsType.setFormatOptions({valueType: oType, maxConditions: -1});

		try {
			oDynamicDateRangeConditionsType.parseValue();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ParseException, "ParseException fired");

	});

	QUnit.test("normal operators", function(assert) {

		var oCondition = _createCondition("EQ", ["2021-10-04"]);
		var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "DATE", values: [UI5Date.getInstance(2021, 9, 4)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("BT", ["2021-10-04", "2021-10-05"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "DATERANGE", values: [UI5Date.getInstance(2021, 9, 4), UI5Date.getInstance(2021, 9, 5)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("GE", ["2021-10-04"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "FROM", values: [UI5Date.getInstance(2021, 9, 4)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("LE", ["2021-10-04"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "TO", values: [UI5Date.getInstance(2021, 9, 4)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

	});

	QUnit.test("RangeOperators - static", function(assert) {

		var aOperators = ["TODAY", "YESTERDAY", "TOMORROW", "LASTWEEK", "THISWEEK", "NEXTWEEK", "LASTMONTH", "THISMONTH", "NEXTMONTH", "LASTQUARTER", "THISQUARTER", "NEXTQUARTER",
							"QUARTER1", "QUARTER2", "QUARTER3", "QUARTER4", "LASTYEAR", "THISYEAR", "NEXTYEAR", "YEARTODATE"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, []);
			var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: sOperator, values: []});
			assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + sOperator);
		}

	});

	QUnit.test("RangeOperators - integer (one value)", function(assert) {

		var aOperators = ["LASTDAYS", "NEXTDAYS", "LASTWEEKS", "NEXTWEEKS", "LASTMONTHS", "NEXTMONTHS", "LASTQUARTERS", "NEXTQUARTERS", "LASTYEARS", "NEXTYEARS", "SPECIFICMONTH"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, [2]);
			var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: sOperator, values: [2]});
			assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + sOperator);
		}

	});

	QUnit.test("RangeOperators - integer (two values)", function(assert) {

		var aOperators = ["TODAYFROMTO"];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oCondition = _createCondition(sOperator, [2, 3]);
			var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: sOperator, values: [2, 3]});
			assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + sOperator);
		}

	});

	QUnit.test("custom operators", function(assert) {

		var oCondition = _createCondition("MyDate", ["2021-10-04"]);
		var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "Date-MyDate", values: ["2021-10-04"]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator); // original value is used as type is used formatting and parsing

	});

	QUnit.module("Parsing DateTime", {
		beforeEach: fnInitDateTime,
		afterEach: fnTeardown
	});

	QUnit.test("normal operators", function(assert) {

		var oCondition = _createCondition("EQ", ["2022-02-01T09:21:30Z"]); // Data type uses UTC
		var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "DATETIME", values: [UI5Date.getInstance(2022, 1, 1, 9, 21, 30, 0)]}); // DynamicDateRange uses local date
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("BT", ["2022-02-01T09:21:30Z", "2022-02-01T10:21:30Z"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "DATETIMERANGE", values: [UI5Date.getInstance(2022, 1, 1, 9, 21, 30, 0), UI5Date.getInstance(2022, 1, 1, 10, 21, 30, 999)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("GE", ["2022-02-08T12:22:30Z"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "FROMDATETIME", values: [UI5Date.getInstance(2022, 1, 8, 12, 22, 30, 0)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

		oCondition = _createCondition("LE", ["2022-02-08T12:22:30Z"]);
		aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "TODATETIME", values: [UI5Date.getInstance(2022, 1, 8, 12, 22, 30, 999)]});
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

	});

	QUnit.test("custom Date operator", function(assert) {

		var oCondition = _createCondition("MYDATE2", ["2021-10-04"]);
		var aConditions = oDynamicDateRangeConditionsType.parseValue({operator: "DATE", values: [UI5Date.getInstance(2021, 9, 4)]}); // DynamicDateRange uses local date
		assert.deepEqual(aConditions, [oCondition], "Result of parsing: " + oCondition.operator);

	});

	QUnit.module("Validating", {
		beforeEach: fnInitDate,
		afterEach: fnTeardown
	});

	QUnit.test("nothing", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.validateValue();
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("empty conditions", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("invalid value", function(assert) {

		var oException;

		try {
			oDynamicDateRangeConditionsType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ConditionValidateException, "ConditionValidateException fired");
		assert.notOk(oException && oException.getCondition(), "exception condition");
		assert.deepEqual(oException && oException.getConditions(), "XXX", "exception conditions");

		oException = undefined;
		try {
			oDynamicDateRangeConditionsType.validateValue(["XXX"]);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ConditionValidateException, "ConditionValidateException fired");
		assert.deepEqual(oException && oException.getCondition(), "XXX", "exception condition");
		assert.deepEqual(oException && oException.getConditions(), ["XXX"], "exception conditions");

	});

	QUnit.test("invalid operator", function(assert) {

		var oException;
		var oCondition = _createCondition("XXX", ["2021-10-04"]);

		try {
			oDynamicDateRangeConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ConditionValidateException, "ConditionValidateException fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.deepEqual(oException && oException.getConditions(), [oCondition], "exception conditions");

	});

	QUnit.test("invalid condition", function(assert) {

		var oException;
		var oCondition = _createCondition("SPECIFICMONTH", [20]);

		try {
			oDynamicDateRangeConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ConditionValidateException, "ConditionValidateException fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.deepEqual(oException && oException.getConditions(), [oCondition], "exception conditions");

	});

	QUnit.test("valid condition", function(assert) {

		var oException;
		var oCondition = _createCondition("SPECIFICMONTH", [2]);

		try {
			oDynamicDateRangeConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}
		assert.notOk(oException, "no exception fired");

	});

});
