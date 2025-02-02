import { Routes } from '@angular/router';
import { BlotterComponent } from './blotter/blotter.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';

export const routes: Routes = [
  { path: 'blotter', component: BlotterComponent },
  { path: 'panel', component: ControlPanelComponent },
];
