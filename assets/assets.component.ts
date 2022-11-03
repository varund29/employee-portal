import {
  Component,
  OnInit,
  HostBinding,
  ChangeDetectorRef,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { SharedService } from "../services/shared.service";
import { ApiService } from "../services/api.service";
import * as uuid from "uuid";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { environment } from "src/environments/environment";
import { MessageService } from "../services/message.service";
import { AppInitializeService } from "../AppInitializeService";
import { ActivatedRoute, Router } from "@angular/router";
import { LoadingService } from "../services/loading.service";
import { IAuthService } from "../auth-services/Iauth.service";
import { AuthServiceFactory } from "../auth-services/auth.service.factory";
import { Asset } from "../model/asset";
import Utils from "../services/utils";
import { EditAssetComponent } from "../popups/edit-asset/edit-asset/edit-asset.component";
import { SelectionModel } from "@angular/cdk/collections";
import { AssetActionSelectionComponent } from "../popups/asset-action-selection/asset-action-selection.component";
import { AssetActionParametersComponent } from "../popups/asset-action-parameters/asset-action-parameters.component";
import { UserDetails } from "../model/userDetails";
import { MtrDetailsComponent } from "../popups/mtr-details/mtr-details.component";
import { ZoomRoomDetailsComponent } from "../popups/zoom-room-details/zoom-room-details.component";
import { ErrorNotificationComponent } from "../error-notification/error-notification.component";
import { ProgressNotificationComponent } from "../progress-notification/progress-notification.component";
import { WebsocketService } from "../services/websocket.service";
import { LiveResponse } from "../model/LiveResponse";
import { AssetLivestatusComponent } from "../popups/asset-livestatus/asset-livestatus.component";
import { ZoomDevice } from "../model/zoomDevice";
import { ZoomDeviceSetings } from "../model/zoomDeviceSettings";
import { of } from "rxjs";

const saveAs = require("file-saver");
declare var jQuery: any;
let $ = jQuery;

@Component({
  selector: "app-assets",
  templateUrl: "./assets.component.html",
  styleUrls: ["./assets.component.css"],
})
export class AssetsComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
{
  @HostBinding("class") classes = "main";
  authService: IAuthService;
  disabledHeader: boolean;
  assetDataSource: MatTableDataSource<any>;
  assets: Asset[] = [];
  expandSearch = false;
  searchKey: string = "";
  displayedColumns = [
    "select",
    "room_name",
    "name",
    "category",
    "brand",
    "model",
    "hostname",
    "ip_address",
    "ip_port",
    "mac_address",
    "serial_number",
    "firmware",
    "middleware",
    "asset_tag",
    "switch_port",
    "field_port",
    "power_status",
    "state",
    "asset-actions",
  ];
  models = {};
  sort: any;
  columns = [];
  showColumns = {};
  sortColumn = {
    header: "-----",
    sort: true,
    columnDef: "*",
  };
  sortDirection = true;
  activeCls: boolean[] = [];
  prev: boolean;
  powerOn: number = 0;
  occupied: number = 0;
  pagesize = environment.AssetsRecordsPerPage;
  loggedInUser: UserDetails;
  selectedAsset: Asset;
  selectedAssets: Asset[] = [];
  showOptionsMenu: boolean;
  optionMenu = [];
  allowMultiSelect = true;
  initialSelection = [];
  selection = new SelectionModel<Asset>(
    this.allowMultiSelect,
    this.initialSelection
  );

  operation: string;
  clearSearchbtn: boolean;
  roomName: string;
  assetName: string;
  enableInvokeAction: boolean;
  selectedAction: any;
  zoomAssetActions = [
    {
      id: "restart-room",
      name: "Restart",
    },
    {
      id: "update-device-settings",
      name: "Update Device Settings",
    },
    {
      id: "update-computer-version",
      name: "Update Computer Version",
    },
    {
      id: "update-controller-version",
      name: "Update Controller Version",
    },
  ];
  selectedZoomDevice: ZoomDevice;
  selectedZoomDeviceSetings = {};
  zoomDeviceSetings: ZoomDeviceSetings;
  zoomAppType: string;
  zoomAppVersionTitle: string;

  mtrAssetActions = [
    {
      id: "mtr-restart-room",
      name: "Restart",
    },
    {
      id: "mtr-run-diagnostics",
      name: "Run Diagnostics",
    },
    {
      id: "update-admin-agent",
      name: "Update Admin Agent",
    },
    {
      id: "update-operating-system",
      name: "Update Operating System",
    },
    {
      id: "update-teams-client",
      name: "Update Teams Client",
    },
    {
      id: "update-firmware",
      name: "Update Firmware",
    },
  ];
  mtrProperties: Asset;
  mtrSoftwareVersions = [];
  currentMTRSoftwareVersion: any;
  mtrModalTitle: string;
  selectedMTRActionType: string;
  showMTRUpdateSoftware: boolean;

  actionFilter = [];
  actionFilteredData: any[];
  actionFilterSelacted: any = null;
  sameTypeOfAseets = false;
  confirmTxt: string;
  confirmTxtClr: string;

  @ViewChild(MatSort, {
    static: false,
  })
  set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      if (this.assetDataSource) {
        this.assetDataSource.sort = this.sort;
      }
    }
  }

  @ViewChild("assetPager", {
    static: false,
  })
  assetPager: MatPaginator;
  @ViewChild(MtrDetailsComponent, {
    static: false,
  })
  mtrDetailsComponent: MtrDetailsComponent;
  @ViewChild(ZoomRoomDetailsComponent, {
    static: false,
  })
  zoomDetailsComponent: ZoomRoomDetailsComponent;

  @ViewChild(EditAssetComponent, {
    static: false,
  })
  editAssetComponent: EditAssetComponent;
  @ViewChild(AssetActionSelectionComponent, {
    static: false,
  })
  actionSelectionComponent: AssetActionSelectionComponent;
  @ViewChild(AssetActionParametersComponent, {
    static: false,
  })
  actionParameterComponent: AssetActionParametersComponent;
  @ViewChild(AssetLivestatusComponent, {
    static: false,
  })
  assetLivestatusComponent: AssetLivestatusComponent;

  haveErrors = false;
  haveProgress = false;
  @ViewChild(ErrorNotificationComponent, {
    static: false,
  })
  errorNotifyComponent: ErrorNotificationComponent;
  @ViewChild(ProgressNotificationComponent, {
    static: false,
  })
  progressNotifyComponent: ProgressNotificationComponent;

  showUpdateZoomAppVersion = false;
  showUpdateZoomDeviceSettings = false;

  constructor(
    public sharedService: SharedService,
    private msgService: MessageService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private appInit: AppInitializeService,
    private router: Router,
    private authServiceFactory: AuthServiceFactory,
    private route: ActivatedRoute,
    private socket: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService = this.authServiceFactory.getInstance();
    this.route.params.subscribe((params) => {
      if (params["roomName"] && params["roomName"] != "undefined") {
        this.roomName = decodeURIComponent(String(params["roomName"]));
        if (this.sharedService.isMobileView) {
          this.searchKey = this.roomName;
        }
        if (params["assetName"] && params["assetName"] != "undefined") {
          this.assetName = decodeURIComponent(String(params["assetName"]));
        }
      }
    });

    this.socket.websocketResponse.subscribe((data) => {
      this.processWebsocketResponse(data);
    });
  }

  ngOnDestroy(): void {
    this.socket.closeConnection();
  }
  setCustomiseColumns() {
    localStorage.setItem(
      "customise-column-" + this.loggedInUser.email,
      JSON.stringify(this.columns)
    );
  }
  getCustomiseColumns() {
    return JSON.parse(
      localStorage.getItem("customise-column-" + this.loggedInUser.email)
    );
  }
  setOptionMenu() {
    return [
      {
        key: "show-details",
        value: "Show Details",
        showOption: true,
      },
      {
        key: "show-live-status",
        value: "Show Live Info",
        showOption: true,
      },
    ];
  }
  ngOnInit() {
    if (this.appInit.cognito["enableAssetsTab"] !== true) {
      this.router.navigate(["Unauthorization"]);
    }

    this.enableInvokeAction = this.appInit.cognito.enableInvokeAction;
    if (this.enableInvokeAction) {
      this.socket.subscribeWebsocket();
    }

    this.optionMenu = this.setOptionMenu();

    this.loggedInUser = this.authService.getUser();

    const costomiseColumns = this.getCustomiseColumns();

    if (costomiseColumns && costomiseColumns.length > 0) {
      this.updateColumns(costomiseColumns);
    } else {
      this.prepareCustomiseColumns();
      this.setCustomiseColumns();
      this.columns.forEach((el) => {
        this.models[el.columnDef] = "";
      });
    }

    this.sharedService.setMobileView();
    this.getAllAssets();
  }

  ngAfterViewChecked(): void {
    //this.sharedService.setMobileView();
    this.cdr.detectChanges();
  }
  ngAfterViewInit(): void {}

  parseDate(str_date) {
    return new Date(Date.parse(str_date));
  }

  prepareCustomiseColumns() {
    let header = {
      columnDef: "room_name",
      header: "Room",
      show: true,
      showAlways: true,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "name",
      header: "Name",
      show: true,
      showAlways: true,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "category",
      header: "Category",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "brand",
      header: "Brand",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "model",
      header: "Model",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "hostname",
      header: "Hostname",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "ip_port",
      header: "IP Port",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "ip_address",
      header: "IP Address",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "mac_address",
      header: "MAC Address",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
    header = {
      columnDef: "serial_number",
      header: "Serial No",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "firmware",
      header: "Firmware",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "middleware",
      header: "Middleware",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "asset_tag",
      header: "Asset Tag",
      show: false,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "switch_port",
      header: "Switch Port",
      show: false,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "field_port",
      header: "Field Port",
      show: false,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "power_status",
      header: "Power",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;

    header = {
      columnDef: "state",
      header: "Online Status",
      show: true,
      showAlways: false,
      sort: true,
    };
    this.columns.push(header);
    this.showColumns[header.columnDef] = header.show;
  }

  getAllAssets(withFilter = false) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService.getAllAssets(correlation_id).subscribe(
        (data) => {
          if (data && data.assets) {
            data.assets.forEach((asset) => {
              if (
                typeof asset.is_communicating == "boolean" &&
                asset.is_communicating
              ) {
                asset["state"] = "Online";
              } else {
                const is_communicating_empty =
                  typeof asset.is_communicating === "string" &&
                  asset.is_communicating === "";
                if (
                  is_communicating_empty &&
                  typeof asset.is_connected == "boolean" &&
                  asset.is_connected
                ) {
                  asset["state"] = "Online";
                } else {
                  asset["state"] = "Offline";
                }
              }
              if (
                typeof asset.is_communicating === "string" &&
                typeof asset.is_connected === "string"
              ) {
                if (
                  asset.is_communicating === "" &&
                  asset.is_connected === ""
                ) {
                  asset["state"] = "";
                }
              }
              if (
                asset.category &&
                asset.category.toLowerCase() == "zoom room"
              ) {
                asset.actions = this.zoomAssetActions;
              }
              if (asset.category && asset.category.toLowerCase() == "mtr") {
                asset.actions = this.mtrAssetActions;
              }

              this.getActons(asset.actions);
            });
            this.assets = data.assets;

            this.assetDataSource = new MatTableDataSource(data.assets);
          } else {
            this.assetDataSource = new MatTableDataSource([]);
          }
          console.log(this.actionFilter)
          this.actionFilter.sort((a, b) => a.name.localeCompare(b.name));;
          this.actionFilter.unshift({ name: "--" });
          this.assetDataSource.sort = this.sort;
          this.assetDataSource.paginator = this.assetPager;
          this.assetDataSource.filter = this.searchKey.trim().toLowerCase();
          this.loadingService.stopLoader();
          this.sharedService.setMobileView();
          if (this.columns && this.columns.length > 0 && this.columns[0]) {
            this.sortColumn = this.columns[0];
            this.applySortByColumn(this.columns[0]);
          }
          this.models["room_name"] = this.roomName;
          this.models["name"] = this.assetName;
          this.applyFilterByColumn("", "");

          this.sortConfig();
          this.cdr.detectChanges();
        },
        (error) => {
          this.loadingService.stopLoader();
          this.msgService.responseMessage(error, true, 3000, correlation_id);
        }
      );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  private getActons(actions: any) {
    if (actions && actions.length > 0) {
      actions.forEach((ele) => {
        let tmp = this.actionFilter.filter((x) => x.name == ele.name);
        if (!(tmp && tmp.length > 0)) {
          this.actionFilter.push(ele);
        }
      });
    }    
  }
  private sortConfig() {
    this.assetDataSource.sortingDataAccessor = (
      data: any,
      sortHeaderId: string
    ): string => {
      if (typeof data[sortHeaderId] === "string") {
        return data[sortHeaderId].toLocaleLowerCase();
      }

      return data[sortHeaderId];
    };
  }

  applyRoomFilter() {
    this.sharedService.searchKey = this.searchKey;
    // this.setupFilter();
    this.assetDataSource.filter = this.searchKey.trim().toLowerCase();
  }

  applyFilterByColumn(event: any, columnName: any) {
    this.clearSearchbtn = false;
    this.showOptionsMenu = false;
    let tmp: Asset[] = this.actionFilterSelacted
      ? JSON.parse(JSON.stringify(this.actionFilteredData))
      : JSON.parse(JSON.stringify(this.assets));
    Object.keys(this.showColumns).forEach((ele) => {
      if (this.showColumns[ele] && this.models[ele]) {
        this.clearSearchbtn = true;
      }
    });
    if (this.clearSearchbtn) {
      Object.keys(this.showColumns).forEach((ele) => {
        if (this.showColumns[ele]) {
          tmp = tmp.filter((data) => {
            if (!this.models[ele]) {
              return true;
            }
            return (
              data[ele] &&
              Utils.preferredValue(data[ele])
                .toString()
                .toLowerCase()
                .indexOf(this.models[ele].toString().toLowerCase()) != -1
            );
          });
        }
      });
    } else {
      tmp = this.actionFilterSelacted ? this.actionFilteredData : this.assets;
    }
    this.assetDataSource.data = tmp;
    this.selection.clear();
  }
  onPaginateChange(event: any) {}

  applySortByColumn(item: any, start?: "asc" | "desc") {
    let id = item.columnDef;
    item.sort = !item.sort;
    this.sortColumn = item;
    start = start || "asc";
    const matSort = this.assetDataSource.sort;
    const disableClear = false;

    //reset state so that start is the first sort direction that you will see
    matSort.sort({
      id: null,
      start,
      disableClear,
    });
    matSort.sort({
      id,
      start,
      disableClear,
    });
  }

  showPopupCustomise() {
    $("#customise-columns-modal").modal("show");
  }

  updateColumns(response: []) {
    this.columns = response;
    this.columns.forEach((ele) => {
      this.showColumns[ele.columnDef] = ele.show;
    });
    this.setCustomiseColumns();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.sharedService.setMobileView();
  }

  showAssetdetails(asset: Asset) {
    this.selectedAsset = asset;
    if (asset.category && asset.category.toLowerCase() == "mtr") {
      this.mtrDetailsComponent.asset = asset;
      this.mtrDetailsComponent.clearObjects();
      let tab = this.mtrDetailsComponent.tabLabels.filter(
        (el) => el.key == "Properties"
      )[0];
      this.mtrDetailsComponent.showTab(tab);
      $("#mtr-details-modal").modal("show");
    } else if (asset.category && asset.category.toLowerCase() == "zoom room") {
      this.zoomDetailsComponent.asset = asset;
      this.zoomDetailsComponent.clearObjects();
      let tab = this.zoomDetailsComponent.tabLabels.filter(
        (el) => el.key == "Properties"
      )[0];
      this.zoomDetailsComponent.showTab(tab);
      $("#zoom-details-modal").modal("show");
    } else {
      $("#asset-details-modal").modal("show");
      this.editAssetComponent.asset = asset;
      this.editAssetComponent.prepareEditAsset();
    }
  }

  showActionSelectionPerAsset(asset: Asset) {
    this.resetActionCheckBoxes();
    let tmp = [];
    tmp.push(asset);
    this.showActionSelection(tmp);
  }
  showActionSelection(assets: Asset[]) {
    $("#asset-details-modal").modal("hide");
    $("#action-parameter-modal").modal("hide");
    $("#action-selection-modal").modal("show");
    this.selectedAsset = assets[0];
    this.selectedAssets = assets;
    this.actionSelectionComponent.asset = assets[0];
    this.actionSelectionComponent.assets = assets;
    this.actionSelectionComponent.getAssetActions();
  }

  invokeAction(cmd: any) {
    if (cmd.action.parameters) {
      this.showActionParameter(cmd.action);
    } else {
      this.callAction(cmd);
    }
  }

  invokeActionWithParameter(cmd: any) {
    if (cmd.source == "back-to-selection") {
      this.showActionSelection(this.selectedAssets);
    }
    if (cmd.source == "action-parameters" || cmd.source == "action-selection") {
      this.callAction(cmd);
    }
  }

  callAction(data: any) {
    let input = JSON.parse(JSON.stringify(data));
    input["assets"] = this.selectedAssets;

    if (input.action && input.action.parameters) {
      for (let key in input.action.parameters) {
        if (input.action.parameters.hasOwnProperty(key)) {
          input.input.forEach((e) => {
            if (e.label == key) {
              if (Utils.isObject(e.val)) {
                let item = {};
                item[e.val.key] = e.val.value;
                input.action.parameters[key] = item;
              } else {
                input.action.parameters[key] = e.val;
              }
            }
          });
        }
      }
    }
    if (input["input"]) {
      delete input["input"];
    }
    if (input["source"]) {
      delete input["source"];
    }
    if (input.action && input.action["selected"]) {
      delete input.action["selected"];
    }
    console.log(input)
    return;
    this.loadingService.startLoader();
    let correlation_id: string = uuid.v4();
    this.apiService
      .invkeAction(input, this.loggedInUser.name, correlation_id)
      .subscribe(
        (response) => {
          this.loadingService.stopLoader();
          this.closeActionInvokePopups();
          this.msgService.responseMessage(
            "Action invoked successfully.",
            false,
            5000
          );
        },
        (error) => {
          this.loadingService.stopLoader();
          this.msgService.responseMessage(error, true, 3000, correlation_id);
        }
      );
  }

  backToActionSelection() {
    $("#action-selection-modal").modal("show");
    $("#action-parameter-modal").modal("hide");
  }

  closeActionInvokePopups() {
    $("#action-selection-modal").modal("hide");
    $("#action-parameter-modal").modal("hide");
  }

  showActionParameter(action: any, directinvoke = false) {
    $("#asset-details-modal").modal("hide");
    $("#action-selection-modal").modal("hide");
    $("#action-parameter-modal").modal("show");
    this.actionParameterComponent.action = action;
    this.actionParameterComponent.directinvoke = directinvoke;
    this.actionParameterComponent.generateInputCtrl();
  }

  onClickOnRow(asset: Asset, val: string) {
    setTimeout(() => {
      let item = this.optionMenu.filter((e) => e.key == this.operation);
      if (
        val == "asset-row" &&
        this.operation !== "invoke-action" &&
        !(item && item[0])
      ) {
        this.showAssetdetails(asset);
      }
      this.operation = "";
    }, 100);
  }

  onOptionItemClick(asset: Asset, action: string) {
    this.operation = action;
    if (action == "invoke-action") {
      this.showActionSelectionPerAsset(asset);
    }
    if (action == "show-details") {
      this.showAssetdetails(asset);
    }
    if (action == "show-live-status") {
      this.showLivestatus(asset);
    }
  }

  onInvokeItemClick(row: any, action: any, key: string) {
    this.operation = key;
    this.selectedAction = action;
   // this.resetActionCheckBoxes();
    let tmp = [];
    tmp.push(row);
    this.selectedAsset = tmp[0];
    if (
      this.selectedAsset.category &&
      this.selectedAsset.category.toLowerCase() === "zoom room"
    ) {
      this.invokeZoomRoomAssetAction(action);
    } else if (
      this.selectedAsset.category &&
      this.selectedAsset.category.toLowerCase() === "mtr"
    ) {
      this.invokeMTRAssetAction(action);
    } else {
      this.selectedAssets = tmp;
      if (action.parameters) {
        this.showActionParameter(action, true);
      } else {
        this.confirmTxt =
          'This will trigger the&nbsp;"' +
          this.selectedAction?.name +
          '"&nbsp;action on&nbsp;"' +
          this.selectedAsset?.name +
          '".';
        this.confirmTxtClr = null;
        $("#common-confirm-action-cofirm").modal("show");
      }
    }
  }

  invokeActionConfirmCallback($event) {
    $("#common-confirm-action-cofirm").modal("hide");
    let input = {};
    input["action"] = this.selectedAction;
    this.callAction(input);
  }

  cancelInvokeAction($event) {
    $("#common-confirm-action-cofirm").modal("hide");
  }

  resetActionCheckBoxes() {
    this.showOptionsMenu = false;
    this.selection.clear();
  }

  performAction() {
    this.showActionSelection(this.selection.selected);
  }

  editAsset(asset: Asset) {
    $("#asset-details-modal").modal("hide");
    $("#edit-asset-modal").modal("show");
    this.editAssetComponent.prepareEditAsset();
  }

  showAssetLivestatus(asset: Asset) {
    $("#asset-details-modal").modal("hide");
    this.showLivestatus(asset);
  }

  updateAssets(asset: Asset) {
    this.reset();
    this.getAllAssets();
  }

  downloadCSVFile(type: string) {
    let data = JSON.parse(JSON.stringify(this.assetDataSource.filteredData));
    data.forEach((ele) => {
      for (let key in ele) {
        if (ele.hasOwnProperty(key)) {
          if (ele[key]) {
            ele[key] = Utils.preferredValue(ele[key]);
          }
        }
      }
    });

    const replacer = (key, value) =>
      value === null ? "" : String(value).replace(new RegExp("<wbr>", "g"), "");
    const header = Object.keys(data[0]);
    let properCaseHeader = [];
    for (var i = 0; i < header.length; i++) {
      properCaseHeader.push(
        Utils.toTitleCase(header[i].replace(new RegExp("_", "g"), " "))
      );
    }

    let csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(properCaseHeader.join(","));
    let csvArray = csv.join("\r\n");

    var blob = new Blob([csvArray], {
      type: "text/csv",
    });
    saveAs(blob, type + ".csv");
  }

  onCheckBoxChecked(row: Asset) {
    this.selection.toggle(row);
    this.onSingleOrMulpleCheckboxesChecked();
  }

  onSingleOrMulpleCheckboxesChecked() {
    if (!this.actionFilterSelacted) {
      if (this.selection.selected.length == 0) {
        this.showOptionsMenu = false;
        this.resetOptionsMenuItems();
        return;
      }
      if (this.selection.selected.length == 1) {
        this.showOptionsMenu = false;
        this.resetOptionsMenuItems();
        return;
      }

      this.showOptionsMenu = true;
      let firstEle = this.selection.selected[0];
      this.selection.selected.forEach((e) => {
        if (
          !(
            e.brand == firstEle.brand &&
            e.category == firstEle.category &&
            e.model == firstEle.model
          )
        ) {
          this.showOptionsMenu = false;
        }
      });
      this.resetOptionsMenuItems();
    } else {
      let flag = false;
      this.sameTypeOfAseets = false;
      let firstEle = this.selection.selected[0]?.actions
        ? this.selection.selected[0]?.actions.filter(
            (x) => x.name == this.actionFilterSelacted.name
          )[0]
        : null;
      if (firstEle) {
        this.selection.selected.forEach((e) => {
          if (e.actions && e.actions.length > 0) {
            let action = e.actions.filter((x) => x.name == firstEle.name)[0];
            let result =
              action.name === firstEle.name &&
              (action.parameters === null ||
                JSON.stringify(action.parameters) ==
                  JSON.stringify(firstEle.parameters));
            if (!result) {
              flag = true;
            }
          }
        });
      }
      if (!flag) {
        this.sameTypeOfAseets = true;
      }
    }
  }

  resetOptionsMenuItems() {
    this.optionMenu.forEach((e) => {
      if (e.key == "invoke-action") {
        //  e.showOption=!this.showOptionsMenu;
      }
    });
  }

  applyAssetFilter() {
    this.assetDataSource.filter = this.searchKey.trim().toLowerCase();
  }

  clearSearchAndFilter() {
    this.applyFilterByAction(null);
    this.clearSearch();
  }
  clearSearch() {
    Object.keys(this.showColumns).forEach((ele) => {
      if (this.showColumns[ele]) {
        this.models[ele] = "";
      }
    });
    this.clearSearchbtn = false;
    this.applyFilterByColumn("", "");
  }

  onLiveStatusChange(event) {
    if (event.statusType == "error") {
      this.haveErrors = this.errorNotifyComponent.errorList.length > 0;
    }
    if (event.statusType == "status") {
      this.haveProgress = this.progressNotifyComponent.progressList.length > 0;
    }
  }
  showErrorList() {
    if (this.errorNotifyComponent) {
      this.errorNotifyComponent.showErrorList();
    }
  }

  showProgressList() {
    if (this.progressNotifyComponent) {
      this.progressNotifyComponent.showProgressList();
    }
  }
  processWebsocketResponse(data: any) {
    const response = JSON.parse(JSON.stringify(data)) as LiveResponse;

    if (response && response.status_type == "error") {
      if (this.errorNotifyComponent) {
        this.errorNotifyComponent.updateErrorList(response);
        this.haveErrors =
          this.errorNotifyComponent.errorList &&
          this.errorNotifyComponent.errorList.length > 0;
      }
    }
    if (response && response.status_type == "status") {
      if (this.progressNotifyComponent) {
        this.progressNotifyComponent.updateProgressList(response);
        if (
          this.progressNotifyComponent.progressList &&
          this.progressNotifyComponent.progressList.length > 0
        ) {
          this.haveProgress = !(
            this.progressNotifyComponent.progressList.filter(
              (d) => d.percentage == 100
            ).length == this.progressNotifyComponent.progressList.length
          );
        } else {
          this.haveProgress = false;
        }
      }
    }
  }

  showLivestatus(asset: Asset) {
    this.assetLivestatusComponent.getAssetLiveStatus(asset);
  }

  invokeZoomRoomAssetAction(action) {
    if (action.id == "restart-room") {
      $("#common-confirm-restart-zoom-room").modal("show");
    } else if (action.id == "update-device-settings") {
      this.showUpdateZoomDeviceSettings = false;
      this.getZoomRoomProperties();
    } else if (action.id == "update-computer-version") {
      this.showUpdateComputerVersion();
    } else if (action.id == "update-controller-version") {
      this.showUpdateControllerVersion();
    }
  }

  restartZoomRoom($event) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .zoomRoomRestart(this.selectedAsset.room_id, correlation_id)
        .subscribe(
          (data) => {
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.loadingService.stopLoader();
            $("#common-confirm-restart-zoom-room").modal("hide");
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  cancelRestart($event) {
    $("#common-confirm-restart-zoom-room").modal("hide");
  }

  updateAppVersion($event) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .updateZoomRoomAppVersion(
          this.selectedAsset.room_id,
          $event.zoomDevice.id,
          $event.action,
          correlation_id
        )
        .subscribe(
          (data) => {
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.getZoomRoomDevices();
            $("#update-app-version-modal").modal("hide");
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  updateDeviceSettings($event) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .updateZoomRoomDeviceSettings(
          this.selectedAsset.room_id,
          $event,
          correlation_id
        )
        .subscribe(
          (data) => {
            $("#update-device-settings-modal").modal("hide");
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  showUpdateComputerVersion() {
    this.selectedZoomDevice = {};
    this.showUpdateZoomAppVersion = false;
    this.zoomAppType = "Computer";
    this.zoomAppVersionTitle = "Update Computer App Version";
    this.getZoomRoomDevices(this.zoomAppType);
  }

  showUpdateControllerVersion() {
    this.selectedZoomDevice = {};
    this.showUpdateZoomAppVersion = false;
    this.zoomAppType = "Controller";
    this.zoomAppVersionTitle = "Update Controller App Version";
    this.getZoomRoomDevices(this.zoomAppType);
  }

  getZoomRoomDevices(forUpdateVersion = "") {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .getZoomRoomDevices(this.selectedAsset.room_id, correlation_id)
        .subscribe(
          (data) => {
            const devices = data || [];
            if (forUpdateVersion) {
              if (devices && devices.length > 0) {
                let obj = devices.filter(
                  (x) => x.device_type.indexOf(forUpdateVersion) != -1
                );
                if (obj && obj.length > 0) {
                  this.selectedZoomDevice = obj[0];
                }
              }
              if (
                this.selectedZoomDevice &&
                this.selectedZoomDevice.enable_version_update
              ) {
                this.showUpdateZoomAppVersion = true;
                setTimeout(() => {
                  $("#update-app-version-modal").modal("show");
                }, 0);
              } else {
                this.msgService.responseMessage(
                  "Updating the controller version is only possible for controllers running Windows/MacOs.",
                  true,
                  3000
                );
              }
            }
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  getZoomRoomDeviceSettings() {
    try {
      let correlation_id: string = uuid.v4();
      this.apiService
        .getZoomRoomDeviceSettings(this.selectedAsset.room_id, correlation_id)
        .subscribe(
          (data) => {
            if (data) {
              this.zoomDeviceSetings = data;
              let tmpObj = this.zoomDeviceSetings.microphones.filter(
                (e) => e.name == this.selectedZoomDeviceSetings["microphone_id"]
              );
              if (tmpObj && tmpObj.length > 0) {
                this.selectedZoomDeviceSetings["microphone"] = tmpObj[0];
              }

              tmpObj = this.zoomDeviceSetings.cameras.filter(
                (e) => e.name == this.selectedZoomDeviceSetings["camera_id"]
              );
              if (tmpObj && tmpObj.length > 0) {
                this.selectedZoomDeviceSetings["camera"] = tmpObj[0];
              }

              tmpObj = this.zoomDeviceSetings.speakers.filter(
                (e) => e.name == this.selectedZoomDeviceSetings["speaker_id"]
              );
              if (tmpObj && tmpObj.length > 0) {
                this.selectedZoomDeviceSetings["speaker"] = tmpObj[0];
              }
            } else {
              this.zoomDeviceSetings = null;
            }
            this.showUpdateZoomDeviceSettings = true;
            setTimeout(() => {
              $("#update-device-settings-modal").modal("show");
            }, 0);
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  getZoomRoomProperties() {
    let properties: any = {};
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .getZoomRoomProperties(this.selectedAsset.room_id, correlation_id)
        .subscribe(
          (data) => {
            properties = data;
            if (properties) {
              this.selectedZoomDeviceSetings["camera_id"] = properties.camera;
              this.selectedZoomDeviceSetings["microphone_id"] =
                properties.microphone;
              this.selectedZoomDeviceSetings["speaker_id"] = properties.speaker;
            }
            this.getZoomRoomDeviceSettings();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  invokeMTRAssetAction(action) {
    if (action.id == "mtr-restart-room") {
      $("#common-confirm-restart-mtr-room").modal("show");
    } else if (action.id == "mtr-run-diagnostics") {
      $("#common-confirm-mtr-run-diagnostics").modal("show");
    } else {
      this.showMTRUpdateSoftware = false;
      this.getMtrProperties().subscribe(
        (data) => {
          this.mtrProperties = data;
          this.loadingService.stopLoader();
          if (action.id == "update-admin-agent") {
            this.showUpdateAdminAgent();
          } else if (action.id == "update-operating-system") {
            this.showUpdateOperatingSystem();
          } else if (action.id == "update-teams-client") {
            this.showUpdateTeamsClient();
          } else if (action.id == "update-firmware") {
            this.showUpdateFirmware();
          }
        },
        (error) => {
          this.loadingService.stopLoader();
          this.msgService.responseMessage(error, true, 3000);
        }
      );
    }
  }

  restartMtrRoom($event) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .mtrRoomRestart(this.selectedAsset.id, correlation_id)
        .subscribe(
          (data) => {
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.loadingService.stopLoader();
            $("#common-confirm-restart-mtr-room").modal("hide");
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  cancelMTRRestart($event) {
    $("#common-confirm-restart-mtr-room").modal("hide");
  }

  runMTRDiagnostics($event) {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .mtrRunDiagnostics(this.selectedAsset.id, correlation_id)
        .subscribe(
          (data) => {
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.loadingService.stopLoader();
            $("#common-confirm-mtr-run-diagnostics").modal("hide");
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  cancelMTRDiagnostics($event) {
    $("#common-confirm-mtr-run-diagnostics").modal("hide");
  }

  updateMTRSoftwareVersion($event) {
    try {
      $event["type"] = this.selectedMTRActionType;
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      this.apiService
        .updateMtrSoftwareVersion(this.selectedAsset.id, $event, correlation_id)
        .subscribe(
          (data) => {
            $("#mtr-update-spftware-version-modal").modal("hide");
            if (data && data.error) {
              this.msgService.responseMessage(data.message, true, 3000);
            } else {
              this.msgService.responseMessage(data.message, false, 3000);
            }
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  getMtrProperties(refresh = false) {
    if (refresh) {
      this.mtrProperties = {};
    }
    if (!Utils.isEmptyObj(this.mtrProperties)) {
      return of(this.mtrProperties);
    }
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      return this.apiService.getMtrProperties(
        this.selectedAsset.id,
        correlation_id
      );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  showUpdateFirmware() {
    this.mtrModalTitle = this.selectedAction.name.replace("Update ", "");
    this.getMtrSoftwareVesionsByType();
  }

  showUpdateTeamsClient() {
    this.mtrModalTitle = this.selectedAction.name.replace("Update ", "");
    this.getMtrSoftwareVesionsByType();
  }

  showUpdateOperatingSystem() {
    this.mtrModalTitle = this.selectedAction.name.replace("Update ", "");
    this.getMtrSoftwareVesionsByType();
  }

  showUpdateAdminAgent() {
    this.mtrModalTitle = this.selectedAction.name.replace("Update ", "");
    this.getMtrSoftwareVesionsByType();
  }

  getMtrSoftwareVesionsByType() {
    try {
      this.loadingService.startLoader();
      let correlation_id: string = uuid.v4();
      if (this.selectedAction.id === "update-admin-agent") {
        this.selectedMTRActionType = "adminAgent";
      } else if (this.selectedAction.id === "update-operating-system") {
        this.selectedMTRActionType = "operatingSystem";
      } else if (this.selectedAction.id === "update-teams-client") {
        this.selectedMTRActionType = "teamsClient";
      } else if (this.selectedAction.id === "update-firmware") {
        this.selectedMTRActionType = "firmware";
      }
      this.apiService
        .getMtrSoftwareVesionsByType(
          this.selectedAsset.id,
          this.selectedMTRActionType,
          correlation_id
        )
        .subscribe(
          (data) => {
            if (data) {
              this.mtrSoftwareVersions = data;
              if (this.selectedMTRActionType == "adminAgent") {
                this.currentMTRSoftwareVersion =
                  this.mtrProperties.teams_admin_agent;
              } else if (this.selectedMTRActionType == "operatingSystem") {
                this.currentMTRSoftwareVersion = this.mtrProperties.windows_os;
              } else if (this.selectedMTRActionType == "teamsClient") {
                this.currentMTRSoftwareVersion = this.mtrProperties.teams_app;
              } else if (this.selectedMTRActionType == "firmware") {
                this.currentMTRSoftwareVersion = this.mtrProperties.firmware;
              } else {
                this.currentMTRSoftwareVersion = "";
              }
            } else {
              this.currentMTRSoftwareVersion = "";
              this.mtrSoftwareVersions = [];
            }
            this.showMTRUpdateSoftware = true;
            setTimeout(() => {
              $("#mtr-update-spftware-version-modal").modal("show");
            }, 0);
            this.loadingService.stopLoader();
          },
          (error) => {
            this.loadingService.stopLoader();
            this.msgService.responseMessage(error, true, 3000);
          }
        );
    } catch (e) {
      this.loadingService.stopLoader();
      this.msgService.responseMessage(e, true, 3000);
    }
  }

  isAllRoomSelected() {
    if (this.selection.selected.length > 0) {
      const filteredData =
        this.assetDataSource.filter.length > 0
          ? this.assetDataSource.filteredData
          : this.assetDataSource.data;
      const numSelected = this.selection.selected.length;
      const numRows = filteredData.length;
      return numSelected === numRows;
    }
  }

  masterRoomToggle() {
    const filteredData =
      this.assetDataSource.filter.length > 0
        ? this.assetDataSource.filteredData
        : this.assetDataSource.data;

    this.isAllRoomSelected()
      ? this.selection.clear()
      : filteredData.forEach((row) => {
          this.selection.select(row);
        });
    this.onSingleOrMulpleCheckboxesChecked();
  }

  applyFilterByAction(action: any) {
    this.clearSearch();
    this.selection.clear();
    if (action && action.name == "--") {
      this.actionFilterSelacted = null;
    } else {
      this.actionFilterSelacted = action;
    }

    if (this.actionFilterSelacted !== null) {
      this.actionFilteredData = [];
      this.assets.forEach((x) => {
        if (x.actions && x.actions.length > 0) {
          let item = x.actions.filter(
            (it) => it.name == this.actionFilterSelacted.name
          );
          if (item && item.length > 0) {
            this.actionFilteredData.push(x);
          }
        }
      });
      this.assetDataSource.data = this.actionFilteredData;
      this.masterRoomToggle();
    } else {
      this.assetDataSource.data = this.assets;
    }
  }

  reset() {
    this.selectedAsset = null;
    this.selectedAction = null;
    this.actionFilterSelacted = null;
    this.actionFilteredData = [];
    this.selection.clear();
  }

  tirggerAction() {
    if (!this.sameTypeOfAseets) {
      return;
    }
    if (this.selection.selected.length > 1) {
      let msg =
        'Warning: This will trigger the&nbsp;<b>"' +
        this.actionFilterSelacted?.name +
        '"</b>&nbsp;action on&nbsp;<b>"' +
        this.selection.selected.length +
        '"</b>&nbsp;assets.';
      this.actionParameterComponent.bulkUpdateTxt = msg;
      this.confirmTxt = msg;
      this.confirmTxtClr = 'red';
      this.onTrigerAction(
        this.selection.selected,
        this.actionFilterSelacted,
        "invoke-action"
      );
    } else {
      this.actionParameterComponent.bulkUpdateTxt = null;
      this.onInvokeItemClick(
        this.selection.selected[0], 
        this.actionFilterSelacted,
        "invoke-action"
      );
    }
  }

  onTrigerAction(row: any, action: any, key: string) {
    console.log(row, action, key);
    this.operation = key;
    this.selectedAction = action;
   // this.resetActionCheckBoxes();
    this.selectedAsset = row[0];
    if (
      this.selectedAsset.category &&
      this.selectedAsset.category.toLowerCase() === "zoom room"
    ) {
      this.invokeZoomRoomAssetAction(action);
    } else if (
      this.selectedAsset.category &&
      this.selectedAsset.category.toLowerCase() === "mtr"
    ) {
      this.invokeMTRAssetAction(action);
    } else {
      this.selectedAssets = row;
      if (action.parameters) {
        this.showActionParameter(action, true);
      } else {       
        $("#common-confirm-action-cofirm").modal("show");
      }
    }
  }
}
