import {
  NgModule
} from '@angular/core';
import {
  BrowserModule
} from '@angular/platform-browser';
import {
  HttpClientModule
} from '@angular/common/http';

import {
  SocialLoginModule,
  SocialAuthServiceConfig
} from 'angularx-social-login';

import {
  AppRoutingModule
} from './app-routing.module';

import {
  AppComponent
} from './app.component';
import {
  RecaptchaFormsModule,
  RecaptchaModule
} from 'ng-recaptcha';
import {
  PageNotFoundComponent
} from './page-not-found/page-not-found.component';

import {
  ServerDownComponent
} from './server-down/server-down.component';

import {
  environment
} from './../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ServerDownComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    SocialLoginModule
  ],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        environment.googleConfig,
        environment.facebookConfig
      ]
    } as SocialAuthServiceConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule {}
