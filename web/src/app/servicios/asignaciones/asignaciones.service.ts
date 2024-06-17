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

  constructor(private restUsuario: UsuarioService) {}

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
    this.idUsuariosAcceso.push(...ids);

    if (noPersonal) {
      this.idUsuariosAcceso = this.idUsuariosAcceso.filter((id: any) => id != idEmpleado);
    }

    console.log("idUsuariosAcceso", this.idUsuariosAcceso);
    console.log("idDepartamentosAcceso", this.idDepartamentosAcceso);
    console.log("idSucursalesAcceso", this.idSucursalesAcceso);

  }
}
