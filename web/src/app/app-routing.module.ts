import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes Administrador
import { VistaRolesComponent } from './componentes/catalogos/catRoles/vista-roles/vista-roles.component';
import { RegistroComponent } from './componentes/empleado/datos-empleado/registro/registro.component';
import { ListaEmpleadosComponent } from './componentes/empleado/datos-empleado/lista-empleados/lista-empleados.component';
import { LoginComponent } from './componentes/iniciarSesion/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { VerEmpleadoComponent } from './componentes/empleado/ver-empleado/ver-empleado.component';
import { SeleccionarRolPermisoComponent } from './componentes/catalogos/catRoles/seleccionar-rol-permiso/seleccionar-rol-permiso.component'
import { ListarRegimenComponent } from './componentes/catalogos/catRegimen/listar-regimen/listar-regimen.component';
import { RelojesComponent } from './componentes/catalogos/catRelojes/relojes/relojes.component'
import { PrincipalProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/principal-proceso/principal-proceso.component';
import { RegistroProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/registro-proceso/registro-proceso.component';
import { PrincipalProvinciaComponent } from './componentes/catalogos/catProvincia/listar-provincia/principal-provincia.component';
import { PrincipalDepartamentoComponent } from './componentes/catalogos/catDepartamentos/listar-departamento/principal-departamento.component';
import { PrincipalHorarioComponent } from './componentes/catalogos/catHorario/horario/principal-horario/principal-horario.component';
import { RegistroHorarioComponent } from './componentes/catalogos/catHorario/horario/registro-horario/registro-horario.component';
import { RegistrarFeriadosComponent } from './componentes/catalogos/catFeriados/feriados/registrar-feriados/registrar-feriados.component';
import { ListarFeriadosComponent } from './componentes/catalogos/catFeriados/feriados/listar-feriados/listar-feriados.component';
import { RegistroDepartamentoComponent } from './componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { ListarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { ListarRelojesComponent } from './componentes/catalogos/catRelojes/listar-relojes/listar-relojes.component';
import { EmplCargosComponent } from './componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { ListarTitulosComponent } from './componentes/catalogos/catTitulos/tituloProfesional/listar-titulos/listar-titulos.component';
import { ListaSucursalesComponent } from './componentes/catalogos/catSucursal/lista-sucursales/lista-sucursales.component';
import { OlvidarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/confirmar-contrasenia/confirmar-contrasenia.component';
import { PlanificacionMultipleComponent } from './componentes/horarios/horarios-rotativos/planificacion-multiple/planificacion-multiple.component';
import { VerDocumentosComponent } from './componentes/documentos/ver-documentos/ver-documentos.component';
import { ConfigurarCodigoComponent } from './componentes/administracionGeneral/configurar-codigo/configurar-codigo.component';
import { ListaHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { VerEmpresaComponent } from './componentes/catalogos/catEmpresa/ver-empresa/ver-empresa.component';

// Seguridad
import { AuthGuard } from "./servicios/guards/auth.guard";

//Reportes
import { ReportePermisosComponent } from './componentes/reportes/modulos/reporte-permisos/reporte-permisos.component';
import { ReporteEntradaSalidaComponent } from './componentes/reportes/asistencia/reporte-entrada-salida/reporte-entrada-salida.component';
import { AsistenciaConsolidadoComponent } from './componentes/reportes/asistencia/reporte-asistencia-consolidado/asistencia-consolidado.component';
import { ReporteHorasPedidasComponent } from './componentes/reportes/modulos/horasExtras/reporte-horas-pedidas/reporte-horas-pedidas.component';
import { TimbreAbiertosComponent } from './componentes/reportes/timbres/timbre-abiertos/timbre-abiertos.component';


// Componentes Empleado
import { ContratoCargoEmpleadoComponent } from './componentes/rolEmpleado/contrato-cargo-empleado/contrato-cargo-empleado.component';
import { DatosEmpleadoComponent } from './componentes/rolEmpleado/datos-empleado/datos-empleado.component';
import { HomeEmpleadoComponent } from './componentes/rolEmpleado/home-empleado/home-empleado.component';
import { InformacionJefeComponent } from './componentes/rolEmpleado/informacion-jefe/informacion-jefe.component';
import { HorariosEmpleadoComponent } from './componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VacacionesEmpleadoComponent } from './componentes/rolEmpleado/vacacion-empleado/vacaciones-empleado/vacaciones-empleado.component';
import { SolicitarPermisosEmpleadoComponent } from './componentes/rolEmpleado/permisos-empleado/solicitar-permisos-empleado/solicitar-permisos-empleado.component';
import { VerDocumentacionComponent } from './componentes/rolEmpleado/ver-documentacion/ver-documentacion.component';
import { HoraExtraEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/hora-extra-empleado/hora-extra-empleado.component';
import { PlanificacionComidasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/planificacion-comidas-empleado/planificacion-comidas-empleado.component';
import { ProcesosEmpleadoComponent } from './componentes/rolEmpleado/procesos-empleado/procesos-empleado.component';
import { AutorizaEmpleadoComponent } from './componentes/rolEmpleado/autoriza-empleado/autoriza-empleado.component';
import { ReporteKardexComponent } from './componentes/reportes/modulos/vacaciones/reporte-kardex/reporte-kardex.component';
import { ReporteEmpleadosComponent } from './componentes/reportes/generales/empleados/activos/reporte-empleados/reporte-empleados.component';
import { ListaArchivosComponent } from './componentes/documentos/lista-archivos/lista-archivos.component';
import { TimbreWebComponent } from './componentes/modulos/timbreWeb/timbre-empleado/timbre-web.component';
import { TimbreAdminComponent } from './componentes/timbres/timbre-admin/timbre-admin.component';
import { ReporteHorasExtrasComponent } from './componentes/reportes/modulos/horasExtras/reporte-horas-extras/reporte-horas-extras.component';
import { AlimentosGeneralComponent } from './componentes/reportes/modulos/alimentacion/alimentos-general/alimentos-general.component';
import { ReporteAtrasosMultiplesComponent } from './componentes/reportes/asistencia/reporte-atrasos-multiples/reporte-atrasos-multiples.component';
import { ReporteEmpleadosInactivosComponent } from './componentes/reportes/generales/empleados/inactivos/reporte-empleados-inactivos/reporte-empleados-inactivos.component';
import { ReporteFaltasComponent } from './componentes/reportes/asistencia/reporte-faltas/reporte-faltas.component';
import { ReporteHorasTrabajadasComponent } from './componentes/reportes/asistencia/reporte-horas-trabajadas/reporte-horas-trabajadas.component';
import { ReporteTimbresMultiplesComponent } from './componentes/reportes/timbres/reporte-timbres-multiples/reporte-timbres-multiples.component';
import { ReportePuntualidadComponent } from './componentes/reportes/asistencia/reporte-puntualidad/reporte-puntualidad.component';
import { MetricaAtrasosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-atrasos/metrica-atrasos.component';
import { MetricaHorasExtrasComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaPermisosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-permisos/metrica-permisos.component';
import { MetricaVacacionesComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-vacaciones/metrica-vacaciones.component';
import { DetallePlanificadosComponent } from './componentes/reportes/modulos/alimentacion/detalle-planificados/detalle-planificados.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { AdministradorTodasComponent } from './componentes/reportes/notificaciones/administrador-todas/administrador-todas.component';
import { PorUsuarioComponent } from './componentes/reportes/notificaciones/por-usuario/por-usuario.component';
import { BuscarTimbreComponent } from './componentes/timbres/acciones-timbres/buscar-timbre/buscar-timbre.component';

import { RecuperarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/recuperar-frase/recuperar-frase.component';
import { OlvidarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/olvidar-frase/olvidar-frase.component';
import { VacunaMultipleComponent } from './componentes/reportes/generales/vacunas/vacuna-multiple/vacuna-multiple.component';
import { AlimentosInvitadosComponent } from './componentes/reportes/modulos/alimentacion/alimentos-invitados/alimentos-invitados.component';
import { TimbreIncompletoComponent } from './componentes/reportes/timbres/timbre-incompleto/timbre-incompleto.component';
import { SalidasAntesComponent } from './componentes/reportes/asistencia/salidas-antes/salidas-antes.component';
import { AuditoriaComponent } from './componentes/reportes/auditoria/auditoria.component';
import { SolicitudVacacionComponent } from './componentes/reportes/modulos/vacaciones/solicitud-vacacion/solicitud-vacacion.component';
import { TimbreSistemaComponent } from './componentes/reportes/timbres/timbre-sistema/timbre-sistema.component';
import { TimbreVirtualComponent } from './componentes/reportes/timbres/timbre-virtual/timbre-virtual.component';
import { ListarParametroComponent } from './componentes/administracionGeneral/parametrizacion/parametros/listar-parametro/listar-parametro.component';
import { ListarCoordenadasComponent } from './componentes/modulos/geolocalizacion/listar-coordenadas/listar-coordenadas.component';
import { ComunicadosComponent } from './componentes/administracionGeneral/comunicados/comunicados.component';
import { VerBirthdayComponent } from './componentes/administracionGeneral/birthday/ver-birthday/ver-birthday.component';
import { ConfiguracionComponent } from './componentes/administracionGeneral/correo/configuracion/configuracion.component';
import { ListaNotificacionComponent } from './componentes/administracionGeneral/configuracion-notificaciones/multiple/lista-empleados/listaNotificacion.component';
import { ListarNivelTitulosComponent } from './componentes/catalogos/catTitulos/nivelTitulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { InasistenciaMacroComponent } from './componentes/reportes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { AsistenciaMacroComponent } from './componentes/reportes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { HoraExtraMacroComponent } from './componentes/reportes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/reportes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/reportes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { RetrasosMacroComponent } from './componentes/reportes/graficas-macro/retrasos-macro/retrasos-macro.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/reportes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { SalidasAntesMacroComponent } from './componentes/reportes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { ListarCiudadComponent } from './componentes/catalogos/catCiudad/listar-ciudad/listar-ciudad.component';
import { ListarEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/listar-empleado-permiso/listar-empleado-permiso.component';
import { ListarVacacionesComponent } from './componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { ListaPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { CalculoHoraExtraComponent } from './componentes/modulos/horasExtras/calculos/calculo-hora-extra/calculo-hora-extra.component';
import { ListaPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-plan-hora-extra/lista-plan-hora-extra.component';
import { HoraExtraRealComponent } from './componentes/modulos/horasExtras/calculos/hora-extra-real/hora-extra-real.component';
import { ListaEmplePlanHoraEComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { ListaPlanificacionesComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { PlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/plan-comidas/plan-comidas.component';
import { ListarPlanificacionComponent } from './componentes/modulos/alimentacion/planifica-comida/listar-planificacion/listar-planificacion.component';
import { ListaAppComponent } from './componentes/modulos/appMovil/lista-app/lista-app.component';
import { ListarSolicitudComponent } from './componentes/modulos/alimentacion/solicitar-comida/listar-solicitud/listar-solicitud.component';
import { VerEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/ver-empleado-permiso/ver-empleado-permiso.component';
import { VerVacacionComponent } from './componentes/modulos/vacaciones/ver-vacacion/ver-vacacion.component';
import { VerPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
import { ListarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { CrearPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { ListarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/modulos/permisos/multiples/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { RealtimeNotificacionComponent } from './componentes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { RealtimeAvisosComponent } from './componentes/notificaciones/realtime-avisos/realtime-avisos.component';
import { HorasPlanificadasEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/horas-planificadas-empleado/horas-planificadas-empleado.component';
import { ComidasSolicitadasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/comidas-solicitadas-empleado/comidas-solicitadas-empleado.component';
import { ListaWebComponent } from './componentes/modulos/timbreWeb/lista-web/lista-web.component';
import { RegistroDispositivosComponent } from './componentes/modulos/appMovil/registro-dispositivos/registro-dispositivos.component';
import { VistaElementosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/listarTipoPermisos/vista-elementos.component';
import { TimbreMultipleComponent } from './componentes/timbres/timbre-multiple/timbre-multiple.component';
import { VerEmpleadosActivosDetalleComponent } from './componentes/reportes/generales/empleados/activos/ver-empleados-activos-detalle/ver-empleados-activos-detalle.component';
import { VerEmpleadosInactivosDetalleComponent } from './componentes/reportes/generales/empleados/inactivos/ver-empleados-inactivos-detalle/ver-empleados-inactivos-detalle.component';
import { VerVacunasComponent } from './componentes/reportes/generales/vacunas/ver-vacunas/ver-vacunas.component';
import { BuscarAsistenciaComponent } from './componentes/horarios/asistencia/buscar-asistencia/buscar-asistencia.component';
import { ReporteTiempoAlimentacionComponent } from './componentes/reportes/asistencia/reporte-tiempo-alimentacion/reporte-tiempo-alimentacion.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Para rol Administrador
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: 1 } },

 { path: 'relojes', component: RelojesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarProceso', component: RegistroProcesoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarDepartamento', component: RegistroDepartamentoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarHorario', component: RegistroHorarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'feriados', component: RegistrarFeriadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
{ path: 'emplCargos', component: EmplCargosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'planificacion', component: PlanificacionMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'asistencia', component: BuscarAsistenciaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'calcularHoraExtra', component: CalculoHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },


  { path: 'verEmpleado/:id', component: VerEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
 
 

  { path: 'planificacionesHorasExtras', component: ListaPlanHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horaExtraReal', component: HoraExtraRealComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // Graficas Empleado
  { path: 'macro/user/atrasos', component: MetricaAtrasosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/horas-extras', component: MetricaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/permisos', component: MetricaPermisosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/vacaciones', component: MetricaVacacionesComponent, canActivate: [AuthGuard], data: { roles: 2 } },

  // Reportes
  { path: 'reporteAsistenciaConsolidado', component: AsistenciaConsolidadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteEmpleados', component: ReporteEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteKardex', component: ReporteKardexComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reportePermisos', component: ReportePermisosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteEntradaSalida', component: ReporteEntradaSalidaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteHorasExtras', component: ReporteHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horas/extras', component: ReporteHorasPedidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-atrasos-multiples', component: ReporteAtrasosMultiplesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-emp-inactivos', component: ReporteEmpleadosInactivosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-faltas', component: ReporteFaltasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-horas-trabajadas', component: ReporteHorasTrabajadasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-puntualidad', component: ReportePuntualidadComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbres-multiples', component: ReporteTimbresMultiplesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-abierto', component: TimbreAbiertosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-incompleto', component: TimbreIncompletoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'salidas-anticipadas', component: SalidasAntesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'tiempo-alimentacion', component: ReporteTiempoAlimentacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'solicitud-vacacion', component: SolicitudVacacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-sistema', component: TimbreSistemaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-reloj-virtual', component: TimbreVirtualComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  //DETALLE REPORTES
  { path: 'ver-empleados-activos-detalle/:tipo', component: VerEmpleadosActivosDetalleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'ver-empleados-inactivos-detalle/:tipo/:lista', component: VerEmpleadosInactivosDetalleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'ver-vacunas-detalle/:tipo/:lista', component: VerVacunasComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // REPORTES ALIMENTACIÓN
  { path: 'alimentosGeneral', component: AlimentosGeneralComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentosDetallado', component: DetallePlanificadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentosInvitados', component: AlimentosInvitadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // REPORTES DE VACUNAS
  { path: 'lista-vacunados', component: VacunaMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // NOTIFICACIONES
  { path: 'listaAllNotificaciones', component: AdministradorTodasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaNotifacionUsuario', component: PorUsuarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ROL MIXTO PARA LAS AUTORIZACIONES
  { path: 'lista-notificaciones', component: RealtimeNotificacionComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'lista-avisos', component: RealtimeAvisosComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  
  { path: 'ver-permiso/:id', component: VerEmpleadoPermisoComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'ver-vacacion/:id', component: VerVacacionComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'ver-hora-extra/:id', component: VerPedidoHoraExtraComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },

  // PARA ROL EMPLEADO
  { path: 'datosEmpleado', component: DatosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'estadisticas', component: HomeEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'informacion', component: InformacionJefeComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'cargoEmpleado', component: ContratoCargoEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
 { path: 'horariosEmpleado', component: HorariosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'vacacionesEmpleado', component: VacacionesEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'solicitarPermiso', component: SolicitarPermisosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'verDocumentacion', component: VerDocumentacionComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'horaExtraEmpleado', component: HoraExtraEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'horasPlanEmpleado', component: HorasPlanificadasEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'comidasPlanEmpleado', component: PlanificacionComidasEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'comidasEmpleado', component: ComidasSolicitadasEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'procesosEmpleado', component: ProcesosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'autorizaEmpleado', component: AutorizaEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
 
  // PANTALLA INICIAL
  { path: 'recuperar-frase/:token', component: RecuperarFraseComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'frase-olvidar', component: OlvidarFraseComponent, canActivate: [AuthGuard], data: { log: false } },

  // ACCESO A RUTAS DE INICIO DE SESION
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'olvidar-contrasenia', component: OlvidarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'confirmar-contrasenia/:token', component: ConfirmarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },

  // ACCESO A RUTAS DE EMPRESA
  { path: 'vistaEmpresa', component: VerEmpresaComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS ESTABLECIMIENTOS
  { path: 'sucursales', component: ListaSucursalesComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE FERIADOS
  { path: 'listarFeriados', component: ListarFeriadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE PARAMETRIZACION GENERAL
  { path: 'parametros', component: ListarParametroComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE CONFIGURACION DE CORREO
  { path: 'configurarCorreo', component: ConfiguracionComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE CONFIGURACION DE NOTIFICACIONES DE USUARIOS
  { path: 'configurarNotificaciones', component: ListaNotificacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE ROLES
  { path: 'roles', component: VistaRolesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'seleccionarPermisos/:id', component: SeleccionarRolPermisoComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE REGIMEN LABORAL
  { path: 'listarRegimen', component: ListarRegimenComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE PROVINCIA
  { path: 'provincia', component: PrincipalProvinciaComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE CIUDAD
  { path: 'listarCiudades', component: ListarCiudadComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE DEPARTAMENTOS
  { path: 'departamento', component: PrincipalDepartamentoComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE CODIGO
  { path: 'codigo', component: ConfigurarCodigoComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE NIVELES DE TITULOS
  { path: 'nivelTitulos', component: ListarNivelTitulosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE TITULOS 
  { path: 'titulos', component: ListarTitulosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE EMPLEADO
  { path: 'registrarEmpleado', component: RegistroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'empleado', component: ListaEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE HORARIOS
  { path: 'horario', component: PrincipalHorarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horariosMultiples', component: HorarioMultipleEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE PERMISOS
  { path: 'verTipoPermiso', component: VistaElementosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'permisosMultiples', component: PermisosMultiplesEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'permisos-solicitados', component: ListarEmpleadoPermisoComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE VACACIONES
  { path: 'vacaciones-solicitados', component: ListarVacacionesComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE HORAS EXTRAS
  { path: 'listaHorasExtras', component: ListaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'planificaHoraExtra', component: ListaEmplePlanHoraEComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listadoPlanificaciones', component: ListaPlanificacionesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horas-extras-solicitadas', component: ListaPedidoHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTA DE ALIMENTACION
  { path: 'listarTipoComidas', component: ListarTipoComidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentacion', component: PlanComidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaPlanComida', component: ListarPlanificacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaSolicitaComida', component: ListarSolicitudComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE ACCIONES DE PERSONAL
  { path: 'proceso', component: PrincipalProcesoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'acciones-personal', component: ListarTipoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'pedidoAccion', component: CrearPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaPedidos', component: ListarPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE GEOLOCALIZACION
  { path: 'coordenadas', component: ListarCoordenadasComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE APLICACION MOVIL
  { path: 'app-movil', component: ListaAppComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registro-dispositivos', component: RegistroDispositivosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE DISPOSITIVOS
  { path: 'listarRelojes', component: ListarRelojesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarRelojes', component: RelojesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  // ACCESO A RUTAS DE TIMBRES
  { path: 'timbres-personal', component: TimbreWebComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'timbres-multiples', component: TimbreMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'timbres-admin', component: TimbreAdminComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'timbresWeb', component: ListaWebComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'buscar-timbre', component: BuscarTimbreComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },

  // ACCESO A RUTAS DE DOCUMENTOS
  { path: 'archivos', component: VerDocumentosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'archivos/:filename', component: ListaArchivosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE CUMPLEANIOS
  { path: 'cumpleanios', component: VerBirthdayComponent, canActivate: [AuthGuard], data: { roles: 1 } },


  // ACCESO A RUTAS DE COMUNICADOS
  { path: 'comunicados', component: ComunicadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // ACCESO A RUTAS DE GRAFICAS ADMINISTRADOR
  { path: 'macro/tiempo-jornada-vs-hora-ext', component: TiempoJornadaVsHoraExtMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/jornada-vs-hora-extra', component: JornadaVsHoraExtraMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/salidas-antes', component: SalidasAntesMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/inasistencia', component: InasistenciaMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/marcaciones', component: MarcacionesEmpMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/asistencia', component: AsistenciaMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/hora-extra', component: HoraExtraMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/retrasos', component: RetrasosMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
