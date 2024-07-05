import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginService,
    private router: Router,
    private active_route: ActivatedRoute
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.loginService.loggedIn()) {
      return true;
    }

    if (!this.loginService.loggedIn()) {
      if (this.loginService.loggedRol() === route.data['log']) {
        return true;
      }
    }

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redireccionar", state.url)
    this.router.navigate(['/login'], { relativeTo: this.active_route, skipLocationChange: false });
    return false;
  }

}
