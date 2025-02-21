import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';
import { FiltrosModule } from './filtros/filtros.module';
import { MatCardModule } from '@angular/material/card';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from './material/material.module';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling'
import { MatPaginatorIntl } from '@angular/material/paginator';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
// CAMBIAR EL LOCAL DE LA APP
import { registerLocaleData } from '@angular/common';
import localEsEC from '@angular/common/locales/es-EC';
registerLocaleData(localEsEC);
// SEGURIDAD
import { AuthGuard } from './servicios/generales/guards/auth.guard';
// RUTA
import { environment } from 'src/environments/environment';
// NOTIFICACIONES EN TIEMPO REAL
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const ruta = environment.url.split("/")[2];
const config: SocketIoConfig = { url: ruta, options: {} };
// COMPONETE PRINCIPAL
import { AppComponent } from './app.component';
// COMPONENTES DE PROGRESO
import { SpinnerModule } from './componentes/generales/spinner/spinner.module';
import { SpinnerInterceptor } from './componentes/generales/spinner/Interceptor/spinner.interceptor';
// ACCESO A RUTAS DE INICIO DE SESION
import { LoginComponent } from './componentes/iniciarSesion/login/login.component';
import { OlvidarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/iniciarSesion/contrasenia/confirmar-contrasenia/confirmar-contrasenia.component';
// PIE DE PAGINA Y NAVEGABILIDAD
import { FooterComponent } from './componentes/iniciarSesion/footer/footer.component';
// PAGINA PRINCIPAL
import { HomeComponent } from './componentes/iniciarSesion/home/home.component';
// CONFIRMACION
import { MetodosComponent } from './componentes/generales/metodoEliminar/metodos.component';
// CONFIGURACION --PARAMETRIZACION
import { EditarEmpresaComponent } from './componentes/configuracion/parametrizacion/empresa/editar-empresa/editar-empresa.component';
import { LogosComponent } from './componentes/configuracion/parametrizacion/empresa/logos/logos.component';
import { VerEmpresaComponent } from './componentes/configuracion/parametrizacion/empresa/ver-empresa/ver-empresa.component';
import { VerParametroComponent } from './componentes/configuracion/parametrizacion/parametros/detalles-parametros/ver-parametro/ver-parametro.component';
import { CrearDetalleParametroComponent } from './componentes/configuracion/parametrizacion/parametros/detalles-parametros/crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from './componentes/configuracion/parametrizacion/parametros/detalles-parametros/editar-detalle-parametro/editar-detalle-parametro.component';
import { ListarParametroComponent } from './componentes/configuracion/parametrizacion/parametros/listar-parametro/listar-parametro.component';
import { ConfiguracionComponent } from './componentes/configuracion/parametrizacion/correo/configuracion/configuracion.component';
import { RegistroRolComponent } from './componentes/configuracion/parametrizacion/roles/registro-rol/registro-rol.component';
import { EditarRolComponent } from './componentes/configuracion/parametrizacion/roles/editar-rol/editar-rol.component';
import { VistaRolesComponent } from './componentes/configuracion/parametrizacion/roles/vista-roles/vista-roles.component';
import { SeleccionarRolPermisoComponent } from './componentes/configuracion/parametrizacion/roles/seleccionar-rol-permiso/seleccionar-rol-permiso.component';
import { RolPermisosMovilComponent } from './componentes/configuracion/parametrizacion/roles/rol-permisos-movil/rol-permisos-movil.component';
import { RegimenComponent } from './componentes/configuracion/parametrizacion/regimen-laboral/regimen/regimen.component';
import { ListarRegimenComponent } from './componentes/configuracion/parametrizacion/regimen-laboral/listar-regimen/listar-regimen.component';
import { VerRegimenComponent } from './componentes/configuracion/parametrizacion/regimen-laboral/ver-regimen/ver-regimen.component';
import { EditarRegimenComponent } from './componentes/configuracion/parametrizacion/regimen-laboral/editar-regimen/editar-regimen.component';
import { CatModalidaLaboralComponent } from './componentes/configuracion/parametrizacion/modalidad-laboral/cat-modalida-laboral/cat-modalida-laboral.component';
import { CatTipoCargosComponent } from './componentes/configuracion/parametrizacion/tipo-cargos/listar-tipo-cargo/cat-tipo-cargos.component';
import { ColoresEmpresaComponent } from './componentes/configuracion/parametrizacion/empresa/colores-empresa/colores-empresa.component';
import { CorreoEmpresaComponent } from './componentes/configuracion/parametrizacion/correo/correo-empresa/correo-empresa.component';
import { TipoSeguridadComponent } from './componentes/configuracion/parametrizacion/empresa/tipo-seguridad/tipo-seguridad.component';
import { MainNavComponent } from './componentes/generales/main-nav/main-nav.component';
import { NavbarComponent } from './componentes/generales/main-nav/navbar/navbar.component';
import { SearchComponent } from './componentes/generales/main-nav/search/search.component';
import { AyudaComponent } from './componentes/generales/ayuda/ayuda.component';
import { VistaMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/vista-menu/vista-menu.component';
import { RegistroModalidadComponent } from './componentes/configuracion/parametrizacion/modalidad-laboral/registro-modalidad/registro-modalidad.component';
import { EditarModalidadComponent } from './componentes/configuracion/parametrizacion/modalidad-laboral/editar-modalidad/editar-modalidad.component';
import { EditarTipoCargoComponent } from './componentes/configuracion/parametrizacion/tipo-cargos/editar-tipo-cargo/editar-tipo-cargo.component';
// CONFIGURACION  --LOCALIZACION
import { PrincipalProvinciaComponent } from './componentes/configuracion/localizacion/provincias/listar-provincia/principal-provincia.component';
import { RegistroProvinciaComponent } from './componentes/configuracion/localizacion/provincias/registro-provincia/registro-provincia.component';
import { ListarCiudadComponent } from './componentes/configuracion/localizacion/ciudades/listar-ciudad/listar-ciudad.component';
import { RegistrarCiudadComponent } from './componentes/configuracion/localizacion/ciudades/registrar-ciudad/registrar-ciudad.component';
import { EditarCiudadComponent } from './componentes/horarios/catFeriados/ciudad-feriados/editar-ciudad/editar-ciudad.component';
import { ListaSucursalesComponent } from './componentes/configuracion/localizacion/sucursales/lista-sucursales/lista-sucursales.component';
import { RegistrarSucursalesComponent } from './componentes/configuracion/localizacion/sucursales/registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from './componentes/configuracion/localizacion/sucursales/editar-sucursal/editar-sucursal.component';
import { VerSucursalComponent } from './componentes/configuracion/localizacion/sucursales/ver-sucursal/ver-sucursal.component';
import { PrincipalDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/listar-departamento/principal-departamento.component';
import { RegistroDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/editar-departamento/editar-departamento.component';
import { VerDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/ver-departamento/ver-departamento.component';
import { RegistrarNivelDepartamentoComponent } from './componentes/configuracion/localizacion/departamentos/registro-nivel-departamento/registrar-nivel-departamento.component';
import { VerListadoNivelComponent } from './componentes/configuracion/localizacion/departamentos/ver-listado-nivel/ver-listado-nivel.component';
import { RegistroAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { EditarAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/editar-autorizacion-depa/editar-autorizacion-depa.component';
// USUARIOS
import { ConfigurarCodigoComponent } from './componentes/usuarios/configurar-codigo/configurar-codigo.component';
import { RegistrarNivelTitulosComponent } from './componentes/usuarios/nivel-titulos/registrar-nivel-titulos/registrar-nivel-titulos.component';
import { EditarNivelTituloComponent } from './componentes/usuarios/nivel-titulos/editar-nivel-titulo/editar-nivel-titulo.component';
import { ListarNivelTitulosComponent } from './componentes/usuarios/nivel-titulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { ListarTitulosComponent } from './componentes/usuarios/titulo-profesional/listar-titulos/listar-titulos.component';
import { TitulosComponent } from './componentes/usuarios/titulo-profesional/titulos/titulos.component';
import { EditarTituloComponent } from './componentes/usuarios/empleados/asignar-titulo/editar-titulo/editar-titulo.component';
import { TituloEmpleadoComponent } from './componentes/usuarios/empleados/asignar-titulo/titulo-empleado/titulo-empleado.component';
import { EditarTitulosComponent } from './componentes/usuarios/titulo-profesional/editar-titulos/editar-titulos.component';
import { DiscapacidadComponent } from './componentes/usuarios/empleados/discapacidad/discapacidad.component';
import { CatDiscapacidadComponent } from './componentes/usuarios/tipo-discapacidad/listar-discapacidad/cat-discapacidad.component';
import { CatVacunasComponent } from './componentes/usuarios/tipo-vacunas/listar-vacuna/cat-vacunas.component';
import { CrearVacunaComponent } from './componentes/usuarios/empleados/vacunacion/crear-vacuna/crear-vacuna.component';
import { EditarVacunaComponent } from './componentes/usuarios/empleados/vacunacion/editar-vacuna/editar-vacuna.component';
import { TipoVacunaComponent } from './componentes/usuarios/tipo-vacunas/tipo-vacuna/tipo-vacuna.component';
import { ListaEmpleadosComponent } from './componentes/usuarios/empleados/datos-empleado/lista-empleados/lista-empleados.component';
import { VerEmpleadoComponent } from './componentes/usuarios/empleados/datos-empleado/ver-empleado/ver-empleado.component';
import { RegistroComponent } from './componentes/usuarios/empleados/datos-empleado/registro/registro.component';
import { EditarEmpleadoComponent } from './componentes/usuarios/empleados/datos-empleado/editar-empleado/editar-empleado.component';
import { CargarPlantillaComponent } from './componentes/usuarios/cargar-plantillas/cargar-plantilla/cargar-plantilla.component';
import { RegistroContratoComponent } from './componentes/usuarios/empleados/asignar-contrato/registro-contrato/registro-contrato.component';
import { EditarContratoComponent } from './componentes/usuarios/empleados/asignar-contrato/editar-contrato/editar-contrato.component';
import { EmplCargosComponent } from './componentes/usuarios/empleados/asignar-cargo/empl-cargos/empl-cargos.component';
import { EditarCargoComponent } from './componentes/usuarios/empleados/asignar-cargo/editar-cargo/editar-cargo.component';
import { ActualizacionInformacionComponent } from './componentes/usuarios/actualizar-informacion/principal-actualizacion/actualizacion-informacion.component';
import { PrincipalSucursalUsuarioComponent } from './componentes/usuarios/administrar-informacion/principal-sucursal-usuario/principal-sucursal-usuario.component';
import { CambiarContrasenaComponent } from './componentes/iniciarSesion/contrasenia/cambiar-contrasena/cambiar-contrasena.component';
import { RecuperarFraseComponent } from './componentes/usuarios/frase-seguridad/recuperar-frase/recuperar-frase.component';
import { OlvidarFraseComponent } from './componentes/usuarios/frase-seguridad/olvidar-frase/olvidar-frase.component';
import { CambiarFraseComponent } from './componentes/usuarios/frase-seguridad/cambiar-frase/cambiar-frase.component';
import { ConfirmarDesactivadosComponent } from './componentes/usuarios/empleados/confirmar-desactivados/confirmar-desactivados.component';
import { ConfirmarCrearCarpetaComponent } from './componentes/usuarios/empleados/confirmar-crearCarpeta/confirmar-crearCarpeta.component';
import { EmplLeafletComponent } from './componentes/modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { SeguridadComponent } from './componentes/usuarios/frase-seguridad/seguridad/seguridad.component';
import { FraseSeguridadComponent } from './componentes/usuarios/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { EditarRolUserComponent } from './componentes/usuarios/actualizar-informacion/editar-rol-user/editar-rol-user.component';
import { EditarDepaUserComponent } from './componentes/usuarios/actualizar-informacion/editar-depa-user/editar-depa-user.component';
import { AsignarUsuarioComponent } from './componentes/usuarios/administrar-informacion/asignar-usuario/asignar-usuario.component';
import { DefinicionPlantillaComponent } from './componentes/usuarios/cargar-plantillas/definicion-plantilla/definicion-plantilla.component';
import { RegistrarCargoComponent } from './componentes/configuracion/parametrizacion/tipo-cargos/registrar-cargo/registrar-cargo.component';
import { RegistroDiscapacidadComponent } from './componentes/usuarios/tipo-discapacidad/registrar-discapacidad/registrar-discapacidad.component';
import { EditarDiscapacidadComponent } from './componentes/usuarios/tipo-discapacidad/editar-discapacidad/editar-discapacidad.component';
import { EditarVacunasComponent } from './componentes/usuarios/tipo-vacunas/editar-vacuna/editar-vacuna.component';
import { VisualizarAsignacionesComponent } from './componentes/usuarios/administrar-informacion/visualizar-asignaciones/visualizar-asignaciones.component';
// HORARIOS
import { RegistrarFeriadosComponent } from './componentes/horarios/catFeriados/feriados/registrar-feriados/registrar-feriados.component';
import { EditarFeriadosComponent } from './componentes/horarios/catFeriados/feriados/editar-feriados/editar-feriados.component';
import { ListarFeriadosComponent } from './componentes/horarios/catFeriados/feriados/listar-feriados/listar-feriados.component';
import { ListarCiudadFeriadosComponent } from './componentes/horarios/catFeriados/ciudad-feriados/listar-ciudad-feriados/listar-ciudad-feriados.component';
import { AsignarCiudadComponent } from './componentes/horarios/catFeriados/ciudad-feriados/asignar-ciudad/asignar-ciudad.component';
import { RegistroHorarioComponent } from './componentes/horarios/catHorarios/horario/registro-horario/registro-horario.component';
import { EditarHorarioComponent } from './componentes/horarios/catHorarios/horario/editar-horario/editar-horario.component';
import { PrincipalHorarioComponent } from './componentes/horarios/catHorarios/horario/principal-horario/principal-horario.component';
import { DetalleCatHorarioComponent } from './componentes/horarios/catHorarios/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { EditarDetalleCatHorarioComponent } from './componentes/horarios/catHorarios/detalle/editar-detalle-cat-horario/editar-detalle-cat-horario.component';
import { VerHorarioDetalleComponent } from './componentes/horarios/catHorarios/detalle/ver-horario-detalle/ver-horario-detalle.component';
import { EditarPlanificacionComponent } from './componentes/horarios/planificar-horarios/horarios-rotativos/editar-planificacion/editar-planificacion.component';
import { RegistoEmpleadoHorarioComponent } from './componentes/horarios/planificar-horarios/rango-fechas/registo-empleado-horario/registo-empleado-horario.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/horarios/planificar-horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';
import { RegistroPlanHorarioComponent } from './componentes/horarios/planificar-horarios/horarios-rotativos/registro-plan-horario/registro-plan-horario.component';
import { PlanificacionMultipleComponent } from './componentes/horarios/planificar-horarios/horarios-rotativos/planificacion-multiple/planificacion-multiple.component';
import { RegistrarAsistenciaComponent } from './componentes/horarios/asistencia/registrar-asistencia/registrar-asistencia.component';
import { BuscarAsistenciaComponent } from './componentes/horarios/asistencia/buscar-asistencia/buscar-asistencia.component';
import { HorariosMultiplesComponent } from './componentes/horarios/planificar-horarios/rango-fechas/horarios-multiples/horarios-multiples.component';
import { BuscarPlanificacionComponent } from './componentes/horarios/planificar-horarios/rango-fechas/buscar-planificacion/buscar-planificacion.component';
import { EliminarIndividualComponent } from './componentes/horarios/planificar-horarios/eliminar-individual/eliminar-individual.component';
import { CargarPlantillaPlanificacionComponent } from './componentes/horarios/planificar-horarios/cargar-plantillas/cargar-plantilla-planificacion/cargar-plantilla-planificacion.component';
import { VisualizarObservacionComponent } from './componentes/horarios/planificar-horarios/cargar-plantillas/visualizar-observacion/visualizar-observacion.component';
// MODULO  --PERMISOS
import { VistaElementosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/listarTipoPermisos/vista-elementos.component';
import { AutorizacionesComponent } from './componentes/autorizaciones/autorizaciones/autorizaciones.component';
import { EditarEstadoAutorizaccionComponent } from './componentes/autorizaciones/editar-estado-autorizaccion/editar-estado-autorizaccion.component';
import { RegistroEmpleadoPermisoComponent } from './componentes/modulos/permisos/gestionar-permisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { CancelarPermisoComponent } from './componentes/modulos/permisos/gestionar-permisos/cancelar-permiso/cancelar-permiso.component';
import { VerEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/ver-empleado-permiso/ver-empleado-permiso.component';
import { ListarEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar/listar-empleado-permiso/listar-empleado-permiso.component';
import { PermisosMultiplesComponent } from './componentes/modulos/permisos/multiples/permisos-multiples/permisos-multiples.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/modulos/permisos/multiples/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { TipoPermisosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/tipo-permisos/tipo-permisos.component';
import { EditarTipoPermisosComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/editar-tipo-permisos/editar-tipo-permisos.component';
import { VerTipoPermisoComponent } from './componentes/modulos/permisos/configurar-tipo-permiso/ver-tipo-permiso/ver-tipo-permiso.component';
import { EditarPermisoEmpleadoComponent } from './componentes/modulos/permisos/gestionar-permisos/editar-permiso-empleado/editar-permiso-empleado.component';
// MODULO  --VACACIONES
import { VacacionAutorizacionesComponent } from './componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { EditarEstadoVacacionAutoriacionComponent } from './componentes/autorizaciones/editar-estado-vacacion-autoriacion/editar-estado-vacacion-autoriacion.component';
import { EstadoVacacionesComponent } from './componentes/modulos/vacaciones/estado-vacaciones/estado-vacaciones.component';
import { EditarVacacionesEmpleadoComponent } from './componentes/modulos/vacaciones/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { CancelarVacacionesComponent } from './componentes/modulos/vacaciones/cancelar-vacaciones/cancelar-vacaciones.component';
import { ListarVacacionesComponent } from './componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { VerVacacionComponent } from './componentes/modulos/vacaciones/ver-vacacion/ver-vacacion.component';
import { RegistrarPeriodoVComponent } from './componentes/modulos/vacaciones/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { EditarPeriodoVacacionesComponent } from './componentes/modulos/vacaciones/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { RegistrarVacacionesComponent } from './componentes/modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
// MODULO  --HORAS EXTRAS
import { HorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/registrar-horas-extras/horas-extras.component';
import { EditarHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/editar-horas-extras/editar-horas-extras.component';
import { ListaHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { VerHorasExtrasComponent } from './componentes/modulos/horasExtras/catHorasExtras/ver-horas-extras/ver-horas-extras.component';
import { ListaEmplePlanHoraEComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { ListaPlanificacionesComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { ListaPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { HoraExtraAutorizacionesComponent } from './componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { EditarEstadoHoraExtraAutorizacionComponent } from './componentes/autorizaciones/editar-estado-hora-extra-autorizacion/editar-estado-hora-extra-autorizacion.component';
import { VerPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
import { CancelarHoraExtraComponent } from './componentes/modulos/horasExtras/cancelar-hora-extra/cancelar-hora-extra.component';
import { EditarHoraExtraEmpleadoComponent } from './componentes/modulos/horasExtras/editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { PlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/plan-hora-extra/plan-hora-extra.component';
import { EditarPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { ListaPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-plan-hora-extra/lista-plan-hora-extra.component';
import { PedidoHoraExtraComponent } from './componentes/modulos/horasExtras/solicitar-hora-extra/pedido-hora-extra/pedido-hora-extra.component';
import { HoraExtraRealComponent } from './componentes/modulos/horasExtras/calculos/hora-extra-real/hora-extra-real.component';
import { TiempoAutorizadoComponent } from './componentes/modulos/horasExtras/tiempo-autorizado/tiempo-autorizado.component';
import { CalculoHoraExtraComponent } from './componentes/modulos/horasExtras/calculos/calculo-hora-extra/calculo-hora-extra.component';
import { EstadoHoraExtraComponent } from './componentes/modulos/horasExtras/estado-hora-extra/estado-hora-extra.component';
import { PlanHoraExtraAutorizaComponent } from './componentes/autorizaciones/plan-hora-extra-autoriza/plan-hora-extra-autoriza.component';
// MODULO  --ALIMENTACION
import { ListarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { TipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/tipo-comidas/tipo-comidas.component';
import { EditarTipoComidasComponent } from './componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { PlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/plan-comidas/plan-comidas.component';
import { ListarPlanificacionComponent } from './componentes/modulos/alimentacion/planifica-comida/listar-planificacion/listar-planificacion.component';
import { ListarSolicitudComponent } from './componentes/modulos/alimentacion/solicitar-comida/listar-solicitud/listar-solicitud.component';
import { CancelarComidaComponent } from './componentes/modulos/alimentacion/cancelar-comida/cancelar-comida.component';
import { SolicitaComidaComponent } from './componentes/modulos/alimentacion/solicitar-comida/solicita-comida/solicita-comida.component';
import { EditarPlanComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/editar-plan-comidas/editar-plan-comidas.component';
import { AdministraComidaComponent } from './componentes/modulos/alimentacion/administra-comida/administra-comida.component';
import { EditarSolicitudComidaComponent } from './componentes/modulos/alimentacion/solicitar-comida/editar-solicitud-comida/editar-solicitud-comida.component';
import { PlanificacionComidasComponent } from './componentes/modulos/alimentacion/planifica-comida/planificacion-comidas/planificacion-comidas.component';
import { DetalleMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/detalle-menu/detalle-menu.component';
import { EditarDetalleMenuComponent } from './componentes/modulos/alimentacion/catTipoComidas/detalles-comidas/editar-detalle-menu/editar-detalle-menu.component';
import { AutorizaSolicitudComponent } from './componentes/modulos/alimentacion/autoriza-solicitud/autoriza-solicitud.component';
// MODULO  --ACCION PERSONAL
import { PrincipalProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/principal-proceso/principal-proceso.component';
import { RegistroProcesoComponent } from './componentes/modulos/accionesPersonal/catProcesos/registro-proceso/registro-proceso.component';
import { EditarCatProcesosComponent } from './componentes/modulos/accionesPersonal/catProcesos/editar-cat-procesos/editar-cat-procesos.component';
import { ListarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { CrearPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { ListarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { RegistrarEmpleProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { EditarEmpleadoProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { CrearTipoaccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/crear-tipoaccion/crear-tipoaccion.component';
import { EditarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/editar-tipo-accion/editar-tipo-accion.component';
import { VerTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/ver-tipo-accion/ver-tipo-accion.component';
import { EditarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/editar-pedido-accion/editar-pedido-accion.component';
import { VerPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/ver-pedido-accion/ver-pedido-accion.component';
// MODULO  --GEOLOCALIZACION
import { CrearCoordenadasComponent } from './componentes/modulos/geolocalizacion/crear-coordenadas/crear-coordenadas.component';
import { EditarCoordenadasComponent } from './componentes/modulos/geolocalizacion/editar-coordenadas/editar-coordenadas.component';
import { VerCoordenadasComponent } from './componentes/modulos/geolocalizacion/ver-coordenadas/ver-coordenadas.component';
import { ListarCoordenadasComponent } from './componentes/modulos/geolocalizacion/listar-coordenadas/listar-coordenadas.component';
// MODULO  --TIMBRE VIRTUAL
import { ListaWebComponent } from './componentes/modulos/timbreWeb/lista-web/lista-web.component';
import { TimbreWebComponent } from './componentes/modulos/timbreWeb/timbre-empleado/timbre-web.component';
import { RegistrarTimbreComponent } from './componentes/modulos/timbreWeb/registrar-timbre/registrar-timbre.component';
import { OpcionesTimbreWebComponent } from './componentes/modulos/timbreWeb/opcionesTimbreWeb/opciones-timbre-web/opciones-timbre-web.component';
import { VerOpcionesTimbreWebComponent } from './componentes/modulos/timbreWeb/opcionesTimbreWeb/ver-opciones-timbre-web/ver-opciones-timbre-web.component';
// MODULO  --APLICACION MOVIL
import { ListaAppComponent } from './componentes/modulos/appMovil/lista-app/lista-app.component';
import { RegistroDispositivosComponent } from './componentes/modulos/appMovil/registro-dispositivos/registro-dispositivos.component';
import { DeleteRegistroDispositivoComponent } from './componentes/modulos/appMovil/delete-registro-dispositivo/delete-registro-dispositivo.component';
import { ConfigurarOpcionesTimbresComponent } from './componentes/modulos/appMovil/configurar-opciones-timbre/configurar-opciones-timbres/configurar-opciones-timbres.component';
import { VerConfiguracionTimbreComponent } from './componentes/modulos/appMovil/configurar-opciones-timbre/ver-configuracion-timbre/ver-configuracion-timbre.component';
// TIMBRES
import { RelojesComponent } from './componentes/timbres/dispositivos/relojes/relojes.component';
import { EditarRelojComponent } from './componentes/timbres/dispositivos/editar-reloj/editar-reloj.component';
import { VerDipositivoComponent } from './componentes/timbres/dispositivos/ver-dipositivo/ver-dipositivo.component';
import { ListarRelojesComponent } from './componentes/timbres/dispositivos/listar-relojes/listar-relojes.component';
import { TimbreAdminComponent } from './componentes/timbres/timbre-admin/timbre-admin.component';
import { TimbreMultipleComponent } from './componentes/timbres/timbre-multiple/timbre-multiple.component';
import { BuscarTimbreComponent } from './componentes/timbres/acciones-timbres/buscar-timbre/buscar-timbre.component';
import { CrearTimbreComponent } from './componentes/timbres/acciones-timbres/crear-timbre/crear-timbre.component';
import { EditarTimbreComponent } from './componentes/timbres/acciones-timbres/editar-timbre/editar-timbre.component';
import { VerTimbreComponent } from './componentes/timbres/acciones-timbres/ver-timbre/ver-timbre.component';
import { VerImagenComponent } from './componentes/timbres/acciones-timbres/ver-imagen/ver-imagen.component';
// NOTIFICACIONES
import { SettingsComponent } from './componentes/notificaciones/configurar-notificaciones/settings/settings.component';
import { ConfiguracionNotificacionComponent } from './componentes/notificaciones/configurar-notificaciones/multiple/configuracion/configuracionNotificacion.component';
import { ListaNotificacionComponent } from './componentes/notificaciones/configurar-notificaciones/multiple/lista-empleados/listaNotificacion.component';
import { SubirDocumentoComponent } from './componentes/notificaciones/documentos/subir-documento/subir-documento.component';
import { VerDocumentosComponent } from './componentes/notificaciones/documentos/ver-documentos/ver-documentos.component';
import { ListaArchivosComponent } from './componentes/notificaciones/documentos/lista-archivos/lista-archivos.component';
import { RegistrarBirthdayComponent } from './componentes/notificaciones/configurar-mensajes/cumpleanios/registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from './componentes/notificaciones/configurar-mensajes/cumpleanios/editar-birthday/editar-birthday.component';
import { VerBirthdayComponent } from './componentes/notificaciones/configurar-mensajes/cumpleanios/ver-birthday/ver-birthday.component';
import { ComunicadosComponent } from './componentes/notificaciones/comunicados/comunicados.component';
import { RealtimeNotificacionComponent } from './componentes/reportes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { RealtimeAvisosComponent } from './componentes/reportes/notificaciones/realtime-avisos/realtime-avisos.component';
import { EliminarRealtimeComponent } from './componentes/reportes/notificaciones/eliminar-realtime/eliminar-realtime.component';
import { ButtonNotificacionComponent } from './componentes/generales/main-nav/button-notificacion/button-notificacion.component';
import { ButtonAvisosComponent } from './componentes/generales/main-nav/button-avisos/button-avisos.component';
import { ButtonOpcionesComponent } from './componentes/generales/main-nav/button-opciones/button-opciones.component';
import { MensajesNotificacionesComponent } from './componentes/notificaciones/configurar-mensajes/mensajes-notificaciones/mensajes-notificaciones.component';
import { VerAniversarioComponent } from './componentes/notificaciones/configurar-mensajes/aniversario/ver-aniversario/ver-aniversario.component';
import { RegistrarAniversarioComponent } from './componentes/notificaciones/configurar-mensajes/aniversario/registrar-aniversario/registrar-aniversario.component';
import { EditarAniversarioComponent } from './componentes/notificaciones/configurar-mensajes/aniversario/editar-aniversario/editar-aniversario.component';

// REPORTE
import { ReportesModule } from './componentes/reportes/reportes.module';
import { ConfigReportFirmasHorasExtrasComponent } from './componentes/reportes/configuracion-reportes/config-report-firmas-horas-extras/config-report-firmas-horas-extras.component';
import { ConfigEmpleadosComponent } from './componentes/reportes/configuracion-reportes/config-report-empleados/config-empleados.component';
import { ConfigAsistenciaComponent } from './componentes/reportes/configuracion-reportes/config-report-asistencia/config-asistencia.component';
import { InformacionNovedadesComponent } from './componentes/reportes/configuracion-reportes/informacion-novedades/informacion-novedades.component';
// REPORTES  // REPORTE  --MODULO HORAS EXTRAS
import { HoraExtraMacroComponent } from './componentes/reportes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/reportes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
// VERIFICAR SU USO
import { MetricaAtrasosComponent } from './componentes/graficas/graficas-micro/metrica-atrasos/metrica-atrasos.component';
import { MetricaHorasExtrasComponent } from './componentes/graficas/graficas-micro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaPermisosComponent } from './componentes/graficas/graficas-micro/metrica-permisos/metrica-permisos.component';
import { MetricaVacacionesComponent } from './componentes/graficas/graficas-micro/metrica-vacaciones/metrica-vacaciones.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/reportes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { SalidasAntesMacroComponent } from './componentes/reportes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { InasistenciaMacroComponent } from './componentes/reportes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/reportes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { AsistenciaMacroComponent } from './componentes/reportes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { RetrasosMacroComponent } from './componentes/reportes/graficas-macro/retrasos-macro/retrasos-macro.component';

// CONECCION REST SERVICIOS
// INICIO DE SESION
import { LoginService } from './servicios/login/login.service';
import { TokenInterceptorService } from './servicios/login/token-interceptor.service';
// PARAMETRIZACION
import { MainNavService } from './componentes/generales/main-nav/main-nav.service';
// REPORTES
import { PlantillaReportesService } from './componentes/reportes/plantilla-reportes.service';
import { GraficasService } from './servicios/graficas/graficas.service';
import { RegistrarGeneroComponent } from './componentes/usuarios/tipo-genero/registrar-genero/registrar-genero.component';
import { EditarGeneroComponent } from './componentes/usuarios/tipo-genero/editar-genero/editar-genero.component';
import { ListarGeneroComponent } from './componentes/usuarios/tipo-genero/listar-genero/listar-genero.component';
import { ListarEstadoCivilComponent } from './componentes/usuarios/tipo-estado-civil/listar-estado-civil/listar-estado-civil.component';
import { RegistrarEstadoCivilComponent } from './componentes/usuarios/tipo-estado-civil/registrar-estado-civil/registrar-estado-civil.component';
import { EditarEstadoCivilComponent } from './componentes/usuarios/tipo-estado-civil/editar-estado-civil/editar-estado-civil.component';

@NgModule({
  declarations: [
    AppComponent,

    LoginComponent,
    OlvidarContraseniaComponent,
    ConfirmarContraseniaComponent,

    FooterComponent,

    HomeComponent,

    MetodosComponent,

    EditarEmpresaComponent,
    LogosComponent,
    VerEmpresaComponent,
    VerParametroComponent,
    CrearDetalleParametroComponent,
    EditarDetalleParametroComponent,
    ListarParametroComponent,
    ConfiguracionComponent,
    RegistroRolComponent,
    EditarRolComponent,
    VistaRolesComponent,
    SeleccionarRolPermisoComponent,
    RolPermisosMovilComponent,
    RegimenComponent,
    ListarRegimenComponent,
    VerRegimenComponent,
    EditarRegimenComponent,
    CatModalidaLaboralComponent,
    CatTipoCargosComponent,
    ColoresEmpresaComponent,
    CorreoEmpresaComponent,
    TipoSeguridadComponent,
    MainNavComponent,
    NavbarComponent,
    SearchComponent,
    AyudaComponent,
    VistaMenuComponent,
    RegistroModalidadComponent,
    EditarModalidadComponent,
    EditarTipoCargoComponent,

    PrincipalProvinciaComponent,
    RegistroProvinciaComponent,
    ListarCiudadComponent,
    RegistrarCiudadComponent,
    EditarCiudadComponent,
    ListaSucursalesComponent,
    RegistrarSucursalesComponent,
    EditarSucursalComponent,
    VerSucursalComponent,
    PrincipalDepartamentoComponent,
    RegistroDepartamentoComponent,
    EditarDepartamentoComponent,
    VerDepartamentoComponent,
    RegistrarNivelDepartamentoComponent,
    VerListadoNivelComponent,
    RegistroAutorizacionDepaComponent,
    EditarAutorizacionDepaComponent,

    ConfigurarCodigoComponent,
    RegistrarNivelTitulosComponent,
    EditarNivelTituloComponent,
    ListarNivelTitulosComponent,
    ListarTitulosComponent,
    TitulosComponent,
    EditarTituloComponent,
    TituloEmpleadoComponent,
    EditarTitulosComponent,
    DiscapacidadComponent,
    CatDiscapacidadComponent,
    CatVacunasComponent,
    CrearVacunaComponent,
    EditarVacunaComponent,
    TipoVacunaComponent,
    ListaEmpleadosComponent,
    VerEmpleadoComponent,
    RegistroComponent,
    EditarEmpleadoComponent,
    CargarPlantillaComponent,
    RegistroContratoComponent,
    EditarContratoComponent,
    EmplCargosComponent,
    EditarCargoComponent,
    ActualizacionInformacionComponent,
    PrincipalSucursalUsuarioComponent,
    CambiarContrasenaComponent,
    RecuperarFraseComponent,
    OlvidarFraseComponent,
    CambiarFraseComponent,
    ConfirmarDesactivadosComponent,
    ConfirmarCrearCarpetaComponent,
    EmplLeafletComponent,
    SeguridadComponent,
    FraseSeguridadComponent,
    EditarRolUserComponent,
    EditarDepaUserComponent,
    AsignarUsuarioComponent,
    DefinicionPlantillaComponent,
    RegistrarCargoComponent,
    RegistroDiscapacidadComponent,
    EditarDiscapacidadComponent,
    EditarVacunasComponent,
    VisualizarAsignacionesComponent,

    RegistrarFeriadosComponent,
    EditarFeriadosComponent,
    ListarFeriadosComponent,
    ListarCiudadFeriadosComponent,
    AsignarCiudadComponent,
    RegistroHorarioComponent,
    EditarHorarioComponent,
    PrincipalHorarioComponent,
    DetalleCatHorarioComponent,
    EditarDetalleCatHorarioComponent,
    VerHorarioDetalleComponent,
    EditarPlanificacionComponent,
    RegistoEmpleadoHorarioComponent,
    HorarioMultipleEmpleadoComponent,
    RegistroPlanHorarioComponent,
    PlanificacionMultipleComponent,
    RegistrarAsistenciaComponent,
    BuscarAsistenciaComponent,
    HorariosMultiplesComponent,
    BuscarPlanificacionComponent,
    EliminarIndividualComponent,
    CargarPlantillaPlanificacionComponent,
    VisualizarObservacionComponent,

    VistaElementosComponent,
    AutorizacionesComponent,
    EditarEstadoAutorizaccionComponent,
    RegistroEmpleadoPermisoComponent,
    CancelarPermisoComponent,
    VerEmpleadoPermisoComponent,
    ListarEmpleadoPermisoComponent,
    PermisosMultiplesComponent,
    PermisosMultiplesEmpleadosComponent,
    TipoPermisosComponent,
    EditarTipoPermisosComponent,
    VerTipoPermisoComponent,
    EditarPermisoEmpleadoComponent,

    VacacionAutorizacionesComponent,
    EditarEstadoVacacionAutoriacionComponent,
    EstadoVacacionesComponent,
    EditarVacacionesEmpleadoComponent,
    CancelarVacacionesComponent,
    ListarVacacionesComponent,
    VerVacacionComponent,
    RegistrarPeriodoVComponent,
    EditarPeriodoVacacionesComponent,
    RegistrarVacacionesComponent,

    HorasExtrasComponent,
    EditarHorasExtrasComponent,
    ListaHorasExtrasComponent,
    VerHorasExtrasComponent,
    ListaEmplePlanHoraEComponent,
    ListaPlanificacionesComponent,
    ListaPedidoHoraExtraComponent,
    HoraExtraAutorizacionesComponent,
    EditarEstadoHoraExtraAutorizacionComponent,
    VerPedidoHoraExtraComponent,
    CancelarHoraExtraComponent,
    EditarHoraExtraEmpleadoComponent,
    PlanHoraExtraComponent,
    EditarPlanHoraExtraComponent,
    ListaPlanHoraExtraComponent,
    PedidoHoraExtraComponent,
    HoraExtraRealComponent,
    TiempoAutorizadoComponent,
    CalculoHoraExtraComponent,
    EstadoHoraExtraComponent,
    PlanHoraExtraAutorizaComponent,

    ListarTipoComidasComponent,
    TipoComidasComponent,
    EditarTipoComidasComponent,
    PlanComidasComponent,
    ListarPlanificacionComponent,
    ListarSolicitudComponent,
    CancelarComidaComponent,
    SolicitaComidaComponent,
    EditarPlanComidasComponent,
    AdministraComidaComponent,
    EditarSolicitudComidaComponent,
    PlanificacionComidasComponent,
    DetalleMenuComponent,
    EditarDetalleMenuComponent,
    AutorizaSolicitudComponent,

    PrincipalProcesoComponent,
    RegistroProcesoComponent,
    EditarCatProcesosComponent,
    ListarTipoAccionComponent,
    CrearPedidoAccionComponent,
    ListarPedidoAccionComponent,
    RegistrarEmpleProcesoComponent,
    EditarEmpleadoProcesoComponent,
    CrearTipoaccionComponent,
    EditarTipoAccionComponent,
    VerTipoAccionComponent,
    EditarPedidoAccionComponent,
    VerPedidoAccionComponent,

    CrearCoordenadasComponent,
    EditarCoordenadasComponent,
    VerCoordenadasComponent,
    ListarCoordenadasComponent,

    ListaWebComponent,
    TimbreWebComponent,
    RegistrarTimbreComponent,
    OpcionesTimbreWebComponent,
    VerOpcionesTimbreWebComponent,

    ListaAppComponent,
    RegistroDispositivosComponent,
    VerDipositivoComponent,
    DeleteRegistroDispositivoComponent,
    ConfigurarOpcionesTimbresComponent,
    VerConfiguracionTimbreComponent,

    RelojesComponent,
    EditarRelojComponent,
    ListarRelojesComponent,
    TimbreAdminComponent,
    TimbreMultipleComponent,
    BuscarTimbreComponent,
    CrearTimbreComponent,
    EditarTimbreComponent,
    VerTimbreComponent,
    VerImagenComponent,

    SettingsComponent,
    ConfiguracionNotificacionComponent,
    ListaNotificacionComponent,
    SubirDocumentoComponent,
    VerDocumentosComponent,
    ListaArchivosComponent,
    RegistrarBirthdayComponent,
    EditarBirthdayComponent,
    VerBirthdayComponent,
    ComunicadosComponent,
    RealtimeNotificacionComponent,
    RealtimeAvisosComponent,
    EliminarRealtimeComponent,
    ButtonNotificacionComponent,
    ButtonAvisosComponent,
    ButtonOpcionesComponent,
    MensajesNotificacionesComponent,
    VerAniversarioComponent,
    RegistrarAniversarioComponent,
    EditarAniversarioComponent,

    ConfigReportFirmasHorasExtrasComponent,
    ConfigEmpleadosComponent,
    ConfigAsistenciaComponent,

    HoraExtraMacroComponent,
    JornadaVsHoraExtraMacroComponent,

    MetricaAtrasosComponent,
    MetricaHorasExtrasComponent,
    MetricaPermisosComponent,
    MetricaVacacionesComponent,
    TiempoJornadaVsHoraExtMacroComponent,
    SalidasAntesMacroComponent,
    InasistenciaMacroComponent,
    MarcacionesEmpMacroComponent,
    AsistenciaMacroComponent,
    RetrasosMacroComponent,
    InformacionNovedadesComponent,
    RegistrarGeneroComponent,
    EditarGeneroComponent,
    ListarGeneroComponent,
    ListarEstadoCivilComponent,
    RegistrarEstadoCivilComponent,
    EditarEstadoCivilComponent,

  ],

  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    FontAwesomeModule,
    FormsModule,
    MatCardModule,
    CommonModule,
    ScrollingModule,
    FiltrosModule,
    MaterialModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReportesModule,
    SpinnerModule,
    WebcamModule,
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
    GraficasService,
    MainNavService,
    PlantillaReportesService,
    RelojesComponent,
    VerEmpresaComponent,
    VerSucursalComponent,
    VerEmpleadoComponent,
    PlanComidasComponent,
    VerDipositivoComponent,
    ListarRelojesComponent,
    AutorizacionesComponent, //--VERIFICAR
    VistaElementosComponent,
    ListaSucursalesComponent,
    ListarVacacionesComponent,
    ListaHorasExtrasComponent,
    PrincipalHorarioComponent,
    ListarTipoComidasComponent,
    BuscarPlanificacionComponent,
    ListaEmplePlanHoraEComponent,
    ListaPlanificacionesComponent,
    ListarCiudadFeriadosComponent,
    PrincipalDepartamentoComponent,
    HorarioMultipleEmpleadoComponent,
    PermisosMultiplesEmpleadosComponent,
  ],
  exports: [CommonModule, TimbreMultipleComponent],

  bootstrap: [AppComponent]

})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }
