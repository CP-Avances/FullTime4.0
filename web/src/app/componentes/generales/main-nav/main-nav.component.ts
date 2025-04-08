import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { DateTime } from 'luxon';
import { MenuNode } from 'src/app/model/menu.model';

import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';
import { MainNavService } from './main-nav.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { FraseSeguridadComponent } from 'src/app/componentes/usuarios/frase-seguridad/frase-seguridad/frase-seguridad.component';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})

export class MainNavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 800px)')
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // CONTROL DE MENU
  treeControl = new NestedTreeControl<MenuNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<MenuNode>();

  // VARIABLES DE ALMACENAMIENTO
  idEmpresa: number;
  datosEmpresa: any = [];
  id_empleado_logueado: number;
  rol: any

  // VERIFICAR LICENCIA
  fec_caducidad_licencia: Date;

  constructor(
    public restF: FuncionesService,
    public inicio: LoginService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public location: Location,
    public restEmpresa: EmpresaService,
    public restUsuario: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private funciones: MainNavService,
    private plantillaPDF: PlantillaReportesService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  hasChild = (_: number, node: MenuNode) => !!node.children && node.children.length > 0;

  isExpanded = true;
  isShowing = false;
  barraInicial = false;

  // EVENTOS DE SELECCION DE MENU
  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  // EVENTOS DE SELECCION DE MEN
  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  // METODO PARA MOSTRAR DATOS DE LICENCIA DEL SISTEMA
  showMessageLicencia: Boolean = false;
  FuncionLicencia() {
    const licencia = localStorage.getItem('fec_caducidad_licencia');
    if (licencia !== null) {
      var fec_caducidad = this.validar.DarFormatoFecha(licencia.split('.')[0], 'yyyy-MM-dd');
      this.fec_caducidad_licencia = fec_caducidad;
      // CONVERTIMOS LA FECHA ACTUAL Y LA FECHA DE CADUCIDAD A OBJETOS LUXON
      const fecha = DateTime.now();
      var fechaActual = this.validar.DarFormatoFecha(fecha, 'yyyy-MM-dd');
      const fechaInicio = DateTime.fromISO(fechaActual);
      const fechaFin = DateTime.fromISO(fec_caducidad);
      // CALCULAMOS LA DIFERENCIA EN DIAS ENTRE LAS DOS FECHAS
      const diferencia = fechaFin.diff(fechaInicio, 'days').days;
      //console.log('diferencia ', diferencia)
      if (diferencia <= 30) {
        this.showMessageLicencia = true;
        const text = (diferencia === 1) ? 'dia' : 'dias';
        this.toaster.warning(`${diferencia + ' ' + text}`, 'SU LICENCIA EXPIRA EN', {
          timeOut: 3000,
        });
      }
    }
  }

  ngOnInit() {
    // ES IMPORTANTE EL ORDEN EN EL QUE SE INVOCAN LAS FUNCIONES
    if (this.inicio.loggedIn()) {
      this.idEmpresa = parseInt(localStorage.getItem('empresa') as string)
      this.FuncionLicencia();
      this.funciones.LogicaFunciones();
      this.plantillaPDF.ShowColoresLogo(localStorage.getItem('empresa') as string);
      this.breakpointObserver.observe('(max-width: 800px)').subscribe((result: BreakpointState) => {
        this.barraInicial = result.matches;
      });
      this.LlamarDatos();
    }
  }

  // METODO PARA MOSTRAR METODOS
  LlamarDatos() {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado') as string);
    this.SeleccionMenu();
    this.ConfigurarSeguridad();
  }

  // METODO PARA VALIDAR FRASE DE SEGURIDAD
  ConfigurarSeguridad() {
    this.restEmpresa.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].seguridad_frase === true) {
        this.restUsuario.BuscarDatosUser(this.id_empleado_logueado).subscribe(data => {
          if (data[0].id_rol === 1) {
            if (data[0].frase === null || data[0].frase === '') {
              this.toaster.info('Debe registrar su frase de seguridad.',
                'Configuración doble seguridad.', { timeOut: 10000 })
                .onTap.subscribe(obj => {
                  this.RegistrarFrase();
                })
            }
          }
        });
      }
    });
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent,
      { width: '350px', data: this.id_empleado_logueado }).disableClose = true;
  }

  // METODO DE NAVEGACION SEGUN ROL DE ACCESO
  irHome() {
    this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
  }

  // CONTROL DE FUNCIONES DEL SISTEMA
  get HabilitarGeolocalizacion(): boolean { return this.funciones.geolocalizacion; }
  get HabilitarAlimentacion(): boolean { return this.funciones.alimentacion; }
  get HabilitarVacaciones(): boolean { return this.funciones.vacaciones; }
  get HabilitarHoraExtra(): boolean { return this.funciones.horasExtras; }
  get HabilitarTimbreWeb(): boolean { return this.funciones.timbre_web; }
  get HabilitarPermisos(): boolean { return this.funciones.permisos; }
  get HabilitarAccion(): boolean { return this.funciones.accionesPersonal; }
  get HabilitarMovil(): boolean { return this.funciones.app_movil; }

  // CONTROL DE MENU PRINCIPAL
  nombreSelect: string = '';
  manejarEstadoActivo(name: any) {
    this.nombreSelect = name;
  }

  // METODO DE SELECCION DE MENU
  SeleccionMenu() {
    const name_emp = localStorage.getItem('name_empresa');
    if (name_emp !== null) {
      this.MetodoSubSelectMenu(name_emp)
    } else {
      this.restEmpresa.ConsultarEmpresas().subscribe(res => {
        localStorage.setItem('name_empresa', res[0].nombre);
        this.MetodoSubSelectMenu(res[0].nombre)
      })
    }
  }

  // METODO DE LLMANADO DE MENU
  MetodoSubSelectMenu(nombre: string) {
    this.dataSource.data = this.MenuAdministracion(nombre) as MenuNode[];
  }

  // MENU PERFIL ADMINISTRADOR
  MenuAdministracion(nombre: string) {
    return [
      {
        name: 'Configuración',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'settings',
        children: [
          {
            name: 'Parametrización',
            accion: true,
            estado: true,
            color: true,
            subtitulo: true,
            icono: 'widgets',
            children: [
              { name: nombre, url: '/vistaEmpresa', color: true, ver: true },
              { name: 'Parámetros', url: '/parametros', color: true, ver: true },
              { name: 'Correo', url: '/configurarCorreo', color: true, ver: true },
              { name: 'Roles', url: '/roles', color: true, ver: true },
              { name: 'Régimen Laboral', url: '/listarRegimen', color: true, ver: true },
              { name: 'Modalidad Laboral', url: '/modalidaLaboral', color: true, ver: true },
              { name: 'Tipo Cargos', url: '/tipoCargos', color: true, ver: true },
            ]
          },
          {
            name: 'Localización',
            accion: true,
            estado: true,
            color: true,
            subtitulo: true,
            icono: 'location_on',
            children: [
              { name: 'Provincia', url: '/provincia', color: true, ver: true },
              { name: 'Ciudad', url: '/listarCiudades', color: true, ver: true },
              { name: 'Establecimiento', url: '/sucursales', color: true, ver: true },
              { name: 'Departamento', url: '/departamento', color: true, ver: true },
            ]
          },
        ]
      },
      {
        name: 'Usuarios',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'account_circle',
        children: [
          { name: 'Configurar Código', url: '/codigo', color: true, ver: true },
          { name: 'Generos', url: '/genero', color: true, ver: true },
          { name: 'Nacionalidades', url: '/nacionalidad', color: true, ver: true },
          

          { name: 'Estados Civil', url: '/estado-civil', color: true, ver: true },

          { name: 'Nivel de Educación', url: '/nivelTitulos', color: true, ver: true },
          { name: 'Título Profesional', url: '/titulos', color: true, ver: true },
          { name: 'Tipo Discapacidad', url: '/discapacidades', color: true, ver: true },
          { name: 'Tipo Vacunas', url: '/vacunas', color: true, ver: true },
          { name: 'Empleados', url: '/empleado', color: true, ver: true },
          { name: 'Cargar Plantillas', url: '/cargarPlantilla', color: true, ver: true },
          { name: 'Actualizar Información', url: '/actualizarInformacion', color: true, ver: true },
          { name: 'Administrar Información', url: '/administrarInformacion', color: true, ver: true },
        ]
      },
      {
        name: 'Horarios',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'assignment',
        children: [
          { name: 'Feriados', url: '/listarFeriados', color: true, ver: true },
          { name: 'Horarios', url: '/horario', color: true, ver: true },
          { name: 'Planificar Horarios', url: '/horariosMultiples', color: true, ver: true },
          { name: 'Actualizar Asistencia', url: '/asistencia', color: true, ver: true },
        ]
      },
      {
        name: 'Módulos',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'games',
        children: [
          {
            name: 'Permisos',
            accion: this.HabilitarPermisos,
            estado: this.HabilitarPermisos,
            color: true,
            subtitulo: true,
            icono: 'insert_emoticon',
            children: [
              { name: 'Configurar Permisos', url: '/verTipoPermiso', color: true, ver: true },
              { name: 'Permisos Múltiples', url: '/permisosMultiples', color: true, ver: true },
              { name: 'Aprobación Múltiple P.', url: '/permisos-solicitados', color: true, ver: true },
            ]
          },
          {
            name: 'Permisos',
            accion: !this.HabilitarPermisos,
            estado: !this.HabilitarPermisos,
            color: false,
            activo: this.HabilitarPermisos,
            icono: 'insert_emoticon',
            url: '/verTipoPermiso'
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarVacaciones,
            estado: this.HabilitarVacaciones,
            icono: 'flight',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Aprobación Múltiple V.', url: '/vacaciones-solicitados', color: true, ver: true },
            ]
          },
          {
            name: 'Vacaciones',
            accion: !this.HabilitarVacaciones,
            estado: !this.HabilitarVacaciones,
            activo: this.HabilitarVacaciones,
            icono: 'flight',
            color: false,
            url: '/vacaciones-solicitados'
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: this.HabilitarHoraExtra,
            color: true,
            subtitulo: true,
            icono: 'schedule',
            children: [
              { name: 'Configurar HoraExtra', url: '/listaHorasExtras', color: true, ver: true },
              { name: 'Planificar Hora Extra', url: '/planificaHoraExtra', color: true, ver: true },
              { name: 'Listar Planificación', url: '/listadoPlanificaciones', color: true, ver: true },
              { name: 'Aprobación Múltiple HE.', url: '/horas-extras-solicitadas', color: true, ver: true },
            ]
          },
          {
            name: 'Horas Extras',
            accion: !this.HabilitarHoraExtra,
            estado: !this.HabilitarHoraExtra,
            activo: this.HabilitarHoraExtra,
            icono: 'schedule',
            color: false,
            url: '/listaHorasExtras'
          },
          {
            name: 'Geolocalización',
            accion: this.HabilitarGeolocalizacion,
            estado: this.HabilitarGeolocalizacion,
            icono: 'my_location',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Registrar Geolocalización', url: '/coordenadas', color: true, ver: true },
            ]
          },
          {
            name: 'Geolocalización',
            accion: !this.HabilitarGeolocalizacion,
            estado: !this.HabilitarGeolocalizacion,
            activo: this.HabilitarGeolocalizacion,
            icono: 'my_location',
            color: false,
            url: '/coordenadas'
          },
          {
            name: 'Timbre Virtual',
            accion: this.HabilitarTimbreWeb,
            estado: this.HabilitarTimbreWeb,
            icono: 'computer',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Timbre Virtual', url: '/timbresWeb', color: true, ver: true },
              { name: 'Configurar Timbre Virtual', url: '/configurar-timbre-web', color: true, ver: true },
              { name: 'Timbrar', url: '/timbres-personal', color: true, ver: true },
            ]
          },
          {
            name: 'Timbre Virtual',
            accion: !this.HabilitarTimbreWeb,
            estado: !this.HabilitarTimbreWeb,
            activo: this.HabilitarTimbreWeb,
            icono: 'computer',
            color: false,
            url: '/timbresWeb'
          },
          {
            name: 'Aplicación Móvil',
            accion: this.HabilitarMovil,
            estado: this.HabilitarMovil,
            icono: 'phone_android',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Reloj Virtual', url: '/app-movil', color: true, ver: true },
              { name: 'Configurar Timbre', url: '/configurar-timbre', color: true, ver: true },
              { name: 'Registro Dispositivos', url: '/registro-dispositivos', color: true, ver: true },
            ]
          },
          {
            name: 'Aplicación Móvil',
            accion: !this.HabilitarMovil,
            estado: !this.HabilitarMovil,
            activo: this.HabilitarMovil,
            icono: 'phone_android',
            color: false,
            url: '/app-movil'
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: this.HabilitarAlimentacion,
            subtitulo: true,
            icono: 'local_dining',
            color: true,
            children: [
              { name: 'Configurar comidas', url: '/listarTipoComidas', color: true, ver: true },
              { name: 'Planificar Servicio', url: '/alimentacion', color: true, ver: true },
              { name: 'Listar Planificación', url: '/listaPlanComida', color: true, ver: true },
              { name: 'Aprobación Múltiple A.', url: '/listaSolicitaComida', color: true, ver: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: !this.HabilitarAlimentacion,
            estado: !this.HabilitarAlimentacion,
            activo: this.HabilitarAlimentacion,
            icono: 'local_dining',
            color: false,
            url: '/listarTipoComidas'
          },
          {
            name: 'Acción Personal',
            accion: this.HabilitarAccion,
            estado: this.HabilitarAccion,
            icono: 'how_to_reg',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Grado', url: '/listaGrados', color: true, ver: true },
              { name: 'Procesos', url: '/proceso', color: true, ver: true },
              { name: 'Grupo Ocupacional', url: '/grupo-ocupacional', color: true, ver: true },
              { name: 'Detalle Acción Personal', url: '/acciones-personal', color: true, ver: true },
              { name: 'Asignar Registros', url: '/IngresarRegistros', color: true, ver: true },
              { name: 'Pedido Acción Personal', url: '/pedidoAccion', color: true, ver: true },
              { name: 'Listar Pedidos', url: '/listaPedidos', color: true, ver: true },
            ]
          },
          {
            name: 'Acción Personal',
            accion: !this.HabilitarAccion,
            estado: !this.HabilitarAccion,
            activo: this.HabilitarAccion,
            icono: 'how_to_reg',
            color: false,
            url: '/proceso'
          },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        icono: 'fingerprint',
        color: true,
        subtitulo: false,
        children: [
          { name: 'Dispositivos', url: '/listarRelojes', color: true, ver: true },
          { name: 'Administrar Timbres', url: '/timbres-admin', color: true, ver: true },
          { name: 'Registrar Timbres', url: '/timbres-multiples', color: true, ver: true },
          { name: 'Actualizar Timbres', url: '/buscar-timbre', color: true, ver: true }
        ]
      },
      {
        name: 'Notificaciones',
        accion: true,
        estado: true,
        subtitulo: false,
        icono: 'notifications',
        color: true,
        children: [
          { name: 'Configurar Notificaciones', url: '/configurarNotificaciones', color: true, ver: true },
          { name: 'Documentos', url: '/archivos', color: true, ver: true },
          { name: 'Mensajes Notificaciones', url: '/mensaje_notificaciones', color: true, ver: true },
          { name: 'Comunicados', url: '/comunicados', color: true, ver: true },
        ]
      },
      {
        name: 'Reportes',
        accion: true,
        estado: true,
        subtitulo: false,
        icono: 'description',
        color: true,
        children: [
          {
            name: 'Generales',
            accion: true,
            estado: true,
            subtitulo: true,
            icono: 'group',
            color: true,
            children: [
              { name: 'Usuarios', url: '/reporteEmpleados', color: true, ver: true },
              { name: 'Registro Vacunación', url: '/lista-vacunados', color: true, ver: true },
            ]
          },
          {
            name: 'Asistencia',
            accion: true,
            estado: true,
            subtitulo: true,
            icono: 'check_circle_outline',
            color: true,
            children: [
              { name: 'Faltas', url: '/reporte-faltas', color: true, ver: true },
              { name: 'Atrasos', url: '/reporte-atrasos-multiples', color: true, ver: true },
              // { name: 'Puntualidad', url: '/reporte-puntualidad', color: true, ver: true },
              { name: 'Tiempo Laborado', url: '/reporte-horas-trabajadas', color: true, ver: true },
              { name: 'Tiempo Alimentación', url: '/tiempo-alimentacion', color: true, ver: true },
              { name: 'Salidas Anticipadas', url: '/salidas-anticipadas', color: true, ver: true },
              { name: 'Resumen Asistencia', url: '/reporte-resumen-asistencia', color: true, ver: true },
              { name: 'Planificación Horaria', url: '/reporte-planificacion-horaria', color: true, ver: true },
              //{ name: 'Entradas Salidas', url: '/reporteEntradaSalida', color: true, ver: true },
              //{ name: 'Asistencia Detalle Consolidado', url: '/reporteAsistenciaConsolidado', color: true, ver: true },
            ]
          },
          {
            name: 'Timbres',
            accion: true,
            estado: true,
            subtitulo: true,
            icono: 'touch_app',
            color: true,
            children: [
              { name: 'Timbres', url: '/reporte-timbres-multiples', color: true, ver: true },
              { name: 'Timbres MRL', url: '/reporte-timbre-mrl', color: true, ver: true },
              { name: 'Timbres Libres', url: '/reporte-timbre-abierto', color: true, ver: true },
              { name: 'Timbres Incompletos', url: '/reporte-timbre-incompleto', color: true, ver: true },
            ]
          },
          {
            name: 'Permisos',
            accion: this.HabilitarPermisos,
            estado: this.HabilitarPermisos,
            icono: 'insert_emoticon',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Permisos', url: '/reportePermisos', color: true, ver: true },
            ]
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarVacaciones,
            estado: this.HabilitarVacaciones,
            icono: 'flight',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Kardex', url: '/reporteKardex', color: true, ver: true },
              { name: 'Solicitudes Vacaciones', url: '/solicitud-vacacion', color: this.HabilitarVacaciones, ver: true },
            ]
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: this.HabilitarHoraExtra,
            icono: 'schedule',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Solicitudes HorasExtras', url: '/horas/extras', color: true, ver: true },
              { name: 'Aprobación HorasExtras', url: '/reporteHorasExtras', color: true, ver: true },
              { name: 'Horas Extras', url: '/macro/hora-extra', color: true, ver: true },
              { name: 'Jornada vs HorasExtras', url: '/macro/jornada-vs-hora-extra', color: true, ver: true },
            ]
          },
          {
            name: 'Aplicación Móvil',
            accion: this.HabilitarMovil,
            estado: this.HabilitarMovil,
            icono: 'phone_android',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Timbre Reloj Virtual', url: '/reporte-timbre-reloj-virtual', color: true, ver: true },
            ]
          },
          {
            name: 'Timbre Virtual',
            accion: this.HabilitarTimbreWeb,
            estado: this.HabilitarTimbreWeb,
            icono: 'computer',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Timbre Virtual', url: '/reporte-timbre-sistema', color: true, ver: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: true,
            icono: 'restaurant',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Tickets Consumidos', url: '/alimentosGeneral', color: true, ver: true },
              { name: 'Detalle TicketsConsumidos', url: '/alimentosDetallado', color: true, ver: true },
              { name: 'Servicios Invitados', url: '/alimentosInvitados', color: true, ver: true },
            ]
          },
          {
            name: 'Auditoría',
            accion: true,
            estado: true,
            subtitulo: true,
            icono: 'gavel',
            color: true,
            children: [
              { name: 'Auditoría', url: '/reporte-auditoria', color: true, ver: true },

            ]
          },
          {
            name: 'Análisis Datos',
            accion: true,
            estado: true,
            icono: 'dashboard',
            subtitulo: true,
            color: true,
            children: [
              { name: 'Análisis Datos', url: '/analisisDatos', color: true, ver: true },
            ]
          },
          /*   {
               name: 'Estadísticos',
               accion: true,
               estado: true,
               subtitulo: true,
               icono: 'leaderboard',
               color: true,
               children: [
                 { name: 'Atrasos', url: '/macro/retrasos', color: true, ver: true },
                 { name: 'Timbres', url: '/macro/marcaciones', color: true, ver: true },
                 { name: 'Asistencia', url: '/macro/asistencia', color: true, ver: true },
                 { name: 'Inasistencia', url: '/macro/inasistencia', color: true, ver: true },
                 { name: 'Salidas antes', url: '/macro/tiempo-jornada-vs-hora-ext', color: true, ver: true },
               ]
             },
             {
               name: 'Notificaciones',
               accion: true,
               estado: true,
               subtitulo: true,
               icono: 'notifications_active',
               color: true,
               children: [
                 { name: 'Todos', url: '/listaAllNotificaciones', color: true, ver: true },
                 { name: 'Usuarios', url: '/listaNotifacionUsuario', color: true, ver: true },
               ]
             },
             */
        ]
      },
    ];
  }

}
