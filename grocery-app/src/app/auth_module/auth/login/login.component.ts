import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  Router
} from '@angular/router';

import {
  Subscription
} from 'rxjs';
import {
  first,
  take
} from 'rxjs/operators';

import {
  SocialAuthService,
} from 'angularx-social-login';

import {
  AuthService
} from './../../../services/auth.service';

import {
  environment
} from './../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
  })

  errorMessage: string; // for displaying errors like invalid username/password etc
  showRecaptcha: boolean; // recaptca is shown if the user enters password incorrectly 3 times. Set to false by default.

  socialSub: Subscription; // subscription to socialAuthService. Unsubscribed when login component is destroyed.
  provider: string; // provider represents google, facebook etc.

  recaptchaSub: Subscription; // subscription to recaptcha. Unsubscribed when login component is destroyed
  siteKey: string; // Recaptcha key received from google console. Site key is stored in the environment file.


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private socialAuthService: SocialAuthService) {}

  ngOnInit(): void {
    this.siteKey = environment.recaptchaSiteKey;
    this.socialSub = this.socialAuthService.authState.subscribe(
      user => {
        if (this.provider === 'google' && user) {
          this.authService.googleBackendSignIn(user.idToken, user.id).pipe(take(1)).subscribe(
            (result: {
              auth: boolean,
              token: string,
              message: string
            }) => {

              this.router.navigate(['/', 'app']);
              localStorage.setItem('grocery-login-token', result.token);
              localStorage.setItem('grocery-user-name', user.firstName + ' ' + user.lastName);
              localStorage.setItem('grocery-user-photo', user.photoUrl);
            }, error => {
              this.errorMessage = error.message;
            }
          );

        } else if (this.provider === 'facebook' && user) {
          this.authService.facebookBackendSignIn({
            email: user.email,
            name: user.name,
            id: user.id
          }).pipe(take(1)).subscribe(
            (result: {
              auth: boolean,
              token: string,
              message: string
            }) => {
              this.router.navigate(['/', 'app']);
              localStorage.setItem('grocery-login-token', result.token);
              localStorage.setItem('grocery-user-name', user.firstName + ' ' + user.lastName);
              localStorage.setItem('grocery-user-photo', user.photoUrl);

            }, error => {
              this.errorMessage = error.message;
            }
          );
        }
      }, error => {
        console.log(error)
        this.errorMessage = error.message;
      }
    )
  }
  // for local login strategy
  onSubmit() {
    this.authService.login(this.loginForm.value).pipe(first()).subscribe(
      (result: {
        auth: boolean,
        token: string,
        message: string,
        name: string,
        photoUrl: string
      }) => {
        if (!result.auth) {
          this.errorMessage = result.message;
          return;
        }
        this.router.navigate(['/', 'app']);
        localStorage.setItem('grocery-login-token', result.token);
        localStorage.setItem('grocery-user-name', result.name);
        if (result.photoUrl) {
          localStorage.setItem('grocery-user-photo', result.photoUrl);
        }

      }, (error: {
        auth: boolean,
        message: string,
        recaptcha: boolean
      }) => {
        
        this.errorMessage = error.message;
        this.showRecaptcha = error.recaptcha;
        
        // We are keeping track of how many times the user inputs invalid password. 
        // After the third invalid attempt, error.recaptcha will return as true, and we will then require recaptcha validation
        if (error.recaptcha) {
          this.loginForm = this.fb.group({
            email: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
            recaptcha: ['', Validators.required]
          })
        }
      }
    );
  }

  // for social login strategy
  onSocialLogin(provider: string) {
    this.provider = provider;
    this.authService.socialLogin(provider);
  }

  // fired when user clicks the recaptha. Communicates with the backend to see if valid.
  resolved(recaptchaToken: string) {
    this.recaptchaSub = this.authService.validateCatpcha(recaptchaToken).subscribe(
      (recaptcha: {
        valid: boolean,
        message: string
      }) => {
        if (recaptcha.valid) {

          this.loginForm.controls['recaptcha'].setErrors(null);

        } else {
          // we need to set it to true, to indicate that the recaptcha is invalid and thus invalidating the whole form
          this.loginForm.controls['recaptcha'].setErrors({
            'incorrect': true
          });
        }
      }, error => {
        this.loginForm.controls['recaptcha'].setErrors({
          'incorrect': true
        });
      }
    );
  }

  ngOnDestroy() {
    try {
      this.recaptchaSub.unsubscribe();
    } catch (err) {}

    try {
      this.socialSub.unsubscribe();
    } catch (err) {}

  }
}
