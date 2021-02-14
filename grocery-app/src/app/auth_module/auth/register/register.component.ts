import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  Router
} from '@angular/router';
import {
  Subscription
} from 'rxjs';
import {
  first
} from 'rxjs/operators';

import {
  AuthService
} from './../../../services/auth.service';

import {
  checkPasswordValidator
} from './../../../directives/checkPassword.directive';

import {
  environment
} from './../../../../environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  errorMessage: boolean;

  recaptchaSub: Subscription;
  siteKey: string;

  registrationForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
    recaptcha: [''] // Validators.required
  }, {
    validators: checkPasswordValidator // validates if the password and confirm password are same.
  });

  // display help text when the user fills these fields.
  displayPasswordInfo: boolean;
  displayNameInfo: boolean;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.displayPasswordInfo = false;
    this.displayNameInfo = false;
    this.siteKey = environment.recaptchaSiteKey;
  }

  onSubmit() {
    this.authService.register(this.registrationForm.value).pipe(first()).subscribe(
      (account: {
        created: boolean,
        token: string
      }) => {
        if (!account.created) {
          alert('Account could not be created due to some internal error. Please try again later');
          return;
        }

        this.router.navigate(['/', 'auth', 'account-created', this.registrationForm.controls['email'].value]);

      }, error => {
        this.errorMessage = error;
      }
    )
  }

  resolved(recaptchaToken: string) {
    this.recaptchaSub = this.authService.validateCatpcha(recaptchaToken).subscribe(
      (recaptcha: {
        valid: boolean,
        message: string
      }) => {
        if (recaptcha.valid) {
          this.registrationForm.controls['recaptcha'].setErrors(null);

        } else {
          this.registrationForm.controls['recaptcha'].setErrors({
            'incorrect': true
          });
        }
      }, error => {
        this.registrationForm.controls['recaptcha'].setErrors({
          'incorrect': true
        });
      }
    );
  }

  ngOnDestroy() {
    try {
      this.recaptchaSub.unsubscribe();
    } catch (err) {}
  }
}
