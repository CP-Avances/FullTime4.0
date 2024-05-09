import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-ver-documentos',
  templateUrl: './ver-documentos.component.html',
  styleUrls: ['./ver-documentos.component.css']
})

export class VerDocumentosComponent implements OnInit {

  // ARRAY DE CARPETAS
  array_carpetas: any = [];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private rest: DocumentosService,
  ) { }

  ngOnInit(): void {
    this.ObtenerCarpetas();
  }

  // METODO PARA OBTENER CARPETAS
  ObtenerCarpetas() {
    this.rest.ListarCarpeta().subscribe(res => {
      this.array_carpetas = res
    })
  }

  // METODO PARA ABRIR UNA CARPETA
  AbrirCarpeta(nombre_carpeta: string) {
    this.router.navigate([nombre_carpeta], { relativeTo: this.route, skipLocationChange: false });
  }

  //CONTROL BOTONES
  getContratos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Documentos Contratos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }
  
  getRespaldosHorarios(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Documentos Respaldos horarios');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getRespaldoPermisos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Documentos Respaldos Permisos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDocumentacion(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Gestionar Documentación');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  verificarValorBoton(nombre: string): boolean {
    switch(nombre){
      case 'Contratos':
        return this.getContratos();
      case 'Respaldos Horarios':
        return this.getRespaldosHorarios();
      case 'Respaldos Permisos':
          return this.getRespaldoPermisos();
      case 'Documentacion':
        return this.getDocumentacion();
      default: 
        return false;
    }
  }
}
