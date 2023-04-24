import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { colorSets, LegendPosition } from '@swimlane/ngx-charts';
import { Location } from '@angular/common';

import { Color, colorSetsArray, ScaleType } from '../../app/utils/color-sets';
import {
  DashboardService,
  LEIData,
  LEITableData,
} from '../services/dashboard.service';
import { escapeLabel, formatLabel } from '../../app/utils/label.helper';
//import jsPDF from 'jspdf';
//import html2canvas from 'html2canvas';
import * as shape from 'd3-shape';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ChildTable, TableBtn, TableColumn } from '../model/genericTable';
const htmlToPdfmake = require('html-to-pdfmake');
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import html2canvas from '';
import jsPDF from 'jspdf';

import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports

import { TableUtil } from '../../app/utils/tableUtil';

import LEIJSONData from '../../app/assets/MOCK_DATA_Date.json';

@Component({
  selector: 'app-dashboardv1',
  templateUrl: './dashboardv1.component.html',
  styleUrls: ['./dashboardv1.component.css'],
})
export class Dashboardv1Component implements OnInit {
  title = 'Dashboard V1';
  leiTableData: any[] = LEIJSONData;

  LEIType!: LEIData[];
  LEITypeTemp!: LEIData[];
  LEIDataByType!: LEIData[];
  LEITypeSelected!: string;
  LEITypeDailyData!: LEITableData[];
  LEITypeMonthlyData!: LEITableData[];

  LEIStatus!: LEIData[];
  LEIStatusTemp!: LEIData[];
  LEIDataByStatus!: LEIData[];
  LEIStatusSelected!: string;
  LEIStatusDailyData!: LEITableData[];
  LEIStatusMonthlyData!: LEITableData[];

  LEICountry!: LEIData[];

  //Tables
  listMembersLEI!: any[];
  listMembersLEIAll!: any[];
  listPublicLEI!: any[];
  columns!: TableColumn[];
  columnsSelected!: TableColumn[];
  columnsMember!: TableColumn[];
  childTableDataMember!: TableColumn[];

  view!: [number, number];
  width: number = 500;
  height: number = 300;
  //fitContainer: boolean = false;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  legendPosition = LegendPosition.Below;
  legendPositionRight = LegendPosition.Right;
  showXAxisLabel = true;
  tooltipDisabled = false;
  showText = true;
  xAxisLabel = 'LEI Type';
  showYAxisLabel = true;
  yAxisLabel = 'LEI Type Count';
  showGridLines = true;
  //innerPadding = '10%';
  barPadding = 10;
  //groupPadding = 16;
  roundDomains = true;
  //maxRadius = 10;
  //minRadius = 3;
  //showSeriesOnHover = true;
  roundEdges: boolean = true;
  animations: boolean = true;
  xScaleMin: any;
  xScaleMax: any;
  yScaleMin!: number;
  yScaleMax!: number;
  showDataLabel: boolean = true;
  noBarWhenZero: boolean = true;
  trimXAxisTicks: boolean = true;
  trimYAxisTicks: boolean = true;
  rotateXAxisTicks: boolean = true;
  maxXAxisTickLength: number = 16;
  maxYAxisTickLength: number = 16;
  //strokeColor: string = '#FFFFFF';
  //strokeWidth: number = 2;

  colorSets: any;
  colorScheme: any;
  colorSchemeStatus: any;
  colorSchemePie: any;
  schemeType = ScaleType.Ordinal;
  //selectedColorScheme!: string;
  //rangeFillOpacity: number = 0.15;

  // Override colors for certain values
  customColors!: any[];

  // pie
  showLabels = true;
  explodeSlices = true;
  doughnut = false;
  arcWidth = 0.5;

  // Line -- Trend Chart
  leiTrendDataYearly!: {};
  leiTrendDataCurrentMonth!: {};
  rangeFillOpacity: number = 0.15;
  curveType: string = 'Linear';
  curves = {
    Basis: shape.curveBasis,
    'Basis Closed': shape.curveBasisClosed,
    Bundle: shape.curveBundle.beta(1),
    Cardinal: shape.curveCardinal,
    'Cardinal Closed': shape.curveCardinalClosed,
    'Catmull Rom': shape.curveCatmullRom,
    'Catmull Rom Closed': shape.curveCatmullRomClosed,
    Linear: shape.curveLinear,
    'Linear Closed': shape.curveLinearClosed,
    'Monotone X': shape.curveMonotoneX,
    'Monotone Y': shape.curveMonotoneY,
    Natural: shape.curveNatural,
    Step: shape.curveStep,
    'Step After': shape.curveStepAfter,
    'Step Before': shape.curveStepBefore,
    default: shape.curveLinear,
  };
  curve: any = shape.curveNatural;
  //curve: any = this.curves[this.curveType];

  autoScale = true;
  timeline = false;

  constructor(
    public location: Location,
    public _dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder
  ) {
    this.colorSets = colorSetsArray;

    //Object.assign(this, { colorSets })
    this.setColorScheme('cool');
    this.getColumns();
  }

  todayDate = new Date();
  currentMonth = this.todayDate.getMonth() + 1;
  currentYear = this.todayDate.getFullYear();

  ngOnInit() {
    this.getDashboardData();
    this.getLEIDataByType('');
    this.getLEIDataByStatus('');

    this.applyDimensions();

    this.dateMember = new FormControl(new Date());
    this.datePublic = new FormControl(new Date());
    this.maxDate.setDate(this.maxDate.getDate() + 1);
  }

  getDashboardData() {
    var res = this._dashboardService.GetDashboardData(this.leiTableData);
    this.LEIType = res.leiTypeCount;
    this.LEITypeTemp = res.leiTypeCount;
    this.LEIStatus = res.leistatusCount;
    this.LEIStatusTemp = res.leistatusCount;
    this.LEICountry = res.leiCountryCount;

    const resultsYear: any = [];
    const dataYear: any = {
      name: 'Creation Date',
      series: [],
    };
    for (let j = 0; j < res.leiTrendDataYearly.length; j++) {
      dataYear.series.push({
        name: 'Year : ' + res.leiTrendDataYearly[j].name,
        value: res.leiTrendDataYearly[j].value,
      });
    }
    resultsYear.push(dataYear);
    this.leiTrendDataYearly = resultsYear;

    const resultsCurrentMonth: any = [];
    const dataCurrentMonth: any = {
      name: 'Creation Date',
      series: [],
    };
    for (let j = 0; j < res.leiTrendDataCurrentMonth.length; j++) {
      dataCurrentMonth.series.push({
        name: res.leiTrendDataCurrentMonth[j].name,
        value: res.leiTrendDataCurrentMonth[j].value,
      });
    }
    resultsCurrentMonth.push(dataCurrentMonth);
    this.leiTrendDataCurrentMonth = resultsCurrentMonth;

    this.listMembersLEI = res.listMembersLEI;
    this.listMembersLEIAll = res.listMembersLEIAll;
    this.activeTabLEIData = res.listMembersLEIAll;
    this.listPublicLEI = res.listPublicLEI;

    if (res.listMembersLEI == null || res.listMembersLEI.length == 0) {
      this.showExportIcon = false;
    }
  }

  applyDimensions() {
    this.view = [this.width, this.height];
  }

  setColorScheme(name: string) {
    //this.selectedColorScheme = name;
    this.colorScheme = this.colorSets.find(
      (s: { name: string }) => s.name === name
    );
    this.colorSchemeStatus = this.colorSets.find(
      (s: { name: string }) => s.name === 'vivid'
    );
    this.colorSchemePie = this.colorSets.find(
      (s: { name: string }) => s.name === 'natural'
    );
  }

  pieTooltipText(data: any) {
    const label = formatLabel(data.data.name);
    const val = formatLabel(data.data.value);

    return `
      <span class="tooltip-label">${escapeLabel(label)}</span>
      <span class="tooltip-val">${val}</span>
    `;
  }

  valueFormatting(value: number): string {
    return `${Math.round(value).toLocaleString()} `;
  }

  labelFormatting(data: any): string {
    var cData: any = this;
    var cvalue = cData.series.find((s: { name: string }) => s.name === data);
    return `${data + ' : ' + cvalue.value}`;
  }

  dblclick(event: any) {
    console.log('Double click', event);
  }

  select(data: any) {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  activate(data: any) {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  deactivate(data: any) {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  selectLEIType(event: any) {
    if (this.isLegend(event)) {
      if (this.isDataShown(event)) {
        const tempData = JSON.parse(JSON.stringify(this.LEIType));
        tempData.forEach((item: any) => {
          if (item.name === event) {
            item.value = 0;
          }
        });
        this.LEIType = tempData;
        var typeArray = this.LEIType.filter((_: { value: any }) => _.value != 0)
          .map((_) => _.name)
          .toString();
        this.LEITypeSelected = typeArray;
        this.getLEIDataByType(typeArray);
      } else {
        const tempData = JSON.parse(JSON.stringify(this.LEIType));
        this.LEITypeTemp.forEach((item: any) => {
          if (item.name == event)
            tempData.find((_: { name: any }) => _.name === event).value =
              item.value;

          this.LEIType = tempData;
          var typeArray = this.LEIType.filter(
            (_: { value: any }) => _.value != 0
          )
            .map((_) => _.name)
            .toString();
          this.LEITypeSelected = typeArray;
          this.getLEIDataByType(typeArray);
        });
      }
    } else {
      this.LEITypeSelected = event.name;
      this.getLEIDataByType(event.name);
    }
  }
  isLegend = (event: any) => typeof event === 'string';

  isDataShown = (event: any) => {
    const selectedBar = this.LEIType.find(
      (model: { name: any; value: number }) => {
        return model.name === event && model.value !== 0;
      }
    );
    return typeof selectedBar !== 'undefined';
  };

  getLEIDataByType(leiType: string) {
    var res = this._dashboardService.GetLEIDataByType(
      this.leiTableData,
      leiType
    );
    this.LEIDataByType = res.leiTypeData;
    this.LEITypeDailyData = res.leiTypeDailyData;
    this.LEITypeMonthlyData = res.leiTypeMonthlyData;

    this.activeTabLEITypeData = res.leiTypeDailyData;
  }

  refreshTypeChart() {
    this.LEIType = this.LEITypeTemp;
    this.getLEIDataByType('');
    this.LEITypeSelected = '';
  }

  selectLEIStatus(event: any) {
    if (this.isLegend(event)) {
      if (this.isDataShownLEIStatus(event)) {
        const tempData = JSON.parse(JSON.stringify(this.LEIStatus));
        tempData.forEach((item: any) => {
          if (item.name === event) {
            item.value = 0;
          }
        });
        this.LEIStatus = tempData;
        var statusArray = this.LEIStatus.filter(
          (_: { value: any }) => _.value != 0
        )
          .map((_) => _.name)
          .toString();
        this.LEIStatusSelected = statusArray;
        this.getLEIDataByStatus(statusArray);
      } else {
        const tempData = JSON.parse(JSON.stringify(this.LEIStatus));
        this.LEIStatusTemp.forEach((item: any) => {
          if (item.name == event)
            tempData.find((_: { name: any }) => _.name === event).value =
              item.value;

          this.LEIStatus = tempData;
          var statusArray = this.LEIStatus.filter(
            (_: { value: any }) => _.value != 0
          )
            .map((_) => _.name)
            .toString();
          this.LEIStatusSelected = statusArray;
          this.getLEIDataByStatus(statusArray);
        });
      }
    } else {
      this.LEIStatusSelected = event.name;
      this.getLEIDataByStatus(event.name);
    }
  }

  isDataShownLEIStatus = (event: any) => {
    const selectedBar = this.LEIStatus.find(
      (model: { name: any; value: number }) => {
        return model.name === event && model.value !== 0;
      }
    );
    return typeof selectedBar !== 'undefined';
  };

  getLEIDataByStatus(leiStatus: string) {
    var res = this._dashboardService.GetLEIDataByStatus(
      this.leiTableData,
      leiStatus
    );
    this.LEIDataByStatus = res.leiStatusData;
    this.LEIStatusDailyData = res.leiStatusDailyData;
    this.LEIStatusMonthlyData = res.leiStatusMonthlyData;

    this.activeTabLEIStatusData = res.leiStatusDailyData;
  }

  refreshStatusChart() {
    this.LEIStatus = this.LEIStatusTemp;
    this.getLEIDataByStatus('');
    this.LEIStatusSelected = '';
  }

  getColumns() {
    this.columnsSelected = [
      { columnDef: 'leiNumber', header: 'LEI Number' },
      { columnDef: 'idNumber', header: 'Id Number' },
      { columnDef: 'leiType', header: 'LEI Type' },
      { columnDef: 'status', header: 'Status' },
      { columnDef: 'nextRenewalDate', header: 'Renewal Date' },
      { columnDef: 'country', header: 'Country' },
    ];

    this.columns = [
      { columnDef: 'leiNumber', header: 'LEI Number' },
      { columnDef: 'idNumber', header: 'Id Number' },
      { columnDef: 'leiType', header: 'LEI Type' },
      { columnDef: 'status', header: 'Status' },
      { columnDef: 'nextRenewalDate', header: 'Renewal Date' },
      { columnDef: 'country', header: 'Country' },
      { columnDef: 'source', header: 'Source' },
      { columnDef: 'createdDate', header: 'Created Date' },
    ];

    this.columnsMember = [
      { columnDef: 'membername', header: 'Member Name' },
      { columnDef: 'count', header: 'Count' },
    ];

    this.childTableDataMember = [
      { columnDef: 'leiNumber', header: 'LEI Number' },
      { columnDef: 'idNumber', header: 'Id Number' },
      { columnDef: 'leiType', header: 'LEI Type' },
      { columnDef: 'status', header: 'Status' },
      { columnDef: 'nextRenewalDate', header: 'Renewal Date' },
      { columnDef: 'country', header: 'Country' },
      { columnDef: 'source', header: 'Source' },
      { columnDef: 'createdDate', header: 'Created Date' },
    ];
  }

  dateMember = new FormControl();
  datePublic = new FormControl();
  maxDate = new Date();
  public showExportIcon: boolean = true;

  onOpenCalendar(container: any) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  public FilterMemberData() {
    debugger;
    var selecteddate =
      this.dateMember.value != null ? new Date(this.dateMember.value) : null;
    if (selecteddate != null) {
      var month = selecteddate.getMonth();
      var finalmonth = month! + 1;
      var year = selecteddate.getFullYear();

      var res = this._dashboardService.GetLEIMemberByMonth(
        this.leiTableData,
        finalmonth,
        year
      );
      this.listMembersLEI = res.listMembersLEI;
      this.listMembersLEIAll = res.listMembersLEIAll;
      this.activeTabLEIData = res.listMembersLEIAll;

      this.showExportIcon = true;
      if (res.listMembersLEI == null || res.listMembersLEI.length == 0) {
        this.showExportIcon = false;
      }
    }
  }

  public FilterPublicData() {
    var selecteddate =
      this.datePublic.value != null ? new Date(this.datePublic.value) : null;
    if (selecteddate != null) {
      var month = selecteddate.getMonth();
      var finalmonth = month! + 1;
      var year = selecteddate.getFullYear();

      var res = this._dashboardService.GetLEIPublicByMonth(
        this.leiTableData,
        finalmonth,
        year
      );
      this.listPublicLEI = res;
      this.activeTabLEIData = res;

      this.showExportIcon = true;
      if (res == null || res.length == 0) {
        this.showExportIcon = false;
      }
    }
  }

  activeTabLEITypeData!: any[];
  tabChangedLEIType = (tabChangeEvent: any): void => {
    switch (tabChangeEvent) {
      case 'Daily':
        this.activeTabLEITypeData = this.LEITypeDailyData;
        break;
      case 'Monthly':
        this.activeTabLEITypeData = this.LEITypeMonthlyData;
        break;
      case 'All':
        this.activeTabLEITypeData = this.LEIDataByType;
        break;
    }
  };

  activeTabLEIStatusData!: any[];
  tabChangedLEIStatus = (tabChangeEvent: any): void => {
    switch (tabChangeEvent) {
      case 'Daily':
        this.activeTabLEIStatusData = this.LEIStatusDailyData;
        break;
      case 'Monthly':
        this.activeTabLEIStatusData = this.LEIStatusMonthlyData;
        break;
      case 'All':
        this.activeTabLEIStatusData = this.LEIDataByStatus;
        break;
    }
  };

  activeTabLEIData!: any[];
  tabChangedLEIData = (tabChangeEvent: any): void => {
    this.showExportIcon = true;
    switch (tabChangeEvent) {
      case 'MemberLEI':
        this.activeTabLEIData = this.listMembersLEIAll;
        if (
          this.activeTabLEIData == null ||
          this.activeTabLEIData.length == 0
        ) {
          this.showExportIcon = false;
        }
        break;
      case 'PublicLEI':
        this.activeTabLEIData = this.listPublicLEI;
        if (
          this.activeTabLEIData == null ||
          this.activeTabLEIData.length == 0
        ) {
          this.showExportIcon = false;
        }
        break;
    }
  };

  exportToExcel(Tabs: string): void {
    try {
      var data!: any[];
      switch (Tabs) {
        case 'LEIType':
          data = this.activeTabLEITypeData;
          break;
        case 'LEIStatus':
          data = this.activeTabLEIStatusData;
          break;
        case 'LEIData':
          data = this.activeTabLEIData;
          break;
      }

      TableUtil.exportArrayToExcel(data);
    } catch (err) {
      console.error('export error', err);
    }
  }

  public openPDF(divId: string, fileName: string): void {
    const DATA: any = document.getElementById(divId);
    html2canvas(DATA).then((canvas: any) => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      heightLeft -= pageHeight;
      const doc = new jsPDF('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(
          canvas,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pageHeight;
      }
      doc.save(fileName + '.pdf');
    });

    //let DATA: any = document.getElementById(divId);
    //html2canvas(DATA).then((canvas) => {
    //  let fileWidth = 208;
    //  let fileHeight = (canvas.height * fileWidth) / canvas.width;
    //  const FILEURI = canvas.toDataURL('image/png');
    //  let PDF = new jsPDF('p', 'mm', 'a4');
    //  let position = 0;
    //  PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
    //  PDF.save(fileName + '.pdf');
    //});

    //var html = htmlToPdfmake(DATA.innerHTML);
    //const documentDefinition = { content: html };
    //pdfMake.createPdf(documentDefinition).download("ChartPDFMake.pdf");
  }
}
