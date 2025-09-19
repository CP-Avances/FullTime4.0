import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material/material.module';
import { FiltrosModule } from '../../filtros/filtros.module';

import { RangoFechasComponent } from './configuracion-reportes/rango-fechas/rango-fechas.component';
import { ReporteFaltasComponent } from './asistencia/reporte-faltas/reporte-faltas.component';

import { ReporteAuditoriaComponent } from './auditoria/reporte-auditoria/reporte-auditoria.component';
import { AuditoriaSistemaComponent } from './auditoria/auditoria-sistema/auditoria-sistema.component';
import { AuditoriaAccesosComponent } from './auditoria/auditoria-accesos/auditoria-accesos.component';

import { CriteriosBusquedaComponent } from './configuracion-reportes/criterios-busqueda/criterios-busqueda.component';
import { ReporteTimbresMultiplesComponent } from './timbres/reporte-timbres-multiples/reporte-timbres-multiples.component';

import { ReporteEmpleadosComponent } from './generales/reporte-empleados/reporte-empleados.component';
import { ReportePeriodosComponent } from './modulos/vacaciones/reporte-periodos/reporte-periodos.component';
import { ReporteAtrasosMultiplesComponent } from './asistencia/reporte-atrasos-multiples/reporte-atrasos-multiples.component';
import { ReporteHorasTrabajadasComponent } from './asistencia/reporte-horas-trabajadas/reporte-horas-trabajadas.component';
import { AppRoutingModule } from '../../app-routing.module';
import { OptionTimbreDispositivoComponent } from './configuracion-reportes/option-timbre-dispositivo/option-timbre-dispositivo.component';
import { TimbreAbiertosComponent } from './timbres/timbre-abiertos/timbre-abiertos.component';
import { VacunaMultipleComponent } from './generales/vacuna-multiple/vacuna-multiple.component';
import { TimbreIncompletoComponent } from './timbres/timbre-incompleto/timbre-incompleto.component';
import { SalidasAntesComponent } from './asistencia/salidas-antes/salidas-antes.component';
import { TimbreSistemaComponent } from './modulos/timbre-sistema/timbre-sistema.component';
import { TimbreVirtualComponent } from './modulos/timbre-virtual/timbre-virtual.component';
import { ReporteTiempoAlimentacionComponent } from './asistencia/reporte-tiempo-alimentacion/reporte-tiempo-alimentacion.component';
import { ReportePlanificacionHorariaComponent } from './asistencia/reporte-planificacion-horaria/reporte-planificacion-horaria.component';
import { ReporteResumenAsistenciaComponent } from './asistencia/reporte-resumen-asistencia/reporte-resumen-asistencia.component';
import { OpcionUsuarioComponent } from './configuracion-reportes/opcion-usuario/opcion-usuario.component';
import { OpcionAccionComponent } from './configuracion-reportes/opcion-accion/opcion-accion.component';

import { TimbreMrlComponent } from './timbres/timbre-mrl/timbre-mrl.component';
import { AnalisisDatosComponent } from './analisis-datos/analisis-datos.component';

@NgModule({
  declarations: [
    RangoFechasComponent,
    CriteriosBusquedaComponent,
    ReporteTimbresMultiplesComponent,
    ReporteFaltasComponent,
    ReporteAuditoriaComponent,
    ReporteEmpleadosComponent,
    ReportePeriodosComponent,
    ReporteAtrasosMultiplesComponent,
    ReporteHorasTrabajadasComponent,
    OptionTimbreDispositivoComponent,
    TimbreAbiertosComponent,
    VacunaMultipleComponent,
    TimbreIncompletoComponent,
    SalidasAntesComponent,
    TimbreSistemaComponent,
    TimbreVirtualComponent,
    ReporteTiempoAlimentacionComponent,
    ReportePlanificacionHorariaComponent,
    ReporteResumenAsistenciaComponent,
    OpcionUsuarioComponent,
    OpcionAccionComponent,
    TimbreMrlComponent,
    AnalisisDatosComponent,
    AuditoriaSistemaComponent,
    AuditoriaAccesosComponent,
  ],
  exports: [
    ReporteFaltasComponent,
    ReporteTimbresMultiplesComponent,
    ReporteEmpleadosComponent,
    ReporteAtrasosMultiplesComponent,
    ReporteHorasTrabajadasComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    FiltrosModule,
  ]
})
export class ReportesModule { }
