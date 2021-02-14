import {
  NgModule
} from '@angular/core';
import {
  RouterModule,
  Routes
} from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import {
  ServerDownComponent
} from '../server-down/server-down.component';
import {
  HomeComponent
} from './home/home.component';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard]
}, {
  path: 'internal-server-error',
  component: ServerDownComponent
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroceryRoutingModule {

}
