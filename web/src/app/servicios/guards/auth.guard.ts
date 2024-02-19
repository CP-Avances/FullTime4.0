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

      if (this.loginService.getRol() >= route.data['rolMix'] && this.loginService.getEstado() === true) {
        return true;
      }

      if (this.loginService.getRol() >= route.data['rolMix']) { //visualizar avisos de timbres para todos los usuarios
        return true;
      }

      if (this.loginService.getRol() === route.data['roles']) {
        console.log('ver roles == roles --> ', this.loginService.getRol(), ' route  --> ', route.data['roles'])
        return true;
      }

      if (this.loginService.getRol() != route.data['roles']) {
        console.log('ver roles !=', this.loginService.getRol())

        if (this.loginService.getRol() === 1) {
          console.log('ver roles =1', this.loginService.getRol())
          this.router.navigate(['/home'], { relativeTo: this.active_route, skipLocationChange: false });
          return true;
        }
        if (this.loginService.getRol() === 2) {
          this.router.navigate(['/estadisticas'], { relativeTo: this.active_route, skipLocationChange: false });
          return true;
        }
      }
    }

    if (!this.loginService.loggedIn()) {
      // console.log(this.loginService.loggedRol());
      if (this.loginService.loggedRol() === route.data['log']) {
        return true;
      }
    }

    // console.log(state.url);
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redireccionar", state.url)
    this.router.navigate(['/login'], { relativeTo: this.active_route, skipLocationChange: false });
    return false;
  }

}
