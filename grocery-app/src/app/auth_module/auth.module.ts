import {
  NgModule
} from "@angular/core";

import {
  CommonModule
} from "@angular/common";
import {
  ReactiveFormsModule
} from "@angular/forms";

import {
  AuthRoutingModule
} from './auth-routing.module';
import {
  RecaptchaFormsModule,
  RecaptchaModule
} from "ng-recaptcha";

import {
  AuthComponent
} from './auth/auth.component';
import {
  RegisterComponent
} from './auth/register/register.component';

import {
  LoginComponent
} from './auth/login/login.component';
import {
  ActivateComponent
} from './auth/register/activate/activate.component';

import {
  AccountCreatedComponent
} from './auth/register/account-created/account-created.component';
import {
  ResetPasswordComponent
} from './auth/reset-password/reset-password.component';
import {
  GetLinkComponent
} from './auth/reset-password/get-link/get-link.component';
import {
  UpdatePasswordComponent
} from './auth/reset-password/update-password/update-password.component';

@NgModule({
  declarations: [AuthComponent, RegisterComponent, LoginComponent, ActivateComponent, AccountCreatedComponent, ResetPasswordComponent, GetLinkComponent, UpdatePasswordComponent],
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule, RecaptchaFormsModule, RecaptchaModule],
  exports: []
})

export class AuthModule {

}
