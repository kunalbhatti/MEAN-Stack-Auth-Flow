//rename this file to environment.ts

import {
    FacebookLoginProvider,
    GoogleLoginProvider
  } from "angularx-social-login";
  
  export const environment = {
    production: false,
    googleConfig: {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider('google oAuth2 client Id') //(https://console.cloud.google.com/)
    },
    facebookConfig: {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider('facebook app id') //(https://developers.facebook.com/)
    },
    recaptchaSiteKey: 'recaptcha site key' // (https://www.google.com/recaptcha)
  };