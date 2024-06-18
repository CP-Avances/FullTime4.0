import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../usuarios/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionesService {

  idDepartamentosAcceso: any[] = [];
  idSucursalesAcceso: any[] = [];
  idUsuariosAcceso: any[] = [];
  asignacionesAcceso: any[] = [];

  constructor(private restUsuario: UsuarioService) {
    this.ObtenerEstado();
  }

  async ObtenerAsignacionesUsuario(idEmpleado: any) {

    const dataEmpleado = {
      id_empleado: Number(idEmpleado)
    }

    let noPersonal: boolean = false;

    const res: any = await firstValueFrom(this.restUsuario.BuscarUsuarioDepartamento(dataEmpleado));
    this.asignacionesAcceso = res;

    const promises = this.asignacionesAcceso.map((asignacion: any) => {
      if (asignacion.principal) {
        if (!asignacion.administra && !asignacion.personal) {
          noPersonal = true;
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        } else if (asignacion.administra && !asignacion.personal) {
          noPersonal = true;
        } else if (asignacion.personal && !asignacion.administra) {
          this.idUsuariosAcceso.push(idEmpleado);
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        }
      }

      this.idDepartamentosAcceso = [...new Set([...this.idDepartamentosAcceso, asignacion.id_departamento])];
      this.idSucursalesAcceso = [...new Set([...this.idSucursalesAcceso, asignacion.id_sucursal])];

      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.restUsuario.ObtenerIdUsuariosDepartamento(data));
    });

    const results = await Promise.all(promises);

    const ids = results.flat().map((res: any) => res?.id).filter(Boolean);
    this.idUsuariosAcceso = [...new Set([...this.idUsuariosAcceso, ...ids])];

    if (noPersonal) {
      console.log("noPersonal", noPersonal);
      this.idUsuariosAcceso = this.idUsuariosAcceso.filter((id: any) => id != idEmpleado);
    }

    console.log("this.idDepartamentosAcceso", this.idDepartamentosAcceso);
    console.log("sucursales",this.idSucursalesAcceso);
    console.log("usuarios",this.idUsuariosAcceso);

    this.GuardarEstado();

  }

  GuardarEstado() {
    localStorage.setItem('idDepartamentosAcceso', JSON.stringify(this.idDepartamentosAcceso));
    localStorage.setItem('idSucursalesAcceso', JSON.stringify(this.idSucursalesAcceso));
    localStorage.setItem('idUsuariosAcceso', JSON.stringify(this.idUsuariosAcceso));
  }

  ObtenerEstado() {
    this.idDepartamentosAcceso = JSON.parse(localStorage.getItem('idDepartamentosAcceso') || '[]');
    this.idSucursalesAcceso = JSON.parse(localStorage.getItem('idSucursalesAcceso') || '[]');
    this.idUsuariosAcceso = JSON.parse(localStorage.getItem('idUsuariosAcceso') || '[]');
  }
}
