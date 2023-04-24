import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  Observable,
  from,
  scan,
  groupBy,
  mergeMap,
  zip,
  of,
  toArray,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor() {}

  todayDate = new Date();
  currentMonth = this.todayDate.getMonth() + 1;
  currentYear = this.todayDate.getFullYear();
  currentDay = this.todayDate.getDay();

  GetDashboardData(leiTableData: LEITableData[]): any {
    var result: Response = {
      leiTypeCount: [],
      leistatusCount: [],
      leiCountryCount: [],
      leiTrendDataYearly: [],
      leiTrendDataCurrentMonth: [],
      listMembersLEI: [],
      listMembersLEIAll: [],
      leiTypeStatusTodaysData: [],
      leiTypeStatusMonthlyData: [],
      listPublicLEI: [],
    };

    //LEI Type Data
    from(leiTableData)
      .pipe(
        groupBy((lei) => lei.leiType),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          result.leiTypeCount.push({
            name: res[0],
            value: res[1].length,
          });
        }
      });

    //LEI Status Data
    from(leiTableData)
      .pipe(
        groupBy((lei) => lei.status),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          result.leistatusCount.push({
            name: res[0],
            value: res[1].length,
          });
        }
      });

    //LEI Country Data
    from(leiTableData)
      .pipe(
        groupBy((lei) => lei.country),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          result.leiCountryCount.push({
            name: res[0],
            value: res[1].length,
          });
        }
      });

    //LEI Trend Chart Yearly Data
    from(leiTableData)
      .pipe(
        groupBy((lei) => new Date(lei.createdDate).getFullYear()),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          result.leiTrendDataYearly.push({
            name: res[0].toString(),
            value: res[1].length,
          });
        }
      });
    result.leiTrendDataYearly.sort(
      (
        a: any,
        b: any //Sorting the years
      ) => a.name - b.name
    );

    //LEI Trend Chart Monthly Data
    var allDatesCurrentMonth = this.getAllDatesArray(
      this.currentYear,
      this.currentMonth
    );

    var currentMonthData = leiTableData.filter(
      (_) =>
        new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
        new Date(_.createdDate).getFullYear() == this.currentYear
    );

    const tempTrendDataCurrentMonth: any = [];
    from(currentMonthData)
      .pipe(
        groupBy((lei) => new Date(lei.createdDate)),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          tempTrendDataCurrentMonth.push({
            name: formatDate(res[0], 'yyyy-MM-dd', 'en-US'),
            value: res[1].length,
          });
        }
      });

    for (var item = 0; item < allDatesCurrentMonth.length; item++) {
      var filterData = tempTrendDataCurrentMonth.filter(
        (_: { name: string }) => _.name == allDatesCurrentMonth[item]
      );
      result.leiTrendDataCurrentMonth.push({
        name: formatDate(allDatesCurrentMonth[item], 'yyyy-MM-dd', 'en-US'),
        value: filterData.length > 0 ? filterData[0].value : 0,
      });
    }

    //LEI Member Data
    var memberData = this.GetLEIMemberByMonth(
      leiTableData,
      this.currentMonth,
      this.currentYear
    );
    result.listMembersLEI = memberData.listMembersLEI;
    result.listMembersLEIAll = memberData.listMembersLEIAll;

    //LEI Public Data
    result.listPublicLEI = this.GetLEIPublicByMonth(
      leiTableData,
      this.currentMonth,
      this.currentYear
    );

    return result;
  }

  GetLEIMemberByMonth(
    leiTableData: LEITableData[],
    month: number,
    year: number
  ): any {
    var result: any = {
      listMembersLEI: [],
      listMembersLEIAll: [],
    };

    var filterMember = leiTableData.filter(
      (_) =>
        _.source == Constants.SourceSimahPro &&
        _.source != '' &&
        _.source != null &&
        new Date(_.createdDate).getMonth() + 1 == month &&
        new Date(_.createdDate).getFullYear() == year
    );

    from(filterMember)
      .pipe(
        groupBy((lei) => lei.memberName),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((res) => {
        if (res.length > 0 && res.length == 2) {
          result.listMembersLEI.push({
            membername: res[0],
            count: res[1].length,
            childData: res[1],
          });
        }
      });

    result.listMembersLEIAll = filterMember;
    return result;
  }

  GetLEIPublicByMonth(
    leiTableData: LEITableData[],
    month: number,
    year: number
  ): any {
    var filterPublic = leiTableData.filter(
      (_) =>
        _.source == Constants.SourceWeb &&
        _.source != '' &&
        _.source != null &&
        new Date(_.createdDate).getMonth() + 1 == month &&
        new Date(_.createdDate).getFullYear() == year
    );

    return filterPublic;
  }

  GetLEIDataByType(leiTableData: LEITableData[], leiType: string): any {
    var result: any = {
      leiTypeData: [],
      leiTypeDailyData: [],
      leiTypeMonthlyData: [],
    };

    if (leiType == '' || leiType == null) {
      result.leiTypeData = leiTableData;

      result.leiTypeDailyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          new Date(_.createdDate).getDay() == this.currentDay
      );

      result.leiTypeMonthlyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear
      );
    } else {
      var tempLETTypeArray = leiType.toLowerCase().split(',');

      result.leiTypeData = leiTableData.filter((_) =>
        tempLETTypeArray.includes(_.leiType.toLowerCase())
      );

      result.leiTypeDailyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          new Date(_.createdDate).getDay() == this.currentDay &&
          tempLETTypeArray.includes(_.leiType.toLowerCase())
      );

      result.leiTypeMonthlyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          tempLETTypeArray.includes(_.leiType.toLowerCase())
      );
    }
    return result;
  }

  GetLEIDataByStatus(leiTableData: LEITableData[], leiStatus: string): any {
    var result: any = {
      leiStatusData: [],
      leiStatusDailyData: [],
      leiStatusMonthlyData: [],
    };

    if (leiStatus == '' || leiStatus == null) {
      result.leiStatusData = leiTableData;

      result.leiStatusDailyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          new Date(_.createdDate).getDay() == this.currentDay
      );

      result.leiStatusMonthlyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear
      );
    } else {
      var tempLETStatusArray = leiStatus.toLowerCase().split(',');

      result.leiStatusData = leiTableData.filter((_) =>
        tempLETStatusArray.includes(_.status.toLowerCase())
      );

      result.leiStatusDailyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          new Date(_.createdDate).getDay() == this.currentDay &&
          tempLETStatusArray.includes(_.status.toLowerCase())
      );

      result.leiStatusMonthlyData = leiTableData.filter(
        (_) =>
          new Date(_.createdDate).getMonth() + 1 == this.currentMonth &&
          new Date(_.createdDate).getFullYear() == this.currentYear &&
          tempLETStatusArray.includes(_.status.toLowerCase())
      );
    }
    return result;
  }

  getAllDatesArray = function (year: number, month: number) {
    var monthIndex = month - 1; // 0..11 instead of 1..12
    var date = new Date(year, monthIndex, 1);
    var result = [];
    while (date.getMonth() == monthIndex) {
      result.push(formatDate(date, 'yyyy-MM-dd', 'en-US'));
      date.setDate(date.getDate() + 1);
    }
    return result;
  };
}

export interface LEIData {
  name: string;
  value: number;
}

export interface LEITableData {
  id: number;
  leiNumber: string;
  idNumber: string;
  entityCreationDate: string;
  nextRenewalDate: string;
  source: string;
  leiType: string;
  country: string;
  status: string;
  createdDate: string;
  memberName: string;
}

export interface Response {
  leiTypeCount: LEIData[];
  leistatusCount: LEIData[];
  leiCountryCount: LEIData[];
  leiTrendDataYearly: LEIData[];
  leiTrendDataCurrentMonth: any;
  leiTypeStatusTodaysData: LEITableData[];
  leiTypeStatusMonthlyData: LEITableData[];
  listMembersLEI: any[];
  listMembersLEIAll: LEITableData[];
  listPublicLEI: LEITableData[];
}

export class Constants {
  public static SourceWeb: string = 'Web';
  public static SourceSimahPro: string = 'SIMAH Pro';
}
