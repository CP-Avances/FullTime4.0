import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material/material.module';
import { FiltrosModule } from '../../filtros/filtros.module';

import { RangoFechasComponent } from './configuracion-reportes/rango-fechas/rango-fechas.component';
import { ReporteFaltasComponent } from './asistencia/reporte-faltas/reporte-faltas.component';
import { CriteriosBusquedaComponent } from './configuracion-reportes/criterios-busqueda/criterios-busqueda.component';
import { ReporteTimbresMultiplesComponent } from './timbres/reporte-timbres-multiples/reporte-timbres-multiples.component';

import { ReporteEmpleadosComponent } from './generales/empleados/activos/reporte-empleados/reporte-empleados.component';
import { ReporteKardexComponent } from './modulos/vacaciones/reporte-kardex/reporte-kardex.component';
import { ReporteHorasPedidasComponent } from './modulos/horasExtras/reporte-horas-pedidas/reporte-horas-pedidas.component';
import { ReporteHorasExtrasComponent } from './modulos/horasExtras/reporte-horas-extras/reporte-horas-extras.component';
import { AlimentosGeneralComponent } from './modulos/alimentacion/alimentos-general/alimentos-general.component';
import { DetallePlanificadosComponent } from './modulos/alimentacion/detalle-planificados/detalle-planificados.component';
import { ReporteAtrasosMultiplesComponent } from './asistencia/reporte-atrasos-multiples/reporte-atrasos-multiples.component';
import { ReporteEmpleadosInactivosComponent } from './generales/empleados/inactivos/reporte-empleados-inactivos/reporte-empleados-inactivos.component';
import { ReporteHorasTrabajadasComponent } from './asistencia/reporte-horas-trabajadas/reporte-horas-trabajadas.component';
import { ReportePuntualidadComponent } from './asistencia/reporte-puntualidad/reporte-puntualidad.component';
import { AsistenciaConsolidadoComponent } from './asistencia/reporte-asistencia-consolidado/asistencia-consolidado.component';
import { ReportePermisosComponent } from './modulos/reporte-permisos/reporte-permisos.component';
import { ReporteEntradaSalidaComponent } from './asistencia/reporte-entrada-salida/reporte-entrada-salida.component';
import { AppRoutingModule } from '../../app-routing.module';
import { AdministradorTodasComponent } from './notificaciones/administrador-todas/administrador-todas.component';
import { PorUsuarioComponent } from './notificaciones/por-usuario/por-usuario.component';
import { OptionTimbreDispositivoComponent } from './configuracion-reportes/option-timbre-dispositivo/option-timbre-dispositivo.component';
import { TimbreAbiertosComponent } from './timbres/timbre-abiertos/timbre-abiertos.component';
import { VacunaMultipleComponent } from './generales/vacunas/vacuna-multiple/vacuna-multiple.component';
import { AlimentosInvitadosComponent } from './modulos/alimentacion/alimentos-invitados/alimentos-invitados.component';
import { TimbreIncompletoComponent } from './timbres/timbre-incompleto/timbre-incompleto.component';
import { SalidasAntesComponent } from './asistencia/salidas-antes/salidas-antes.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { SolicitudVacacionComponent } from './modulos/vacaciones/solicitud-vacacion/solicitud-vacacion.component';
import { HorasPlanificadasComponent } from './modulos/horasExtras/horas-planificadas/horas-planificadas.component';
import { TimbreSistemaComponent } from './timbres/timbre-sistema/timbre-sistema.component';
import { TimbreVirtualComponent } from './timbres/timbre-virtual/timbre-virtual.component';
import { VerEmpleadosActivosDetalleComponent } from './generales/empleados/activos/ver-empleados-activos-detalle/ver-empleados-activos-detalle.component';
import { VerEmpleadosInactivosDetalleComponent } from './generales/empleados/inactivos/ver-empleados-inactivos-detalle/ver-empleados-inactivos-detalle.component';
import { VerVacunasComponent } from './generales/vacunas/ver-vacunas/ver-vacunas.component';
@NgModule({
  declarations: [
    RangoFechasComponent,
    CriteriosBusquedaComponent,
    ReporteTimbresMultiplesComponent,
    ReporteFaltasComponent,
    ReporteEmpleadosComponent,
    ReporteKardexComponent,
    ReporteHorasPedidasComponent,
    ReporteHorasExtrasComponent,
    AlimentosGeneralComponent,
    DetallePlanificadosComponent,
    ReporteAtrasosMultiplesComponent,
    ReporteEmpleadosInactivosComponent,
    ReporteHorasTrabajadasComponent,
    ReportePuntualidadComponent,
    AsistenciaConsolidadoComponent,
    ReportePermisosComponent,
    ReporteEntradaSalidaComponent,
    AdministradorTodasComponent,
    PorUsuarioComponent,
    OptionTimbreDispositivoComponent,
    TimbreAbiertosComponent,
    VacunaMultipleComponent,
    AlimentosInvitadosComponent,
    TimbreIncompletoComponent,
    SalidasAntesComponent,
    AuditoriaComponent,
    SolicitudVacacionComponent,
    HorasPlanificadasComponent,
    TimbreSistemaComponent,
    TimbreVirtualComponent,
    VerEmpleadosActivosDetalleComponent,
    VerEmpleadosInactivosDetalleComponent,
    VerVacunasComponent,
  ],
  exports: [
    ReporteFaltasComponent,
    ReporteTimbresMultiplesComponent,
    ReporteEmpleadosComponent,
    ReporteKardexComponent,
    ReporteHorasPedidasComponent,
    ReporteHorasExtrasComponent,
    AlimentosGeneralComponent,
    DetallePlanificadosComponent,
    ReporteAtrasosMultiplesComponent,
    ReporteEmpleadosInactivosComponent,
    ReporteHorasTrabajadasComponent,
    ReportePuntualidadComponent,
    AsistenciaConsolidadoComponent,
    ReportePermisosComponent,
    ReporteEntradaSalidaComponent,
    SolicitudVacacionComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    FiltrosModule
  ]
})
export class ReportesModule { }
