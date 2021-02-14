import {
  Injectable
} from "@angular/core";

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  of ,
  throwError
} from "rxjs";

import {
  catchError,
  map
} from 'rxjs/operators';

import {
  SocialAuthService,
  GoogleLoginProvider,
  FacebookLoginProvider
} from "angularx-social-login";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //url = 'http://localhost:8080/'
  url='';
  constructor(private htttpClient: HttpClient, private socialAuthService: SocialAuthService) {}

  register(data: {
    name: string,
    email: string,
    password: string
  }): Observable < any > {

    const headers = {
      'content-type': 'application/json'
    }
    return this.htttpClient.post(`${this.url}auth/register`, data, {
      headers
    }).pipe(catchError(this.errorHandler))
  }

  login(data: {
    email: string,
    password: string
  }): Observable < any > {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });

    return this.htttpClient.post(`${this.url}auth/login`, data, {
      headers
    }).pipe(catchError(this.errorHandler));
  }

  getResetLink(email: string): Observable < any > {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });

    return this.htttpClient.post(`${this.url}auth/get-reset-link`, {
      email
    }, {
      headers
    }).pipe(catchError(this.errorHandler));
  }

  resetPassword(password: string, token: string): Observable < any > {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'x-access-token': token
    })
    return this.htttpClient.post(`${this.url}auth/reset-password`, {
      password
    }, {
      headers
    }).pipe(catchError(this.errorHandler));
  }

  validateCatpcha(recaptchaToken: string) {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.htttpClient.post(`${this.url}auth/validate-captcha`, {
      recaptchaToken
    }, {
      headers
    }).pipe(catchError(this.errorHandler));
  }

  resendActivationMail(email: string) {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });
    return this.htttpClient.post(`${this.url}auth/activation/resend-mail/`, {
      email
    }, {
      headers
    }).pipe(catchError(this.errorHandler));
  }


  checkIfLoggedIn(): Observable < any > {
    let token = localStorage.getItem('grocery-login-token');
    if (!token) {
      token = '';
    }

    const headers = {
      'x-access-token': token,
      'content-type': 'application/json'
    }

    /* 
    There are two important points here.
    1) This function is an async function because it depends on the servers response.
    2) The auth guards consume this method to determine if the user is logged in. 

    Simply returning a boolean will not work here. So we need to return an observable.
    
    If there are no errors, we are using 'map' operator to extract the results in an observable.
    If there are errors, we are creating a new observable using the 'of' operator.

    If we dont return observable the guards will stop working.*/

    return this.htttpClient.post(`${this.url}auth/validate-token`, {}, {
      headers
    }).pipe(
      map((user: {
        auth: boolean,
        message: string
      }) => {
        if (user) {
          return {
            auth: user.auth,
            status: 200
          };
        }
      }), catchError((err: HttpErrorResponse) => {
        return of({
          auth: err.error.auth,
          status: err.status
        });
      })
    );
  }

  // generic funtion for social login. The user data has be retrieved in the login component.
  // We are not subscribing here because unsubscribing to socialAuthService.authState is easier there.
  socialLogin(provider: string) {
    if (provider === 'google') {
      this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    } else if (provider === 'facebook') {
      this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }
  }

   /* Sending the user token and googlId. The server will decode the token to get the payload.
   The server will create a new user if its a new user. 
   The server will return jwt, name and photo url. */
  googleBackendSignIn(token: string, googleId: string) {
    const headers = new HttpHeaders({
      'x-access-token': token
    });
    return this.htttpClient.post(`${this.url}social-auth/google-login`, {
      googleId
    }, {
      headers
    }).pipe(catchError(this.errorHandler));

  }

  /* Sending the user details here. The server will create a new user if its a new user. 
   The new user will be created by fb_id because fb allows users to create account without an  email 
   The server will also return jwt, name and photo url.*/
  facebookBackendSignIn(userData: {
    email: string,
    name: string,
    id: string
  }) {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });

    return this.htttpClient.post(`${this.url}social-auth/facebook-login`, userData, {
      headers
    }).pipe(catchError(this.errorHandler));
  }

  logout() {
    // We need to do error handling like this here. Using try and catch does not work.
    this.socialAuthService.signOut().catch(err => {});

    localStorage.setItem('grocery-login-token', '');
    localStorage.setItem('grocery-user-name', '');
    localStorage.setItem('grocery-user-photo', '');
  }

  // Utility Functions
  
  errorHandler(errorRes: HttpErrorResponse) {
    let errorMessage: any = 'An unknown error occured. Please try again later';

    // This can be improved.
    switch (errorRes.status) {
      case 500:
        errorMessage = errorRes.error;
        break;
      case 401:
        errorMessage = errorRes.error;
        break;
      case 409:
        errorMessage = errorRes.error;
        break;
      case 404:
        errorMessage = errorRes.error;
        break;
      case 400:
        errorMessage = errorRes.error;
        break;
    }

    return throwError(errorMessage);
  }

}
