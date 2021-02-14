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
  Subscription
} from 'rxjs';
import {
  first
} from 'rxjs/operators';

import {
  AuthService
} from './../../../../services/auth.service';

import {
  environment
} from './../../../../../environments/environment';

@Component({
  selector: 'app-get-link',
  templateUrl: './get-link.component.html',
  styleUrls: ['./get-link.component.css']
})
export class GetLinkComponent implements OnInit, OnDestroy {

  resetPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    recaptcha: [''] //, Validators.required
  });

  errorMessage: string;
  sent: boolean; // set to true if email sent successfully
  
  showForm: boolean;

  recaptchaSub: Subscription;
  siteKey: string;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.showForm = false;
    this.sent = false; // set to true after the request has been sent
    this.siteKey = environment.recaptchaSiteKey;
  }

  onSubmit() {
    this.authService.getResetLink(this.resetPasswordForm.value.email).pipe(first()).subscribe(
      (result: {
        message: string
      }) => {
        this.errorMessage = result.message;
        this.sent = true;
      }, (error: {
        message: string
      }) => {
        this.errorMessage = error.message;
      }
    );
  }

  resolved(recaptchaToken: string) {
    this.recaptchaSub = this.authService.validateCatpcha(recaptchaToken).subscribe(
      (recaptcha: {
        valid: boolean,
        message: string
      }) => {
        if (recaptcha.valid) {

          this.resetPasswordForm.controls['recaptcha'].setErrors(null);

        } else {
          this.resetPasswordForm.controls['recaptcha'].setErrors({
            'incorrect': true
          });
        }
      }, error => {
        this.resetPasswordForm.controls['recaptcha'].setErrors({
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
