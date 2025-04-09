import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router) { }


  // VALIDACIONES DE INGRESO AL SISTEMA     **USADO
  async ValidarCredenciales(data: any) {
    const response = await firstValueFrom(this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/login`, data));
    return response;
  }

  // METODO PARA CAMBIAR CONTRASEÑA    **USADO
  EnviarCorreoContrasena(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/login/recuperar-contrasenia/`, data)
  }

  // METODO PARA CAMBIAR CONTRASEÑA   **USADO
  ActualizarContrasenia(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/login/cambiar-contrasenia`, data)
  }

  // VERIFICAR EXISTENCIA DE INICIO DE SESION
  loggedIn() {
    return !!localStorage.getItem('token');
  }

  // OBTENER TOKEN
  getToken() {
    return localStorage.getItem('token');
  }

  // OBTENER ROL
  getRol() {
    return parseInt(localStorage.getItem('rol') as string);//Empleado
  }

  // REVISAR ROL (VERIFICAR)
  loggedRol() {
    return !!localStorage.getItem('rol');
  }

  // ACCEDER AL MENU -- PRUEBAS
  getRolMenu() {
    return true;
  }

  // METODO PARA SALIR DEL SISTEMA
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/'], { relativeTo: this.route, skipLocationChange: false });
  }

  //SELECTOR DE EMPRESAS
  getEmpresa(data: any){
    return this.http.post<any>(`${environment.url}/fulltime`, data);
  }
 
}
