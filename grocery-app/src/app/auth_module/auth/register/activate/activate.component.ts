import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

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
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit, OnChanges, OnDestroy {

  // Activate component has option to send and resend activation link. If the email is empty, the user can input his email.
  @Input() email: string;
  @Input() created = false; // Display account created successfully when created is set to true.


  resendForm = this.fb.group({
    email: [{
        value: '',
        disabled: false
      },
      [Validators.required, Validators.email]
    ],
    recaptcha: ['', Validators.required]
  });

  showForm = true; // show form to send link. 
  sent = false; // set to true after the email has been sent to the email.
  activated = false; // set to true if the user is already active. 

  errorMessage: string;

  recaptchaSub: Subscription;
  siteKey: string;

  constructor(private authService: AuthService, private fb: FormBuilder, private route: ActivatedRoute) {}


  ngOnInit(): void {
    this.email = null; // If the user has created a new account, this is will set from account-created component.
    this.siteKey = environment.recaptchaSiteKey;
  }

  ngOnChanges(change: SimpleChanges) {

    // if the user has created a new account, hide the form to resend link by default.
    if (this.created) {
      this.showForm = false;
    }
    this.resendForm = this.fb.group({
      email: [{
          value: '',
          disabled: this.email !== null // Will happen only after the account was created.
        },
        [Validators.required, Validators.email]
      ],
      recaptcha: ['', Validators.required]
    });
    this.resendForm.patchValue({
      email: this.email
    })
  }

  resolved(recaptchaToken: string) {
    this.recaptchaSub = this.authService.validateCatpcha(recaptchaToken).subscribe(
      (recaptcha: {
        valid: boolean,
        message: string
      }) => {
        if (recaptcha.valid) {
          this.resendForm.controls['recaptcha'].setErrors(null);

        } else {
          this.resendForm.controls['recaptcha'].setErrors({
            'incorrect': true
          });
        }
      }, error => {
        this.resendForm.controls['recaptcha'].setErrors({
          'incorrect': true
        });
        this.errorMessage = error;
      }
    );
  }

  onSubmit() {
    this.authService.resendActivationMail(this.resendForm.controls['email'].value).pipe(first()).subscribe(
      (result: {
        activated: boolean,
        message: string
      }) => {
        this.sent = true;
        this.showForm = false;
        this.created = false;
        if (result.activated) {
          this.activated = true;
        }
      }, error => {
        this.errorMessage = error;
      }
    );
  }

  ngOnDestroy() {
    try {
      this.recaptchaSub.unsubscribe();
    } catch (err) {}
  }

}
