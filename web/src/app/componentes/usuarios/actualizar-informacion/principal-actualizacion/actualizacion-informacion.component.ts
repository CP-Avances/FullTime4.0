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
  getActualizarRolUsuario(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Actualizar Rol Usuario');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getActualizarDepartamentoUsuario(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Actualizar Departamento Usuario');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
