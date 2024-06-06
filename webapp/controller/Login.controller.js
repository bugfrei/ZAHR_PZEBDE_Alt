sap.ui.define([
	"ZAHR_PZEBDE/ZAHR_PZEBDE/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ZAHR_PZEBDE.ZAHR_PZEBDE.controller.Login", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.Login
		 */
		onInit: function () {
			//Get Router
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Login").attachMatched(this.onRouteMatched, this);

			//Get Service Url for OData Read
			var sServiceUrl = this.getOwnerComponent().getManifestEntry("sap.app").dataSources["ZAHR_PZEBDE_GET_FA_PSP_SRV"].uri;
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);
		},

		onRouteMatched: function (oEvent) {
			//this.getView().byId("inputTimeID").setValue("");
		},

		onInputLiveChange: function (oEvent) {
			if (this.getView().byId("inputTimeID").getValue().length === 10) {
				this.onLogin(oEvent);
			}
		},

		onInputSubmit: function (oEvent) {
			this.onLogin(oEvent);
		},

		onLogin: function (oEvent) {
			var that = this;
			console.log(this.getView().byId("inputTimeID").getValue() + "  <<<");
			if (!this.getView().byId("inputTimeID").getValue()) {
				MessageBox.show("Ausweisnummer darf nicht leer sein.");
				return;
			}

			//Get login time ID
			var timeID = this.getView().byId("inputTimeID").getValue();

			//Prepare aFilters
			var aFilters = [];
			var oReadFilter = new Filter({
				path: "timeID",
				operator: FilterOperator.EQ,
				value1: timeID
			});
			aFilters.push(oReadFilter);

			// Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					that.oRouter.navTo("PZEBDE", {
						timeID: response.data.results[0].timeID,
						employeeID: response.data.results[0].employeeID,
						name: response.data.results[0].name
					}, true);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};

			// Read OData for Login
			this.oModel.read("/LoginSet", oParameters);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.Login
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.Login
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.Login
		 */
		//	onExit: function() {
		//
		//	}

	});

});
