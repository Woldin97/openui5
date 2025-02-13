/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/library",
	"sap/ui/table/menus/ColumnHeaderMenuAdapter"
], function(
	Control,
	TableQUnitUtils,
	qutils,
	TableUtils,
	Column,
	Table,
	library,
	ColumnHeaderMenuAdapter
) {
	"use strict";

	var TestMenu, TestAdapter, oTestAdapterInstance, oInjectMenuItemsSpy, oRemoveItemsSpy, oAfterMenuDestroyedSpy;

	sap.ui.define("sap/ui/table/menus/test/TestAdapter", function() {
		TestAdapter = ColumnHeaderMenuAdapter.extend("sap.ui.table.menus.test.TestAdapter", {
			constructor: function() {
				oTestAdapterInstance = this;
				oInjectMenuItemsSpy = sinon.spy(oTestAdapterInstance, "injectMenuItems");
				oRemoveItemsSpy = sinon.spy(oTestAdapterInstance, "removeMenuItems");
				oAfterMenuDestroyedSpy = sinon.spy(oTestAdapterInstance, "onAfterMenuDestroyed");

				ColumnHeaderMenuAdapter.apply(this, arguments);
			},

			injectMenuItems: function(oColumnHeaderMenu, oColumn) {
			},

			removeMenuItems: function(oColumnHeaderMenu, oColumn) {
			},

			onAfterMenuDestroyed: function(oColumnHeaderMenu) {
			}
		});

		return TestAdapter;
	});

	sap.ui.define("sap/m/table/columnmenu/test/TestMenu", function() {
		TestMenu = Control.extend("sap.m.table.columnmenu.test.TestMenu", {
			openBy: function(oColumn) {
			},
			getAriaHasPopupType: function() {
				return "dialog";
			}
		});

		return TestMenu;
	});

	QUnit.module("API and Integration", {
		beforeEach: function() {
			this.oMenu1 = new TestMenu();
			this.oMenu2 = new TestMenu();
			this.oColumn1 = new Column();
			this.oColumn2 = new Column();
			this.oColumn1.setHeaderMenu(this.oMenu1.getId());
			this.oColumn2.setHeaderMenu(this.oMenu2.getId());
			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn1, this.oColumn2]
			});
		},
		afterEach: function() {
			this.oMenu1.destroy();
			this.oMenu2.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("activateFor", function(assert) {
		var done = assert.async();
		var that = this;

		ColumnHeaderMenuAdapter.activateFor(that.oColumn1);
		setTimeout(function() {
			assert.ok(oInjectMenuItemsSpy.calledOnceWith(that.oMenu1, that.oColumn1), "injectMenuItems is called once with the correct parameters");
			assert.ok(oTestAdapterInstance._mInjectionTarget.column === that.oColumn1 && oTestAdapterInstance._mInjectionTarget.menu === that.oMenu1,
				"the injection target is correct");
			oInjectMenuItemsSpy.reset();

			ColumnHeaderMenuAdapter.activateFor(that.oColumn2);
			setTimeout(function() {
				assert.ok(oRemoveItemsSpy.calledOnceWith(that.oMenu1), "removeMenuItems is called once with the correct parameters");
				assert.ok(oInjectMenuItemsSpy.calledOnceWith(that.oMenu2, that.oColumn2), "injectMenuItems called once with the correct parameters");
				assert.ok(oTestAdapterInstance._mInjectionTarget.column === that.oColumn2 && oTestAdapterInstance._mInjectionTarget.menu === that.oMenu2,
					"the injection target is correct");
				done();
			}, 0);
		}, 0);
	});

	QUnit.test("destroy", function(assert) {
		var done = assert.async();
		var that = this;

		ColumnHeaderMenuAdapter.activateFor(that.oColumn2);
		setTimeout(function() {
			var oObserveSpy = sinon.spy(oTestAdapterInstance._oColumnHeaderMenuObserver, "disconnect");

			that.oMenu2.destroy();
			assert.ok(oAfterMenuDestroyedSpy.called, "onAfterMenuDestroyed is called");

			that.oTable.destroy();
			assert.ok(oRemoveItemsSpy.calledOnce, "removeMenuItems is called once");
			assert.ok(oObserveSpy.calledOnce, "observer is disconnected");
			assert.equal(oTestAdapterInstance._oColumnHeaderMenuObserver, undefined, "observer is deleted");

			done();
		}, 0);
	});

	QUnit.test("Adapter lifecycle", function(assert) {
		var done = assert.async();
		var oActivateSpy = sinon.spy(ColumnHeaderMenuAdapter, "activateFor");
		var oUnlinkSpy = sinon.spy(ColumnHeaderMenuAdapter, "unlink");

		this.oColumn1._openHeaderMenu(this.oColumn1);

		assert.ok(oActivateSpy.calledOnceWith(this.oColumn1));
		oActivateSpy.reset();
		oInjectMenuItemsSpy.reset();

		setTimeout(function() {
			var oAdapterInstance = oTestAdapterInstance;
			assert.ok(oTestAdapterInstance, "TestAdapter is initialized");
			assert.ok(oInjectMenuItemsSpy.calledOnce, 1, "injectMenuItems is called once");

			this.oColumn2._openHeaderMenu(this.oColumn2);
			assert.ok(oActivateSpy.calledOnceWith(this.oColumn2));
			assert.deepEqual(oTestAdapterInstance, oAdapterInstance, "the same Adapter instance is used");

			assert.ok(oRemoveItemsSpy.calledOnce, "removeMenuItems is called once");
			assert.ok(oInjectMenuItemsSpy.calledTwice, "injectMenuItems is called once");

			var oDestroySpy = sinon.spy(oTestAdapterInstance, "destroy");
			this.oColumn1.destroy();
			assert.ok(oUnlinkSpy.calledOnce);
			assert.ok(oDestroySpy.notCalled);
			this.oColumn2.destroy();
			assert.ok(oUnlinkSpy.calledTwice);
			assert.ok(oDestroySpy.calledOnce);

			done();
		}.bind(this), 0);
	});
});