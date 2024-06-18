import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling'

import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

// COMPONENTES ADMINISTRADOR
import { VistaRolesComponent } from './componentes/catalogos/catRoles/vista-roles/vista-roles.component';
import { LoginComponent } from './componentes/iniciarSesion/login/login.component';
import { RegistroComponent } from './componentes/empleado/datos-empleado/registro/registro.component';
import { ListaEmpleadosComponent } from './componentes/empleado/datos-empleado/lista-empleados/lista-empleados.component';
import { TitulosComponent } from './componentes/catalogos/catTitulos/tituloProfesional/titulos/titulos.component';
import { DiscapacidadComponent } from './componentes/empleado/discapacidad/discapacidad.component';
import { HomeComponent } from './componentes/home/home.component';
import { RegistroRolComponent } from './componentes/catalogos/catRoles/registro-rol/registro-rol.component';
import { VerEmpleadoComponent } from './componentes/empleado/ver-empleado/ver-empleado.component';
import { SeleccionarRolPermisoComponent } from './componentes/catalogos/catRoles/seleccionar-rol-permiso/seleccionar-rol-permiso.component';
import { PrincipalHorarioComponent } from './componentes/catalogos/catHorario/horario/principal-horario/principal-horario.component'
import { RegistroHorarioComponent } from './componentes/catalogos/catHorario/horario/registro-horario/registro-horario.component'
import { PrincipalProvinciaComponent } from './componentes/catalogos/catProvincia/listar-provincia/principal-provincia.component';
import { RegistroProvinciaComponent } from './componentes/catalogos/catProvincia/registro-provincia/registro-provincia.component';
import { PrincipalProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/principal-proceso/principal-proceso.component';
import { RegistroProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/registro-proceso/registro-proceso.component';
import { HorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/registrar-horas-extras/horas-extras.component';
import { RegimenComponent } from './componentes/catalogos/catRegimen/regimen/regimen.component';
import { TipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/tipo-comidas/tipo-comidas.component';
import { RelojesComponent } from './componentes/catalogos/catRelojes/relojes/relojes.component';
import { ListarFeriadosComponent } from './componentes/catalogos/catFeriados/feriados/listar-feriados/listar-feriados.component';
import { PrincipalDepartamentoComponent } from './componentes/catalogos/catDepartamentos/listar-departamento/principal-departamento.component';
import { RegistroDepartamentoComponent } from './componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { RegistrarFeriadosComponent } from './componentes/catalogos/catFeriados/feriados/registrar-feriados/registrar-feriados.component';
import { EditarFeriadosComponent } from './componentes/catalogos/catFeriados/feriados/editar-feriados/editar-feriados.component';
import { ListarRegimenComponent } from './componentes/catalogos/catRegimen/listar-regimen/listar-regimen.component';
import { ListarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { ListarRelojesComponent } from './componentes/catalogos/catRelojes/listar-relojes/listar-relojes.component';
import { TituloEmpleadoComponent } from './componentes/empleado/titulos/titulo-empleado/titulo-empleado.component';
import { RegistrarCiudadComponent } from './componentes/catalogos/catCiudad/registrar-ciudad/registrar-ciudad.component';
import { AsignarCiudadComponent } from './componentes/catalogos/catFeriados/ciudad-feriados/asignar-ciudad/asignar-ciudad.component';
import { RegistroContratoComponent } from './componentes/empleado/contrato/registro-contrato/registro-contrato.component';
import { EmplCargosComponent } from './componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { ListarTitulosComponent } from './componentes/catalogos/catTitulos/tituloProfesional/listar-titulos/listar-titulos.component';
import { ListarCiudadFeriadosComponent } from './componentes/catalogos/catFeriados/ciudad-feriados/listar-ciudad-feriados/listar-ciudad-feriados.component';
import { ListaSucursalesComponent } from './componentes/catalogos/catSucursal/lista-sucursales/lista-sucursales.component';
import { RegistrarSucursalesComponent } from './componentes/catalogos/catSucursal/registrar-sucursales/registrar-sucursales.component';
import { RegistroPlanHorarioComponent } from './componentes/horarios/horarios-rotativos/registro-plan-horario/registro-plan-horario.component';
import { RegistroAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { RegistoEmpleadoHorarioComponent } from './componentes/horarios/rango-fechas/registo-empleado-horario/registo-empleado-horario.component';
import { DetalleCatHorarioComponent } from './componentes/catalogos/catHorario/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { EditarRelojComponent } from './componentes/catalogos/catRelojes/editar-reloj/editar-reloj.component';
import { EditarRolComponent } from './componentes/catalogos/catRoles/editar-rol/editar-rol.component';
import { EditarRegimenComponent } from './componentes/catalogos/catRegimen/editar-regimen/editar-regimen.component';
import { EditarDepartamentoComponent } from './componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { VerDepartamentoComponent } from './componentes/catalogos/catDepartamentos/ver-departamento/ver-departamento.component';
import { VerListadoNivelComponent } from './componentes/catalogos/catDepartamentos/ver-listado-nivel/ver-listado-nivel.component';
import { RegistrarNivelDepartamentoComponent } from './componentes/catalogos/catDepartamentos/registro-nivel-departamento/registrar-nivel-departamento.component';
import { PlanificacionMultipleComponent } from './componentes/horarios/horarios-rotativos/planificacion-multiple/planificacion-multiple.component';
import { VerHorarioDetalleComponent } from './componentes/catalogos/catHorario/detalle/ver-horario-detalle/ver-horario-detalle.component';
import { EditarHorarioComponent } from './componentes/catalogos/catHorario/horario/editar-horario/editar-horario.component';
import { AutorizacionesComponent } from './componentes/autorizaciones/autorizaciones/autorizaciones.component';
import { EditarTitulosComponent } from './componentes/catalogos/catTitulos/tituloProfesional/editar-titulos/editar-titulos.component';
import { EditarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { EditarEmpleadoComponent } from './componentes/empleado/datos-empleado/editar-empleado/editar-empleado.component';
import { EditarTituloComponent } from './componentes/empleado/titulos/editar-titulo/editar-titulo.component';
import { OlvidarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/confirmar-contrasenia/confirmar-contrasenia.component';
import { EditarEmpresaComponent } from './componentes/catalogos/catEmpresa/editar-empresa/editar-empresa.component';
import { EditarSucursalComponent } from './componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { EditarCatProcesosComponent } from './componentes/modulos/accionesPersonal/catProcesos/editar-cat-procesos/editar-cat-procesos.component';
import { MetodosComponent } from './componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarContratoComponent } from './componentes/empleado/contrato/editar-contrato/editar-contrato.component';
import { EditarCargoComponent } from './componentes/empleado/cargo/editar-cargo/editar-cargo.component';
import { RegistrarTimbreComponent } from './componentes/modulos/timbreWeb/registrar-timbre/registrar-timbre.component';
import { RegistrarAsistenciaComponent } from './componentes/horarios/asistencia/registrar-asistencia/registrar-asistencia.component';
import { EditarEstadoAutorizaccionComponent } from './componentes/autorizaciones/editar-estado-autorizaccion/editar-estado-autorizaccion.component';
import { EditarEstadoVacacionAutoriacionComponent } from './componentes/autorizaciones/editar-estado-vacacion-autoriacion/editar-estado-vacacion-autoriacion.component';
import { SubirDocumentoComponent } from './componentes/documentos/subir-documento/subir-documento.component';
import { VerDocumentosComponent } from './componentes/documentos/ver-documentos/ver-documentos.component';
import { SettingsComponent } from './componentes/administracionGeneral/configuracion-notificaciones/settings/settings.component';
import { VacacionAutorizacionesComponent } from './componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { HoraExtraAutorizacionesComponent } from './componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { EditarEstadoHoraExtraAutorizacionComponent } from './componentes/autorizaciones/editar-estado-hora-extra-autorizacion/editar-estado-hora-extra-autorizacion.component';
import { EditarCiudadComponent } from './componentes/catalogos/catFeriados/ciudad-feriados/editar-ciudad/editar-ciudad.component';
import { EditarPlanificacionComponent } from './componentes/horarios/horarios-rotativos/editar-planificacion/editar-planificacion.component';
import { EditarAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/editar-autorizacion-depa/editar-autorizacion-depa.component';
import { EditarDetalleCatHorarioComponent } from './componentes/catalogos/catHorario/detalle/editar-detalle-cat-horario/editar-detalle-cat-horario.component';
import { VerDipositivoComponent } from './componentes/catalogos/catRelojes/ver-dipositivo/ver-dipositivo.component';
import { ConfigurarCodigoComponent } from './componentes/administracionGeneral/configurar-codigo/configurar-codigo.component';
import { VerRegimenComponent } from './componentes/catalogos/catRegimen/ver-regimen/ver-regimen.component';
import { ListaHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { EditarHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/editar-horas-extras/editar-horas-extras.component';
import { VerHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/ver-horas-extras/ver-horas-extras.component';
import { VerSucursalComponent } from './componentes/catalogos/catSucursal/ver-sucursal/ver-sucursal.component';
import { VerEmpresaComponent } from './componentes/catalogos/catEmpresa/ver-empresa/ver-empresa.component';
import { LogosComponent } from './componentes/catalogos/catEmpresa/logos/logos.component';

// COMPONENTES EMPLEADO
import { DatosEmpleadoComponent } from './componentes/rolEmpleado/datos-empleado/datos-empleado.component';
import { CambiarContrasenaComponent } from './componentes/iniciarSesion/contrasenia/cambiar-contrasena/cambiar-contrasena.component';
import { ContratoCargoEmpleadoComponent } from './componentes/rolEmpleado/contrato-cargo-empleado/contrato-cargo-empleado.component';
import { HorariosEmpleadoComponent } from './componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VacacionesEmpleadoComponent } from './componentes/rolEmpleado/vacacion-empleado/vacaciones-empleado/vacaciones-empleado.component';
import { SolicitarPermisosEmpleadoComponent } from './componentes/rolEmpleado/permisos-empleado/solicitar-permisos-empleado/solicitar-permisos-empleado.component';
import { VerDocumentacionComponent } from './componentes/rolEmpleado/ver-documentacion/ver-documentacion.component';
import { InformacionJefeComponent } from './componentes/rolEmpleado/informacion-jefe/informacion-jefe.component';
import { HomeEmpleadoComponent } from './componentes/rolEmpleado/home-empleado/home-empleado.component';
import { HoraExtraEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/hora-extra-empleado/hora-extra-empleado.component';
import { PlanificacionComidasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/planificacion-comidas-empleado/planificacion-comidas-empleado.component';
import { ProcesosEmpleadoComponent } from './componentes/rolEmpleado/procesos-empleado/procesos-empleado.component';
import { AutorizaEmpleadoComponent } from './componentes/rolEmpleado/autoriza-empleado/autoriza-empleado.component';
import { CancelarHoraExtraComponent } from './componentes/rolEmpleado/horasExtras-empleado/cancelar-hora-extra/cancelar-hora-extra.component';

// CAMBIAR EL LOCAL DE LA APP
import { registerLocaleData } from '@angular/common';
import localEsEC from '@angular/common/locales/es-EC';
registerLocaleData(localEsEC);

// PIE DE PAGINA Y NAVEGABILIDAD
import { FooterComponent } from './componentes/iniciarSesion/footer/footer.component';



// CONEXIÓN REST SERVICIOS POSTGRES
import { RolesService } from './servicios/catalogos/catRoles/roles.service';
import { LoginService } from './servicios/login/login.service';
import { TituloService } from './servicios/catalogos/catTitulos/titulo.service';
import { EmpleadoService } from './servicios/empleado/empleadoRegistro/empleado.service'
import { DiscapacidadService } from './servicios/discapacidad/discapacidad.service';
import { ProvinciaService } from './servicios/catalogos/catProvincias/provincia.service';
import { HorarioService } from './servicios/catalogos/catHorarios/horario.service';
import { HorasExtrasService } from './servicios/catalogos/catHorasExtras/horas-extras.service';
import { DepartamentosService } from './servicios/catalogos/catDepartamentos/departamentos.service';
import { RolPermisosService } from './servicios/catalogos/catRolPermisos/rol-permisos.service';
import { TipoPermisosService } from './servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { CiudadFeriadosService } from './servicios/ciudadFeriados/ciudad-feriados.service';
import { EmpleadoHorariosService } from './servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { EmplCargosService } from './servicios/empleado/empleadoCargo/empl-cargos.service';
import { CiudadService } from './servicios/ciudad/ciudad.service';
import { TokenInterceptorService } from './servicios/login/token-interceptor.service';
import { SpinnerService } from './servicios/intercepto/spinner.service';

import { GraficasService } from './servicios/graficas/graficas.service';
import { ProgressService } from './componentes/administracionGeneral/progress/progress.service';


// SEGURIDAD
import { AuthGuard } from "./servicios/guards/auth.guard";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ConfirmarDesactivadosComponent } from './componentes/empleado/datos-empleado/confirmar-desactivados/confirmar-desactivados.component';
import { PlanHoraExtraAutorizaComponent } from './componentes/autorizaciones/plan-hora-extra-autoriza/plan-hora-extra-autoriza.component';
import { ColoresEmpresaComponent } from './componentes/catalogos/catEmpresa/colores-empresa/colores-empresa.component';
import { AyudaComponent } from './componentes/administracionGeneral/preferecias/ayuda/ayuda.component';

import { CorreoEmpresaComponent } from './componentes/administracionGeneral/correo/correo-empresa/correo-empresa.component';
import { ListaArchivosComponent } from './componentes/documentos/lista-archivos/lista-archivos.component';
import { EmplLeafletComponent } from './componentes/modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { TimbreWebComponent } from './componentes/modulos/timbreWeb/timbre-empleado/timbre-web.component';
import { TimbreAdminComponent } from './componentes/timbres/timbre-admin/timbre-admin.component';
import { CrearTimbreComponent } from './componentes/timbres/acciones-timbres/crear-timbre/crear-timbre.component';
import { SeguridadComponent } from './componentes/administracionGeneral/frase-seguridad/seguridad/seguridad.component';
import { TipoSeguridadComponent } from './componentes/catalogos/catEmpresa/tipo-seguridad/tipo-seguridad.component';
import { FraseSeguridadComponent } from './componentes/administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { MetricaVacacionesComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-vacaciones/metrica-vacaciones.component';
import { MetricaHorasExtrasComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaAtrasosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-atrasos/metrica-atrasos.component';
import { MetricaPermisosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-permisos/metrica-permisos.component';
import { DetalleMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/detalle-menu/detalle-menu.component';
import { VistaMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/vista-menu/vista-menu.component';
import { EditarDetalleMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/editar-detalle-menu/editar-detalle-menu.component';
import { ConfigReportFirmasHorasExtrasComponent } from './componentes/reportes/configuracion-reportes/config-report-firmas-horas-extras/config-report-firmas-horas-extras.component';
import { AccionesTimbresComponent } from './componentes/administracionGeneral/preferecias/acciones-timbres/acciones-timbres.component';
import { HorariosMultiplesComponent } from './componentes/horarios/rango-fechas/horarios-multiples/horarios-multiples.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';

import { ConfigEmpleadosComponent } from './componentes/reportes/configuracion-reportes/config-report-empleados/config-empleados.component';
import { ConfigAsistenciaComponent } from './componentes/reportes/configuracion-reportes/config-report-asistencia/config-asistencia.component';

// Imagen upload
//import { ImageUploadModule } from 'angular2-image-upload';

//Modulos Compartidos
import { MaterialModule } from './material/material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FiltrosModule } from './filtros/filtros.module';

import { ReportesModule } from './componentes/reportes/reportes.module';

//enviroment
import { environment } from 'src/environments/environment';

import { ProgressComponent } from './componentes/administracionGeneral/progress/progress.component';
import { PlantillaReportesService } from './componentes/reportes/plantilla-reportes.service';

import { CrearVacunaComponent } from './componentes/empleado/vacunacion/crear-vacuna/crear-vacuna.component';
import { EditarVacunaComponent } from './componentes/empleado/vacunacion/editar-vacuna/editar-vacuna.component';
import { TimbreMultipleComponent } from './componentes/timbres/timbre-multiple/timbre-multiple.component';
import { CambiarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/cambiar-frase/cambiar-frase.component';
import { RecuperarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/recuperar-frase/recuperar-frase.component';

import { OlvidarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/olvidar-frase/olvidar-frase.component';
import { TipoVacunaComponent } from './componentes/empleado/vacunacion/tipo-vacuna/tipo-vacuna.component';
import { ListarParametroComponent } from './componentes/administracionGeneral/parametrizacion/parametros/listar-parametro/listar-parametro.component';
import { EditarParametroComponent } from './componentes/administracionGeneral/parametrizacion/parametros/editar-parametro/editar-parametro.component';
import { VerParametroComponent } from './componentes/administracionGeneral/parametrizacion/detalle-parametros/ver-parametro/ver-parametro.component';
import { CrearDetalleParametroComponent } from './componentes/administracionGeneral/parametrizacion/detalle-parametros/crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from './componentes/administracionGeneral/parametrizacion/detalle-parametros/editar-detalle-parametro/editar-detalle-parametro.component';
import { CrearCoordenadasComponent } from './componentes/modulos/geolocalizacion/crear-coordenadas/crear-coordenadas.component';
import { ListarCoordenadasComponent } from './componentes/modulos/geolocalizacion/listar-coordenadas/listar-coordenadas.component';
import { EditarCoordenadasComponent } from './componentes/modulos/geolocalizacion/editar-coordenadas/editar-coordenadas.component';
import { VerCoordenadasComponent } from './componentes/modulos/geolocalizacion/ver-coordenadas/ver-coordenadas.component';
import { ComunicadosComponent } from './componentes/administracionGeneral/comunicados/comunicados.component';
import { RegistrarBirthdayComponent } from './componentes/administracionGeneral/birthday/registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from './componentes/administracionGeneral/birthday/editar-birthday/editar-birthday.component';
import { VerBirthdayComponent } from './componentes/administracionGeneral/birthday/ver-birthday/ver-birthday.component';
import { ConfiguracionComponent } from './componentes/administracionGeneral/correo/configuracion/configuracion.component';
import { ListaNotificacionComponent } from './componentes/administracionGeneral/configuracion-notificaciones/multiple/lista-empleados/listaNotificacion.component';
import { ConfiguracionNotificacionComponent } from './componentes/administracionGeneral/configuracion-notificaciones/multiple/configuracion/configuracionNotificacion.component';
import { CancelarPermisoComponent } from './componentes/rolEmpleado/permisos-empleado/cancelar-permiso/cancelar-permiso.component';
import { CancelarVacacionesComponent } from './componentes/rolEmpleado/vacacion-empleado/cancelar-vacaciones/cancelar-vacaciones.component';
import { EditarVacacionesEmpleadoComponent } from './componentes/modulos/vacaciones/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { EditarHoraExtraEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { CancelarComidaComponent } from './componentes/rolEmpleado/comidas-empleado/cancelar-comida/cancelar-comida.component';
import { RegistrarNivelTitulosComponent } from './componentes/catalogos/catTitulos/nivelTitulos/registrar-nivel-titulos/registrar-nivel-titulos.component';
import { ListarNivelTitulosComponent } from './componentes/catalogos/catTitulos/nivelTitulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { EditarNivelTituloComponent } from './componentes/catalogos/catTitulos/nivelTitulos/editar-nivel-titulo/editar-nivel-titulo.component';
import { SalidasAntesMacroComponent } from './componentes/reportes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { InasistenciaMacroComponent } from './componentes/reportes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { AsistenciaMacroComponent } from './componentes/reportes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { HoraExtraMacroComponent } from './componentes/reportes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/reportes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/reportes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { RetrasosMacroComponent } from './componentes/reportes/graficas-macro/retrasos-macro/retrasos-macro.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/reportes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { ListarCiudadComponent } from './componentes/catalogos/catCiudad/listar-ciudad/listar-ciudad.component';
import { RegistrarPeriodoVComponent } from './componentes/modulos/vacaciones/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { RegistrarEmpleProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { RegistrarVacacionesComponent } from './componentes/modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { RegistroEmpleadoPermisoComponent } from './componentes/modulos/permisos/gestionar-permisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { EditarEmpleadoProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { ListarEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/listar-empleado-permiso/listar-empleado-permiso.component';
import { EditarPeriodoVacacionesComponent } from './componentes/modulos/vacaciones/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { PedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/pedido-hora-extra/pedido-hora-extra.component';
import { CalculoHoraExtraComponent } from './componentes/modulos/horasExtras/calculos/calculo-hora-extra/calculo-hora-extra.component';
import { VerEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/ver-empleado-permiso/ver-empleado-permiso.component';
import { ListarVacacionesComponent } from './componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { EstadoVacacionesComponent } from './componentes/modulos/vacaciones/estado-vacaciones/estado-vacaciones.component';
import { VerVacacionComponent } from './componentes/modulos/vacaciones/ver-vacacion/ver-vacacion.component';
import { ListaPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { VerPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
import { EstadoHoraExtraComponent } from './componentes/modulos/horasExtras/estado-hora-extra/estado-hora-extra.component';
import { EditarPlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/editar-plan-comidas/editar-plan-comidas.component';
import { HoraExtraRealComponent } from './componentes/modulos/horasExtras/calculos/hora-extra-real/hora-extra-real.component';
import { PlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/plan-hora-extra/plan-hora-extra.component';
import { ListaEmplePlanHoraEComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { TiempoAutorizadoComponent } from './componentes/modulos/horasExtras/tiempo-autorizado/tiempo-autorizado.component';
import { ListaPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-plan-hora-extra/lista-plan-hora-extra.component';
import { ListaPlanificacionesComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { EditarPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { PlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/plan-comidas/plan-comidas.component';
import { SolicitaComidaComponent } from './componentes/modulos/alimentacion/solicitar-comida/solicita-comida/solicita-comida.component';
import { AdministraComidaComponent } from './componentes/modulos/alimentacion/administra-comida/administra-comida.component';
import { CrearTipoaccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/crear-tipoaccion/crear-tipoaccion.component';
import { EditarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/editar-tipo-accion/editar-tipo-accion.component';
import { ListarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { VerTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/ver-tipo-accion/ver-tipo-accion.component';
import { ListarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { CrearPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { EditarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/editar-pedido-accion/editar-pedido-accion.component';
import { VerPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/ver-pedido-accion/ver-pedido-accion.component';
import { PermisosMultiplesComponent } from './componentes/modulos/permisos/multiples/permisos-multiples/permisos-multiples.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/modulos/permisos/multiples/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { AutorizaSolicitudComponent } from './componentes/modulos/alimentacion/autoriza-solicitud/autoriza-solicitud.component';
import { ListarSolicitudComponent } from './componentes/modulos/alimentacion/solicitar-comida/listar-solicitud/listar-solicitud.component';
import { EditarSolicitudComidaComponent } from './componentes/modulos/alimentacion/solicitar-comida/editar-solicitud-comida/editar-solicitud-comida.component';
import { ListarPlanificacionComponent } from './componentes/modulos/alimentacion/planifica-comida/listar-planificacion/listar-planificacion.component';
import { ListaAppComponent } from './componentes/modulos/appMovil/lista-app/lista-app.component';
import { ListaWebComponent } from './componentes/modulos/timbreWeb/lista-web/lista-web.component';
import { RegistroDispositivosComponent } from './componentes/modulos/appMovil/registro-dispositivos/registro-dispositivos.component';
import { DeleteRegistroDispositivoComponent } from './componentes/modulos/appMovil/delete-registro-dispositivo/delete-registro-dispositivo.component';
import { PlanificacionComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/planificacion-comidas/planificacion-comidas.component';
import { MainNavComponent } from './componentes/administracionGeneral/main-nav/main-nav.component';
import { RealtimeNotificacionComponent } from './componentes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { RealtimeAvisosComponent } from './componentes/notificaciones/realtime-avisos/realtime-avisos.component';
import { EliminarRealtimeComponent } from './componentes/notificaciones/eliminar-realtime/eliminar-realtime.component';
import { NavbarComponent } from './componentes/administracionGeneral/main-nav/navbar/navbar.component';
import { SearchComponent } from './componentes/administracionGeneral/main-nav/search/search.component';
import { ButtonNotificacionComponent } from './componentes/administracionGeneral/main-nav/button-notificacion/button-notificacion.component';
import { ButtonAvisosComponent } from './componentes/administracionGeneral/main-nav/button-avisos/button-avisos.component';
import { ButtonOpcionesComponent } from './componentes/administracionGeneral/main-nav/button-opciones/button-opciones.component';
import { MainNavService } from './componentes/administracionGeneral/main-nav/main-nav.service';
import { HorasPlanificadasEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/horas-planificadas-empleado/horas-planificadas-empleado.component';
import { ComidasSolicitadasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/comidas-solicitadas-empleado/comidas-solicitadas-empleado.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BuscarTimbreComponent } from './componentes/timbres/acciones-timbres/buscar-timbre/buscar-timbre.component';
import { EditarTimbreComponent } from './componentes/timbres/acciones-timbres/editar-timbre/editar-timbre.component';
import { VerTimbreComponent } from './componentes/timbres/acciones-timbres/ver-timbre/ver-timbre.component';

import { BuscarPlanificacionComponent } from './componentes/horarios/rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { TipoPermisosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/tipo-permisos/tipo-permisos.component';
import { VistaElementosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/listarTipoPermisos/vista-elementos.component';
import { EditarTipoPermisosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/editar-tipo-permisos/editar-tipo-permisos.component';
import { VerTipoPermisoComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/ver-tipo-permiso/ver-tipo-permiso.component';
import { EditarPermisoEmpleadoComponent } from './componentes/modulos/permisos/gestionar-permisos/editar-permiso-empleado/editar-permiso-empleado.component';
import { EliminarIndividualComponent } from './componentes/horarios/eliminar-individual/eliminar-individual.component';
import { BuscarAsistenciaComponent } from './componentes/horarios/asistencia/buscar-asistencia/buscar-asistencia.component';
import { CargarPlantillaPlanificacionComponent } from './componentes/horarios/cargar-plantillas/cargar-plantilla-planificacion/cargar-plantilla-planificacion.component';
import { PrincipalSucursalUsuarioComponent } from './componentes/empleado/sucursal-usuario/principal-sucursal-usuario/principal-sucursal-usuario.component';
import { AsignarUsuarioComponent } from './componentes/empleado/sucursal-usuario/asignar-usuario/asignar-usuario.component';
import { DefinicionPlantillaComponent } from './componentes/administracionGeneral/definicion-plantilla/definicion-plantilla.component';
import { SpinnerModule } from './componentes/spinner/spinner.module';
import { SpinnerComponent } from './componentes/spinner/spinner.component';
import { SpinnerInterceptor } from './componentes/spinner/Interceptor/spinner.interceptor';
import { CargarPlantillaComponent } from './componentes/empleado/cargar-plantilla/cargar-plantilla.component';
import { CatModalidaLaboralComponent } from './componentes/catalogos/catalogoModalidadLaboral/cat-modalida-laboral/cat-modalida-laboral.component';
import { CatTipoCargosComponent } from './componentes/catalogos/catalogoTipoCargo/listar-tipo-cargo/cat-tipo-cargos.component';
import { RegistroModalidadComponent } from './componentes/catalogos/catalogoModalidadLaboral/registro-modalidad/registro-modalidad.component';
import { EditarModalidadComponent } from './componentes/catalogos/catalogoModalidadLaboral/editar-modalidad/editar-modalidad.component';
import { RegistrarCargoComponent } from './componentes/catalogos/catalogoTipoCargo/registrar-cargo/registrar-cargo.component';
import { EditarTipoCargoComponent } from './componentes/catalogos/catalogoTipoCargo/editar-tipo-cargo/editar-tipo-cargo.component';
import { CatDiscapacidadComponent } from './componentes/catalogos/catalogoDiscapacidad/listar-discapacidad/cat-discapacidad.component';
import { RegistroDiscapacidadComponent } from './componentes/catalogos/catalogoDiscapacidad/registrar-discapacidad/registrar-discapacidad.component';
import { EditarDiscapacidadComponent } from './componentes/catalogos/catalogoDiscapacidad/editar-discapacidad/editar-discapacidad.component';
import { CatVacunasComponent } from './componentes/catalogos/catalogoVacuna/listar-vacuna/cat-vacunas.component';
import { EditarVacunasComponent } from './componentes/catalogos/catalogoVacuna/editar-vacuna/editar-vacuna.component';


//Seteo de ruta por defecto al iniciar front
let url: string | null = localStorage.getItem('empresaURL');
if (!url) {
  url = environment.url;
}
//fin seteo de ruta por defecto al iniciar front

const config: SocketIoConfig = { url: String(url), options: {} };

@NgModule({
  declarations: [
    AppComponent,
    VistaRolesComponent,
    LoginComponent,
    RegistroComponent,
    MainNavComponent,
    ListaEmpleadosComponent,
    HomeComponent,
    TitulosComponent,
    DiscapacidadComponent,
    VerEmpleadoComponent,
    RegistroRolComponent,
    SeleccionarRolPermisoComponent,
    RegimenComponent,
    TipoComidasComponent,
    RelojesComponent,
    PrincipalProvinciaComponent,
    RegistroProvinciaComponent,
    PrincipalProcesoComponent,
    RegistroProcesoComponent,
    PrincipalHorarioComponent,
    RegistroHorarioComponent,
    FooterComponent,
    HorasExtrasComponent,
    ListarFeriadosComponent,
    PrincipalDepartamentoComponent,
    RegistroDepartamentoComponent,
    RegistrarFeriadosComponent,
    TipoPermisosComponent,
    EditarFeriadosComponent,
    ListarRegimenComponent,
    ListarTipoComidasComponent,
    ListarRelojesComponent,
    TituloEmpleadoComponent,
    ListarCiudadComponent,
    RegistrarCiudadComponent,
    AsignarCiudadComponent,
    VistaElementosComponent,
    RegistroContratoComponent,
    EmplCargosComponent,
    ListarTitulosComponent,
    ListarCiudadFeriadosComponent,
    PlanificacionComidasEmpleadoComponent,
    ListaSucursalesComponent,
    RegistrarSucursalesComponent,
    RegistrarNivelTitulosComponent,
    ListarNivelTitulosComponent,
    EditarNivelTituloComponent,
    RegistrarPeriodoVComponent,
    RegistrarEmpleProcesoComponent,
    RegistrarVacacionesComponent,
    RegistroPlanHorarioComponent,
    RegistroAutorizacionDepaComponent,
    RegistroEmpleadoPermisoComponent,
    RegistoEmpleadoHorarioComponent,
    DetalleCatHorarioComponent,
    AutorizacionesComponent,
    EditarTitulosComponent,
    EditarTipoComidasComponent,
    EditarEmpresaComponent,
    EditarSucursalComponent,
    EditarCatProcesosComponent,
    EditarEmpleadoProcesoComponent,
    EditarEmpleadoComponent,
    EditarTituloComponent,
    OlvidarContraseniaComponent,
    ConfirmarContraseniaComponent,
    MetodosComponent,
    EditarContratoComponent,
    EditarCargoComponent,
    DatosEmpleadoComponent,
    CambiarContrasenaComponent,
    EditarRelojComponent,
    EditarRolComponent,
    EditarRegimenComponent,
    EditarDepartamentoComponent,
    RegistrarNivelDepartamentoComponent,
    VerDepartamentoComponent,
    VerListadoNivelComponent,
    EditarTipoPermisosComponent,
    PlanificacionMultipleComponent,
    VerHorarioDetalleComponent,
    EditarHorarioComponent,
    HomeEmpleadoComponent,
    ListarEmpleadoPermisoComponent,
    EditarPeriodoVacacionesComponent,
    RegistrarTimbreComponent,
    RegistrarAsistenciaComponent,
    PedidoHoraExtraComponent,
    CalculoHoraExtraComponent,
    InformacionJefeComponent,
    VerEmpleadoPermisoComponent,
    EditarEstadoAutorizaccionComponent,
    ListarVacacionesComponent,
    EstadoVacacionesComponent,
    VerVacacionComponent,
    EditarEstadoVacacionAutoriacionComponent,
    ContratoCargoEmpleadoComponent,
    HorariosEmpleadoComponent,
    VacacionesEmpleadoComponent,
    SolicitarPermisosEmpleadoComponent,
    RealtimeNotificacionComponent,
    SubirDocumentoComponent,
    VerDocumentosComponent,
    VerDocumentacionComponent,
    SettingsComponent,
    VacacionAutorizacionesComponent,
    ListaPedidoHoraExtraComponent,
    VerPedidoHoraExtraComponent,
    HoraExtraEmpleadoComponent,
    HoraExtraAutorizacionesComponent,
    EditarEstadoHoraExtraAutorizacionComponent,
    EstadoHoraExtraComponent,
    CancelarPermisoComponent,
    EditarCiudadComponent,
    EditarPlanificacionComponent,
    EditarPlanComidasComponent,
    EditarAutorizacionDepaComponent,
    PlanificacionComidasEmpleadoComponent,
    EditarDetalleCatHorarioComponent,
    VerDipositivoComponent,
    ProcesosEmpleadoComponent,
    AutorizaEmpleadoComponent,
    ConfigurarCodigoComponent,
    EditarPermisoEmpleadoComponent,
    CancelarHoraExtraComponent,
    EditarHoraExtraEmpleadoComponent,
    CancelarVacacionesComponent,
    EditarVacacionesEmpleadoComponent,
    VerRegimenComponent,
    VerTipoPermisoComponent,
    ListaHorasExtrasComponent,
    EditarHorasExtrasComponent,
    VerHorasExtrasComponent,
    VerSucursalComponent,
    VerEmpresaComponent,
    RegistrarBirthdayComponent,
    EditarBirthdayComponent,
    VerBirthdayComponent,
    LogosComponent,
    HoraExtraRealComponent,
    PlanHoraExtraComponent,
    ListaEmplePlanHoraEComponent,
    TiempoAutorizadoComponent,
    ConfirmarDesactivadosComponent,
    RealtimeAvisosComponent,
    EliminarRealtimeComponent,
    ListaPlanHoraExtraComponent,
    PlanHoraExtraAutorizaComponent,
    ColoresEmpresaComponent,
    ConfigEmpleadosComponent,
    ConfigAsistenciaComponent,
    AyudaComponent,
    CorreoEmpresaComponent,
    ListaPlanificacionesComponent,
    EditarPlanHoraExtraComponent,
    ListaArchivosComponent,
    EmplLeafletComponent,
    TimbreWebComponent,
    TimbreAdminComponent,
    CrearTimbreComponent,
    InasistenciaMacroComponent,
    AsistenciaMacroComponent,
    HoraExtraMacroComponent,
    JornadaVsHoraExtraMacroComponent,
    MarcacionesEmpMacroComponent,
    RetrasosMacroComponent,
    TiempoJornadaVsHoraExtMacroComponent,
    SalidasAntesMacroComponent,
    SeguridadComponent,
    TipoSeguridadComponent,
    FraseSeguridadComponent,
    PlanComidasComponent,
    MetricaVacacionesComponent,
    MetricaHorasExtrasComponent,
    MetricaAtrasosComponent,
    MetricaPermisosComponent,
    DetalleMenuComponent,
    VistaMenuComponent,
    EditarDetalleMenuComponent,

    ConfigReportFirmasHorasExtrasComponent,
    SolicitaComidaComponent,
    AdministraComidaComponent,
    CrearTipoaccionComponent,
    EditarTipoAccionComponent,
    ListarTipoAccionComponent,
    VerTipoAccionComponent,
    ListarPedidoAccionComponent,
    CrearPedidoAccionComponent,
    EditarPedidoAccionComponent,
    VerPedidoAccionComponent,
    AccionesTimbresComponent,
    PermisosMultiplesComponent,
    PermisosMultiplesEmpleadosComponent,
    HorariosMultiplesComponent,
    HorarioMultipleEmpleadoComponent,
    AutorizaSolicitudComponent,
    ListarSolicitudComponent,
    EditarSolicitudComidaComponent,
    ListarPlanificacionComponent,
    NavbarComponent,
    SearchComponent,
    ButtonNotificacionComponent,
    ButtonAvisosComponent,
    ProgressComponent,
    ButtonOpcionesComponent,

    CrearVacunaComponent,
    EditarVacunaComponent,
    TimbreMultipleComponent,
    CambiarFraseComponent,
    RecuperarFraseComponent,
    PlanificacionComidasComponent,
    ListaAppComponent,
    RegistroDispositivosComponent,
    DeleteRegistroDispositivoComponent,
    ListaWebComponent,
    OlvidarFraseComponent,
    TipoVacunaComponent,
    ListarParametroComponent,
    EditarParametroComponent,
    VerParametroComponent,
    CrearDetalleParametroComponent,
    EditarDetalleParametroComponent,
    CrearCoordenadasComponent,
    ListarCoordenadasComponent,
    EditarCoordenadasComponent,
    VerCoordenadasComponent,
    ComunicadosComponent,
    ConfiguracionComponent,
    ListaNotificacionComponent,
    ConfiguracionNotificacionComponent,
    CancelarComidaComponent,
    HorasPlanificadasEmpleadoComponent,
    ComidasSolicitadasEmpleadoComponent,
    BuscarTimbreComponent,
    EditarTimbreComponent,
    VerTimbreComponent,
    BuscarPlanificacionComponent,
    EliminarIndividualComponent,
    BuscarAsistenciaComponent,
    CargarPlantillaPlanificacionComponent,
    PrincipalSucursalUsuarioComponent,
    AsignarUsuarioComponent,
    DefinicionPlantillaComponent,
    CargarPlantillaComponent,
    CatModalidaLaboralComponent,
    CatTipoCargosComponent,
    RegistroModalidadComponent,
    EditarModalidadComponent,
    RegistrarCargoComponent,
    EditarTipoCargoComponent,
    CatDiscapacidadComponent,
    RegistroDiscapacidadComponent,
    EditarDiscapacidadComponent,
    CatVacunasComponent,
    EditarVacunasComponent

  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    SocketIoModule.forRoot(config),
    FontAwesomeModule,
    FormsModule,
    MatCardModule,
    ScrollingModule,
    FiltrosModule,
    MaterialModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReportesModule,
    SpinnerModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true
    },

    {
      provide: LOCALE_ID, useValue: 'es-EC'
    },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntl },
    LoginService,
    RolesService,
    TituloService,
    EmpleadoService,
    DiscapacidadService,
    ProvinciaService,
    HorarioService,
    HorasExtrasService,
    RolPermisosService,
    TipoPermisosService,
    DepartamentosService,
    CiudadFeriadosService,
    CiudadService,
    EmpleadoHorariosService,
    EmplCargosService,
    GraficasService,
    ProgressService,
    MainNavService,
    PlantillaReportesService,
    VerEmpleadoComponent,
    PermisosMultiplesEmpleadosComponent,
    HorarioMultipleEmpleadoComponent,
    BuscarPlanificacionComponent,
    PrincipalDepartamentoComponent,
    VerSucursalComponent,
    ListarCiudadFeriadosComponent,
    ListarRelojesComponent,
    VerDipositivoComponent,
    RelojesComponent,
    AutorizacionesComponent,
    PrincipalHorarioComponent,
    ListarTipoComidasComponent,
    PlanComidasComponent,
    ListaHorasExtrasComponent,
    VistaElementosComponent,
    ListaSucursalesComponent,
    VerEmpresaComponent,
    HorariosEmpleadoComponent
  ],

  bootstrap: [AppComponent]

})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }
