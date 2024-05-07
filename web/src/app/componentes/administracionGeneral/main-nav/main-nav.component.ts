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
import * as moment from 'moment';

import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { MainNavService } from './main-nav.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { FraseSeguridadComponent } from 'src/app/componentes/administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';

import { MenuNode } from 'src/app/model/menu.model';
import { SpinnerService } from 'src/app/servicios/spinner/spinner.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

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

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public restF: FuncionesService,
    public inicio: LoginService,
    public ventana: MatDialog,
    public location: Location,
    public restEmpresa: EmpresaService,
    public restUsuario: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private funciones: MainNavService,
    private plantillaPDF: PlantillaReportesService,
    private breakpointObserver: BreakpointObserver,
    public spinnerService: SpinnerService,
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
      const fec_caducidad = new Date(licencia.split('.')[0])
      const fecha_hoy = new Date();
      this.fec_caducidad_licencia = fec_caducidad;
      const fecha1 = moment(fecha_hoy.toJSON().split('T')[0])
      const fecha2 = moment(fec_caducidad.toJSON().split('T')[0])

      const diferencia = fecha2.diff(fecha1, 'days');

      if (diferencia <= 30) {
        this.showMessageLicencia = true;
        const text = (diferencia === 1) ? 'dia' : 'dias';
        this.toaster.warning(`SU LICENCIA EXPIRA EN ${diferencia + ' ' + text}`)
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

    var f = moment();
    let hora: number = parseInt(moment(f).format('HH'));
    let fecha: string = moment(f).format('YYYY-MM-DD');
    console.log('HORAS ', hora, ' fechas ', fecha)

  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent,
      { width: '350px', data: this.id_empleado_logueado }).disableClose = true;
  }

  // METODO DE NAVEGACION SEGUN ROL DE ACCESO
  irHome() {
    if (this.inicio.getRol() === 1) {
      this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
    } else {
      this.router.navigate(['/estadisticas'], { relativeTo: this.route, skipLocationChange: false });
    }
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
  superadmin: boolean = false;
  SeleccionMenu() {
    const name_emp = localStorage.getItem('name_empresa');

    if (this.inicio.getRol() === 3) {
      this.superadmin = true;
    }
    else {
      this.superadmin = false;
    }

    if (name_emp !== null) {
      this.MetodoSubSelectMenu(name_emp)
    } else {
      this.restEmpresa.ConsultarEmpresas().subscribe(res => {
        localStorage.setItem('name_empresa', res[0].nombre);
        this.MetodoSubSelectMenu(res[0].nombre)
        //console.log("Informacion: ", res)
        //console.log("Estado: ", this.HabilitarAlimentacion);
      })
    }
  }

  // METODO DE LLMANADO DE MENU
  MetodoSubSelectMenu(nombre: string) {
    if (this.inicio.getRolMenu() === true) {
      this.dataSource.data = this.MenuAdministracion(nombre) as MenuNode[];
    } else {
      this.dataSource.data = this.MenuEmpleado() as MenuNode[];
    }
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
          { name: 'Nivel de Educación', url: '/nivelTitulos', color: true, ver: true },
          { name: 'Título Profesional', url: '/titulos', color: true, ver: true },
          { name: 'Empleados', url: '/empleado', color: true, ver: true },
          { name: 'Cargar Plantillas', url: '/cargarPlantilla', color: true, ver: true },
          { name: 'Modalida Laboral', url: '/modalidaLaboral', color: true, ver: true },
          { name: 'Tipo Cargos', url: '/tipoCargos', color: true, ver: true },
          { name: 'Asignar Establecimientos', url: '/administrarSucursales', color: true, ver: this.superadmin },
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
              { name: 'Procesos', url: '/proceso', color: true, ver: true },
              { name: 'Tipo Acción Personal', url: '/acciones-personal', color: true, ver: true },
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
              { name: 'Configurar Timbre Virtual', url: '/timbresWeb', color: true, ver: true },
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
          { name: 'Actualizar Timbres', url: '/buscar-timbre', color: true, ver: true },
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
          { name: 'Cumpleaños', url: '/cumpleanios', color: true, ver: true },
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
              { name: 'Vacaciones Solicitadas', url: '/solicitud-vacacion', color: this.HabilitarVacaciones, ver: true },
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
              { name: 'Solicitudes Horas Extras', url: '/horas/extras', color: true, ver: true },
              { name: 'Horas Extras Autorizaciones', url: '/reporteHorasExtras', color: true, ver: true },
              { name: 'Horas Extras', url: '/macro/hora-extra', color: true, ver: true },
              { name: 'Jornada vs Horas extras', url: '/macro/jornada-vs-hora-extra', color: true, ver: true },
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
              { name: 'Detalle Tickets Consumidos', url: '/alimentosDetallado', color: true, ver: true },
              { name: 'Servicios Invitados', url: '/alimentosInvitados', color: true, ver: true },
            ]
          },
          {
            name: 'Análisis Datos',
            accion: this.HabilitarAlimentacion,
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
             {
               name: 'Auditoría',
               accion: true,
               estado: true,
               subtitulo: true,
               icono: 'gavel',
               color: true,
               children: [
                 { name: 'Auditoria', url: '/auditoria', color: true, ver: true },
               ]
             },*/
        ]
      },
    ];
  }

  // SELECCION MENU DE EMPLEADO
  MenuEmpleado() {
    return [
      {
        name: 'Perfil',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'account_circle',
        children: [
          { name: 'Datos Personales', url: '/datosEmpleado', color: true, ver: true },
          { name: 'Datos Laborales', url: '/cargoEmpleado', color: true, ver: true },
        ]
      },
      {
        name: 'Asistencia',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'event',
        children: [
          { name: 'Planificación Horaria', url: '/horariosEmpleado', color: true, ver: true },
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
            icono: 'transfer_within_a_station',
            children: [
              { name: 'Solicitar Permiso', url: '/solicitarPermiso', color: true, ver: true },
            ]
          },
          {
            name: 'Permisos',
            accion: !this.HabilitarPermisos,
            estado: !this.HabilitarPermisos,
            activo: this.HabilitarPermisos,
            color: false,
            icono: 'transfer_within_a_station',
            url: '/solicitarPermiso'
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarVacaciones,
            estado: this.HabilitarVacaciones,
            color: true,
            subtitulo: true,
            icono: 'flight',
            children: [
              { name: 'Solicitar Vacaciones', url: '/vacacionesEmpleado', color: true, ver: true },
            ]
          },
          {
            name: 'Vacaciones',
            accion: !this.HabilitarVacaciones,
            estado: !this.HabilitarVacaciones,
            activo: this.HabilitarVacaciones,
            color: false,
            icono: 'flight',
            url: '/vacacionesEmpleado'
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: this.HabilitarHoraExtra,
            subtitulo: true,
            color: true,
            icono: 'hourglass_full',
            children: [
              { name: 'Solicitar Hora Extra', url: '/horaExtraEmpleado', color: true, ver: true },
              { name: 'Planificación HorasExtras', url: '/horasPlanEmpleado', color: true, ver: true },
            ]
          },
          {
            name: 'Horas Extras',
            accion: !this.HabilitarHoraExtra,
            estado: !this.HabilitarHoraExtra,
            activo: this.HabilitarHoraExtra,
            color: false,
            icono: 'hourglass_full',
            url: '/horaExtraEmpleado'
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: this.HabilitarAlimentacion,
            subtitulo: true,
            color: true,
            icono: 'restaurant',
            children: [
              { name: 'Solicitar Servicio', url: '/comidasEmpleado', color: true, ver: true },
              { name: 'Planificación Alimentación', url: '/comidasPlanEmpleado', color: true, ver: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: !this.HabilitarAlimentacion,
            estado: !this.HabilitarAlimentacion,
            activo: this.HabilitarAlimentacion,
            color: false,
            icono: 'restaurant',
            url: '/comidasEmpleado'
          },
          {
            name: 'Acción Personal',
            accion: this.HabilitarAccion,
            estado: this.HabilitarAccion,
            color: true,
            subtitulo: true,
            icono: 'how_to_reg',
            children: [
              { name: 'Procesos', url: '/procesosEmpleado', color: true, ver: true },
            ]
          },
          {
            name: 'Acción Personal',
            accion: !this.HabilitarAccion,
            estado: !this.HabilitarAccion,
            activo: this.HabilitarAccion,
            color: false,
            icono: 'how_to_reg',
            url: '/procesosEmpleado'
          },
          {
            name: 'Timbre Virtual',
            accion: this.HabilitarTimbreWeb,
            estado: this.HabilitarTimbreWeb,
            icono: 'computer',
            color: true,
            subtitulo: true,
            children: [
              { name: 'Timbre Virtual', url: '/timbres-personal', color: true, ver: true },
            ]
          },
          {
            name: 'Timbre Virtual',
            accion: !this.HabilitarTimbreWeb,
            estado: !this.HabilitarTimbreWeb,
            activo: this.HabilitarTimbreWeb,
            icono: 'computer',
            color: false,
            url: '/timbres-personal'
          },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        color: true,
        subtitulo: false,
        icono: 'fingerprint',
        children: [
          { name: 'Actualizar Timbres', url: '/buscar-timbre', color: true, ver: true },
        ]
      },
      {
        name: 'Información',
        accion: true,
        estado: true,
        icono: 'check_circle_outline',
        color: true,
        subtitulo: false,
        children: [
          { name: 'Jefes', url: '/informacion', color: true, ver: true },
          { name: 'Documentos', url: '/verDocumentacion', color: true, ver: true },
          { name: 'Aprobación departamental', url: '/autorizaEmpleado', color: true, ver: true },
        ]
      },
      /*  {
          name: 'Notificaciones',
          accion: true,
          estado: true,
          color: true,
          subtitulo: false,
          icono: 'notifications',
          children: [
            { name: 'Lista notificaciones', url: '/lista-notificaciones', color: true, ver: true },
          ]
        },*/
    ]
  }
}
