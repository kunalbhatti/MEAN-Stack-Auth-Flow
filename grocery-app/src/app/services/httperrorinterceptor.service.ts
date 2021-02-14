import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class HttpErrorInteceptor implements HttpInterceptor{
    constructor(private http: HttpClient){}
    // will need to change how the tokens are handeled to use interceptor. Applying this will break the app.
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        let token = localStorage.getItem('grocery-login-token');
        if (!token) {
          token = '';
        }
        request = request.clone({
            setHeaders: {
                'content-type:': 'application/json',
                'x-access-token': token
            }
          });
        return next.handle(request);
        
    }
}