import { Component, OnInit, ViewChild } from '@angular/core';
import { AuditoriaAccesosComponent } from '../auditoria-accesos/auditoria-accesos.component';
import { ReporteAuditoriaComponent } from '../reporte-auditoria/reporte-auditoria.component';

@Component({
  standalone: false,
  selector: 'app-auditoria-sistema',
  templateUrl: './auditoria-sistema.component.html',
  styleUrl: './auditoria-sistema.component.css'
})

export class AuditoriaSistemaComponent implements OnInit {

  @ViewChild(AuditoriaAccesosComponent)
  accesoComponent!: AuditoriaAccesosComponent;

  @ViewChild(ReporteAuditoriaComponent)
  auditoriaComponent!: ReporteAuditoriaComponent;

  ngOnInit(): void { }

  // METODO PARA LIMPIAR DATOS DEL COMPONENTE DE AUDITORIA DE ACCESO AL SISTEMA
  LimpiarAccesoSistema() {
    //console.log('Ejecutando limpieza...');
    if (this.accesoComponent) {
      this.accesoComponent.verDetalle = false;
    }
  }

  // METODO PARA LIMPIAR DATOS DEL COMPONENTE DE AUDITORIA GENERAL
  LimpiarAuditoriaSistema() {
    //console.log('Ejecutando limpieza...');
    if (this.auditoriaComponent) {
      this.auditoriaComponent.LimpiarDatos();
    }
  }

}
