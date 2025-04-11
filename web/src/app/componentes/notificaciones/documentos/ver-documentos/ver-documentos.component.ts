import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { DocumentosService } from 'src/app/servicios/notificaciones/documentos/documentos.service';

@Component({
  selector: 'app-ver-documentos',
  standalone: false,
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

  getContratos(){
    return this.tienePermiso('Ver Documentos Contratos');
  }
  
  getRespaldosHorarios(){
    return this.tienePermiso('Ver Documentos Respaldos horarios');
  }

  getRespaldoPermisos(){
    return this.tienePermiso('Ver Documentos Respaldos Permisos');
  }

  getDocumentacion(){
    return this.tienePermiso('Gestionar Documentación');
  }

  verificarValorBoton(nombre: string): boolean {
    switch (nombre) {
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
