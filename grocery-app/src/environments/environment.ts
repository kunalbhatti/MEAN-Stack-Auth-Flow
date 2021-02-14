// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {
  FacebookLoginProvider,
  GoogleLoginProvider
} from "angularx-social-login";

export const environment = {
  production: false,
  googleConfig: {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('950213084014-qm91m03256m6plee79t66io7nsd5ou0c.apps.googleusercontent.com')
  },
  facebookConfig: {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('971923123335329')
  },
  recaptchaSiteKey: '6Lf5G0saAAAAAI0B0XArViinyIZ9qQK8eAf1KmVA'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
