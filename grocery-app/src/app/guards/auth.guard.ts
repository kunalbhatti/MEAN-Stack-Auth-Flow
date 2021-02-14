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
  Observable
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

// Prevents user from accessing the app if not logged in. 
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Promise < boolean | UrlTree > | Observable < boolean | UrlTree > {
    
    return this.authService.checkIfLoggedIn().pipe(take(1), map(
      (user: {
        auth: boolean,
        status: number
      }) => {
        if (user.auth) {
          return true;
        } else if (!user.auth && user.status === 401) {
          return this.router.createUrlTree(['/', 'auth', 'login']);
        } else if (!user.auth && user.status === 500) {
          return this.router.createUrlTree(['/', 'app', 'internal-server-error']);
        }
      }
    ));
  }

}
