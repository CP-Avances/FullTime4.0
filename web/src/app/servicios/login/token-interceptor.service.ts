import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { HttpInterceptor } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(
    private loginServices: LoginService
  ) { }


  intercept(req, next) {

    const tokenizeReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.loginServices.getToken()}`
      }
    });
    return next.handle(tokenizeReq);
  }

}
