import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { Dashboardv1Component } from './dashboardv1/dashboardv1.component';

const routes: Routes = [
  { path: '', component: Dashboardv1Component },
  { path: 'dashboardv1', component: Dashboardv1Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
