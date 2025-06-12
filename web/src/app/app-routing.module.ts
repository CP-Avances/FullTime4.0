import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
// SEGURIDAD
import { AuthGuard } from './servicios/generales/guards/auth.guard';
// ACCESO A RUTAS DE INICIO DE SESION
import { LoginComponent } from './componentes/iniciarSesion/login/login.component';
import { OlvidarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/confirmar-contrasenia/confirmar-contrasenia.component';
// PAGINA PRINCIPAL
import { HomeComponent } from './componentes/iniciarSesion/home/home.component';
// CONFIGURACION --PARAMETRIZACION
import { VerEmpresaComponent } from './componentes/configuracion/parametrizacion/empresa/ver-empresa/ver-empresa.component';
import { ListarParametroComponent } from './componentes/configuracion/parametrizacion/parametros/listar-parametro/listar-parametro.component';
import { ConfiguracionComponent } from './componentes/configuracion/parametrizacion/correo/configuracion/configuracion.component';
import { VistaRolesComponent } from './componentes/configuracion/parametrizacion/roles/vista-roles/vista-roles.component';
import { ListarRegimenComponent } from './componentes/configuracion/parametrizacion/regimen-laboral/listar-regimen/listar-regimen.component';
import { CatModalidaLaboralComponent } from './componentes/configuracion/parametrizacion/modalidad-laboral/cat-modalida-laboral/cat-modalida-laboral.component';
import { CatTipoCargosComponent } from './componentes/configuracion/parametrizacion/tipo-cargos/listar-tipo-cargo/cat-tipo-cargos.component';
// CONFIGURACION  --LOCALIZACION
import { PrincipalProvinciaComponent } from './componentes/configuracion/localizacion/provincias/listar-provincia/principal-provincia.component';
import { ListarCiudadComponent } from './componentes/configuracion/localizacion/ciudades/listar-ciudad/listar-ciudad.component';
import { ListaSucursalesComponent } from './componentes/configuracion/localizacion/sucursales/lista-sucursales/lista-sucursales.component';
import { PrincipalDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/listar-departamento/principal-departamento.component';
// USUARIOS
import { ConfigurarCodigoComponent } from './componentes/usuarios/configurar-codigo/configurar-codigo.component';
import { ListarNivelTitulosComponent } from './componentes/usuarios/nivel-titulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { ListarTitulosComponent } from './componentes/usuarios/titulo-profesional/listar-titulos/listar-titulos.component';
import { CatDiscapacidadComponent } from './componentes/usuarios/tipo-discapacidad/listar-discapacidad/cat-discapacidad.component';
import { CatVacunasComponent } from './componentes/usuarios/tipo-vacunas/listar-vacuna/cat-vacunas.component';
import { ListarGeneroComponent } from './componentes/usuarios/tipo-genero/listar-genero/listar-genero.component';
import { ListarEstadoCivilComponent } from './componentes/usuarios/tipo-estado-civil/listar-estado-civil/listar-estado-civil.component';
import { ListarNacionalidadComponent } from './componentes/usuarios/tipo-nacionalidad/listar-nacionalidad/listar-nacionalidad.component';
import { ListaEmpleadosComponent } from './componentes/usuarios/empleados/datos-empleado/lista-empleados/lista-empleados.component';
import { VerEmpleadoComponent } from './componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';
import { RegistroComponent } from './componentes/usuarios/empleados/datos-empleado/registro/registro.component';
import { CargarPlantillaComponent } from './componentes/usuarios/cargar-plantillas/cargar-plantilla/cargar-plantilla.component';
import { ActualizacionInformacionComponent } from './componentes/usuarios/actualizar-informacion/principal-actualizacion/actualizacion-informacion.component';
import { PrincipalSucursalUsuarioComponent } from './componentes/usuarios/administrar-informacion/principal-sucursal-usuario/principal-sucursal-usuario.component';
import { RecuperarFraseComponent } from './componentes/usuarios/frase-seguridad/recuperar-frase/recuperar-frase.component';
import { OlvidarFraseComponent } from './componentes/usuarios/frase-seguridad/olvidar-frase/olvidar-frase.component';
// HORARIOS
import { ListarFeriadosComponent } from './componentes/horarios/catFeriados/feriados/listar-feriados/listar-feriados.component';
import { PrincipalHorarioComponent } from './componentes/horarios/catHorarios/horario/principal-horario/principal-horario.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/horarios/planificar-horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { BuscarAsistenciaComponent } from './componentes/horarios/asistencia/buscar-asistencia/buscar-asistencia.component';
// MODULO  --PERMISOS
import { VistaElementosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/listarTipoPermisos/vista-elementos.component';
import { ListarEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/listar-empleado-permiso/listar-empleado-permiso.component';
import { VerEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/ver-empleado-permiso/ver-empleado-permiso.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/modulos/permisos/multiples/permisos-multiples-empleados/permisos-multiples-empleados.component';
// MODULO  --VACACIONES
import { ListarVacacionesComponent } from './componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { VerVacacionComponent } from './componentes/modulos/vacaciones/ver-vacacion/ver-vacacion.component';
// MODULO  --HORAS EXTRAS
import { ListaHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { ListaEmplePlanHoraEComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { ListaPlanificacionesComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { ListaPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { VerPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
// MODULO  --ALIMENTACION
import { ListarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { PlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/plan-comidas/plan-comidas.component';
import { ListarPlanificacionComponent } from './componentes/modulos/alimentacion/planifica-comida/listar-planificacion/listar-planificacion.component';
import { ListarSolicitudComponent } from './componentes/modulos/alimentacion/solicitar-comida/listar-solicitud/listar-solicitud.component';
// MODULO  --ACCION PERSONAL
import { PrincipalProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/principal-proceso/principal-proceso.component';
import { ListarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { CrearPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { ListarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { GradosComponent } from './componentes/modulos/accionesPersonal/grados/principal-grados/grados.component';
import { GrupoOcupacionalComponent } from './componentes/modulos/accionesPersonal/grupo-ocupacional/principal-grupo-ocupacional/grupo-ocupacional.component';
import { IngresarRegistrosComponent } from './componentes/modulos/accionesPersonal/asignar-registros-usuarios/ingresar-registros/ingresar-registros.component';

// MODULO  --GEOLOCALIZACION
import { ListarCoordenadasComponent } from './componentes/modulos/geolocalizacion/listar-coordenadas/listar-coordenadas.component';
// MODULO  --TIMBRE VIRTUAL
import { ListaWebComponent } from './componentes/modulos/timbreWeb/lista-web/lista-web.component';
import { TimbreWebComponent } from './componentes/modulos/timbreWeb/timbre-empleado/timbre-web.component';
import { OpcionesTimbreWebComponent } from './componentes/modulos/timbreWeb/opcionesTimbreWeb/opciones-timbre-web/opciones-timbre-web.component';
// MODULO  --APLICACION MOVIL
import { ListaAppComponent } from './componentes/modulos/appMovil/lista-app/lista-app.component';
import { RegistroDispositivosComponent } from './componentes/modulos/appMovil/registro-dispositivos/registro-dispositivos.component';
// TIMBRES
import { ListarRelojesComponent } from './componentes/timbres/dispositivos/listar-relojes/listar-relojes.component';
import { RelojesComponent } from './componentes/timbres/dispositivos/relojes/relojes.component';
import { TimbreAdminComponent } from './componentes/timbres/timbre-admin/timbre-admin.component';
import { TimbreMultipleComponent } from './componentes/timbres/timbre-multiple/timbre-multiple.component';
import { BuscarTimbreComponent } from './componentes/timbres/acciones-timbres/buscar-timbre/buscar-timbre.component';
import { ConfigurarOpcionesTimbresComponent } from './componentes/modulos/appMovil/configurar-opciones-timbre/configurar-opciones-timbres/configurar-opciones-timbres.component';
// NOTIFICACIONES
import { ListaNotificacionComponent } from './componentes/notificaciones/configurar-notificaciones/multiple/lista-empleados/listaNotificacion.component';
import { VerDocumentosComponent } from './componentes/notificaciones/documentos/ver-documentos/ver-documentos.component';
import { ListaArchivosComponent } from './componentes/notificaciones/documentos/lista-archivos/lista-archivos.component';
import { MensajesNotificacionesComponent } from './componentes/notificaciones/configurar-mensajes/mensajes-notificaciones/mensajes-notificaciones.component';
import { ComunicadosComponent } from './componentes/notificaciones/comunicados/comunicados.component';
import { AdministradorTodasComponent } from './componentes/reportes/notificaciones/administrador-todas/administrador-todas.component';
import { PorUsuarioComponent } from './componentes/reportes/notificaciones/por-usuario/por-usuario.component';
import { RealtimeNotificacionComponent } from './componentes/reportes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { RealtimeAvisosComponent } from './componentes/reportes/notificaciones/realtime-avisos/realtime-avisos.component';
import { SettingsComponent } from './componentes/notificaciones/configurar-notificaciones/settings/settings.component';
// REPORTES  --GENERALES
import { ReporteEmpleadosComponent } from './componentes/reportes/generales/reporte-empleados/reporte-empleados.component';
import { VacunaMultipleComponent } from './componentes/reportes/generales/vacuna-multiple/vacuna-multiple.component';
// REPORTES  --ASISTENCIA
import { ReporteFaltasComponent } from './componentes/reportes/asistencia/reporte-faltas/reporte-faltas.component';
import { ReporteAtrasosMultiplesComponent } from './componentes/reportes/asistencia/reporte-atrasos-multiples/reporte-atrasos-multiples.component';
import { ReporteHorasTrabajadasComponent } from './componentes/reportes/asistencia/reporte-horas-trabajadas/reporte-horas-trabajadas.component';
import { ReporteTiempoAlimentacionComponent } from './componentes/reportes/asistencia/reporte-tiempo-alimentacion/reporte-tiempo-alimentacion.component';
import { SalidasAntesComponent } from './componentes/reportes/asistencia/salidas-antes/salidas-antes.component';
import { ReporteResumenAsistenciaComponent } from './componentes/reportes/asistencia/reporte-resumen-asistencia/reporte-resumen-asistencia.component';
import { ReportePlanificacionHorariaComponent } from './componentes/reportes/asistencia/reporte-planificacion-horaria/reporte-planificacion-horaria.component';
// REPORTE  --TIMBRES
import { ReporteTimbresMultiplesComponent } from './componentes/reportes/timbres/reporte-timbres-multiples/reporte-timbres-multiples.component';
import { TimbreMrlComponent } from './componentes/reportes/timbres/timbre-mrl/timbre-mrl.component';
import { TimbreAbiertosComponent } from './componentes/reportes/timbres/timbre-abiertos/timbre-abiertos.component';
import { TimbreIncompletoComponent } from './componentes/reportes/timbres/timbre-incompleto/timbre-incompleto.component';
// REPORTE  --MODULO PERMISOS
import { ReportePermisosComponent } from './componentes/reportes/modulos/reporte-permisos/reporte-permisos.component';
// REPORTE  --MODULO VACACIONES
import { ReporteKardexComponent } from './componentes/reportes/modulos/vacaciones/reporte-kardex/reporte-kardex.component';
import { SolicitudVacacionComponent } from './componentes/reportes/modulos/vacaciones/solicitud-vacacion/solicitud-vacacion.component';
// REPORTE  --MODULO HORAS EXTRAS
import { ReporteHorasPedidasComponent } from './componentes/reportes/modulos/horasExtras/reporte-horas-pedidas/reporte-horas-pedidas.component';
import { ReporteHorasExtrasComponent } from './componentes/reportes/modulos/horasExtras/reporte-horas-extras/reporte-horas-extras.component';
import { HoraExtraMacroComponent } from './componentes/reportes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/reportes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
// REPORTE  --MODULO APLICACION MOVIL
import { TimbreVirtualComponent } from './componentes/reportes/modulos/timbre-virtual/timbre-virtual.component';
// REPORTE  --MODULO TIMBRE VIRTUAL
import { TimbreSistemaComponent } from './componentes/reportes/modulos/timbre-sistema/timbre-sistema.component';
// REPORTE  --MODULO ALIMENTACION
import { AlimentosGeneralComponent } from './componentes/reportes/modulos/alimentacion/alimentos-general/alimentos-general.component';
import { DetallePlanificadosComponent } from './componentes/reportes/modulos/alimentacion/detalle-planificados/detalle-planificados.component';
import { AlimentosInvitadosComponent } from './componentes/reportes/modulos/alimentacion/alimentos-invitados/alimentos-invitados.component';
// REPORTE  --ANALISIS DATOS
import { AnalisisDatosComponent } from './componentes/reportes/analisis-datos/analisis-datos.component';
// REPORTE  --AUDITORIA
import { AuditoriaSistemaComponent } from './componentes/reportes/auditoria/auditoria-sistema/auditoria-sistema.component';
// VERIFICAR SU USO
import { MetricaAtrasosComponent } from './componentes/graficas/graficas-micro/metrica-atrasos/metrica-atrasos.component';
import { MetricaHorasExtrasComponent } from './componentes/graficas/graficas-micro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaPermisosComponent } from './componentes/graficas/graficas-micro/metrica-permisos/metrica-permisos.component';
import { MetricaVacacionesComponent } from './componentes/graficas/graficas-micro/metrica-vacaciones/metrica-vacaciones.component';
import { AsistenciaConsolidadoComponent } from './componentes/reportes/asistencia/reporte-asistencia-consolidado/asistencia-consolidado.component';
import { ReporteEntradaSalidaComponent } from './componentes/reportes/asistencia/reporte-entrada-salida/reporte-entrada-salida.component';
import { ReportePuntualidadComponent } from './componentes/reportes/asistencia/reporte-puntualidad/reporte-puntualidad.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/reportes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { SalidasAntesMacroComponent } from './componentes/reportes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { InasistenciaMacroComponent } from './componentes/reportes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/reportes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { AsistenciaMacroComponent } from './componentes/reportes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { RetrasosMacroComponent } from './componentes/reportes/graficas-macro/retrasos-macro/retrasos-macro.component';

const routes: Routes = [

  // PAGINA INICIO SESION
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ACCESO A RUTAS DE INICIO DE SESION
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'olvidar-contrasenia', component: OlvidarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'confirmar-contrasenia/:token', component: ConfirmarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },

  // PANTALLA INICIAL
  { path: 'recuperar-frase/:token', component: RecuperarFraseComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'frase-olvidar', component: OlvidarFraseComponent, canActivate: [AuthGuard], data: { log: false } },

  // PAGINA PRINCIPAL
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  // CONFIGURACION --PARAMETRIZACION
  { path: 'vistaEmpresa', component: VerEmpresaComponent, canActivate: [AuthGuard] },
  { path: 'parametros', component: ListarParametroComponent, canActivate: [AuthGuard] },
  { path: 'configurarCorreo', component: ConfiguracionComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: VistaRolesComponent, canActivate: [AuthGuard] },
  { path: 'listarRegimen', component: ListarRegimenComponent, canActivate: [AuthGuard] },
  { path: 'modalidaLaboral', component: CatModalidaLaboralComponent, canActivate: [AuthGuard] },
  { path: 'tipoCargos', component: CatTipoCargosComponent, canActivate: [AuthGuard] },

  // CONFIGURACION  --LOCALIZACION
  { path: 'provincia', component: PrincipalProvinciaComponent, canActivate: [AuthGuard] },
  { path: 'listarCiudades', component: ListarCiudadComponent, canActivate: [AuthGuard] },
  { path: 'sucursales', component: ListaSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'departamento', component: PrincipalDepartamentoComponent, canActivate: [AuthGuard] },

  // USUARIOS
  { path: 'codigo', component: ConfigurarCodigoComponent, canActivate: [AuthGuard] },
  { path: 'genero', component: ListarGeneroComponent, canActivate: [AuthGuard] },
  { path: 'nacionalidad', component: ListarNacionalidadComponent, canActivate: [AuthGuard] },
  { path: 'estado-civil', component: ListarEstadoCivilComponent, canActivate: [AuthGuard] },
  { path: 'nivelTitulos', component: ListarNivelTitulosComponent, canActivate: [AuthGuard] },
  { path: 'titulos', component: ListarTitulosComponent, canActivate: [AuthGuard] },
  { path: 'discapacidades', component: CatDiscapacidadComponent, canActivate: [AuthGuard] },
  { path: 'vacunas', component: CatVacunasComponent, canActivate: [AuthGuard] },
  { path: 'empleado', component: ListaEmpleadosComponent, canActivate: [AuthGuard] },
  { path: 'verEmpleado/:id', component: VerEmpleadoComponent, canActivate: [AuthGuard] },
  { path: 'registrarEmpleado', component: RegistroComponent, canActivate: [AuthGuard] },
  { path: 'cargarPlantilla', component: CargarPlantillaComponent, canActivate: [AuthGuard] },
  { path: 'actualizarInformacion', component: ActualizacionInformacionComponent, canActivate: [AuthGuard] },
  { path: 'administrarInformacion', component: PrincipalSucursalUsuarioComponent, canActivate: [AuthGuard] },

  // HORARIOS
  { path: 'listarFeriados', component: ListarFeriadosComponent, canActivate: [AuthGuard] },
  { path: 'horario', component: PrincipalHorarioComponent, canActivate: [AuthGuard] },
  { path: 'horariosMultiples', component: HorarioMultipleEmpleadoComponent, canActivate: [AuthGuard] },
  { path: 'asistencia', component: BuscarAsistenciaComponent, canActivate: [AuthGuard] },

  // MODULO  --PERMISOS
  { path: 'verTipoPermiso', component: VistaElementosComponent, canActivate: [AuthGuard] },
  { path: 'permisosMultiples', component: PermisosMultiplesEmpleadosComponent, canActivate: [AuthGuard] },
  { path: 'permisos-solicitados', component: ListarEmpleadoPermisoComponent, canActivate: [AuthGuard] },

  // MODULO  --VACACIONES
  { path: 'vacaciones-solicitados', component: ListarVacacionesComponent, canActivate: [AuthGuard] },

  // MODULO  --HORAS EXTRAS
  { path: 'listaHorasExtras', component: ListaHorasExtrasComponent, canActivate: [AuthGuard] },
  { path: 'planificaHoraExtra', component: ListaEmplePlanHoraEComponent, canActivate: [AuthGuard] },
  { path: 'listadoPlanificaciones', component: ListaPlanificacionesComponent, canActivate: [AuthGuard] },
  { path: 'horas-extras-solicitadas', component: ListaPedidoHoraExtraComponent, canActivate: [AuthGuard] },

  // MODULO  --ALIMENTACION
  { path: 'listarTipoComidas', component: ListarTipoComidasComponent, canActivate: [AuthGuard] },
  { path: 'alimentacion', component: PlanComidasComponent, canActivate: [AuthGuard] },
  { path: 'listaPlanComida', component: ListarPlanificacionComponent, canActivate: [AuthGuard] },
  { path: 'listaSolicitaComida', component: ListarSolicitudComponent, canActivate: [AuthGuard] },

  // MODULO  --ACCION PERSONAL
  { path: 'proceso', component: PrincipalProcesoComponent, canActivate: [AuthGuard] },
  { path: 'acciones-personal', component: ListarTipoAccionComponent, canActivate: [AuthGuard] },
  { path: 'pedidoAccion', component: CrearPedidoAccionComponent, canActivate: [AuthGuard] },
  { path: 'listaPedidos', component: ListarPedidoAccionComponent, canActivate: [AuthGuard] },
  { path: 'listaGrados', component: GradosComponent, canActivate: [AuthGuard]},
  { path: 'grupo-ocupacional', component: GrupoOcupacionalComponent, canActivate: [AuthGuard]},
  { path: 'IngresarRegistros', component: IngresarRegistrosComponent, canActivate: [AuthGuard] },
  
  // MODULO  --GEOLOCALIZACION
  { path: 'coordenadas', component: ListarCoordenadasComponent, canActivate: [AuthGuard] },

  // MODULO  --TIMBRE VIRTUAL
  { path: 'timbresWeb', component: ListaWebComponent, canActivate: [AuthGuard] },
  { path: 'timbres-personal', component: TimbreWebComponent, canActivate: [AuthGuard] },
  { path: 'configurar-timbre-web', component: OpcionesTimbreWebComponent, canActivate: [AuthGuard] },

  // MODULO  --APLICACION MOVIL
  { path: 'app-movil', component: ListaAppComponent, canActivate: [AuthGuard] },
  { path: 'registro-dispositivos', component: RegistroDispositivosComponent, canActivate: [AuthGuard] },
  { path: 'configurar-timbre', component: ConfigurarOpcionesTimbresComponent, canActivate: [AuthGuard] },

  // TIMBRES
  { path: 'listarRelojes', component: ListarRelojesComponent, canActivate: [AuthGuard] },
  { path: 'registrarRelojes', component: RelojesComponent, canActivate: [AuthGuard] },
  { path: 'timbres-admin', component: TimbreAdminComponent, canActivate: [AuthGuard] },
  { path: 'timbres-multiples', component: TimbreMultipleComponent, canActivate: [AuthGuard] },
  { path: 'buscar-timbre', component: BuscarTimbreComponent, canActivate: [AuthGuard] },

  // NOTIFICACIONES
  { path: 'configurarNotificaciones', component: ListaNotificacionComponent, canActivate: [AuthGuard] },
  { path: 'archivos', component: VerDocumentosComponent, canActivate: [AuthGuard] },
  { path: 'archivos/:filename', component: ListaArchivosComponent, canActivate: [AuthGuard] },
  { path: 'mensaje_notificaciones', component: MensajesNotificacionesComponent, canActivate: [AuthGuard] },
  { path: 'comunicados', component: ComunicadosComponent, canActivate: [AuthGuard] },
  { path: 'listaAllNotificaciones', component: AdministradorTodasComponent, canActivate: [AuthGuard] },
  { path: 'listaNotifacionUsuario', component: PorUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'lista-notificaciones', component: RealtimeNotificacionComponent, canActivate: [AuthGuard] },
  { path: 'lista-avisos', component: RealtimeAvisosComponent, canActivate: [AuthGuard] },
  { path: 'configuraciones-alertas/:id', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'ver-permiso/:id', component: VerEmpleadoPermisoComponent, canActivate: [AuthGuard] },
  { path: 'ver-vacacion/:id', component: VerVacacionComponent, canActivate: [AuthGuard] },
  { path: 'ver-hora-extra/:id', component: VerPedidoHoraExtraComponent, canActivate: [AuthGuard] },

  // REPORTES  --GENERALES
  { path: 'reporteEmpleados', component: ReporteEmpleadosComponent, canActivate: [AuthGuard] },
  { path: 'lista-vacunados', component: VacunaMultipleComponent, canActivate: [AuthGuard] },

  // REPORTES  --ASISTENCIA
  { path: 'reporte-faltas', component: ReporteFaltasComponent, canActivate: [AuthGuard] },
  { path: 'reporte-atrasos-multiples', component: ReporteAtrasosMultiplesComponent, canActivate: [AuthGuard] },
  { path: 'reporte-horas-trabajadas', component: ReporteHorasTrabajadasComponent, canActivate: [AuthGuard] },
  { path: 'tiempo-alimentacion', component: ReporteTiempoAlimentacionComponent, canActivate: [AuthGuard] },
  { path: 'salidas-anticipadas', component: SalidasAntesComponent, canActivate: [AuthGuard] },
  { path: 'reporte-resumen-asistencia', component: ReporteResumenAsistenciaComponent, canActivate: [AuthGuard] },
  { path: 'reporte-planificacion-horaria', component: ReportePlanificacionHorariaComponent, canActivate: [AuthGuard] },

  // REPORTE  --TIMBRES
  { path: 'reporte-timbres-multiples', component: ReporteTimbresMultiplesComponent, canActivate: [AuthGuard] },
  { path: 'reporte-timbre-mrl', component: TimbreMrlComponent, canActivate: [AuthGuard] },
  { path: 'reporte-timbre-abierto', component: TimbreAbiertosComponent, canActivate: [AuthGuard] },
  { path: 'reporte-timbre-incompleto', component: TimbreIncompletoComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO PERMISOS
  { path: 'reportePermisos', component: ReportePermisosComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO VACACIONES
  { path: 'reporteKardex', component: ReporteKardexComponent, canActivate: [AuthGuard] },
  { path: 'solicitud-vacacion', component: SolicitudVacacionComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO HORAS EXTRAS
  { path: 'horas/extras', component: ReporteHorasPedidasComponent, canActivate: [AuthGuard] },
  { path: 'reporteHorasExtras', component: ReporteHorasExtrasComponent, canActivate: [AuthGuard] },
  { path: 'macro/hora-extra', component: HoraExtraMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/jornada-vs-hora-extra', component: JornadaVsHoraExtraMacroComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO APLICACION MOVIL
  { path: 'reporte-timbre-reloj-virtual', component: TimbreVirtualComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO TIMBRE VIRTUAL
  { path: 'reporte-timbre-sistema', component: TimbreSistemaComponent, canActivate: [AuthGuard] },

  // REPORTE  --MODULO ALIMENTACION
  { path: 'alimentosGeneral', component: AlimentosGeneralComponent, canActivate: [AuthGuard] },
  { path: 'alimentosDetallado', component: DetallePlanificadosComponent, canActivate: [AuthGuard] },
  { path: 'alimentosInvitados', component: AlimentosInvitadosComponent, canActivate: [AuthGuard] },

  // REPORTE  --ANALISIS DATOS
  { path: 'analisisDatos', component: AnalisisDatosComponent, canActivate: [AuthGuard] },

  // REPORTE  --AUDITORIA
  { path: 'reporte-auditoria', component: AuditoriaSistemaComponent, canActivate: [AuthGuard] },

  // VERIFICAR SU USO
  { path: 'macro/user/atrasos', component: MetricaAtrasosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/horas-extras', component: MetricaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/permisos', component: MetricaPermisosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/vacaciones', component: MetricaVacacionesComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'reporteAsistenciaConsolidado', component: AsistenciaConsolidadoComponent, canActivate: [AuthGuard] },
  { path: 'reporteEntradaSalida', component: ReporteEntradaSalidaComponent, canActivate: [AuthGuard] },
  { path: 'reporte-puntualidad', component: ReportePuntualidadComponent, canActivate: [AuthGuard] },
  { path: 'macro/tiempo-jornada-vs-hora-ext', component: TiempoJornadaVsHoraExtMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/salidas-antes', component: SalidasAntesMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/inasistencia', component: InasistenciaMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/marcaciones', component: MarcacionesEmpMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/asistencia', component: AsistenciaMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/retrasos', component: RetrasosMacroComponent, canActivate: [AuthGuard] },

  // VERIFICAR SU USO
  { path: 'macro/user/atrasos', component: MetricaAtrasosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/horas-extras', component: MetricaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/permisos', component: MetricaPermisosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/vacaciones', component: MetricaVacacionesComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'reporteAsistenciaConsolidado', component: AsistenciaConsolidadoComponent, canActivate: [AuthGuard] },
  { path: 'reporteEntradaSalida', component: ReporteEntradaSalidaComponent, canActivate: [AuthGuard] },
  { path: 'reporte-puntualidad', component: ReportePuntualidadComponent, canActivate: [AuthGuard] },
  { path: 'macro/tiempo-jornada-vs-hora-ext', component: TiempoJornadaVsHoraExtMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/salidas-antes', component: SalidasAntesMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/inasistencia', component: InasistenciaMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/marcaciones', component: MarcacionesEmpMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/asistencia', component: AsistenciaMacroComponent, canActivate: [AuthGuard] },
  { path: 'macro/retrasos', component: RetrasosMacroComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule, CommonModule]
})

export class AppRoutingModule { }
