import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../usuarios/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionesService {

  idDepartamentosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  asignacionesAcceso: any[] = [];

  constructor(private restUsuario: UsuarioService) {
    this.ObtenerEstado();
  }

  async ObtenerAsignacionesUsuario(idEmpleado: any) {

    this.asignacionesAcceso = [];
    this.idDepartamentosAcceso.clear();
    this.idSucursalesAcceso.clear();
    this.idUsuariosAcceso.clear();

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
          return Promise.resolve(null);
        } else if (asignacion.administra && !asignacion.personal) {
          noPersonal = true;
        } else if (asignacion.personal && !asignacion.administra) {
          this.idUsuariosAcceso.add(idEmpleado);
          return Promise.resolve(null);
        }
      }

      this.idDepartamentosAcceso.add(asignacion.id_departamento);
      this.idSucursalesAcceso.add(asignacion.id_sucursal);

      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.restUsuario.ObtenerIdUsuariosDepartamento(data));
    });

    const results = await Promise.all(promises);

    const ids = results.flat().map((res: any) => res?.id).filter(Boolean);
    ids.forEach(id => this.idUsuariosAcceso.add(id));

    if (noPersonal) {
      this.idUsuariosAcceso.delete(idEmpleado);
    }

    this.GuardarEstado();

  }

  GuardarEstado() {
    localStorage.setItem('idDepartamentosAcceso', JSON.stringify(Array.from(this.idDepartamentosAcceso)));
    localStorage.setItem('idSucursalesAcceso', JSON.stringify(Array.from(this.idSucursalesAcceso)));
    localStorage.setItem('idUsuariosAcceso', JSON.stringify(Array.from(this.idUsuariosAcceso)));
  }

  ObtenerEstado() {
    this.idDepartamentosAcceso = new Set(JSON.parse(localStorage.getItem('idDepartamentosAcceso') || '[]'));
    this.idSucursalesAcceso = new Set(JSON.parse(localStorage.getItem('idSucursalesAcceso') || '[]'));
    this.idUsuariosAcceso = new Set(JSON.parse(localStorage.getItem('idUsuariosAcceso') || '[]'));
  }
}
