/*global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/layout/VerticalLayout",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/ui/rta/plugin/Stretch"
],
function (
	jQuery,
	sinon,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	VerticalLayout,
	HBox,
	VBox,
	Button,
	Stretch
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	var sStretchStyleClass = Stretch.STRETCHSTYLECLASS;

	function isStretched(oControl) {
		return oControl.hasStyleClass(sStretchStyleClass);
	}

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							new VBox("vbox11", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox12", {
								width: "300px",
								items: new Button()
							})
						]
					}),
					this.oVBox2 = new VBox("vbox2", {
						width: "300px",
						items: [
							new VBox("vbox21", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox22", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				this.oVBoxOverlay2 = OverlayRegistry.getOverlay(this.oVBox2);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(isStretched(this.oLayout), "the style class was set");
			assert.ok(isStretched(this.oVBox1), "the style class was set");
			assert.ok(isStretched(this.oVBox2), "the style class was set");
		});

		QUnit.test("when the plugin gets deregistered", function(assert) {
			this.oStretchPlugin.deregisterElementOverlay(this.oLayoutOverlay);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay1);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay2);
			assert.notOk(isStretched(this.oLayout), "the style class was removed");
			assert.notOk(isStretched(this.oVBox1), "the style class was removed");
			assert.notOk(isStretched(this.oVBox2), "the style class was removed");
		});

		QUnit.test("when a vbox changes editable to false", function(assert) {
			var oSetStyleClassSpy = sandbox.spy(this.oStretchPlugin, "_setStyleClassForAllStretchCandidates");
			this.oVBoxOverlay1.setEditable(false);
			assert.deepEqual(oSetStyleClassSpy.lastCall.args[0], [this.oVBox1.getId()], "only one overlay is reevaluated");
			assert.ok(isStretched(this.oLayout), "the style class was set");
			assert.notOk(isStretched(this.oVBox1), "the style class was set");
			assert.ok(isStretched(this.oVBox2), "the style class was set");
		});

		QUnit.test("when the root element changes editable to false", function(assert) {
			var oSetStyleClassSpy = sandbox.spy(this.oStretchPlugin, "_setStyleClassForAllStretchCandidates");
			this.oLayoutOverlay.setEditable(false);
			assert.deepEqual(oSetStyleClassSpy.lastCall.args[0], [this.oLayout.getId()], "only one overlay is reevaluated");
			assert.notOk(isStretched(this.oLayout), "the style class was set");
			assert.ok(isStretched(this.oVBox1), "the style class was set");
			assert.ok(isStretched(this.oVBox2), "the style class was set");
		});

		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.notOk(isStretched(this.oLayout), "the style class was removed");
				done();
			}, this);
			this.oLayout.setWidth("400px");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers of different sizes", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "600px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							this.oVBox2 = new VBox("vbox11", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(isStretched(this.oLayout), "the style class was not set");
			assert.ok(isStretched(this.oVBox1), "the style class was set");
		});

		QUnit.test("When a vbox inside becomes not editable", function(assert) {
			this.oVBoxOverlay1.setEditable(false);
			assert.notOk(isStretched(this.oLayout), "the style class was not set");
			assert.notOk(isStretched(this.oVBox1), "the style class was removed");
		});

		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};
			this.oLayout.setWidth("300px");

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.ok(isStretched(this.oLayout), "the style class was set");
				done();
			}, this);
		});

		QUnit.test("when the size of the layout changes with a busy plugin", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};
			this.oLayout.setWidth("300px");
			this.oStretchPlugin.isBusy = function() {
				return true;
			};

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.notOk(isStretched(this.oLayout), "the style class was not set");
				done();
			}, this);
		});

		QUnit.test("When the inner vbox gets destroyed", function(assert) {
			this.oVBox2.destroy();
			assert.notOk(isStretched(this.oVBox1), "the style class was removed");
		});

		QUnit.test("When the inner vbox gets destroyed while a plugin is busy", function(assert) {
			this.oStretchPlugin.isBusy = function() {
				return true;
			};

			this.oVBox2.destroy();
			assert.ok(isStretched(this.oVBox1), "the style class was not removed");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers (one invisible) of different sizes", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "600px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							this.oVBox2 = new VBox("vbox11", {
								width: "300px",
								items: new Button()
							})
						],
						visible: false
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the size of the layout changes", function(assert) {
			var done = assert.async();
			var oEvent = {
				getParameters: function() {
					return {
						id: this.oLayoutOverlay.getId()
					};
				}.bind(this)
			};
			this.oLayout.setWidth("300px");

			this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
				this.oStretchPlugin._onElementOverlayChanged(oEvent);
				assert.notOk(isStretched(this.oLayout), "the style class was not set");
				done();
			}, this);
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (not all editable)", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button()
							}),
							this.oVBox2 = new VBox("vbox2", {
								width: "300px",
								items: new Button()
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oStretchPlugin = new Stretch();
			sandbox.stub(oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElement().getId() === "hbox" || oOverlay.getElement().getId() === "vbox2") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(isStretched(this.oLayout), "the style class was set");
			assert.notOk(isStretched(this.oHBox), "the style class was not set");
		});

		QUnit.test("When the editable child changes editable", function(assert) {
			this.oVBoxOverlay.setEditable(false);
			assert.notOk(isStretched(this.oLayout), "the style class was removed");
			assert.notOk(isStretched(this.oHBox), "the style class is not there");
			assert.notOk(isStretched(this.oVBox), "the style class is not there");

			this.oVBoxOverlay.setEditable(true);
			assert.ok(isStretched(this.oLayout), "the style class was added again");
			assert.notOk(isStretched(this.oHBox), "the style class is not there");
			assert.notOk(isStretched(this.oVBox), "the style class is not there");
		});

		QUnit.test("When the layout becomes not editable", function(assert) {
			this.oLayoutOverlay.setEditable(false);
			assert.notOk(isStretched(this.oLayout), "the style class was removed");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.ok(isStretched(this.oHBox), "the style class was added");
		});

		QUnit.test("When the editable child becomes invisible", function(assert) {
			var done = assert.async();

			this.oVBox.setVisible(false);
			// wait for the dom to update
			var fnDebounced = DtUtil.debounce(function() {
				assert.notOk(isStretched(this.oLayout), "the style class was removed");
				assert.notOk(isStretched(this.oHBox), "the style class is not there");
				assert.notOk(isStretched(this.oVBox), "the style class is not there");
				this.oHBoxOverlay.detachEvent("geometryChanged", fnDebounced);
				done();
			}.bind(this));

			this.oHBoxOverlay.attachEvent("geometryChanged", fnDebounced);
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with two hboxes (one invisible, one not editable) in a layout", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: new Button()
					}),
					this.oHBox2 = new HBox("hbox2", {
						visible: false,
						items: new Button()
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElement().getId() === "hbox") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(isStretched(this.oLayout), "the style class was not set");
			assert.notOk(isStretched(this.oHBox), "the style class was not set");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.ok(isStretched(this.oLayout), "the style class was set");
		});

		QUnit.test("When the hbox becomes editable but a plugin is busy", function(assert) {
			this.oStretchPlugin.isBusy = function() {
				return true;
			};

			this.oHBoxOverlay.setEditable(true);
			assert.notOk(isStretched(this.oLayout), "the style class was not set");
		});

		QUnit.test("When the invisible hbox becomes visible", function(assert) {
			var done = assert.async();
			this.oHBox2.setVisible(true);
			// wait for the dom to update
			var fnDebounced = DtUtil.debounce(function() {
				assert.ok(isStretched(this.oLayout), "the style class was added");
				this.oLayoutOverlay.detachEvent("geometryChanged", fnDebounced);
				done();
			}.bind(this));

			this.oLayoutOverlay.attachEvent("geometryChanged", fnDebounced);
		});

		QUnit.test("When the invisible hbox becomes visible while the plugin is busy", function(assert) {
			this.oStretchPlugin.isBusy = function() {
				return true;
			};
			this.oHBox2.setVisible(true);
			assert.notOk(isStretched(this.oLayout), "the style class was added");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (editable not stubbed)", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button("button")
							})
						]
					})
				]
			}).addStyleClass("sapUiRtaRoot");
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oStretchPlugin = new Stretch();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(this.oLayoutOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oHBoxOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oVBoxOverlay.getEditable(), "no overlay is editable");
		});

		QUnit.test("When the hbox becomes editable", function(assert) {
			this.oHBoxOverlay.setEditable(true);
			assert.notOk(isStretched(this.oLayout), "the style class was not set");
			assert.notOk(isStretched(this.oHBox), "the style class was not set");
			assert.notOk(isStretched(this.oVBox), "the style class was not set");
		});
	});

	QUnit.module("Given a stretch plugin is instantiated without designtime available", {
		beforeEach: function() {
			this.oStretchPlugin = new Stretch();
		},
		afterEach: function() {
			this.oStretchPlugin.destroy();
		}
	}, function() {
		QUnit.test("When the plugin is destroyed", function(assert) {
			this.oStretchPlugin.destroy();
			assert.ok(true, "there is no error thrown");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
