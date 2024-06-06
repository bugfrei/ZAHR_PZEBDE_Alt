sap.ui.define([
	"ZAHR_PZEBDE/ZAHR_PZEBDE/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"ZAHR_PZEBDE/ZAHR_PZEBDE/controller/Formatter"
], function (BaseController, MessageBox, MessageToast, Filter, FilterOperator, Device, Sorter, JSONModel, Menu, MenuItem) {
	"use strict";

	return BaseController.extend("ZAHR_PZEBDE.ZAHR_PZEBDE.controller.PZEBDE", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.PZEBDE
		 */

		onInit: function () {
			//Get Data from Login View
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("PZEBDE").attachMatched(this.onRouteMatched, this);

			//Get Service Url for OData
			var sServiceUrl = this.getOwnerComponent().getManifestEntry("sap.app").dataSources["ZAHR_PZEBDE_GET_FA_PSP_SRV"].uri;
			this.oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);

			/*Table Init*/
			// Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			this._mViewSettingsDialogs = {};

			this.mGroupFunctions = {
				date: function (oContext) {
					var name = oContext.getProperty("date");
					return {
						key: name,
						text: name
					};
				}
			};

			// sap.ui.getCore().attachValidationError(function(oEvent) {
			// 	oEvent.getParameter("element").setValueState(sap.ui.core.ValueState.Error);
			// });

			// sap.ui.getCore().attachValidationSuccess(function(oEvent) {
			// 	oEvent.getParameter("element").setValueState(sap.ui.core.ValueState.None);
			// });
		},

		handleIconTabBarSelect: function (oEvent) {
			var selectedTab = oEvent.getParameter("key");
			switch (selectedTab) {
			case "__xmlview1--filter0":
				//PZE
				this.getView().byId("filter2").setVisible(false);
				break;
			case "__xmlview1--filter1":
				//BDE
				this.getView().byId("filter2").setVisible(false);
				this.getLastOperationsList();
				// this.getCurrentProcessesList();
				this.getView().byId("bdeInput0").setValue("");
				break;
			case "__xmlview1--filter2":
				//BDE Detail
				break;
			case "__xmlview1--filter3":
				//PZE Overview
				this.getPzeOvDat();
				break;
			case "__xmlview1--filter4":
				//BDE Overview
				this.getBdeOvDat();
				break;
			}
		},

		getBdeOvDat: function () {
			var that = this;
			//Prepare aFilters
			var aFilters = [
				new Filter({
					path: "employeeID",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("pzeInput1").getValue()
				}),
				new Filter({
					path: "datetime",
					operator: FilterOperator.EQ,
					value1: new Date()
				})
			];

			//Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					var bdeJSONModel = new sap.ui.model.json.JSONModel();
					that.getView().byId("bdeOvTable").setModel(bdeJSONModel);
					bdeJSONModel.setData({
						bdeTableData: oData
					});
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.read("/BdeOverviewSet", oParameters);
		},

		getPzeOvDat: function () {
			var that = this;
			//Prepare aFilters
			var aFilters = [
				new Filter({
					path: "employeeID",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("pzeInput1").getValue()
				}),
				new Filter({
					path: "datetime",
					operator: FilterOperator.EQ,
					value1: new Date()
				})
			];

			//Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					var pzeJSONModel = new sap.ui.model.json.JSONModel();
					that.getView().byId("pzeOvTable").setModel(pzeJSONModel);
					pzeJSONModel.setData({
						pzeTableData: oData
					});
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.read("/PzeOverviewSet", oParameters);
		},

		onPressBearbeiten: function () {
			var input = this.getView().byId("bdeInput0").getValue();
			if (!input) {
				MessageBox.show("Ungültige Nummer eingegeben.");
				return;
			}
			if (input.includes(" ")) {
				var keys = input.split(' ');
				this.setFaParameters(keys);
			}
			else {
				this.setPsParameters(input);
			}
		},

		setFaParameters: function (values) {
			this.getView().byId("bdeDetailElement0").setVisible(false);
			this.getView().byId("bdeDetailElement1").setVisible(true);
			this.getView().byId("bdeDetailElement2").setVisible(true);
			//FA
			this.getView().byId("bdeDetailInput1").setValue(values[0]);
			//Vorgang
			this.getView().byId("bdeDetailInput2").setValue(values[1]);
			this.getOperationDetails();
		},

		setPsParameters: function (value) {
			this.getView().byId("bdeDetailElement0").setVisible(true);
			this.getView().byId("bdeDetailElement1").setVisible(false);
			this.getView().byId("bdeDetailElement2").setVisible(false);
			//PS
			this.getView().byId("bdeDetailInput0").setValue(value);
			this.getOperationDetails();
		},

		onItemPress: function (oEvent) {
			var title = oEvent.getParameters().listItem.getTitle();
			if (title.includes("Fertigungsauftrag")) {
				var keys = oEvent.getParameters().listItem.getDescription().split("/");
				this.setFaParameters(keys);
			}
			else {
				var key = oEvent.getParameters().listItem.getDescription();
				this.setPsParameters(key);
			}
		},

		onPressUnterbrechung: function () {
			var that = this;
			var oSaveRequestBody = {
				employeeID: this.getView().byId("pzeInput1").getValue(),

				datetime: new Date(),
				productionOrder: this.getView().byId("bdeDetailInput1").getValue(),
				operation: this.getView().byId("bdeDetailInput2").getValue(),
				pspnr: this.getView().byId("bdeDetailInput0").getValue(),
				yield: this.getView().byId("bdeDetailInput7").getValue(),
				scrap: this.getView().byId("bdeDetailInput8").getValue()
			};

			//Prepare oParameters
			var oParameters = {
				success: function (oData, response) {
					MessageToast.show("Vorgang erfolgreich pausiert.");
					that.getView().byId("bdeDetailbutton0").setVisible(true);
					that.getView().byId("bdeDetailbutton1").setVisible(false);
					that.getView().byId("bdeDetailbutton2").setVisible(false);
					that.getView().byId("bdeDetailbutton3").setVisible(false);
					that.getView().byId("bdeDetailInput7").setEditable(false);
					that.getView().byId("bdeDetailInput8").setEditable(false);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.create("/ProcessPauseSet", oSaveRequestBody, oParameters);
		},

		onPressMenge: function () {
			var oSaveRequestBody = {
				employeeID: this.getView().byId("pzeInput1").getValue(),
				datetime: new Date(),
				productionOrder: this.getView().byId("bdeDetailInput1").getValue(),
				operation: this.getView().byId("bdeDetailInput2").getValue(),
				pspnr: this.getView().byId("bdeDetailInput0").getValue(),
				yield: this.getView().byId("bdeDetailInput7").getValue(),
				scrap: this.getView().byId("bdeDetailInput8").getValue()
			};

			//Prepare oParameters
			var oParameters = {
				success: function (oData, response) {
					MessageToast.show("Mengenrückmeldung war erfolgreich.");
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.create("/ProcessQuantitySet", oSaveRequestBody, oParameters);
		},

		onPressEnde: function () {
			var that = this;
			var oSaveRequestBody = {
				employeeID: this.getView().byId("pzeInput1").getValue(),
				datetime: new Date(),
				productionOrder: this.getView().byId("bdeDetailInput1").getValue(),
				operation: this.getView().byId("bdeDetailInput2").getValue(),
				pspnr: this.getView().byId("bdeDetailInput0").getValue(),
				yield: this.getView().byId("bdeDetailInput7").getValue(),
				scrap: this.getView().byId("bdeDetailInput8").getValue()
			};

			//Prepare oParameters
			var oParameters = {
				success: function (oData, response) {
					MessageToast.show("Vorgang erfolgreich beendet.");
					that.getView().byId("bdeDetailbutton0").setVisible(true);
					that.getView().byId("bdeDetailbutton1").setVisible(false);
					that.getView().byId("bdeDetailbutton2").setVisible(false);
					that.getView().byId("bdeDetailbutton3").setVisible(false);
					that.getView().byId("bdeDetailInput7").setEditable(false);
					that.getView().byId("bdeDetailInput8").setEditable(false);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.create("/ProcessEndSet", oSaveRequestBody, oParameters);
		},

		onPressBeginn: function () {
			var that = this;
			var oSaveRequestBody = {
				employeeID: this.getView().byId("pzeInput1").getValue(),
				datetime: new Date(),
				productionOrder: this.getView().byId("bdeDetailInput1").getValue(),
				operation: this.getView().byId("bdeDetailInput2").getValue(),
				pspnr: this.getView().byId("bdeDetailInput0").getValue()
			};

			//Prepare oParameters
			var oParameters = {
				success: function (oData, response) {
					MessageToast.show("Vorgang erfolgreich begonnen.");
					that.getView().byId("bdeDetailbutton0").setVisible(false);
					that.getView().byId("bdeDetailbutton1").setVisible(true);
					that.getView().byId("bdeDetailbutton2").setVisible(true);
					that.getView().byId("bdeDetailbutton3").setVisible(true);
					that.getView().byId("bdeDetailInput7").setEditable(true);
					that.getView().byId("bdeDetailInput8").setEditable(true);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.create("/ProcessBeginSet", oSaveRequestBody, oParameters);
		},

		checkOperationInput: function () {
			if (!this.getView().byId("pzeInput0").getValue() &&
				!this.getView().byId("pzeInput1").getValue()) {
				MessageBox.show("Entweder der FA oder das PS muss gefüllt sein");
				return false;
			}
			if (this.getView().byId("pzeInput1").getValue() &&
				!this.getView().byId("pzeInput2").getValue()) {
				MessageBox.show("Vorgangsnummer muss gefüllt sein");
				return false;
			}
			return true;
		},

		getOperationDetails: function () {
			var that = this;
			var ret = that.checkOperationInput();
			if (!ret) {
				return;
			}

			//Prepare aFilters
			var aFilters = [
				new Filter({
					path: "employeeID",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("pzeInput1").getValue()
				}),
				new Filter({
					path: "datetime",
					operator: FilterOperator.EQ,
					value1: new Date()
				}),
				new Filter({
					path: "productionOrder",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("bdeDetailInput1").getValue()
				}),
				new Filter({
					path: "operation",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("bdeDetailInput2").getValue()
				}),
				new Filter({
					path: "pspnr",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("bdeDetailInput0").getValue()
				})
			];

			//Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					that.processDetailResult(response.data.results[0]);
					that.getView().byId("filter2").setVisible(true);
					that.getView().byId("bar0").setSelectedKey("__xmlview1--filter2");
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.read("/OperationDetailsSet", oParameters);
		},

		processDetailResult: function (result) {
			//Artikel
			this.getView().byId("bdeDetailInput3").setValue(result.product);
			//Kunde
			this.getView().byId("bdeDetailInput4").setValue(result.customer);
			//Arbeitsplatz
			this.getView().byId("bdeDetailInput5").setValue(result.workstation);
			//Langtext
			this.getView().byId("bdeDetailInput6").setValue(result.longtext);
			if (!result.pspnr) {
				this.getView().byId("bdeDetailInput1").setValue(result.productionOrder);
				this.getView().byId("bdeDetailInput2").setValue(result.operation);
			}
			else {
				this.getView().byId("bdeDetailInput0").setValue(result.pspnr);
			}
			if (result.tmvnt === "PSB" ||
				result.tmvnt === "FAB") {
				this.getView().byId("bdeDetailbutton0").setVisible(false);
				this.getView().byId("bdeDetailbutton1").setVisible(true);
				this.getView().byId("bdeDetailbutton2").setVisible(true);
				this.getView().byId("bdeDetailbutton3").setVisible(true);
				this.getView().byId("bdeDetailInput7").setEditable(true);
				this.getView().byId("bdeDetailInput8").setEditable(true);
			}
			else {
				this.getView().byId("bdeDetailbutton0").setVisible(true);
				this.getView().byId("bdeDetailbutton1").setVisible(false);
				this.getView().byId("bdeDetailbutton2").setVisible(false);
				this.getView().byId("bdeDetailbutton3").setVisible(false);
				this.getView().byId("bdeDetailInput7").setEditable(false);
				this.getView().byId("bdeDetailInput8").setEditable(false);
			}
		},

		getLastOperationsList: function () {
			var that = this;
			//Prepare aFilters
			var aFilters = [
				new Filter({
					path: "employeeID",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("pzeInput1").getValue()
				}),
				new Filter({
					path: "datetime",
					operator: FilterOperator.EQ,
					value1: new Date()
				})
			];

			//Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					that.addLastOperationItems(response.data.results);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.read("/OperationSet", oParameters);
		},

		// getCurrentProcessesList: function () {
		// 	var that = this;
		// 	//Prepare aFilters
		// 	var aFilters = [
		// 		new Filter({
		// 			path: "employeeID",
		// 			operator: FilterOperator.EQ,
		// 			value1: this.getView().byId("pzeInput1").getValue()
		// 		}),
		// 		new Filter({
		// 			path: "datetime",
		// 			operator: FilterOperator.EQ,
		// 			value1: new Date()
		// 		})
		// 	];

		// 	//Prepare oParameters
		// 	var oParameters = {
		// 		filters: aFilters,
		// 		success: function (oData, response) {
		// 			that.addLastOperationItems(response.data.results);
		// 		},
		// 		error: function (oError) {
		// 			var oErrorText = JSON.parse(oError.responseText);
		// 			MessageBox.show(oErrorText.error.message.value);
		// 		}
		// 	};
		// 	this.oModel.read("/CurrentProcessesList", oParameters);
		// },

		addCurrentProcessesItems: function (results) {
			var that = this;
			var oSelectList = that.getView().byId("bdeList1");
			oSelectList.removeAllItems();
			results.forEach(function (item) {
				var oItem = new sap.m.StandardListItem();
				if (item.productionOrder) {
					var text = item.productionOrder + "/" + item.operation;
					oItem.setTitle("Fertigungsauftrag: ");
					oItem.setDescription(text);
				}
				else {
					oItem.setTitle("PSP Element: ");
					oItem.setDescription(item.pspnr);
				}
				oItem.setType("Navigation");
				//oContent.setText("");
				oSelectList.addItem(oItem);
			});
		},

		addLastOperationItems: function (results) {
			var that = this;
			var oSelectList = that.getView().byId("bdeList0");
			oSelectList.removeAllItems();
			results.forEach(function (item) {
				var oItem = new sap.m.StandardListItem();
				if (item.productionOrder) {
					var text = item.productionOrder + "/" + item.operation;
					oItem.setTitle("Fertigungsauftrag: ");
					oItem.setDescription(text);
				}
				else {
					oItem.setTitle("PSP Element: ");
					oItem.setDescription(item.pspnr);
				}
				oItem.setType("Navigation");
				//oContent.setText("");
				oSelectList.addItem(oItem);
			});
		},

		onRouteMatched: function (oEvent) {
			this.getView().byId("filter2").setVisible(false);
			this.setViewParameters(oEvent);
			this.getHrEvents();
		},

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Login", {}, true);
		},

		onKommen: function () {
			this.createODataRequest("/onKommenSet");
		},

		onGehen: function () {
			this.createODataRequest("/onGehenSet");
		},

		createODataRequest: function (sPath) {
			var that = this;
			//Prepare oParameters
			var oParameters = {
				success: function (oData, response) {
					//Timeline mit neuem Item befüllen
					that.addTimelineItem(response.data, sPath);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};

			var oSaveRequestBody = {
				employeeID: this.getView().byId("pzeInput1").getValue(),
				datetime: new Date()
			};
			this.oModel.create(sPath, oSaveRequestBody, oParameters);
		},

		setViewParameters: function (oEvent) {
			this.getView().byId("pzeInput0").setValue(oEvent.getParameter("arguments").timeID);
			this.getView().byId("pzeInput1").setValue(oEvent.getParameter("arguments").employeeID);
			this.getView().byId("pzeInput2").setValue(oEvent.getParameter("arguments").name);
		},

		getHrEvents: function () {
			var that = this;
			//Prepare aFilters
			var aFilters = [
				new Filter({
					path: "employeeID",
					operator: FilterOperator.EQ,
					value1: this.getView().byId("pzeInput1").getValue()
				}),
				new Filter({
					path: "datetime",
					operator: FilterOperator.EQ,
					value1: new Date()
				})
			];

			//Prepare oParameters
			var oParameters = {
				filters: aFilters,
				success: function (oData, response) {
					//Timeline mit Items befüllen
					that.addTimelineItems(response.data.results);
				},
				error: function (oError) {
					var oErrorText = JSON.parse(oError.responseText);
					MessageBox.show(oErrorText.error.message.value);
				}
			};
			this.oModel.read("/KommenInitSet", oParameters);
		},

		addTimelineItems: function (results) {
			var that = this;
			var oTimeline = that.getView().byId("pzeTimeline");
			oTimeline.removeAllContent();
			oTimeline.setSortOldestFirst(true);
			results.forEach(function (item) {
				var oContent = new sap.suite.ui.commons.TimelineItem();
				if (item.tmvnt === "HRK") {
					oContent.setTitle("Kommen");
				}
				else {
					oContent.setTitle("Gehen");
				}
				oContent.setDateTime(item.datetime);
				//oContent.setText("");
				oTimeline.addContent(oContent);
			});
		},

		addTimelineItem: function (result, sPath) {
			var that = this;
			var oTimeline = that.getView().byId("pzeTimeline");
			var oContent = new sap.suite.ui.commons.TimelineItem();
			if (sPath === "/onKommenSet") {
				oContent.setTitle("Kommen");
			}
			else {
				oContent.setTitle("Gehen");
			}
			oContent.setDateTime(result.datetime);
			//oContent.setText("");
			oTimeline.addContent(oContent);
		},

		/*		changeButtonActivity(result) {
					if (result.tmvnt == 'HRK') {
						this.getView().byId("pzeButton0").setEnabled(false);
						this.getView().byId("pzeButton1").setEnabled(true);
					}
					else {
						this.getView().byId("pzeButton0").setEnabled(true);
						this.getView().byId("pzeButton1").setEnabled(false);
					}
				}*/

		/*
		Table Functions
		*/

		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		// PZE Overview Functions

		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.SortDialog").open();
		},

		handleFilterButtonPressed: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.FilterDialog").open();
		},

		handleGroupButtonPressed: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.GroupDialog").open();
		},

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("pzeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			var oSorter = new sap.ui.model.Sorter(sPath, bDescending);
			aSorters.push(oSorter);

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.byId("pzeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		handleGroupDialogConfirm: function (oEvent) {
			var oTable = this.byId("pzeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
				// aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, true));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
		},

		// BDE Overview Functions

		handleSortButtonPressedBde: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.SortDialogBde").open();
		},

		handleFilterButtonPressedBde: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.FilterDialogBde").open();
		},

		handleGroupButtonPressedBde: function () {
			this.createViewSettingsDialog("ZAHR_PZEBDE.ZAHR_PZEBDE.view.GroupDialogBde").open();
		},

		handleSortDialogConfirmBde: function (oEvent) {
			var oTable = this.byId("bdeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			var oSorter = new sap.ui.model.Sorter(sPath, bDescending);
			aSorters.push(oSorter);

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirmBde: function (oEvent) {
			var oTable = this.byId("bdeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		handleGroupDialogConfirmBde: function (oEvent) {
			var oTable = this.byId("bdeOvTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
				// aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, true));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.PZEBDE
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.PZEBDE
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZAHR_PZEBDE.ZAHR_PZEBDE.view.PZEBDE
		 */
		//	onExit: function() {
		//
		//	}

	});

});
