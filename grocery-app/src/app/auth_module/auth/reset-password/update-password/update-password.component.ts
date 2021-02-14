import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  first
} from 'rxjs/operators';

import {
  checkPasswordValidator
} from './../../../../directives/checkPassword.directive';
import {
  AuthService
} from './../../../../services/auth.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  passwordResetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
  }, {
    validators: checkPasswordValidator // validate whether password and confirm password are the same.
  });

  success: boolean; // set to true if the password was successfully reset.
  errorMessage: string;
  linkExpired: boolean; // Link expires after use or if a new new link was issued after the current link.

  displayPasswordInfo: boolean; // display help text when the user is typing the password.
  token: string;

  constructor(private authService: AuthService, private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.displayPasswordInfo = false;
    this.success = false;

    this.route.params.subscribe(
      (params: {
        token: string
      }) => {
        this.token = params.token;
      }
    );
  }

  onSubmit() {
    this.authService.resetPassword(this.passwordResetForm.value.password, this.token).pipe(first()).subscribe(
      (result: {
        message: string
      }) => {
        this.errorMessage = result.message;
        this.success = true;
      },
      (error: {
        message: string,
        expired: boolean // whether the reset link has expired or not
      }) => {
        this.errorMessage = error.message;
        this.success = false;
        this.linkExpired = error.expired;
      }
    );
  }

}
