import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable, asapScheduler } from 'rxjs';
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
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { RolPermisosService } from 'src/app/servicios/catalogos/catRolPermisos/rol-permisos.service';
import { textChangeRangeIsUnchanged } from 'typescript';

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
  dataSource1 = new MatTreeNestedDataSource<MenuNode>();

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

  //COMPONENTES DEL MENU
  menuGeneralUsuarios: any = [];//Menu General
  menuGeneralAdministrador: any = [];//Menu Administrador
  paginasMG: any = []; //Variable para guardar los permisos de acceso a botones que tiene asignado
  
  itemConfiguracion: boolean = false;
  subItemConfiguracionParametrizacion: boolean = false;
  childrenParametrizacion: any = [];
  vistaVistaEmpresa: boolean = false;
  vistaParametros: boolean = false;
  vistaConfigurarCorreo: boolean = false;
  vistaRoles: boolean = false;
  vistaListarRegimen: boolean = false;
  vistaModalidadLaboral: boolean = false;
  vistaTipoCargos: boolean = false;
  subItemConfiguracionLocalizacion: boolean = false;
  childrenLocalizacion: any = [];
  vistaProvincia: boolean = false;
  vistaListarCiudades: boolean = false;
  vistaSucursales: boolean = false;
  vistaDepartamento: boolean = false;

  itemUsuarios: boolean = false;
  childrenUsuarios: any = [];
  vistaCodigo: boolean = false;
  vistaNivelTitulos: boolean = false;
  vistaTitulos: boolean = false;
  vistaEmpleados: boolean = false;
  vistaAdministrarSucursales: boolean = false;
  vistaCargarPlantillas: boolean = false;

  itemHorarios: boolean = false;
  childrenHorarios: any = [];
  vistaListarFeriados: boolean = false;
  vistaHorario: boolean = false;
  vistaHorariosMultiples: boolean = false;
  vistaAsistencia: boolean = false;

  itemModulos: boolean = true;
  subItemModulosPermisos: boolean = false;
  childrenPermisos: any = [];
  vistaModulosPermisosVerTipoPermiso: boolean = false;
  vistaModulosPermisosPermisosMultiples: boolean = false;
  vistaModulosPermisosPermisosSolicitados: boolean = false;
  subItemModulosVacaciones: boolean = false;
  childrenVacaciones: any = [];
  vistaModulosVacacionesVacacionesSolicitadas: boolean = false;
  subItemModulosHorasExtras: boolean = false;
  childrenHorasExtras: any = [];
  vistaModulosHorasExtrasListaHorasExtras: boolean = false;
  vistaModulosHorasExtrasPlanificaHoraExtra: boolean = false;
  vistaModulosHorasExtrasListadoPlanificaciones: boolean = false;
  vistaModulosHorasExtrasHorasExtrasSolicitadas: boolean = false;
  subItemModulosAlimentacion: boolean = false;
  childrenAlimentacion: any = [];
  vistaModulosAlimentacionListarTipoComidas: boolean = false;
  vistaModulosAlimentacionAlimentacion: boolean = false;
  vistaModulosAlimentacionListaPlanComida: boolean = false;
  vistaModulosAlimentacionListaSolicitaComida: boolean = false;
  subItemModulosAccionPersonal: boolean = false;
  childrenAccionPersonal: any = [];
  vistaModulosAccionPersonalProceso: boolean = false;
  vistaModulosAccionPersonalAccionesPersonal: boolean = false;
  vistaModulosAccionPersonalPedidoAccion: boolean = false;
  vistaModulosAccionPersonalListaPedidos: boolean = false;
  subItemModulosGeolocalizacion: boolean = false;
  childrenGeolocalizacion: any = [];
  vistaModulosGeolocalizacionCoordenadas: boolean = false;
  subItemModulosTimbreVirtual: boolean = false;
  childrenTimbreVirtual: any = [];
  vistaModulosTimbreVirtualTimbresWeb: boolean = false;
  vistaModulosTimbreVirtualTimbresPersonal: boolean = false;
  subItemModulosAplicacionMovil: boolean = false;
  childrenAplicacionMovil: any = [];
  vistaModulosAplicacionMovilAppMovil: boolean = false;
  vistaModulosAplicacionMovilRegistroDispositivos: boolean = false;
  
  itemTimbres: boolean = false;
  childrenTimbres: any = [];
  vistaModulosTimbresListarRelojes: boolean = false;
  vistaModulosTimbresTimbresAdmin: boolean = false;
  vistaModulosTimbresTimbresMultiples: boolean = false;
  vistaModulosTimbresBuscarTimbre: boolean = false;

  itemNotificaciones: boolean = false;
  childrenNotificaciones: any = [];
  vistaModulosNotificacionesConfigurarNotificaciones: boolean = false;
  vistaModulosNotificacionesArchivos: boolean = false;
  vistaModulosNotificacionesCumpleanios: boolean = false;
  vistaModulosNotificacionesComunicados: boolean = false;

  itemReportes: boolean = true;
  subItemReportesGenerales: boolean = false;
  childrenGenerales: any = [];
  vistaReportesGeneralesReporteEmpleados: boolean = false;
  vistaReportesGeneralesListaVacunados: boolean = false;
  subItemReportesAsistencia: boolean = false;
  childrenAsistencia: any = [];
  vistaReportesAsistenciaReporteFaltas: boolean = false;
  vistaReportesAsistenciaReporteAtrasosMultiples: boolean = false;
  vistaReportesAsistenciaReporteHorasTrabajadas: boolean = false;
  vistaReportesAsistenciaTiempoAlimentacion: boolean = false;
  vistaReportesAsistenciaSalidasAnticipadas: boolean = false;
  vistaReportesAsistenciaReporteResumenAsistencia: boolean = false;
  vistaReportesAsistenciaReportePlanificacionHoraria: boolean = false;
  subItemReportesTimbres: boolean = false;
  childrenReportesTimbres: any = [];
  vistaReportesTimbresReporteTimbresMultiples: boolean = false;
  vistaReportesTimbresReporteTimbreMlr: boolean = false;
  vistaReportesTimbresReporteTimbreAbierto: boolean = false;
  vistaReportesTimbresReporteTimbreIncompleto: boolean = false;
  subItemReportesPermisos: boolean = false;
  childrenReportesPermisos: any = [];
  vistaReportesPermisosReportePermisos: boolean = false;
  subItemReportesVacaciones: boolean = false;
  childrenReportesVacaciones: any = [];
  vistaReportesVacacionesReporteKardex: boolean = false;
  vistaReportesVacacionesSolicitudVacacion: boolean = false;
  subItemReportesHorasExtras: boolean = false;
  childrenReportesHorasExtras: any = [];
  vistaReportesHorasExtrasHorasExtras: boolean = false;
  vistaReportesHorasExtrasReporteHorasExtras: boolean = false;
  vistaReportesHorasExtrasMacroHoraExtra: boolean = false;
  vistaReportesHorasExtrasMacroJornadavsHoraExtra: boolean = false;
  subItemReportesAplicacionMovil: boolean = false;
  childrenReportesAplicacionMovil: any = [];
  vistaReportesAplicacionMovilReporteTimbreRelojVirtual: boolean = false;
  subItemReportesTimbreVirtual: boolean = false;
  childrenReportesTimbreVirtual: any = [];
  vistaReportesTimbreVirtualReporteTimbreSistema: boolean = false;
  subItemReportesAlimentacion: boolean = false;
  childrenReportesAlimentacion: any = [];
  vistaReportesAlimentacionAlimentosGeneral: boolean = false;
  vistaReportesAlimentacionAlimentosDetallado: boolean = false;
  vistaReportesAlimentacionAlimentosInvitados: boolean = false;
  subItemReportesAnalisisDatos: boolean = false;
  childrenReportesAnalisisDatos: any = [];
  vistaReportesAnalisisDatosAnalisisDatos: boolean = false;
  datosPaginaRol: any = [];

  constructor(
    private restRolPermiso: RolPermisosService,
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
      
      //Inicio Consulta de menu
      this.MenuGeneral();
      //Fin Consulta de menu
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
  superadmin: boolean = false;
  SeleccionMenu() {
    const name_emp = localStorage.getItem('name_empresa');

    if (this.inicio.getRol() === 1) {
      this.superadmin = true;
    }
    else {
      this.superadmin = false;
    }

    if (name_emp !== null) {
      this.MetodoSubSelectMenu(name_emp);
    } else {
      this.restEmpresa.ConsultarEmpresas().subscribe(res => {
        localStorage.setItem('name_empresa', res[0].nombre);
        this.MetodoSubSelectMenu(res[0].nombre);
      });
    }
  }

  // METODO DE LLMANADO DE MENU
  MetodoSubSelectMenu(nombre: string) {
    this.dataSource.data = this.menuGeneralUsuarios as MenuNode[];
  }

  MenuGeneral(){
    var buscarPagina = {id_rol: this.inicio.getRol()};
    if(this.menuGeneralUsuarios.length < 1){
      this.restRolPermiso.BuscarPaginasMenuRol(buscarPagina).subscribe(
        {
          next: (v) => 
            {
              this.paginasMG = v;
            },
          error: (e) =>
            {
              //Armado de json con elementos de menu ERROR
              this.menuGeneralUsuarios = [
                {
                  name: 'Módulos',
                  accion: true,
                  estado: true,
                  color: true,
                  subtitulo: false,
                  icono: 'games',
                  children: [
                    {
                      name: 'Permisos.',
                      accion: !this.HabilitarPermisos,
                      estado: !this.HabilitarPermisos,
                      color: false,
                      activo: false,
                      icono: 'insert_emoticon',
                      url: this.HabilitarPermisos ? '/home' : '/verTipoPermiso',//this.HabilitarPermisos
                    },
                    {
                      name: 'Vacaciones.',
                      accion: !this.HabilitarVacaciones,
                      estado: !this.HabilitarVacaciones,
                      activo: false,
                      icono: 'flight',
                      color: false,
                      url: this.HabilitarVacaciones ? '/home' : '/vacaciones-solicitados'
                    },
                    {
                      name: 'Horas Extras.',
                      accion: !this.HabilitarHoraExtra,
                      estado: !this.HabilitarHoraExtra,
                      activo: false,
                      icono: 'schedule',
                      color: false,
                      url: this.HabilitarHoraExtra ? '/home' : '/listaHorasExtras'
                    },
                    {
                      name: 'Alimentación.',
                      accion: !this.HabilitarAlimentacion,
                      estado: !this.HabilitarAlimentacion,
                      activo: false,
                      icono: 'local_dining',
                      color: false,
                      url: this.HabilitarAlimentacion ? '/home' : '/listarTipoComidas'
                    },
                    {
                      name: 'Acción Personal.',
                      accion: !this.HabilitarAccion,
                      estado: !this.HabilitarAccion,
                      activo: false,
                      icono: 'how_to_reg',
                      color: false,
                      url: this.HabilitarAccion ? '/home' : '/proceso'
                    },
                    {
                      name: 'Geolocalización.',
                      accion: !this.HabilitarGeolocalizacion,
                      estado: !this.HabilitarGeolocalizacion,
                      activo: false,
                      icono: 'my_location',
                      color: false,
                      url: this.HabilitarGeolocalizacion ? '/home' : '/coordenadas'
                    },
                    {
                      name: 'Timbre Virtual.',
                      accion: !this.HabilitarTimbreWeb,
                      estado: !this.HabilitarTimbreWeb,
                      activo: false,
                      icono: 'computer',
                      color: false,
                      url: this.HabilitarTimbreWeb ? '/home' : '/timbresWeb'
                    },
                    {
                      name: 'Aplicación Móvil.',
                      accion: !this.HabilitarMovil,
                      estado: !this.HabilitarMovil,
                      activo: false,
                      icono: 'phone_android',
                      color: false,
                      url: this.HabilitarMovil ? '/home' : '/app-movil'
                    },
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
                      name: 'R. Generales.',
                      accion: !this.subItemReportesGenerales,
                      estado: !this.subItemReportesGenerales,
                      color: false,
                      activo: false,
                      icono: 'group',
                      url: '/home'
                    },
                    {
                      name: 'R. Asistencia.',
                      accion: !this.subItemReportesAsistencia,
                      estado: !this.subItemReportesAsistencia,
                      color: false,
                      activo: false,
                      icono: 'check_circle_outline',
                      url: '/home'
                    },
                    {
                      name: 'R. Timbres.',
                      accion: !this.subItemReportesTimbres,
                      estado: !this.subItemReportesTimbres,
                      color: false,
                      activo: false,
                      icono: 'touch_app',
                      url: '/home'
                    },
                    {
                      name: 'R. Permisos.',
                      accion: !this.HabilitarPermisos,
                      estado: !this.HabilitarPermisos,
                      color: false,
                      activo: false,
                      icono: 'insert_emoticon',
                      url: '/home'
                    },
                    {
                      name: 'R. Vacaciones.',
                      accion: !this.HabilitarVacaciones,
                      estado: !this.HabilitarVacaciones,
                      color: false,
                      activo: false,
                      icono: 'flight',
                      url: '/home'
                    },
                    {
                      name: 'R. Horas Extras.',
                      accion: !this.HabilitarHoraExtra,
                      estado: !this.HabilitarHoraExtra,
                      color: false,
                      activo: false,
                      icono: 'schedule',
                      url: '/home'
                    },
                    {
                      name: 'R. Aplicación Móvil.',
                      accion: !this.HabilitarMovil,
                      estado: !this.HabilitarMovil,
                      color: false,
                      activo: false,
                      icono: 'phone_android',
                      url: '/home'
                    },
                    {
                      name: 'R. Timbre Virtual.',
                      accion: !this.HabilitarTimbreWeb,
                      estado: !this.HabilitarTimbreWeb,
                      color: false,
                      activo: false,
                      icono: 'computer',
                      url: '/home'
                    },
                    {
                      name: 'R. Alimentación.',
                      accion: !this.HabilitarAlimentacion,
                      estado: !this.HabilitarAlimentacion,
                      color: false,
                      activo: false,
                      icono: 'restaurant',
                      url: '/home'
                    },
                    {
                      name: 'R. Análisis Datos.',
                      accion: !this.HabilitarAlimentacion,
                      estado: !this.HabilitarAlimentacion,
                      color: false,
                      activo: false,
                      icono: 'dashboard',
                      url: '/home'
                    }
                    
                  ]
                },
              ]
              //Fin Armado de json con elementos de menu ERROR
              sessionStorage.setItem('paginaRol', JSON.stringify(this.datosPaginaRol));
              
              this.LlamarDatos();
            },
          complete: () => 
            {
              //Control de vistas activas
              this.paginasMG.forEach((row: any) => 
                {
                  //console.log('id: ' , row.id, ' funcion ', row.funcion, ' link: ' , row.link, ' id_rol: ' , row.id_rol, ' accion: ' , row.id_accion);
                  switch(row.link){
                    case 'vistaEmpresa':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/vistaEmpresa'){
                          this.vistaVistaEmpresa = true;
                        }
                      }
                      if(!this.vistaVistaEmpresa){
                        this.childrenParametrizacion.push({name: 'Empresa', url:'/vistaEmpresa', color: true, ver: true}); 
                      }
                      break;
                    case 'parametros':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/parametros'){
                          this.vistaParametros = true;
                        }
                      }
                      if(!this.vistaParametros){
                        this.childrenParametrizacion.push({name: 'Parámetros', url: '/parametros', color: true, ver: true}); 
                      }
                      break;
                    case 'configurarCorreo':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/configurarCorreo'){
                          this.vistaConfigurarCorreo = true;
                        }
                      }
                      if(!this.vistaConfigurarCorreo){
                        this.childrenParametrizacion.push({name: 'Correo',url: '/configurarCorreo', color: true, ver: true}); 
                      }
                      break;
                    case 'roles':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/roles'){
                          this.vistaRoles = true;
                        }
                      }
                      if(!this.vistaRoles){
                        this.childrenParametrizacion.push({name: 'Roles', url: '/roles', color: true, ver: true}); 
                      }
                      break;
                    case 'listarRegimen':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/listarRegimen'){
                          this.vistaListarRegimen = true;
                        }
                      }
                      if(!this.vistaListarRegimen){
                        this.childrenParametrizacion.push({name: 'Régimen Laboral', url: '/listarRegimen', color: true, ver: true}); 
                      }
                      break;
                    case 'modalidadLaboral':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/modalidaLaboral'){
                          this.vistaModalidadLaboral = true;
                        }
                      }
                      if(!this.vistaModalidadLaboral){
                        this.childrenParametrizacion.push({name: 'Modalidad Laboral', url: '/modalidaLaboral', color: true, ver: true}); 
                      }
                      break;
                    case 'tipoCargos':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionParametrizacion = true;
                      for (const parametrizacion of this.childrenParametrizacion) {
                        if(parametrizacion.url === '/tipoCargos'){
                          this.vistaTipoCargos = true;
                        }
                      }
                      if(!this.vistaTipoCargos){
                        this.childrenParametrizacion.push({name: 'Tipo Cargos', url: '/tipoCargos', color: true, ver: true}); 
                      }
                      break;
                    case 'provincia':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionLocalizacion = true;
                      for (const parametrizacion of this.childrenLocalizacion) {
                        if(parametrizacion.url === '/provincia'){
                          this.vistaProvincia = true;
                        }
                      }
                      if(!this.vistaProvincia){
                        this.childrenLocalizacion.push({name: 'Provincia', url: '/provincia', color: true, ver: true}); 
                      }
                      break;
                    case 'listarCiudades':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionLocalizacion = true;
                      for (const parametrizacion of this.childrenLocalizacion) {
                        if(parametrizacion.url === '/listarCiudades'){
                          this.vistaListarCiudades = true;
                        }
                      }
                      if(!this.vistaListarCiudades){
                        this.childrenLocalizacion.push({name: 'Ciudad', url: '/listarCiudades', color: true, ver: true}); 
                      }
                      break;
                    case 'sucursales':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionLocalizacion = true;
                      for (const parametrizacion of this.childrenLocalizacion) {
                        if(parametrizacion.url === '/sucursales'){
                          this.vistaSucursales = true;
                        }
                      }
                      if(!this.vistaSucursales){
                        this.childrenLocalizacion.push({name: 'Establecimiento', url: '/sucursales', color: true, ver: true}); 
                      }
                      break;
                    case 'departamento':
                      this.itemConfiguracion = true;
                      this.subItemConfiguracionLocalizacion = true;
                      for (const parametrizacion of this.childrenLocalizacion) {
                        if(parametrizacion.url === '/departamento'){
                          this.vistaDepartamento = true;
                        }
                      }
                      if(!this.vistaDepartamento){
                        this.childrenLocalizacion.push({name:'Departamento', url: '/departamento', color: true, ver: true}); 
                      }
                      break;
                    case 'codigo':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/codigo'){
                          this.vistaCodigo = true;
                        }
                      }
                      if(!this.vistaCodigo){
                        this.childrenUsuarios.push({name: 'Configurar Código', url: '/codigo', color: true, ver: true}); 
                      }
                      break;
                    case 'nivelTitulos':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/nivelTitulos'){
                          this.vistaNivelTitulos = true;
                        }
                      }
                      if(!this.vistaNivelTitulos){
                        this.childrenUsuarios.push({name: 'Nivel de Educación', url: '/nivelTitulos', color: true, ver: true}); 
                      }
                      break;
                    case 'titulos':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/titulos'){
                          this.vistaTitulos = true;
                        }
                      }
                      if(!this.vistaTitulos){
                        this.childrenUsuarios.push({name: 'Título Profesional', url: '/titulos', color: true, ver: true}); 
                      }
                      break;
                    case 'empleado':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/empleado'){
                          this.vistaEmpleados = true;
                        }
                      }
                      if(!this.vistaEmpleados){
                        this.childrenUsuarios.push({name: 'Empleados', url: '/empleado', color: true, ver: true}); 
                      }
                      break;
                    case 'administrarSucursales':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/administrarSucursales'){
                          this.vistaAdministrarSucursales = true;
                        }
                      }
                      if(!this.vistaAdministrarSucursales){
                        this.childrenUsuarios.push({name: 'Asignar Establecimientos', url: '/administrarSucursales', color: true, ver: true}); 
                      }
                      break;
                    case 'cargarPlantilla':
                      this.itemUsuarios = true;
                      for (const parametrizacion of this.childrenUsuarios) {
                        if(parametrizacion.url === '/cargarPlantilla'){
                          this.vistaCargarPlantillas = true;
                        }
                      }
                      if(!this.vistaCargarPlantillas){
                        this.childrenUsuarios.push({name: 'Cargar Plantillas', url: '/cargarPlantilla', color: true, ver: true}); 
                      }
                      break;
                    case 'listarFeriados':
                      this.itemHorarios = true;
                      for (const parametrizacion of this.childrenHorarios) {
                        if(parametrizacion.url === '/listarFeriados'){
                          this.vistaListarFeriados = true;
                        }
                      }
                      if(!this.vistaListarFeriados){
                        this.childrenHorarios.push({name: 'Feriados', url: '/listarFeriados', color: true, ver: true}); 
                      }
                      break;
                    case 'horario':
                      this.itemHorarios = true;
                      for (const parametrizacion of this.childrenHorarios) {
                        if(parametrizacion.url === '/horario'){
                          this.vistaHorario = true;
                        }
                      }
                      if(!this.vistaHorario){
                        this.childrenHorarios.push({name: 'Horarios', url: '/horario', color: true, ver: true}); 
                      }
                      break;
                    case 'horariosMultiples':
                      this.itemHorarios = true;
                      for (const parametrizacion of this.childrenHorarios) {
                        if(parametrizacion.url === '/horariosMultiples'){
                          this.vistaHorariosMultiples = true;
                        }
                      }
                      if(!this.vistaHorariosMultiples){
                        this.childrenHorarios.push({name: 'Planificar Horarios', url: '/horariosMultiples', color: true, ver: true}); 
                      }
                      break;
                    case 'asistencia':
                      this.itemHorarios = true;
                      for (const parametrizacion of this.childrenHorarios) {
                        if(parametrizacion.url === '/asistencia'){
                          this.vistaAsistencia = true;
                        }
                      }
                      if(!this.vistaAsistencia){
                        this.childrenHorarios.push({name: 'Actualizar Asistencia', url: '/asistencia', color: true, ver: true}); 
                      }
                      break;
                    case 'verTipoPermiso':
                      this.itemModulos = true;
                      this.subItemModulosPermisos = true;
                      for (const parametrizacion of this.childrenPermisos) {
                        if(parametrizacion.url === '/verTipoPermiso'){
                          this.vistaModulosPermisosVerTipoPermiso = true;
                        }
                      }
                      if(!this.vistaModulosPermisosVerTipoPermiso){
                        this.childrenPermisos.push({name: 'Configurar Permisos', url: '/verTipoPermiso', color: true, ver: true}); 
                      }
                      break;
                    case 'permisosMultiples':
                      this.itemModulos = true;
                      this.subItemModulosPermisos = true;
                      for (const parametrizacion of this.childrenPermisos) {
                        if(parametrizacion.url === '/permisosMultiples'){
                          this.vistaModulosPermisosPermisosMultiples = true;
                        }
                      }
                      if(!this.vistaModulosPermisosPermisosMultiples){
                        this.childrenPermisos.push({name: 'Permisos Múltiples', url: '/permisosMultiples', color: true, ver: true}); 
                      }
                      break;
                    case 'permisos-solicitados':
                      this.itemModulos = true;
                      this.subItemModulosPermisos = true;
                      for (const parametrizacion of this.childrenPermisos) {
                        if(parametrizacion.url === '/permisos-solicitados'){
                          this.vistaModulosPermisosPermisosSolicitados = true;
                        }
                      }
                      if(!this.vistaModulosPermisosPermisosSolicitados){
                        this.childrenPermisos.push({name: 'Aprobación Múltiple P.', url: '/permisos-solicitados', color: true, ver: true}); 
                      }
                      break;
                    case 'vacaciones-solicitados':
                      this.itemModulos = true;
                      this.subItemModulosVacaciones = true;
                      for (const parametrizacion of this.childrenVacaciones) {
                        if(parametrizacion.url === '/vacaciones-solicitados'){
                          this.vistaModulosVacacionesVacacionesSolicitadas = true;
                        }
                      }
                      if(!this.vistaModulosVacacionesVacacionesSolicitadas){
                        this.childrenVacaciones.push({name: 'Aprobación Múltiple V.', url: '/vacaciones-solicitados', color: true, ver: true}); 
                      }
                      break;
                    case 'listaHorasExtras':
                      this.itemModulos = true;
                      this.subItemModulosHorasExtras = true;
                      for (const parametrizacion of this.childrenHorasExtras) {
                        if(parametrizacion.url === '/listaHorasExtras'){
                          this.vistaModulosHorasExtrasListaHorasExtras = true;
                        }
                      }
                      if(!this.vistaModulosHorasExtrasListaHorasExtras){
                        this.childrenHorasExtras.push({name: 'Configurar HoraExtra', url: '/listaHorasExtras', color: true, ver: true}); 
                      }
                      break;
                    case 'planificaHoraExtra':
                      this.itemModulos = true;
                      this.subItemModulosHorasExtras = true;
                      for (const parametrizacion of this.childrenHorasExtras) {
                        if(parametrizacion.url === '/planificaHoraExtra'){
                          this.vistaModulosHorasExtrasPlanificaHoraExtra = true;
                        }
                      }
                      if(!this.vistaModulosHorasExtrasPlanificaHoraExtra){
                        this.childrenHorasExtras.push({name: 'Planificar Hora Extra', url: '/planificaHoraExtra', color: true, ver: true}); 
                      }
                      break;
                    case 'listadoPlanificaciones':
                      this.itemModulos = true;
                      this.subItemModulosHorasExtras = true;
                      for (const parametrizacion of this.childrenHorasExtras) {
                        if(parametrizacion.url === '/listadoPlanificaciones'){
                          this.vistaModulosHorasExtrasListadoPlanificaciones = true;
                        }
                      }
                      if(!this.vistaModulosHorasExtrasListadoPlanificaciones){
                        this.childrenHorasExtras.push({name: 'Listar Planificación', url: '/listadoPlanificaciones', color: true, ver: true}); 
                      }
                      break;
                    case 'horas-extras-solicitadas':
                      this.itemModulos = true;
                      this.subItemModulosHorasExtras = true;
                      for (const parametrizacion of this.childrenHorasExtras) {
                        if(parametrizacion.url === '/horas-extras-solicitadas'){
                          this.vistaModulosHorasExtrasHorasExtrasSolicitadas = true;
                        }
                      }
                      if(!this.vistaModulosHorasExtrasHorasExtrasSolicitadas){
                        this.childrenHorasExtras.push({name: 'Aprobación Múltiple HE.', url: '/horas-extras-solicitadas', color: true, ver: true}); 
                      }
                      break;
                    case 'listarTipoComidas':
                      this.itemModulos = true;
                      this.subItemModulosAlimentacion = true;
                      for (const parametrizacion of this.childrenAlimentacion) {
                        if(parametrizacion.url === '/listarTipoComidas'){
                          this.vistaModulosAlimentacionListarTipoComidas = true;
                        }
                      }
                      if(!this.vistaModulosAlimentacionListarTipoComidas){
                        this.childrenAlimentacion.push({name: 'Configurar comidas', url: '/listarTipoComidas', color: true, ver: true}); 
                      }
                      break;
                    case 'alimentacion':
                      this.itemModulos = true;
                      this.subItemModulosAlimentacion = true;
                      for (const parametrizacion of this.childrenAlimentacion) {
                        if(parametrizacion.url === '/alimentacion'){
                          this.vistaModulosAlimentacionAlimentacion = true;
                        }
                      }
                      if(!this.vistaModulosAlimentacionAlimentacion){
                        this.childrenAlimentacion.push({name: 'Planificar Servicio', url: '/alimentacion', color: true, ver: true}); 
                      }
                      break;
                    case 'listaPlanComida':
                      this.itemModulos = true;
                      this.subItemModulosAlimentacion = true;
                      for (const parametrizacion of this.childrenAlimentacion) {
                        if(parametrizacion.url === '/listaPlanComida'){
                          this.vistaModulosAlimentacionListaPlanComida = true;
                        }
                      }
                      if(!this.vistaModulosAlimentacionListaPlanComida){
                        this.childrenAlimentacion.push({name: 'Listar Planificación', url: '/listaPlanComida', color: true, ver: true}); 
                      }
                      break;
                    case 'listaSolicitaComida':
                      this.itemModulos = true;
                      this.subItemModulosAlimentacion = true;
                      for (const parametrizacion of this.childrenAlimentacion) {
                        if(parametrizacion.url === '/listaSolicitaComida'){
                          this.vistaModulosAlimentacionListaSolicitaComida = true;
                        }
                      }
                      if(!this.vistaModulosAlimentacionListaSolicitaComida){
                        this.childrenAlimentacion.push({name: 'Aprobación Múltiple A.', url: '/listaSolicitaComida', color: true, ver: true}); 
                      }
                      break;
                    case 'proceso':
                      this.itemModulos = true;
                      this.subItemModulosAccionPersonal = true;
                      for (const parametrizacion of this.childrenAccionPersonal) {
                        if(parametrizacion.url === '/proceso'){
                          this.vistaModulosAccionPersonalProceso = true;
                        }
                      }
                      if(!this.vistaModulosAccionPersonalProceso){
                        this.childrenAccionPersonal.push({name: 'Procesos', url: '/proceso', color: true, ver: true}); 
                      }
                      break;
                    case 'acciones-personal':
                      this.itemModulos = true;
                      this.subItemModulosAccionPersonal = true;
                      for (const parametrizacion of this.childrenAccionPersonal) {
                        if(parametrizacion.url === '/acciones-personal'){
                          this.vistaModulosAccionPersonalAccionesPersonal = true;
                        }
                      }
                      if(!this.vistaModulosAccionPersonalAccionesPersonal){
                        this.childrenAccionPersonal.push({name: 'Tipo Acción Personal', url: '/acciones-personal', color: true, ver: true});
                      }
                      break;
                    case 'pedidoAccion':
                      this.itemModulos = true;
                      this.subItemModulosAccionPersonal = true;
                      for (const parametrizacion of this.childrenAccionPersonal) {
                        if(parametrizacion.url === '/pedidoAccion'){
                          this.vistaModulosAccionPersonalPedidoAccion = true;
                        }
                      }
                      if(!this.vistaModulosAccionPersonalPedidoAccion){
                        this.childrenAccionPersonal.push({name: 'Pedido Acción Personal', url: '/pedidoAccion', color: true, ver: true});
                      }
                      break;
                    case 'listaPedidos':
                      this.itemModulos = true;
                      this.subItemModulosAccionPersonal = true;
                      for (const parametrizacion of this.childrenAccionPersonal) {
                        if(parametrizacion.url === '/listaPedidos'){
                          this.vistaModulosAccionPersonalListaPedidos = true;
                        }
                      }
                      if(!this.vistaModulosAccionPersonalListaPedidos){
                        this.childrenAccionPersonal.push({name: 'Listar Pedidos', url: '/listaPedidos', color: true, ver: true});
                      }
                      break;
                    case 'coordenadas':
                      this.itemModulos = true;
                      this.subItemModulosGeolocalizacion = true;
                      for (const parametrizacion of this.childrenGeolocalizacion) {
                        if(parametrizacion.url === '/coordenadas'){
                          this.vistaModulosGeolocalizacionCoordenadas = true;
                        }
                      }
                      if(!this.vistaModulosGeolocalizacionCoordenadas){
                        this.childrenGeolocalizacion.push({name: 'Registrar Geolocalización', url: '/coordenadas', color: true, ver: true});
                      }
                      break;
                    case 'timbresWeb':
                      this.itemModulos = true;
                      this.subItemModulosTimbreVirtual = true;
                      for (const parametrizacion of this.childrenTimbreVirtual) {
                        if(parametrizacion.url === '/timbresWeb'){
                          this.vistaModulosTimbreVirtualTimbresWeb = true;
                        }
                      }
                      if(!this.vistaModulosTimbreVirtualTimbresWeb){
                        this.childrenTimbreVirtual.push({name: 'Configurar Timbre Virtual', url: '/timbresWeb', color: true, ver: true});
                      }
                      break;
                    case 'timbres-personal':
                      this.itemModulos = true;
                      this.subItemModulosTimbreVirtual = true;
                      for (const parametrizacion of this.childrenTimbreVirtual) {
                        if(parametrizacion.url === '/timbres-personal'){
                          this.vistaModulosTimbreVirtualTimbresPersonal = true;
                        }
                      }
                      if(!this.vistaModulosTimbreVirtualTimbresPersonal){
                        this.childrenTimbreVirtual.push({name: 'Timbrar', url: '/timbres-personal', color: true, ver: true});
                      }
                      break;
                    case 'app-movil':
                      this.itemModulos = true;
                      this.subItemModulosAplicacionMovil = true;
                      for (const parametrizacion of this.childrenAplicacionMovil) {
                        if(parametrizacion.url === '/app-movil'){
                          this.vistaModulosAplicacionMovilAppMovil = true;
                        }
                      }
                      if(!this.vistaModulosAplicacionMovilAppMovil){
                        this.childrenAplicacionMovil.push({name: 'Reloj Virtual', url: '/app-movil', color: true, ver: true});
                      }
                      break;
                    case 'registro-dispositivos':
                      this.itemModulos = true;
                      this.subItemModulosAplicacionMovil = true;
                      for (const parametrizacion of this.childrenAplicacionMovil) {
                        if(parametrizacion.url === '/registro-dispositivos'){
                          this.vistaModulosAplicacionMovilRegistroDispositivos = true;
                        }
                      }
                      if(!this.vistaModulosAplicacionMovilRegistroDispositivos){
                        this.childrenAplicacionMovil.push({name: 'Registro Dispositivos', url: '/registro-dispositivos', color: true, ver: true});
                      }
                      break;
                    case 'listarRelojes':
                      this.itemTimbres = true;
                      for (const parametrizacion of this.childrenTimbres) {
                        if(parametrizacion.url === '/listarRelojes'){
                          this.vistaModulosTimbresListarRelojes = true;
                        }
                      }
                      if(!this.vistaModulosTimbresListarRelojes){
                        this.childrenTimbres.push({name: 'Dispositivos', url: '/listarRelojes', color: true, ver: true});
                      }
                      break;
                    case 'timbres-admin':
                      this.itemTimbres = true;
                      for (const parametrizacion of this.childrenTimbres) {
                        if(parametrizacion.url === '/timbres-admin'){
                          this.vistaModulosTimbresTimbresAdmin = true;
                        }
                      }
                      if(!this.vistaModulosTimbresTimbresAdmin){
                        this.childrenTimbres.push({name: 'Administrar Timbres', url: '/timbres-admin', color: true, ver: true});
                      }
                      break;
                    case 'timbres-multiples':
                      this.itemTimbres = true;
                      for (const parametrizacion of this.childrenTimbres) {
                        if(parametrizacion.url === '/timbres-multiples'){
                          this.vistaModulosTimbresTimbresMultiples = true;
                        }
                      }
                      if(!this.vistaModulosTimbresTimbresMultiples){
                        this.childrenTimbres.push({name: 'Registrar Timbres', url: '/timbres-multiples', color: true, ver: true});
                      }
                      break;
                    case 'buscar-timbre':
                      this.itemTimbres = true;
                      for (const parametrizacion of this.childrenTimbres) {
                        if(parametrizacion.url === '/buscar-timbre'){
                          this.vistaModulosTimbresBuscarTimbre = true;
                        }
                      }
                      if(!this.vistaModulosTimbresBuscarTimbre){
                        this.childrenTimbres.push({name: 'Actualizar Timbres', url: '/buscar-timbre', color: true, ver: true});
                      }
                      break;
                    case 'configurarNotificaciones':
                      this.itemNotificaciones = true;
                      for (const parametrizacion of this.childrenNotificaciones) {
                        if(parametrizacion.url === '/configurarNotificaciones'){
                          this.vistaModulosNotificacionesConfigurarNotificaciones = true;
                        }
                      }
                      if(!this.vistaModulosNotificacionesConfigurarNotificaciones){
                        this.childrenNotificaciones.push({name: 'Configurar Notificaciones', url: '/configurarNotificaciones', color: true, ver: true});
                      }
                      break;
                    case 'archivos':
                      this.itemNotificaciones = true;
                      for (const parametrizacion of this.childrenNotificaciones) {
                        if(parametrizacion.url === '/archivos'){
                          this.vistaModulosNotificacionesArchivos = true;
                        }
                      }
                      if(!this.vistaModulosNotificacionesArchivos){
                        this.childrenNotificaciones.push({name: 'Documentos', url: '/archivos', color: true, ver: true});
                      }
                      break;
                    case 'cumpleanios':
                      this.itemNotificaciones = true;
                      for (const parametrizacion of this.childrenNotificaciones) {
                        if(parametrizacion.url === '/cumpleanios'){
                          this.vistaModulosNotificacionesCumpleanios = true;
                        }
                      }
                      if(!this.vistaModulosNotificacionesCumpleanios){
                        this.childrenNotificaciones.push({name: 'Cumpleaños', url: '/cumpleanios', color: true, ver: true});
                      }
                      break;
                    case 'comunicados':
                      this.itemNotificaciones = true;
                      for (const parametrizacion of this.childrenNotificaciones) {
                        if(parametrizacion.url === '/comunicados'){
                          this.vistaModulosNotificacionesComunicados = true;
                        }
                      }
                      if(!this.vistaModulosNotificacionesComunicados){
                        this.childrenNotificaciones.push({name: 'Comunicados', url: '/comunicados', color: true, ver: true});
                      }
                      break;
                    case 'reporteEmpleados':
                      this.itemReportes = true;
                      this.subItemReportesGenerales = true;
                      for (const parametrizacion of this.childrenGenerales) {
                        if(parametrizacion.url === '/reporteEmpleados'){
                          this.vistaReportesGeneralesReporteEmpleados = true;
                        }
                      }
                      if(!this.vistaReportesGeneralesReporteEmpleados){
                        this.childrenGenerales.push({name: 'Usuarios', url: '/reporteEmpleados', color: true, ver: true});
                      }
                      break;
                    case 'lista-vacunados':
                      this.itemReportes = true;
                      this.subItemReportesGenerales = true;
                      for (const parametrizacion of this.childrenGenerales) {
                        if(parametrizacion.url === '/lista-vacunados'){
                          this.vistaReportesGeneralesListaVacunados = true;
                        }
                      }
                      if(!this.vistaReportesGeneralesListaVacunados){
                        this.childrenGenerales.push({name: 'Registro Vacunación', url: '/lista-vacunados', color: true, ver: true});
                      }
                      break;
                    case 'reporte-faltas':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/reporte-faltas'){
                          this.vistaReportesAsistenciaReporteFaltas = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaReporteFaltas){
                        this.childrenAsistencia.push({name: 'Faltas', url: '/reporte-faltas', color: true, ver: true});
                      }
                      break;
                    case 'reporte-atrasos-multiples':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/reporte-atrasos-multiples'){
                          this.vistaReportesAsistenciaReporteAtrasosMultiples = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaReporteAtrasosMultiples){
                        this.childrenAsistencia.push({name: 'Atrasos', url: '/reporte-atrasos-multiples', color: true, ver: true});
                      }
                      break;
                    case 'reporte-horas-trabajadas':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/reporte-horas-trabajadas'){
                          this.vistaReportesAsistenciaReporteHorasTrabajadas = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaReporteHorasTrabajadas){
                        this.childrenAsistencia.push({name: 'Tiempo Laborado', url: '/reporte-horas-trabajadas', color: true, ver: true});
                      }
                      break;
                    case 'tiempo-alimentacion':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/tiempo-alimentacion'){
                          this.vistaReportesAsistenciaTiempoAlimentacion = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaTiempoAlimentacion){
                        this.childrenAsistencia.push({name: 'Tiempo Alimentación', url: '/tiempo-alimentacion', color: true, ver: true});
                      }
                      break;
                    case 'salidas-anticipadas':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/salidas-anticipadas'){
                          this.vistaReportesAsistenciaSalidasAnticipadas = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaSalidasAnticipadas){
                        this.childrenAsistencia.push({name: 'Salidas Anticipadas', url: '/salidas-anticipadas', color: true, ver: true});
                      }
                      break;
                    case 'reporte-resumen-asistencia':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/reporte-resumen-asistencia'){
                          this.vistaReportesAsistenciaReporteResumenAsistencia = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaReporteResumenAsistencia){
                        this.childrenAsistencia.push({name: 'Resumen Asistencia', url: '/reporte-resumen-asistencia', color: true, ver: true});
                      }
                      break;
                    case 'reporte-planificacion-horaria':
                      this.itemReportes = true;
                      this.subItemReportesAsistencia = true;
                      for (const parametrizacion of this.childrenAsistencia) {
                        if(parametrizacion.url === '/reporte-planificacion-horaria'){
                          this.vistaReportesAsistenciaReportePlanificacionHoraria = true;
                        }
                      }
                      if(!this.vistaReportesAsistenciaReportePlanificacionHoraria){
                        this.childrenAsistencia.push({name: 'Planificación Horaria', url: '/reporte-planificacion-horaria', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbres-multiples':
                      this.itemReportes = true;
                      this.subItemReportesTimbres = true;
                      for (const parametrizacion of this.childrenReportesTimbres) {
                        if(parametrizacion.url === '/reporte-timbres-multiples'){
                          this.vistaReportesTimbresReporteTimbresMultiples = true;
                        }
                      }
                      if(!this.vistaReportesTimbresReporteTimbresMultiples){
                        this.childrenReportesTimbres.push({name: 'Timbres', url: '/reporte-timbres-multiples', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbre-mrl':
                      this.itemReportes = true;
                      this.subItemReportesTimbres = true;
                      for (const parametrizacion of this.childrenReportesTimbres) {
                        if(parametrizacion.url === '/reporte-timbre-mrl'){
                          this.vistaReportesTimbresReporteTimbreMlr = true;
                        }
                      }
                      if(!this.vistaReportesTimbresReporteTimbreMlr){
                        this.childrenReportesTimbres.push({name: 'Timbres MRL', url: '/reporte-timbre-mrl', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbre-abierto':
                      this.itemReportes = true;
                      this.subItemReportesTimbres = true;
                      for (const parametrizacion of this.childrenReportesTimbres) {
                        if(parametrizacion.url === '/reporte-timbre-abierto'){
                          this.vistaReportesTimbresReporteTimbreAbierto = true;
                        }
                      }
                      if(!this.vistaReportesTimbresReporteTimbreAbierto){
                        this.childrenReportesTimbres.push({name: 'Timbres Libres', url: '/reporte-timbre-abierto', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbre-incompleto':
                      this.itemReportes = true;
                      this.subItemReportesTimbres = true;
                      for (const parametrizacion of this.childrenReportesTimbres) {
                        if(parametrizacion.url === '/reporte-timbre-incompleto'){
                          this.vistaReportesTimbresReporteTimbreIncompleto = true;
                        }
                      }
                      if(!this.vistaReportesTimbresReporteTimbreIncompleto){
                        this.childrenReportesTimbres.push({name: 'Timbres Incompletos', url: '/reporte-timbre-incompleto', color: true, ver: true});
                      }
                      break;
                    case 'reportePermisos':
                      this.itemReportes = true;
                      this.subItemReportesPermisos = true;
                      for (const parametrizacion of this.childrenReportesPermisos) {
                        if(parametrizacion.url === '/reportePermisos'){
                          this.vistaReportesPermisosReportePermisos = true;
                        }
                      }
                      if(!this.vistaReportesPermisosReportePermisos){
                        this.childrenReportesPermisos.push({name: 'Permisos', url: '/reportePermisos', color: true, ver: true});
                      }
                      break;
                    case 'reporteKardex':
                      this.itemReportes = true;
                      this.subItemReportesVacaciones = true;
                      for (const parametrizacion of this.childrenReportesVacaciones) {
                        if(parametrizacion.url === '/reporteKardex'){
                          this.vistaReportesVacacionesReporteKardex = true;
                        }
                      }
                      if(!this.vistaReportesVacacionesReporteKardex){
                        this.childrenReportesVacaciones.push({name: 'Kardex', url: '/reporteKardex', color: true, ver: true});
                      }
                      break;
                    case 'solicitud-vacacion':
                      this.itemReportes = true;
                      this.subItemReportesVacaciones = true;
                      for (const parametrizacion of this.childrenReportesVacaciones) {
                        if(parametrizacion.url === '/solicitud-vacacion'){
                          this.vistaReportesVacacionesSolicitudVacacion = true;
                        }
                      }
                      if(!this.vistaReportesVacacionesSolicitudVacacion){
                        this.childrenReportesVacaciones.push({name: 'Vacaciones Solicitadas', url: '/solicitud-vacacion', color: true, ver: true});
                      }
                      break;
                    case 'horas/extras':
                      this.itemReportes = true;
                      this.subItemReportesHorasExtras = true;
                      for (const parametrizacion of this.childrenReportesHorasExtras) {
                        if(parametrizacion.url === '/horas/extras'){
                          this.vistaReportesHorasExtrasHorasExtras = true;
                        }
                      }
                      if(!this.vistaReportesHorasExtrasHorasExtras){
                        this.childrenReportesHorasExtras.push({name: 'Solicitudes Horas Extras', url: '/horas/extras', color: true, ver: true});
                      }
                      break;
                    case 'reporteHorasExtras':
                      this.itemReportes = true;
                      this.subItemReportesHorasExtras = true;
                      for (const parametrizacion of this.childrenReportesHorasExtras) {
                        if(parametrizacion.url === '/reporteHorasExtras'){
                          this.vistaReportesHorasExtrasReporteHorasExtras = true;
                        }
                      }
                      if(!this.vistaReportesHorasExtrasReporteHorasExtras){
                        this.childrenReportesHorasExtras.push({name: 'Horas Extras Autorizaciones', url: '/reporteHorasExtras', color: true, ver: true});
                      }
                      break;
                    case 'macro/hora-extra':
                      this.itemReportes = true;
                      this.subItemReportesHorasExtras = true;
                      for (const parametrizacion of this.childrenReportesHorasExtras) {
                        if(parametrizacion.url === '/macro/hora-extra'){
                          this.vistaReportesHorasExtrasMacroHoraExtra = true;
                        }
                      }
                      if(!this.vistaReportesHorasExtrasMacroHoraExtra){
                        this.childrenReportesHorasExtras.push({name: 'Horas Extras', url: '/macro/hora-extra', color: true, ver: true});
                      }
                      break;
                    case 'macro/jornada-vs-hora-extra':
                      this.itemReportes = true;
                      this.subItemReportesHorasExtras = true;
                      for (const parametrizacion of this.childrenReportesHorasExtras) {
                        if(parametrizacion.url === '/macro/jornada-vs-hora-extra'){
                          this.vistaReportesHorasExtrasMacroJornadavsHoraExtra = true;
                        }
                      }
                      if(!this.vistaReportesHorasExtrasMacroJornadavsHoraExtra){
                        this.childrenReportesHorasExtras.push({name: 'Jornada vs Horas extras', url: 'macro/jornada-vs-hora-extra', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbre-reloj-virtual':
                      this.itemReportes = true;
                      this.subItemReportesAplicacionMovil = true;
                      for (const parametrizacion of this.childrenReportesAplicacionMovil) {
                        if(parametrizacion.url === '/reporte-timbre-reloj-virtual'){
                          this.vistaReportesAplicacionMovilReporteTimbreRelojVirtual = true;
                        }
                      }
                      if(!this.vistaReportesAplicacionMovilReporteTimbreRelojVirtual){
                        this.childrenReportesAplicacionMovil.push({name: 'Timbre Reloj Virtual', url: '/reporte-timbre-reloj-virtual', color: true, ver: true});
                      }
                      break;
                    case 'reporte-timbre-sistema':
                      this.itemReportes = true;
                      this.subItemReportesTimbreVirtual = true;
                      for (const parametrizacion of this.childrenReportesAplicacionMovil) {
                        if(parametrizacion.url === '/reporte-timbre-sistema'){
                          this.vistaReportesTimbreVirtualReporteTimbreSistema = true;
                        }
                      }
                      if(!this.vistaReportesTimbreVirtualReporteTimbreSistema){
                        this.childrenReportesTimbreVirtual.push({name: 'Timbre Virtual', url: '/reporte-timbre-sistema', color: true, ver: true});
                      }
                      break;
                    case 'alimentosGeneral':
                      this.itemReportes = true;
                      this.subItemReportesAlimentacion = true;
                      for (const parametrizacion of this.childrenReportesAlimentacion) {
                        if(parametrizacion.url === '/alimentosGeneral'){
                          this.vistaReportesAlimentacionAlimentosGeneral = true;
                        }
                      }
                      if(!this.vistaReportesAlimentacionAlimentosGeneral){
                        this.childrenReportesAlimentacion.push({name: 'Tickets Consumidos', url: '/alimentosGeneral', color: true, ver: true});
                      }
                      break;
                    case 'alimentosDetallado':
                      this.itemReportes = true;
                      this.subItemReportesAlimentacion = true;
                      for (const parametrizacion of this.childrenReportesAlimentacion) {
                        if(parametrizacion.url === '/alimentosDetallado'){
                          this.vistaReportesAlimentacionAlimentosDetallado = true;
                        }
                      }
                      if(!this.vistaReportesAlimentacionAlimentosDetallado){
                        this.childrenReportesAlimentacion.push({name: 'Detalle Tickets Consumidos', url: '/alimentosDetallado', color: true, ver: true});
                      }
                      break;
                    case 'alimentosInvitados':
                      this.itemReportes = true;
                      this.subItemReportesAlimentacion = true;
                      for (const parametrizacion of this.childrenReportesAlimentacion) {
                        if(parametrizacion.url === '/alimentosInvitados'){
                          this.vistaReportesAlimentacionAlimentosInvitados = true;
                        }
                      }
                      if(!this.vistaReportesAlimentacionAlimentosInvitados){
                        this.childrenReportesAlimentacion.push({name: 'Servicios Invitados', url: '/alimentosInvitados', color: true, ver: true});
                      }
                      break;
                    case 'analisisDatos':
                      this.itemReportes = true;
                      this.subItemReportesAnalisisDatos = true;
                      for (const parametrizacion of this.childrenReportesAnalisisDatos) {
                        if(parametrizacion.url === '/analisisDatos'){
                          this.vistaReportesAnalisisDatosAnalisisDatos = true;
                        }
                      }
                      if(!this.vistaReportesAnalisisDatosAnalisisDatos){
                        this.childrenReportesAnalisisDatos.push({name: 'Análisis Datos', url: '/analisisDatos', color: true, ver: true});
                      }
                      break;
                  }

                  this.datosPaginaRol.push({accion: row.accion, id_funcion: row.id_funcion, link: row.link});
                }
              );

              //guardado de datosPaginaRol
              sessionStorage.setItem('paginaRol', JSON.stringify(this.datosPaginaRol));

              //FIXME
              //Armado de json con elementos de menu COMPLETE
              this.menuGeneralUsuarios = [
                {
                  name: 'Configuración',
                  accion: this.itemConfiguracion,
                  estado: this.itemConfiguracion,
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
                      children: this.childrenParametrizacion
                    },
                    {
                      name: 'Localización',
                      accion: true,
                      estado: true,
                      color: true,
                      subtitulo: true,
                      icono: 'location_on',
                      children: this.childrenLocalizacion
                    },
                  ]
                },
                {
                  name: 'Usuarios',
                  accion: this.itemUsuarios,
                  estado: this.itemUsuarios,
                  color: true,
                  subtitulo: false,
                  icono: 'account_circle',
                  children: this.childrenUsuarios
                },
                {
                  name: 'Horarios',
                  accion: this.itemHorarios,
                  estado: this.itemHorarios,
                  color: true,
                  subtitulo: false,
                  icono: 'assignment',
                  children: this.childrenHorarios
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
                      accion: this.HabilitarPermisos && this.subItemModulosPermisos ? true : false,
                      estado: this.HabilitarPermisos && this.subItemModulosPermisos ? true : false,
                      color: true,
                      subtitulo: true,
                      icono: 'insert_emoticon',
                      children: this.childrenPermisos
                    },
                    {
                      name: 'Permisos.',
                      accion: !this.HabilitarPermisos || !this.subItemModulosPermisos,
                      estado: !this.HabilitarPermisos || !this.subItemModulosPermisos,
                      color: false,
                      activo: false,
                      icono: 'insert_emoticon',
                      url: this.HabilitarPermisos ? '/home' : '/verTipoPermiso',//this.HabilitarPermisos
                    },
                    {
                      name: 'Vacaciones',
                      accion: this.HabilitarVacaciones && this.subItemModulosVacaciones ? true : false,
                      estado: this.HabilitarVacaciones && this.subItemModulosVacaciones ? true : false,
                      icono: 'flight',
                      subtitulo: true,
                      color: true,
                      children: this.childrenVacaciones
                    },
                    {
                      name: 'Vacaciones.',
                      accion: !this.HabilitarVacaciones || !this.subItemModulosVacaciones,
                      estado: !this.HabilitarVacaciones || !this.subItemModulosVacaciones,
                      activo: false,
                      icono: 'flight',
                      color: false,
                      url: this.HabilitarVacaciones ? '/home' : '/vacaciones-solicitados'
                    },
                    {
                      name: 'Horas Extras',
                      accion: this.HabilitarHoraExtra && this.subItemModulosHorasExtras ? true : false,
                      estado: this.HabilitarHoraExtra && this.subItemModulosHorasExtras ? true : false,
                      color: true,
                      subtitulo: true,
                      icono: 'schedule',
                      children: this.childrenHorasExtras
                    },
                    {
                      name: 'Horas Extras.',
                      accion: !this.HabilitarHoraExtra || !this.subItemModulosHorasExtras,
                      estado: !this.HabilitarHoraExtra || !this.subItemModulosHorasExtras,
                      activo: false,
                      icono: 'schedule',
                      color: false,
                      url: this.HabilitarHoraExtra ? '/home' : '/listaHorasExtras'
                    },
                    {
                      name: 'Alimentación',
                      accion: this.HabilitarAlimentacion && this.subItemModulosAlimentacion ? true : false,
                      estado: this.HabilitarAlimentacion && this.subItemModulosAlimentacion ? true : false,
                      subtitulo: true,
                      icono: 'local_dining',
                      color: true,
                      children: this.childrenAlimentacion
                    },
                    {
                      name: 'Alimentación.',
                      accion: !this.HabilitarAlimentacion || !this.subItemModulosAlimentacion,
                      estado: !this.HabilitarAlimentacion || !this.subItemModulosAlimentacion,
                      activo: false,
                      icono: 'local_dining',
                      color: false,
                      url: this.HabilitarAlimentacion ? '/home' : '/listarTipoComidas'
                    },
                    {
                      name: 'Acción Personal',
                      accion: this.HabilitarAccion && this.subItemModulosAccionPersonal,
                      estado: this.HabilitarAccion && this.subItemModulosAccionPersonal,
                      icono: 'how_to_reg',
                      color: true,
                      subtitulo: true,
                      children: this.childrenAccionPersonal
                    },
                    {
                      name: 'Acción Personal.',
                      accion: !this.HabilitarAccion || !this.subItemModulosAccionPersonal,
                      estado: !this.HabilitarAccion || !this.subItemModulosAccionPersonal,
                      activo: false,
                      icono: 'how_to_reg',
                      color: false,
                      url: this.HabilitarAccion ? '/home' : '/proceso'
                    },
                    {
                      name: 'Geolocalización',
                      accion: this.HabilitarGeolocalizacion && this.subItemModulosGeolocalizacion,
                      estado: this.HabilitarGeolocalizacion && this.subItemModulosGeolocalizacion,
                      icono: 'my_location',
                      subtitulo: true,
                      color: true,
                      children: this.childrenGeolocalizacion
                    },
                    {
                      name: 'Geolocalización.',
                      accion: !this.HabilitarGeolocalizacion || !this.subItemModulosGeolocalizacion,
                      estado: !this.HabilitarGeolocalizacion || !this.subItemModulosGeolocalizacion,
                      activo: false,
                      icono: 'my_location',
                      color: false,
                      url: this.HabilitarGeolocalizacion ? '/home' : '/coordenadas'
                    },
                    {
                      name: 'Timbre Virtual',
                      accion: this.HabilitarTimbreWeb && this.subItemModulosTimbreVirtual,
                      estado: this.HabilitarTimbreWeb && this.subItemModulosTimbreVirtual,
                      icono: 'computer',
                      color: true,
                      subtitulo: true,
                      children: this.childrenTimbreVirtual
                    },
                    {
                      name: 'Timbre Virtual.',
                      accion: !this.HabilitarTimbreWeb || !this.subItemModulosTimbreVirtual,
                      estado: !this.HabilitarTimbreWeb || !this.subItemModulosTimbreVirtual,
                      activo: false,
                      icono: 'computer',
                      color: false,
                      url: this.HabilitarTimbreWeb ? '/home' : '/timbresWeb'
                    },
                    {
                      name: 'Aplicación Móvil',
                      accion: this.HabilitarMovil && this.subItemModulosAplicacionMovil,
                      estado: this.HabilitarMovil && this.subItemModulosAplicacionMovil,
                      icono: 'phone_android',
                      color: true,
                      subtitulo: true,
                      children: this.childrenAplicacionMovil
                    },
                    {
                      name: 'Aplicación Móvil.',
                      accion: !this.HabilitarMovil || !this.subItemModulosAplicacionMovil,
                      estado: !this.HabilitarMovil || !this.subItemModulosAplicacionMovil,
                      activo: false,
                      icono: 'phone_android',
                      color: false,
                      url: this.HabilitarMovil ? '/home' : '/app-movil'
                    },
                  ]
                },
                {
                  name: 'Timbres',
                  accion: this.itemTimbres,
                  estado: this.itemTimbres,
                  icono: 'fingerprint',
                  color: true,
                  subtitulo: false,
                  children: this.childrenTimbres
                },
                {
                  name: 'Notificaciones',
                  accion: this.itemNotificaciones,
                  estado: this.itemNotificaciones,
                  subtitulo: false,
                  icono: 'notifications',
                  color: true,
                  children: this.childrenNotificaciones
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
                      name: 'R. Generales',
                      accion: this.subItemReportesGenerales,
                      estado: this.subItemReportesGenerales,
                      subtitulo: true,
                      icono: 'group',
                      color: true,
                      children: this.childrenGenerales
                    },
                    {
                      name: 'R. Generales.',
                      accion: !this.subItemReportesGenerales,
                      estado: !this.subItemReportesGenerales,
                      color: false,
                      activo: false,
                      icono: 'group',
                      url: '/home'
                    },
                    {
                      name: 'R. Asistencia',
                      accion: this.subItemReportesAsistencia,
                      estado: this.subItemReportesAsistencia,
                      subtitulo: true,
                      icono: 'check_circle_outline',
                      color: true,
                      children: this.childrenAsistencia
                    },
                    {
                      name: 'R. Asistencia.',
                      accion: !this.subItemReportesAsistencia,
                      estado: !this.subItemReportesAsistencia,
                      color: false,
                      activo: false,
                      icono: 'check_circle_outline',
                      url: '/home'
                    },
                    {
                      name: 'R. Timbres',
                      accion: this.subItemReportesTimbres,
                      estado: this.subItemReportesTimbres,
                      subtitulo: true,
                      icono: 'touch_app',
                      color: true,
                      children: this.childrenReportesTimbres
                    },
                    {
                      name: 'R. Timbres.',
                      accion: !this.subItemReportesTimbres,
                      estado: !this.subItemReportesTimbres,
                      color: false,
                      activo: false,
                      icono: 'touch_app',
                      url: '/home'
                    },
                    {
                      name: 'R. Permisos',
                      accion: this.HabilitarPermisos && this.subItemReportesPermisos ? true : false,
                      estado: this.HabilitarPermisos && this.subItemReportesPermisos ? true : false,
                      icono: 'insert_emoticon',
                      color: true,
                      subtitulo: true,
                      children: this.childrenReportesPermisos
                    },
                    {
                      name: 'R. Permisos.',
                      accion: !this.HabilitarPermisos || !this.subItemReportesPermisos,
                      estado: !this.HabilitarPermisos || !this.subItemReportesPermisos,
                      color: false,
                      activo: false,
                      icono: 'insert_emoticon',
                      url: '/home'
                    },
                    {
                      name: 'R. Vacaciones',
                      accion: this.HabilitarVacaciones && this.subItemReportesVacaciones ? true : false,
                      estado: this.HabilitarVacaciones && this.subItemReportesVacaciones ? true : false,
                      icono: 'flight',
                      color: true,
                      subtitulo: true,
                      children: this.childrenReportesVacaciones
                    },
                    {
                      name: 'R. Vacaciones.',
                      accion: !this.HabilitarVacaciones || !this.subItemReportesVacaciones,
                      estado: !this.HabilitarVacaciones || !this.subItemReportesVacaciones,
                      color: false,
                      activo: false,
                      icono: 'flight',
                      url: '/home'
                    },
                    {
                      name: 'R. Horas Extras',
                      accion: this.HabilitarHoraExtra && this.subItemReportesHorasExtras ? true : false,
                      estado: this.HabilitarHoraExtra && this.subItemReportesHorasExtras ? true : false,
                      icono: 'schedule',
                      color: true,
                      subtitulo: true,
                      children: this.childrenReportesHorasExtras
                    },
                    {
                      name: 'R. Horas Extras.',
                      accion: !this.HabilitarHoraExtra || !this.subItemReportesHorasExtras,
                      estado: !this.HabilitarHoraExtra || !this.subItemReportesHorasExtras,
                      color: false,
                      activo: false,
                      icono: 'schedule',
                      url: '/home'
                    },
                    {
                      name: 'R. Aplicación Móvil',
                      accion: this.HabilitarMovil,
                      estado: this.HabilitarMovil,
                      icono: 'phone_android',
                      subtitulo: true,
                      color: true,
                      children: this.childrenReportesAplicacionMovil
                    },
                    {
                      name: 'R. Aplicación Móvil.',
                      accion: !this.HabilitarMovil || !this.subItemReportesAplicacionMovil,
                      estado: !this.HabilitarMovil || !this.subItemReportesAplicacionMovil,
                      color: false,
                      activo: false,
                      icono: 'phone_android',
                      url: '/home'
                    },
                    {
                      name: 'R. Timbre Virtual',
                      accion: this.HabilitarTimbreWeb,
                      estado: this.HabilitarTimbreWeb,
                      icono: 'computer',
                      subtitulo: true,
                      color: true,
                      children: this.childrenReportesTimbreVirtual
                    },
                    {
                      name: 'R. Timbre Virtual.',
                      accion: !this.HabilitarTimbreWeb || !this.subItemReportesTimbreVirtual,
                      estado: !this.HabilitarTimbreWeb || !this.subItemReportesTimbreVirtual,
                      color: false,
                      activo: false,
                      icono: 'computer',
                      url: '/home'
                    },
                    {
                      name: 'R. Alimentación',
                      accion: this.HabilitarAlimentacion,
                      estado: true,
                      icono: 'restaurant',
                      subtitulo: true,
                      color: true,
                      children: this.childrenReportesAlimentacion
                    },
                    {
                      name: 'R. Alimentación.',
                      accion: !this.HabilitarAlimentacion || !this.subItemReportesAlimentacion,
                      estado: !this.HabilitarAlimentacion || !this.subItemReportesAlimentacion,
                      color: false,
                      activo: false,
                      icono: 'restaurant',
                      url: '/home'
                    },
                    {
                      name: 'R. Análisis Datos',
                      accion: this.subItemReportesAnalisisDatos,
                      estado: true,
                      icono: 'dashboard',
                      subtitulo: true,
                      color: true,
                      children: this.childrenReportesAnalisisDatos
                    },
                    {
                      name: 'R. Análisis Datos.',
                      accion: !this.subItemReportesAnalisisDatos,
                      estado: !this.subItemReportesAnalisisDatos,
                      color: false,
                      activo: false,
                      icono: 'dashboard',
                      url: '/home'
                    }
                    
                  ]
                },
              ]
              //Fin Armado de json con elementos de menu COMPLETE

              //Complemento de elementos
              //Configuracion
              if(!this.itemConfiguracion){
                const indexConfiguracion = this.menuGeneralUsuarios.findIndex(item => item.name === 'Configuración');
                if (indexConfiguracion !== -1) {
                  this.menuGeneralUsuarios.splice(indexConfiguracion, 1);
                }
              }
              //Configuracion-Parametrizacion
              if(!this.subItemConfiguracionParametrizacion){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Configuración');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'Parametrización');
                }
              }
              //Configuracion-Localizacion
              if(!this.subItemConfiguracionLocalizacion){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Configuración');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'Localización');
                }
              }
              //Usuarios
              if(!this.itemUsuarios){
                const indexUsuarios = this.menuGeneralUsuarios.findIndex(item => item.name === 'Usuarios');
                if (indexUsuarios !== -1) {
                  this.menuGeneralUsuarios.splice(indexUsuarios, 1);
                }
              }
              //Horarios
              if(!this.itemHorarios){
                const indexHorarios = this.menuGeneralUsuarios.findIndex(item => item.name === 'Horarios');
                if (indexHorarios !== -1) {
                  this.menuGeneralUsuarios.splice(indexHorarios, 1);
                }
              }
              //Timbres
              if(!this.itemTimbres){
                const indexTimbres = this.menuGeneralUsuarios.findIndex(item => item.name === 'Timbres');
                if (indexTimbres !== -1) {
                  this.menuGeneralUsuarios.splice(indexTimbres, 1);
                }
              }
              //Notificaciones
              if(!this.itemNotificaciones){
                const indexNotificaciones = this.menuGeneralUsuarios.findIndex(item => item.name === 'Notificaciones');
                if (indexNotificaciones !== -1) {
                  this.menuGeneralUsuarios.splice(indexNotificaciones, 1);
                }
              }
              //Modulos-Permisos              
              if (!this.HabilitarPermisos || !this.subItemModulosPermisos) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Permisos');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Permisos.');
                }
              }
              //Modulos-Vacaciones
              if (!this.HabilitarVacaciones || !this.subItemModulosVacaciones) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Vacaciones');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Vacaciones.');
                }
              }
              //Modulos-HorasExtras
              if (!this.HabilitarHoraExtra || !this.subItemModulosHorasExtras) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Horas Extras');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Horas Extras.');
                }
              }
              //Modulos-Alimentacion
              if (!this.HabilitarAlimentacion || !this.subItemModulosAlimentacion) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Alimentación');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Alimentación.');
                }
              }
              //Modulos-AccionPersonal
              if (!this.HabilitarAccion || !this.subItemModulosAccionPersonal) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Acción Personal');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Acción Personal.');
                }
              }
              //Modulos-Geolocalizacion
              if (!this.HabilitarGeolocalizacion || !this.subItemModulosGeolocalizacion) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Geolocalización');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Geolocalización.');
                }
              }
              //Modulos-TimbreVirtual
              if (!this.HabilitarTimbreWeb || !this.subItemModulosTimbreVirtual) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Timbre Virtual');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Timbre Virtual.');
                }
              }
              //Modulos-AplicacionMovil
              if (!this.HabilitarMovil || !this.subItemModulosAplicacionMovil) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Aplicación Móvil');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Módulos');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'Aplicación Móvil.');
                }
              }
              //Reportes-Generales
              if(!this.subItemReportesGenerales){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Generales');
                }
              }else{
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Generales.');
                }
              }
              //Reportes-Asistencia
              if(!this.subItemReportesAsistencia){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Asistencia');
                }
              }else{
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Asistencia.');
                }
              }
              //Reportes-timbres
              if(!this.subItemReportesTimbres){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Timbres');
                }
              }else{
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Timbres.');
                }
              }
              //Reportes-Permisos
              if (!this.HabilitarPermisos || !this.subItemReportesPermisos) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Permisos');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Permisos.');
                }
              }
              //Reportes-Vacaciones
              if (!this.HabilitarVacaciones || !this.subItemReportesVacaciones) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Vacaciones');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Vacaciones.');
                }
              }
              //Reportes-HorasExtras
              if (!this.HabilitarHoraExtra || !this.subItemReportesHorasExtras) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Horas Extras');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Horas Extras.');
                }
              }
              //Reportes-Aplicación Móvil
              if (!this.HabilitarMovil || !this.subItemReportesAplicacionMovil) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Aplicación Móvil');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Aplicación Móvil.');
                }
              }
              //Reportes-Timbre Virtual
              if (!this.HabilitarTimbreWeb || !this.subItemReportesTimbreVirtual) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Timbre Virtual');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Timbre Virtual.');
                }
              }
              //Reportes-Alimentación
              if (!this.HabilitarAlimentacion || !this.subItemReportesAlimentacion) {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Alimentación');
                }
              } else {
                const configurationItem = this.menuGeneralUsuarios.findIndex(item => item.name === 'Reportes');
                if (configurationItem !== -1 && this.menuGeneralUsuarios[configurationItem].children) {
                  this.filterMenuChildren(configurationItem, 'R. Alimentación.');
                }
              }
              //Reportes-Analisis
              if(!this.subItemReportesAnalisisDatos){
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Análisis Datos');
                }
              }else{
                const configuracionItem = this.menuGeneralUsuarios.findIndex(item => item.name == 'Reportes');
                if(configuracionItem !== -1 && this.menuGeneralUsuarios[configuracionItem].children){
                  this.menuGeneralUsuarios[configuracionItem].children = this.menuGeneralUsuarios[configuracionItem].children.filter(child => child.name !== 'R. Análisis Datos.');
                }
              }
              //Fin Complemento de elementos
              this.LlamarDatos();
            }
        }
      );
    }else{
      this.LlamarDatos();
    }
    
  }

  //Elimina elementos que cumplan con los parametros de entrada, quitar elementos sobrantes de menu lateral
  filterMenuChildren(index, itemName) {
    this.menuGeneralUsuarios[index].children = this.menuGeneralUsuarios[index].children.filter(child => child.name !== itemName);
  }

  filterMenuChildrenAdministrador(index, itemName) {
    this.menuGeneralAdministrador[index].children = this.menuGeneralAdministrador[index].children.filter(child => child.name !== itemName);
  }

}
