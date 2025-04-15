import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-actualizacion-informacion',
  standalone: false,
  templateUrl: './actualizacion-informacion.component.html',
  styleUrls: ['./actualizacion-informacion.component.css']
})

export class ActualizacionInformacionComponent implements OnInit {

  constructor(
  ) {}

  ngOnInit(): void {}

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getActualizarRolUsuario(){
    return this.tienePermiso('Actualizar Rol Usuario');
  }

  getActualizarDepartamentoUsuario(){
    return this.tienePermiso('Actualizar Departamento Usuario');
  }

}
