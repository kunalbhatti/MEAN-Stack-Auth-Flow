import {
  NgModule
} from "@angular/core";
import {
  RouterModule,
  Routes
} from '@angular/router'


import {
  AuthComponent
} from './auth/auth.component';
import {
  LoginComponent
} from "./auth/login/login.component";
import {
  AccountCreatedComponent
} from "./auth/register/account-created/account-created.component";
import {
  ActivateComponent
} from "./auth/register/activate/activate.component";
import {
  RegisterComponent
} from "./auth/register/register.component";
import {
  GetLinkComponent
} from "./auth/reset-password/get-link/get-link.component";
import {
  ResetPasswordComponent
} from "./auth/reset-password/reset-password.component";
import {
  UpdatePasswordComponent
} from "./auth/reset-password/update-password/update-password.component";


const routes: Routes = [{
  path: '',
  component: AuthComponent,
  children: [{
      path: 'register',
      component: RegisterComponent
    }, {
      path: 'login',
      component: LoginComponent
    },
    {
      path: 'reset-password',
      component: ResetPasswordComponent,
      children: [{
          path: 'get-link',
          component: GetLinkComponent
        },
        {
          path: 'update-password/:token',
          component: UpdatePasswordComponent
        }
      ]
    },
    {
      path: 'account-created/:email',
      component: AccountCreatedComponent
    }, {
      path: 'get-activation-link',
      component: ActivateComponent,
    },
  ]
}];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {

}
