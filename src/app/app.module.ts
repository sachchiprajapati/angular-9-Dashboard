import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Dashboardv1Component } from './dashboard1/dashboardv1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DevExtremeModule } from 'devextreme-angular';
import { GenericTableDevextremeComponent } from './generic-table-devextreme/generic-table-devextreme.component';
import {
  BsDatepickerModule,
  BsDatepickerConfig,
} from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    AppComponent,
    Dashboardv1Component,
    GenericTableDevextremeComponent,
  ],
  imports: [
    NgxChartsModule,
    BrowserModule,
    BrowserAnimationsModule,
    //GenericTableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BsDatepickerModule,
    DevExtremeModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
