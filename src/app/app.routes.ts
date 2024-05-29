import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { TrendpageComponent } from './trendpage/trendpage.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'trends/:location', component: TrendpageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
