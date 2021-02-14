import {
  Injectable
} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import {
  Observable,
} from "rxjs";
import {
  take,
  map
} from 'rxjs/operators';
import {
  AuthService
} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})

// Prevents user from navigating to the auth module if he is already logged in.
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Promise < boolean | UrlTree > | Observable < boolean | UrlTree > {

    return this.authService.checkIfLoggedIn().pipe(take(1), map(
      (user: {
        auth: boolean,
        status: number
      }) => {
        if (user.auth) {
          // navigate away if already logged in
          this.router.navigate(['/', 'app']);
          return false;
        } 

        return true;
      }
    ));
  }
}
