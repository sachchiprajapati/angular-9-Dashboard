import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import { TableColumn } from '../model/genericTable';
// import { exportDataGrid } from 'devextreme/pdf_exporter';

@Component({
  selector: 'app-generic-table-devextreme',
  templateUrl: './generic-table-devextreme.component.html',
  styleUrls: ['./generic-table-devextreme.component.css'],
})
export class GenericTableDevextremeComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() childTable: boolean = false;
  @Input() tableId: string = '';
  @Input() pagination: number[] = [];
  @Input() pageSize!: number;
  @Input() filter: boolean = false;
  @Input() filterHeader: boolean = false;
  @Input() exportOption: boolean = false;
  @Input() childTableColumns: TableColumn[] = [];

  dataSource!: any[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = this.data;
  }

  onExporting(e: any) {
    const doc = new jsPDF();
    // exportDataGrid({
    //   jsPDFDocument: doc,
    //   component: e.component,
    //   indent: 5,
    // }).then(() => {
    //   doc.save('Companies.pdf');
    // });
  }
}
