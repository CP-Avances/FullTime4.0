// IMPORTAR LIBRERIAS
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as L from 'leaflet';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

// IMPORTAR SERVICIOS
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { ScriptService } from 'src/app/servicios/empleado/script.service';

// IMPORTAR COMPONENTES
import { EditarVacacionesEmpleadoComponent } from 'src/app/componentes/modulos/vacaciones/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { RegistroAutorizacionDepaComponent } from 'src/app/componentes/autorizaciones/autorizaDepartamentos/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { EditarPeriodoVacacionesComponent } from '../../modulos/vacaciones/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { EditarAutorizacionDepaComponent } from 'src/app/componentes/autorizaciones/autorizaDepartamentos/editar-autorizacion-depa/editar-autorizacion-depa.component';
import { RegistrarEmpleProcesoComponent } from '../../modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { EditarEmpleadoProcesoComponent } from '../../modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { EditarSolicitudComidaComponent } from '../../modulos/alimentacion/solicitar-comida/editar-solicitud-comida/editar-solicitud-comida.component';
import { PlanificacionComidasComponent } from '../../modulos/alimentacion/planifica-comida/planificacion-comidas/planificacion-comidas.component';
import { EditarPlanHoraExtraComponent } from '../../modulos/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { RegistrarVacacionesComponent } from '../../modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { CancelarVacacionesComponent } from 'src/app/componentes/rolEmpleado/vacacion-empleado/cancelar-vacaciones/cancelar-vacaciones.component';
import { RegistrarPeriodoVComponent } from '../../modulos/vacaciones/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { EditarPlanComidasComponent } from '../../modulos/alimentacion/planifica-comida/editar-plan-comidas/editar-plan-comidas.component';
import { CancelarHoraExtraComponent } from 'src/app/componentes/rolEmpleado/horasExtras-empleado/cancelar-hora-extra/cancelar-hora-extra.component';
import { CambiarContrasenaComponent } from '../../iniciarSesion/contrasenia/cambiar-contrasena/cambiar-contrasena.component';
import { AdministraComidaComponent } from '../../modulos/alimentacion/administra-comida/administra-comida.component';
import { RegistroContratoComponent } from 'src/app/componentes/empleado/contrato/registro-contrato/registro-contrato.component';
import { CancelarPermisoComponent } from '../../rolEmpleado/permisos-empleado/cancelar-permiso/cancelar-permiso.component';
import { EditarEmpleadoComponent } from '../datos-empleado/editar-empleado/editar-empleado.component';
import { FraseSeguridadComponent } from '../../administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { TituloEmpleadoComponent } from '../titulos/titulo-empleado/titulo-empleado.component';
import { PlanHoraExtraComponent } from '../../modulos/horasExtras/planificacionHoraExtra/plan-hora-extra/plan-hora-extra.component';
import { DiscapacidadComponent } from '../discapacidad/discapacidad.component';
import { EditarTituloComponent } from '../titulos/editar-titulo/editar-titulo.component';
import { CambiarFraseComponent } from '../../administracionGeneral/frase-seguridad/cambiar-frase/cambiar-frase.component';
import { EditarVacunaComponent } from '../vacunacion/editar-vacuna/editar-vacuna.component';
import { EmplLeafletComponent } from '../../modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { CrearVacunaComponent } from '../vacunacion/crear-vacuna/crear-vacuna.component';
import { EmplCargosComponent } from 'src/app/componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { LoginService } from 'src/app/servicios/login/login.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';

@Component({
  selector: 'app-ver-empleado',
  templateUrl: './ver-empleado.component.html',
  styleUrls: ['./ver-empleado.component.css']
})

export class VerEmpleadoComponent implements OnInit {

  @ViewChild('tabla2') tabla2: ElementRef;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE ALMACENAMIENTO DE DATOS CONSULTADOS
  discapacidadUser: any = [];
  empleadoLogueado: any = [];
  contratoEmpleado: any = [];
  tituloEmpleado: any = [];
  idPerVacacion: any = [];
  empleadoUno: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE BOTONESimagenEmpleado
  btnTitulo = 'Añadir';
  btnDisc = 'Añadir';
  idEmpleado: string; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO SELECCIONADO PARA VER DATOS
  editar: string = '';

  idEmpleadoLogueado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  selectedIndex: number;
  imagenEmpleado: any;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase_m(): string { return this.plantillaPDF.marca_Agua }
  get logoE(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS EMPLEADO
    public restEmpleHorario: EmpleadoHorariosService, // SERVICIO DATOS HORARIO DE EMPLEADOS
    public restDiscapacidad: DiscapacidadService, // SERVICIO DATOS DISCAPACIDAD
    public restPlanComidas: PlanComidasService, // SERVICIO DATOS DE PLANIFICACIÓN COMIDAS
    public restVacaciones: VacacionesService, // SERVICIO DATOS DE VACACIONES
    public restDocumentos: DocumentosService, // SERVICIO DE DOCUMENTOS
    public restAutoridad: AutorizaDepartamentoService, // SERVICIO DATOS JEFES
    public restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public restPermiso: PermisosService, // SERVICIO DATOS PERMISOS
    public restEmpresa: EmpresaService, // SERVICIO DATOS EMPRESA
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE REGISTRO DE VACUNACIÓN
    public restTitulo: TituloService, // SERVICIO DATOS TÍTULO PROFESIONAL
    public plan_hora: PlanHoraExtraService,
    public restCargo: EmplCargosService, // SERVICIO DATOS CARGO
    public parametro: ParametrosService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public validar: ValidacionesService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public router: Router, // VARIABLE NAVEGACIÓN DE RUTAS URL
    public restU: UsuarioService, // SERVICIO DATOS USUARIO
    public aviso: RealTimeService,
    private restF: FuncionesService, // SERVICIO DATOS FUNCIONES DEL SISTEMA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private restHE: PedHoraExtraService, // SERVICIO DATOS PEDIDO HORA EXTRA
    private sesion: LoginService,
    private informacion: DatosGeneralesService,
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private scriptService: ScriptService, // SERVICIO DATOS EMPLEADO - REPORTE
    private activatedRoute: ActivatedRoute,
    private restPlanGeneral: PlanGeneralService, // SERVICIO DATOS DE PLANIFICACION
    private aprobar: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES

  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    var cadena = this.router.url.split('#')[0];
    this.idEmpleado = cadena.split("/")[2];
    this.scriptService.load('pdfMake', 'vfsFonts');

    console.log('cadena: ', cadena);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    var a = moment();
    this.FechaActual = a.format('YYYY-MM-DD');
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.idEmpleado = id)
      )
      .subscribe(() => {
        this.ObtenerEmpleadoLogueado(this.idEmpleadoLogueado);
        this.ObtenerTituloEmpleado();
        this.ObtenerDiscapacidadEmpleado();
        this.VerAccionContrasena();
        this.ObtenerNacionalidades();
        this.VerFuncionalidades();
        this.VerEmpresa();
      });

  }

  /** ***************************************************************************************** **
   ** **                       METODO PARA ACTIVAR FUNCIONALIDADES                           ** **
   ** ***************************************************************************************** **/

  // METODO PARA ACTIVAR FUNCIONALIDADES
  HabilitarAlimentacion: boolean = false;
  habilitarVacaciones: boolean = false;
  HabilitarPermisos: boolean = false;
  HabilitarAccion: boolean = false;
  HabilitarHorasE: boolean = false;
  autorizar: boolean = false;
  aprobacion: boolean = false;

  VerFuncionalidades() {
    this.restF.ListarFunciones().subscribe(datos => {
      if (datos[0].hora_extra === true) {
        if (this.idEmpleadoLogueado === parseInt(this.idEmpleado)) {
          this.HabilitarHorasE = true;
        }
        this.VerRegistroAutorizar();
      }
      if (datos[0].accion_personal === true) {
        this.HabilitarAccion = true;
      }
      if (datos[0].alimentacion === true) {
        this.HabilitarAlimentacion = true;
        this.autorizar = true;
        this.VerAdminComida();
      }
      if (datos[0].permisos === true) {
        this.HabilitarPermisos = true;
        this.VerRegistroAutorizar();
      }
      if (datos[0].vacaciones === true) {
        this.habilitarVacaciones = true;
        this.VerRegistroAutorizar();
      }
      // METODOS DE CONSULTAS GENERALES
      this.BuscarParametro();
    })
  }

  // METODO PARA VER REGISTRO DE PERSONAL QUE APRUEBA SOLICITUDES
  VerRegistroAutorizar() {
    this.autorizar = true;
    this.aprobacion = true;
    // FUNCIONES DE AUTORIZACIONES
    this.ObtenerAutorizaciones();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha);
      },
      vacio => {
        this.BuscarHora(this.formato_fecha);
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        // LLAMADO A PRESENTACION DE DATOS
        this.LlamarMetodos(fecha, this.formato_hora);
      },
      vacio => {
        this.LlamarMetodos(fecha, this.formato_hora);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string, formato_hora: string) {
    this.VerDatosActuales(formato_fecha);
    this.VerEmpleado(formato_fecha);
    this.ObtenerDatosVacunas(formato_fecha);
    this.ObtenerContratosEmpleado(formato_fecha);
    if (this.habilitarVacaciones === true) {
      this.ObtenerVacaciones(formato_fecha);
    }
    if (this.HabilitarPermisos === true) {
      this.ObtenerPermisos(formato_fecha, formato_hora);
    }
    if (this.HabilitarAlimentacion === true) {
      this.ObtenerPlanComidasEmpleado(formato_fecha, formato_hora);
      this.ObtenerSolComidas(formato_fecha, formato_hora);
    }
    if (this.HabilitarAccion === true) {
      this.ObtenerEmpleadoProcesos(formato_fecha);
    }
    if (this.HabilitarHorasE === true) {
      this.ObtenerlistaHorasExtrasEmpleado(formato_fecha, formato_hora);
      this.ObtenerPlanHorasExtras(formato_fecha, formato_hora);
    }
  }

  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** **
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(res => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);

    }, vacio => {
      this.BuscarContratoActual(formato_fecha);
    });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO QUE INICIA SESION
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
    })
  }

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS EN TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }


  /** ********************************************************************************************* **
   ** **                      METODO PARA MOSTRAR DATOS PERFIL DE USUARIO                        ** **                                           *
   ** ********************************************************************************************* **/

  // METODO PARA VER LA INFORMACION DEL USUARIO
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  textoBoton: string = 'Subir foto';
  VerEmpleado(formato_fecha: string) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
      this.empleadoUno[0].fec_nacimiento_ = this.validar.FormatearFecha(this.empleadoUno[0].fec_nacimiento, formato_fecha, this.validar.dia_abreviado);
      var empleado = data[0].nombre + data[0].apellido;
      if (data[0].imagen != null) {
        this.urlImagen = `${environment.url}/empleado/img/` + data[0].id + '/' + data[0].imagen;
        this.restEmpleado.obtenerImagen(data[0].id, data[0].imagen).subscribe(data => {
          console.log('ver imagen data ', data)
          if (data.imagen != 0) {
            this.imagenEmpleado = 'data:image/jpeg;base64,' + data.imagen;
          }
          else {
            this.ImagenLocalUsuario("assets/imagenes/user.png").then(
              (result) => (this.imagenEmpleado = result)
            );
          }
        });
        //console.log('ver urlImagen ', this.urlImagen)
        this.mostrarImagen = true;
        this.textoBoton = 'Editar foto';
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.textoBoton = 'Subir foto';
        this.ImagenLocalUsuario("assets/imagenes/user.png").then(
          (result) => (this.imagenEmpleado = result)
        );
      }
      this.MapGeolocalizar(data[0].latitud, data[0].longitud, empleado);

      if (this.habilitarVacaciones === true) {
        this.ObtenerPeriodoVacaciones(formato_fecha);
      }
    })
  }

  // METODO PARA MOSTRAR IMAGEN EN PDF
  ImagenLocalUsuario(localPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let img = new Image();
      img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
      img.onerror = () => reject('Imagen no disponible')
      img.src = localPath;
    });
  }

  // METODO PARA VER UBICACION EN EL MAPA
  MARKER: any;
  MAP: any;
  MapGeolocalizar(latitud: number, longitud: number, empleado: string) {
    let zoom = 19;
    if (latitud === null && longitud === null) {
      latitud = -0.1918213;
      longitud = -78.4875258;
      zoom = 7
    }

    if (this.MAP) {
      this.MAP = this.MAP.remove();
    }

    this.MAP = L.map('geolocalizacion', {
      center: [latitud, longitud],
      zoom: zoom
    });
    const marker = L.marker([latitud, longitud]);
    if (this.MARKER !== undefined) {
      this.MAP.removeLayer(this.MARKER);
    }
    else {
      marker.setLatLng([latitud, longitud]);
    }
    marker.bindPopup(empleado);
    this.MAP.addLayer(marker);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(this.MAP);
    this.MARKER = marker;
  }

  // METODO INCLUIR EL CROKIS
  AbrirUbicacion(nombre: string, apellido: string) {
    this.ventana.open(EmplLeafletComponent, { width: '500px', height: '500px' })
      .afterClosed().subscribe((res: any) => {
        if (res.message === true) {
          if (res.latlng != undefined) {
            const datos = {
              lat: res.latlng.lat,
              lng: res.latlng.lng,
              user_name: this.user_name,
              ip: this.ip,
            }
            this.restEmpleado.ActualizarDomicilio(parseInt(this.idEmpleado), datos).subscribe(respuesta => {
              this.toastr.success(respuesta.message);
              this.MAP.off();
              this.MapGeolocalizar(res.latlng.lat, res.latlng.lng, nombre + ' ' + apellido);
            }, err => {
              this.toastr.error(err);
            });
          }
        }
      });
  }

  // METODO EDICION DE REGISTRO DE EMPLEADO
  AbirVentanaEditarEmpleado(dataEmpley) {
    this.ventana.open(EditarEmpleadoComponent, { data: dataEmpley, width: '800px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.VerEmpleado(this.formato_fecha)
        }
      })
  }





  /** ********************************************************************************************* **
   ** **                            PARA LA SUBIR LA IMAGEN DEL EMPLEADO                         ** **                                 *
   ** ********************************************************************************************* **/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('');
  FileChange(element: any) {
    this.archivoSubido = element.target.files;
    var detalle = this.archivoSubido[0].name;
    let arrayItems = detalle.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    // VALIDAR FORMATO PERMITIDO DE ARCHIVO
    if (itemExtencion == 'png' || itemExtencion == 'jpg' || itemExtencion == 'jpeg') {
      // VALIDAR PESO DE IMAGEN
      if (this.archivoSubido.length != 0) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.SubirPlantilla();
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.',
            'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
    }
    else {
      this.toastr.info(
        'Formatos permitidos .png, .jpg, .jpeg', 'Formato de imagen no permitido.', {
        timeOut: 6000,
      });
    }
  }

  SubirPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("image", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.restEmpleado.SubirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Imagen registrada.', {
        timeOut: 6000,
      });
      this.VerEmpleado(this.formato_fecha);
      this.archivoForm.reset();
      this.nameFile = '';
      this.ResetDataMain();
    });
  }

  ResetDataMain() {
    localStorage.removeItem('fullname');
    localStorage.removeItem('correo');
    localStorage.removeItem('iniciales');
    localStorage.removeItem('view_imagen');
  }




  /** ********************************************************************************************* **
   ** **                   BUSQUEDA DE DATOS DE ASIGNACIONES: TITULOS                            ** **                        *
   ** ********************************************************************************************* **/

  // BUSQUEDA DE TITULOS
  ObtenerTituloEmpleado() {
    this.tituloEmpleado = [];
    this.restEmpleado.BuscarTituloUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.tituloEmpleado = data;
    });
  }

  // REGISTRAR NUEVO TITULO
  AbrirVentanaRegistarTituloEmpleado() {
    this.ventana.open(TituloEmpleadoComponent, { data: this.idEmpleado, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // EDITAR UN TITULO
  AbrirVentanaEditarTitulo(dataTitulo: any) {
    this.ventana.open(EditarTituloComponent, { data: dataTitulo, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // ELIMINAR REGISTRO DE TITULO
  EliminarTituloEmpleado(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.restEmpleado.EliminarTitulo(id, datos).subscribe(res => {
      this.ObtenerTituloEmpleado();
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteTitulo(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarTituloEmpleado(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);

        }
      });
  }


  /** ********************************************************************************************* **
   ** **               BUSQUEDA DE DATOS DE ASIGNACIONES: DISCAPACIDAD                           ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA OBTENER DATOS DE DISCAPACIDAD
  ObtenerDiscapacidadEmpleado() {
    this.discapacidadUser = [];
    this.restDiscapacidad.BuscarDiscapacidadUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.discapacidadUser = data;
      this.HabilitarBtn();
    });
  }

  // ELIMINAR REGISTRO DE DISCAPACIDAD
  EliminarDiscapacidad(id_discapacidad: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.restDiscapacidad.EliminarDiscapacidad(id_discapacidad, datos).subscribe(res => {
      this.ObtenerDiscapacidadEmpleado();
      this.btnDisc = 'Añadir';
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    })
  };

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteDiscapacidad(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDiscapacidad(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // REGISTRAR DISCAPACIDAD
  AbrirVentanaDiscapacidad(proceso: string) {
    this.ventana.open(DiscapacidadComponent, {
      data: { idEmpleado: this.idEmpleado, metodo: proceso }, width: '360px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDiscapacidadEmpleado();
      })
  }

  // HABILITAR BOTONES DE EDICION
  HabilitarBtn() {
    if (this.discapacidadUser.length != 0) {
      this.btnDisc = 'Editar';
    }
    else {
      this.btnDisc = 'Añadir';
    }
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE DISCAPACIDAD
  MostrarDis() {
    if (this.discapacidadUser.length != 0) {
      this.AbrirVentanaDiscapacidad('editar');
    }
    else {
      this.AbrirVentanaDiscapacidad('registrar');
    }
  }

  /** ********************************************************************************************* **
   ** **                          BUSQUEDA DE DATOS DE VACUNACION                                ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA CONSULTAR DATOS DE REGISTRO DE VACUNACION
  datosVacuna: any = [];
  ObtenerDatosVacunas(formato_fecha: string) {
    this.datosVacuna = [];
    this.restVacuna.ObtenerVacunaEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosVacuna = data;
      this.datosVacuna.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_completo);
      })
    });
  }

  // EDITAR REGISTRO DE VACUNA
  AbrirVentanaEditar(datos: any) {
    this.ventana.open(EditarVacunaComponent, {
      data: { idEmpleado: this.idEmpleado, vacuna: datos }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE VACUNACION
  MostrarVentanaVacuna() {
    this.ventana.open(CrearVacunaComponent, {
      data: { idEmpleado: this.idEmpleado }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // ELIMINAR REGISTRO DE VACUNA
  EliminarVacuna(datos: any) {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.restVacuna.EliminarRegistroVacuna(datos.id, datos.carnet, data).subscribe(res => {
      this.ObtenerDatosVacunas(this.formato_fecha);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarEliminarVacuna(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarVacuna(datos);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /** ******************************************************************************************** **
   ** **                    METODOS PARA MANEJO DE DATOS DE CONTRATO                            ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER ULTIMO CONTRATO
  BuscarContratoActual(formato_fecha: string) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.datoActual.id_contrato = datos[0].max;
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
    });
  }

  // METODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO REGIMEN LABORAL
  ObtenerContratoEmpleado(id_contrato: number, formato_fecha: string) {
    this.contratoEmpleado = [];
    this.restEmpleado.BuscarDatosContrato(id_contrato).subscribe(res => {
      this.contratoEmpleado = res;
      this.contratoEmpleado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fec_salida, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER LISTA DE TODOS LOS CONTRATOS
  contratoBuscado: any = [];
  ObtenerContratosEmpleado(formato_fecha: string) {
    this.contratoBuscado = [];
    this.restEmpleado.BuscarContratosEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.contratoBuscado = res;
      this.contratoBuscado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER DATOS DEL CONTRATO SELECCIONADO
  fechaContrato = new FormControl('');
  public contratoForm = new FormGroup({
    fechaContratoForm: this.fechaContrato,
  });
  contratoSeleccionado: any = [];
  listaCargos: any = [];
  ObtenerContratoSeleccionado(form: any) {
    this.LimpiarCargo();
    this.contratoSeleccionado = [];
    this.restEmpleado.BuscarDatosContrato(form.fechaContratoForm).subscribe(res => {
      this.contratoSeleccionado = res;
      this.contratoSeleccionado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fec_salida, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
    this.restCargo.BuscarCargoIDContrato(form.fechaContratoForm).subscribe(datos => {
      this.listaCargos = datos;
      this.listaCargos.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, this.formato_fecha, this.validar.dia_abreviado);
      })
    }, error => {
      this.toastr.info('El contrato seleccionado no registra ningún cargo.', 'VERIFICAR', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA LIMPIAR REGISTRO DE CONTRATO
  LimpiarContrato() {
    this.contratoSeleccionado = [];
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.contratoForm.reset();
    this.cargoForm.reset();
  }

  // METODO DE EDICION DE CONTRATOS
  editar_contrato: boolean = false;
  pagina_contrato: any = '';
  contrato_editar: any = [];
  AbrirVentanaEditarContrato(dataContrato: any) {
    this.editar_contrato = true;
    this.contrato_editar = dataContrato;
    this.pagina_contrato = 'ver-empleado';
    this.btnActualizarCargo = true;
  }

  // METODO PARA MOSTRAR VENTANA DE EDICION DE CONTRATO
  btnActualizarContrato: boolean = true;
  VerContratoEdicion(value: boolean) {
    this.btnActualizarContrato = value;
  }

  // METODO BUSQUEDA DE DATOS DE CONTRATO
  idSelectContrato: number;
  ObtenerIdContratoSeleccionado(idContratoEmpleado: number) {
    this.idSelectContrato = idContratoEmpleado;
  }

  // VENTANA PARA INGRESAR CONTRATO DEL EMPLEADO
  AbrirVentanaCrearContrato(): void {
    this.ventana.open(RegistroContratoComponent, { width: '900px', data: this.idEmpleado }).
      afterClosed().subscribe(item => {
        this.VerDatosActuales(this.formato_fecha);
      });
    this.btnActualizarCargo = true;
  }




  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MANEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/


  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA LIMPIAR REGISTRO
  LimpiarCargo() {
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.cargoForm.reset();
  }

  // METODO PARA VER CARGO SELECCIONADO
  fechaICargo = new FormControl('');
  public cargoForm = new FormGroup({
    fechaICargoForm: this.fechaICargo,
  });
  cargoSeleccionado: any = [];
  ObtenerCargoSeleccionado(form: any) {
    this.cargoSeleccionado = [];
    this.restCargo.BuscarCargoID(form.fechaICargoForm).subscribe(datos => {
      this.cargoSeleccionado = datos;
      this.cargoSeleccionado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // MOSTRAR VENTANA EDICION DE CARGO
  btnActualizarCargo: boolean = true;
  VerCargoEdicion(value: boolean) {
    this.btnActualizarCargo = value;
    this.editar_contrato = false;
  }

  // BUSQUEDA DE ID DE CARGO SELECCIONADO
  idSelectCargo: number;
  ObtenerIdCargoSeleccionado(idCargoEmpleado: number) {
    this.idSelectCargo = idCargoEmpleado;
  }

  // VENTANA PARA INGRESAR CARGO DEL EMPLEADO
  AbrirVentanaCargo(): void {
    if (this.datoActual.id_contrato != undefined) {
      this.ventana.open(EmplCargosComponent,
        { width: '1000px', data: { idEmpleado: this.idEmpleado, idContrato: this.datoActual.id_contrato, idRol: this.datoActual.id_rol } }).
        afterClosed().subscribe(item => {
          this.VerDatosActuales(this.formato_fecha);
        });
      this.editar_contrato = false;
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Contrato.', '', {
        timeOut: 6000,
      });
    }
  }

  /** ***************************************************************************************** **
   ** **                VENTANA PARA VER HORARIOS ASIGNADOS AL USUARIO                       ** **
   ** ***************************************************************************************** **/

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  fecHorario: boolean = true;

  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>, opcion: number) {
    const ctrlValue = fecha;
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = moment(ctrlValue).format('01/MM/YYYY');
        this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      this.fecHorario = false;
    }
    else {
      this.ValidarFechas(this.fechaInicialF.value, ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

  // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
  ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
    // FORMATO DE FECHA PERMITIDO PARA COMPARARLAS
    let inicio = moment(fec_inicio).format('01/MM/YYYY');
    let final = moment(fec_fin).daysInMonth() + moment(fec_fin).format('/MM/YYYY');
    let feci = moment(inicio, 'DD/MM/YYYY').format('YYYY/MM/DD');
    let fecf = moment(final, 'DD/MM/YYYY').format('YYYY/MM/DD');
    // VERIFICAR SI LAS FECHAS ESTAN INGRESDAS DE FORMA CORRECTA
    if (Date.parse(feci) <= Date.parse(fecf)) {
      if (opcion === 1) {
        formulario.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      else {
        formulario.setValue(moment(final, 'DD/MM/YYYY'));
      }
    }
    else {
      this.toastr.warning('La fecha no se registro. Ups la fecha no es correcta.!!!', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA SELECCIONAR TIPO DE BUSQUEDA
  ver_tabla_horarios: boolean = true;
  BuscarHorarioPeriodo() {
    this.ver_tabla_horarios = true;
    this.eliminar_plan = false;
    this.ventana_horario = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;

    if (this.fechaInicialF.value != null && this.fechaFinalF.value != null) {
      this.ObtenerHorariosEmpleado(this.fechaInicialF.value, this.fechaFinalF.value, 1);
    }
    else {
      let inicio = moment().format('YYYY/MM/01');
      let final = moment().format('YYYY/MM/') + moment().daysInMonth();
      this.ObtenerHorariosEmpleado(inicio, final, 2);
    }
  }

  // METODO PARA MOSTRAR DATOS DE HORARIO
  horariosEmpleado: any = [];
  mes_inicio: any = '';
  mes_fin: any = '';
  ObtenerHorariosEmpleado(fec_inicio: any, fec_final: any, opcion: number) {
    this.horariosEmpleado = [];
    if (opcion === 1) {
      this.mes_inicio = fec_inicio.format("YYYY-MM-DD");
      this.mes_fin = fec_final.format("YYYY-MM-DD");
    }
    else {
      this.mes_inicio = fec_inicio;
      this.mes_fin = fec_final;
    }

    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: '\'' + this.datoActual.codigo + '\''
    }
    this.restPlanGeneral.BuscarPlanificacionHoraria(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.horariosEmpleado = datos.data;
        let index = 0;

        this.ver_detalle = true;
        this.ver_acciones = false;
        this.ver_activar_editar = true;
        this.editar_activar = false;

        this.horariosEmpleado.forEach(obj => {
          obj.index = index;
          index = index + 1;
        })
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe planificación.', {
          timeOut: 6000,
        });
        this.ver_acciones = false;
        this.ver_activar_editar = false;
        this.editar_activar = false;
      }

    })
  }

  // METODO PARA OBTENER DETALLE DE PLANIFICACION
  ver_detalle: boolean = false;
  ver_acciones: boolean = false;
  paginar: boolean = false;
  detalles: any = [];
  detalle_acciones: any = [];
  // ACCIONES DE HORARIOS
  entrada: '';
  salida: '';
  inicio_comida = '';
  fin_comida = '';
  ObtenerDetallesPlanificacion() {
    this.detalles = [];
    // DATOS DE BUSQUEDA DE DETALLES DE PLANIFICACION
    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: '\'' + this.datoActual.codigo + '\''
    }
    let codigo_horario = '';
    let tipos: any = [];
    let accion = '';
    // VARIABLES AUXILIARES
    let aux_h = '';
    let aux_a = '';
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.restPlanGeneral.BuscarDetallePlanificacion(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.ver_acciones = true;
        this.detalle_acciones = [];
        this.detalles = datos.data;

        datos.data.forEach(obj => {
          if (aux_h === '') {
            accion = obj.tipo_accion + ': ' + obj.hora;
            this.ValidarAcciones(obj);
          }
          else if (obj.id_horario === aux_h) {
            if (obj.tipo_accion != aux_a) {
              accion = accion + ' , ' + obj.tipo_accion + ': ' + obj.hora
              codigo_horario = obj.codigo_dia
              this.ValidarAcciones(obj);
            }
          }
          else {
            // CONCATENAR VALORES ANTERIORES
            tipos = [{
              acciones: accion,
              horario: codigo_horario,
              entrada: this.entrada,
              inicio_comida: this.inicio_comida,
              fin_comida: this.fin_comida,
              salida: this.salida,
            }]
            this.detalle_acciones = this.detalle_acciones.concat(tipos);
            // LIMPIAR VALORES
            accion = obj.tipo_accion + ': ' + obj.hora;
            codigo_horario = obj.codigo_dia;
            this.entrada = '';
            this.salida = '';
            this.inicio_comida = '';
            this.fin_comida = '';
            this.ValidarAcciones(obj);
          }
          // ASIGNAR VALORES A VARIABLES AUXILIARES
          aux_h = obj.id_horario;
          aux_a = obj.tipo_accion;
        })
        // AL FINALIZAR EL CICLO CONCATENAR VALORES
        tipos = [{
          acciones: accion,
          horario: codigo_horario,
          entrada: this.entrada,
          inicio_comida: this.inicio_comida,
          fin_comida: this.fin_comida,
          salida: this.salida,
        }]
        this.detalle_acciones = this.detalle_acciones.concat(tipos);

        this.detalle_acciones.forEach(detalle => {
          detalle.entrada_ = this.validar.FormatearHora(detalle.entrada, this.formato_hora);
          if (detalle.inicio_comida != '') {
            detalle.inicio_comida = this.validar.FormatearHora(detalle.inicio_comida, this.formato_hora);
          }
          if (detalle.fin_comida != '') {
            detalle.fin_comida = this.validar.FormatearHora(detalle.fin_comida, this.formato_hora);
          }
          detalle.salida_ = this.validar.FormatearHora(detalle.salida, this.formato_hora);
        })

        // METODO PARA VER PAGINACION
        if (this.detalle_acciones.length > 8) {
          this.paginar = true;
        }
        else {
          this.paginar = false;
        }
      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe detalle de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
  ValidarAcciones(obj: any) {
    if (obj.tipo_accion === 'E') {
      return this.entrada = obj.hora;
    }
    if (obj.tipo_accion === 'S') {
      return this.salida = obj.hora;
    }
    if (obj.tipo_accion === 'I/A') {
      return this.inicio_comida = obj.hora;
    }
    if (obj.tipo_accion === 'F/A') {
      return this.fin_comida = obj.hora;
    }
  }

  // ARREGLO DE DATOS DE HORARIOS
  nomenclatura = [
    { nombre: 'L', descripcion: 'LIBRE' },
    { nombre: 'FD', descripcion: 'FERIADO' },
    { nombre: 'REC', descripcion: 'RECUPERACIÓN' },
    { nombre: 'P', descripcion: 'PERMISO' },
    { nombre: 'V', descripcion: 'VACACION' },
    { nombre: '-', descripcion: 'SIN PLANIFICACIÓN' }
  ]

  // OCULTAR DETALLE DE HORARIOS
  CerrarDetalles() {
    this.ver_acciones = false;
  }

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptionsD = [5, 10, 20, 50];
  tamanio_paginaD: number = 5;
  numero_paginaD: number = 1;

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS EN TABLA
  ManejarPaginaDetalles(e: PageEvent) {
    this.numero_paginaD = e.pageIndex + 1;
    this.tamanio_paginaD = e.pageSize;
  }


  /** ***************************************************************************************** **
   ** **              METODOS PARA MANEJAR HORARIOS FIJOS DEL USUARIO                        ** **
   ** ***************************************************************************************** **/

  // VENTANA PARA REGISTRAR HORARIO
  ventana_horario: boolean = false;
  data_horario: any = [];
  AbrirPlanificarHorario(): void {
    this.ver_tabla_horarios = false;
    this.ver_acciones = false;
    this.eliminar_plan = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;
    this.data_horario = [];
    if (this.datoActual.id_cargo != undefined) {
      this.ventana_horario = true;
      this.ver_rotativo = false;

      this.data_horario = {
        pagina: 'ver_empleado',
        codigo: this.datoActual.codigo,
        idCargo: this.datoActual.id_cargo,
        idEmpleado: this.idEmpleado,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
      }
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }






  /** ********************************************************************************************* **
   ** **                     CARGAR HORARIOS DEL EMPLEADO CON PLANTILLA                          ** **
   ** ********************************************************************************************* **/
  plantillas: boolean = false;

  nameFileHorario: string;
  archivoSubidoHorario: Array<File>;
  archivoHorarioForm = new FormControl('');

  FileChangeHorario(element) {
    if (this.datoActual.id_cargo != undefined) {
      this.archivoSubidoHorario = element.target.files;
      this.nameFileHorario = this.archivoSubidoHorario[0].name;
      let arrayItems = this.nameFileHorario.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0].slice(0, 16);
      console.log(itemName.toLowerCase());
      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase() == 'horario empleado') {
          this.SubirPlantillaHorario();
        } else {
          this.toastr.error('Plantilla seleccionada incorrecta', '', {
            timeOut: 6000,
          });
          this.archivoHorarioForm.reset();
          this.nameFileHorario = '';
        }
      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
    }
    else {
      this.toastr.info('El empleado no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
      this.archivoHorarioForm.reset();
      this.nameFileHorario = '';
    }
  }

  SubirPlantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoHorario.length; i++) {
      formData.append("uploads[]", this.archivoSubidoHorario[i], this.archivoSubidoHorario[i].name);
      console.log("toda la data", this.archivoSubidoHorario[i])
    }

    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.restEmpleHorario.VerificarDatos_EmpleadoHorario(formData, parseInt(this.idEmpleado)).subscribe(res => {
      console.log('entra')
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
          'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
          'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema. ' +
          'Las fechas deben estar ingresadas correctamente, la fecha de inicio no debe ser posterior a la fecha final.', 'Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
      else {
        this.restEmpleHorario.VerificarPlantilla_EmpleadoHorario(formData).subscribe(resD => {
          if (resD.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
              'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
              'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema.', 'Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivoHorarioForm.reset();
            this.nameFileHorario = '';
          }
          else {
            this.restEmpleHorario.SubirArchivoExcel(formData, parseInt(this.idEmpleado), this.empleadoUno[0].codigo).subscribe(resC => {

              this.restEmpleHorario.CreaPlanificacion(formData, parseInt(this.idEmpleado), this.empleadoUno[0].codigo).subscribe(resP => {
                this.toastr.success('Operación exitosa.', 'Plantilla de Horario importada.', {
                  timeOut: 6000,
                });
                // this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);-------------------------------
                //this.actualizar = false;
                //window.location.reload(this.actualizar);
                this.archivoHorarioForm.reset();
                this.nameFileHorario = '';
              });
              /*this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
              //this.actualizar = false;
              //window.location.reload(this.actualizar);
              this.archivoHorarioForm.reset();
              this.nameFileHorario = '';*/
            });
          }
        });
      }
    });
  }








  /** **************************************************************************************** **
   ** **                          METODO DE REGISTRO DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // VENTANA PARA REGISTRAR PLANIFICACION DE HORARIOS DEL EMPLEADO
  rotativo: any = []
  registrar_rotativo: boolean = false;
  ver_rotativo: boolean = true;
  pagina_rotativo: string = '';
  AbrirVentanaHorarioRotativo(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.pagina_rotativo = 'ver-empleado';
      this.rotativo = {
        idCargo: this.datoActual.id_cargo,
        codigo: this.datoActual.codigo,
        pagina: this.pagina_rotativo,
        idEmpleado: this.idEmpleado,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
      }
      this.registrar_rotativo = true;
      this.ver_acciones = false;
      this.ver_tabla_horarios = false;
      this.ventana_horario = false;
      this.eliminar_plan = false;
      this.editar_horario = false;
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // BUSCAR FECHAS DE HORARIO y ELIMINAR PLANIFICACION GENERAL
  id_planificacion_general: any = [];
  EliminarPlanGeneral(fec_inicio: string, fec_final: string, horario: number, codigo: string) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fec_inicio.split('T')[0],
      fec_final: fec_final.split('T')[0],
      id_horario: horario,
      codigo: codigo
    };
    this.restPlanGeneral.BuscarFechas(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      let datos = {
        user_name: this.user_name,
        ip: this.ip,
        id_plan: '',
      }
      this.id_planificacion_general.map(obj => {
        datos.id_plan = obj.id;
        this.restPlanGeneral.EliminarRegistro(datos).subscribe(res => {
        })
      })
    })
  }


  // ELIMINAR REGISTROS DE PLANIFICACION GENERAL
  EliminarPlanificacionGeneral(fecha: string, horario: number, codigo: string) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fecha.split('T')[0],
      id_horario: horario,
      codigo: codigo
    };
    this.restPlanGeneral.BuscarFecha(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }


  /** ********************************************************************************************* **
   ** **                               ELIMINAR PLANIFICACIONES HORARIAS                         ** **
   ** ********************************************************************************************* **/
  eliminar_plan: boolean = false;
  eliminar_horarios: any = [];
  EliminarHorarios() {
    this.eliminar_horarios = {
      pagina: 'ver_empleado',
      usuario: [{ codigo: this.datoActual.codigo, id: this.idEmpleado }]
    }
    this.ver_tabla_horarios = false;
    this.eliminar_plan = true;
    this.ver_acciones = false;
    this.ventana_horario = false;
    this.registrar_rotativo = false;
    this.editar_horario = false;
  }

  /** ********************************************************************************************* **
   ** **                                METODO DE EDICION DE HORARIOS                            ** **
   ** ********************************************************************************************* **/
  editar_activar: boolean = false;
  ver_activar_editar: boolean = false;
  ActivarEditarHorario() {
    if (this.editar_activar === true) {
      this.editar_activar = false;
    }
    else {
      this.editar_activar = true;
    }
  }

  // VENTANA PARA REGISTRAR HORARIO
  editar_horario: boolean = false;
  datos_editar: any = [];
  expansion: boolean = true;
  AbrirEditarHorario(anio: any, mes: any, dia: any, horario: any, index: any): void {
    let fecha = anio + '-' + mes + '-' + dia;
    let fecha_ = moment(fecha, 'YYYY-MM-D').format('YYYY/MM/DD');
    let verificar = moment(fecha_, 'YYYY/MM/DD', true).isValid();
    console.log('resultado ', verificar)
    // VERIFICAR QUE EL DIA SEA VALIDO (30-31)
    if (verificar === true) {
      this.horariosEmpleado[index].color = 'ok';
      this.horariosEmpleado[index].seleccionado = dia;
      this.datos_editar = {
        idEmpleado: this.idEmpleado,
        datosPlan: horario,
        anio: anio,
        mes: mes,
        dia: dia,
        codigo: this.datoActual.codigo,
        pagina: 'ver_empleado',
        idCargo: this.datoActual.id_cargo,
        horas_trabaja: this.cargoEmpleado[0].hora_trabaja,
        index: index
      }
      this.editar_horario = true;
      this.expansion = false;
      this.editar_activar = false;
      this.ver_activar_editar = false;
    }
    else {
      this.toastr.warning('Ups!!! Fecha no es válida.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ok':
        return color = '#F6DDCC';
    }
  }


  /** **************************************************************************************** **
   ** **                METODO DE PRESENTACION DE DATOS DE PERMISOS                         ** **
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DEL PERMISO
  permisosTotales: any = [];
  ObtenerPermisos(formato_fecha: string, formato_hora: string) {
    this.permisosTotales = [];
    this.permisosTotales.splice(0, this.permisosTotales.length);
    this.restPermiso.BuscarPermisoEmpleado(parseInt(this.idEmpleado)).subscribe(datos => {
      this.permisosTotales = datos;
      this.permisosTotales.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, formato_fecha, this.validar.dia_completo);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, formato_fecha, this.validar.dia_completo);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, formato_fecha, this.validar.dia_completo);

        p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, formato_hora);
        p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, formato_hora);

      })
    })
  }

  // VENTANA PARA REGISTRAR PERMISOS DEL EMPLEADO
  solicita_permiso: any = [];
  solicitudes_permiso: boolean = true;
  formulario_permiso: boolean = false;
  AbrirVentanaPermiso(): void {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      this.formulario_permiso = true;
      this.solicitudes_permiso = false;
      this.solicita_permiso = [];
      this.solicita_permiso = [
        {
          id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato,
          id_cargo: this.datoActual.id_cargo,
          ventana: 'empleado'
        }
      ]
    }
    else {
      this.formulario_permiso = false;
      this.solicitudes_permiso = true;
      this.toastr.info('El usuario no tiene registrado un Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO EDICION DE PERMISOS
  formulario_editar_permiso: boolean = false;
  EditarPermiso(permisos: any) {
    this.formulario_editar_permiso = true;
    this.solicitudes_permiso = false;
    this.solicita_permiso = [];
    this.solicita_permiso = [
      {
        id_empleado: parseInt(this.idEmpleado),
        permiso: permisos,
        ventana: 'empleado'
      }
    ]
  }

  // METODO PARA ELIMINAR PERMISOS DEL USUARIO
  CancelarPermiso(dataPermiso: any) {
    this.ventana.open(CancelarPermisoComponent,
      {
        width: '450px',
        data: { info: dataPermiso, id_empleado: parseInt(this.idEmpleado) }
      }).afterClosed().subscribe(items => {
        this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
      });
  }

  // MANEJO DE FILTRO DE DATOS DE PERMISOS
  filtradoFecha = '';
  fechaF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaForm: this.fechaF,
  });

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCamposPermisos() {
    this.fechaF.setValue('');
    this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
  }

  // METODO PARA CONSULTAR DATOS DEL USUARIO QUE SOLICITA EL PERMISO
  unPermiso: any = [];
  ConsultarPermisoIndividual(id: number) {
    this.unPermiso = [];
    this.restPermiso.ObtenerInformeUnPermiso(id).subscribe(datos => {
      this.unPermiso = datos[0];
      // TRATAMIENTO DE FECHAS Y HORAS
      this.unPermiso.fec_creacion_ = this.validar.FormatearFecha(this.unPermiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
      this.unPermiso.fec_inicio_ = this.validar.FormatearFecha(this.unPermiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      this.unPermiso.fec_final_ = this.validar.FormatearFecha(this.unPermiso.fec_final, this.formato_fecha, this.validar.dia_completo);

      this.unPermiso.hora_ingreso_ = this.validar.FormatearHora(this.unPermiso.hora_ingreso, this.formato_hora);
      this.unPermiso.hora_salida_ = this.validar.FormatearHora(this.unPermiso.hora_salida, this.formato_hora);

      this.ConsultarAprobacionPermiso(id);
    })
  }

  // METODO PARA VER LA INFORMACION DE LA APROBACION DEL PERMISO
  aprobacionPermiso: any = [];
  empleado_estado: any = [];
  lectura: number = 0;
  ConsultarAprobacionPermiso(id: number) {
    this.aprobacionPermiso = [];
    this.empleado_estado = [];
    this.lectura = 1;
    this.aprobar.BuscarAutorizacionPermiso(id).subscribe(data => {
      this.aprobacionPermiso = data[0];
      if (this.aprobacionPermiso.id_documento === '' || this.aprobacionPermiso.id_documento === null) {
        this.GenerarPDFPermisos('open');
      }
      else {
        // METODO PARA OBTENER EMPLEADOS Y ESTADOS
        var autorizaciones = this.aprobacionPermiso.id_documento.split(',');
        autorizaciones.map((obj: string) => {
          this.lectura = this.lectura + 1;
          if (obj != '') {
            let empleado_id = obj.split('_')[0];
            var estado_auto = obj.split('_')[1];

            // CAMBIAR DATO ESTADO INT A VARCHAR
            if (estado_auto === '1') {
              estado_auto = 'Pendiente';
            }
            if (estado_auto === '2') {
              estado_auto = 'Preautorizado';
            }
            if (estado_auto === '3') {
              estado_auto = 'Autorizado';
            }
            if (estado_auto === '4') {
              estado_auto = 'Permiso Negado';
            }
            // CREAR ARRAY DE DATOS DE COLABORADORES
            var data = {
              id_empleado: empleado_id,
              estado: estado_auto
            }
            this.empleado_estado = this.empleado_estado.concat(data);
            // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACION DE AUTORIZACION
            if (this.lectura === autorizaciones.length) {
              this.VerInformacionAutoriza(this.empleado_estado);
            }
          }
        })
      }
    });
  }

  // METODO PARA INGRESAR NOMBRE Y CARGO DEL USUARIO QUE REVIZO LA SOLICITUD
  cadena_texto: string = ''; // VARIABLE PARA ALMACENAR TODOS LOS USUARIOS
  cont: number = 0;
  VerInformacionAutoriza(array: any) {
    this.cont = 0;
    array.map(empl => {
      this.informacion.InformarEmpleadoAutoriza(parseInt(empl.id_empleado)).subscribe(data => {
        this.cont = this.cont + 1;
        empl.nombre = data[0].fullname;
        empl.cargo = data[0].cargo;
        empl.departamento = data[0].departamento;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].fullname + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' --.-- ' + data[0].fullname + ': ' + empl.estado;
        }
        if (this.cont === array.length) {
          this.GenerarPDFPermisos('open');
        }
      })
    })
  }


  /** **************************************************************************************************** **
   **                        METODO PARA EXPORTAR A PDF SOLICITUDES DE PERMISOS                            **
   ** **************************************************************************************************** **/

  // METODO PARA DESCARGAR SOLICITUD DE PERMISO
  GenerarPDFPermisos(action = 'open') {
    var documentDefinition: any;
    if (this.empleado_estado.length === 0) {
      documentDefinition = this.CabeceraDocumentoPermisoEmpleado();
    }
    else {
      documentDefinition = this.CabeceraDocumentoPermisoAprobacion();
    }

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // CABECERA Y PIE DE PAGINA DEL DOCUMENTO
  CabeceraDocumentoPermisoEmpleado() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        var f = moment();
        fecha = f.format('DD/MM/YYYY');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: this.unPermiso.empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -25, 0, 20] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] },
        this.InformarEmpleado(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  // METODO PARA MOSTRAR LA INFORMACION DE LA SOLICITUD DEL PERMISO
  InformarEmpleado() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA SOLICITUD: ' + this.unPermiso.fec_creacion_, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.unPermiso.ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.unPermiso.nombre, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.unPermiso.apellido, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.unPermiso.cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.unPermiso.regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'Sucursal: ' + this.unPermiso.sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.unPermiso.num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.unPermiso.tipo_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DESDE: ' + this.unPermiso.fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.unPermiso.descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA HASTA: ' + this.unPermiso.fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APROBACIÓN: ' + this.cadena_texto, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.unPermiso.nombre + ' ' + this.unPermiso.apellido + '\n' + this.unPermiso.cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 10; },
        paddingBottom: function (i: any, node: any) { return 10; }
      }
    };
  }

  // CABECERA Y PIE DE PAGINA DEL DOCUMENTO
  CabeceraDocumentoPermisoAprobacion() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        var f = moment();
        fecha = f.format('DD/MM/YYYY');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: this.unPermiso.empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -25, 0, 20] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] },
        this.InformarAprobacion(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  // METODO PARA MOSTRAR LA INFORMACION DEL PERMISO CON APROBACION
  InformarAprobacion() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA SOLICITUD: ' + this.unPermiso.fec_creacion_, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.unPermiso.ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.unPermiso.nombre, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.unPermiso.apellido, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.unPermiso.cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.unPermiso.regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'Sucursal: ' + this.unPermiso.sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.unPermiso.num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.unPermiso.tipo_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DESDE: ' + this.unPermiso.fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.unPermiso.descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA HASTA: ' + this.unPermiso.fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APROBACIÓN: ', style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: this.empleado_estado[this.empleado_estado.length - 1].estado.toUpperCase() + ' POR', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.empleado_estado[this.empleado_estado.length - 1].nombre + '\n' + this.empleado_estado[this.empleado_estado.length - 1].cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              },
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.unPermiso.nombre + ' ' + this.unPermiso.apellido + '\n' + this.unPermiso.cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 10; },
        paddingBottom: function (i: any, node: any) { return 10; }
      }
    };
  }


  /** **************************************************************************************** **
   ** **            METODO DE PRESENTACION DE DATOS DE PERIODO DE VACACIONES                ** **
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DEL PERIODO DE VACACIONES
  peridoVacaciones: any;
  ObtenerPeriodoVacaciones(formato_fecha: string) {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;

      this.peridoVacaciones.forEach(v => {
        // TRATAMIENTO DE FECHAS Y HORAS
        v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
        v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
      })
    })
  }

  // VENTANA PARA INGRESAR PERÍODO DE VACACIONES
  AbrirVentanaPerVacaciones(): void {
    if (this.datoActual.id_contrato != undefined) {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        console.log("idPerVaca ", this.idPerVacacion[0].id);
        this.toastr.info('El empleado ya tiene registrado un periodo de vacaciones y este se actualiza automáticamente', '', {
          timeOut: 6000,
        })
      }, error => {
        this.ventana.open(RegistrarPeriodoVComponent,
          {
            width: '900px', data: {
              idEmpleado: this.idEmpleado,
              idContrato: this.datoActual.id_contrato
            }
          })
          .afterClosed().subscribe(item => {
            this.ObtenerPeriodoVacaciones(this.formato_fecha);
          });
      });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Contrato.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA PERIODO DE VACACIONES
  AbrirEditarPeriodoVacaciones(datoSeleccionado: any): void {
    this.ventana.open(EditarPeriodoVacacionesComponent,
      { width: '900px', data: { idEmpleado: this.idEmpleado, datosPeriodo: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerPeriodoVacaciones(this.formato_fecha);
      });
  }


  /** **************************************************************************************** **
   ** **                 METODO DE PRESENTACION DE DATOS DE VACACIONES                      ** **
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DE VACACIONES
  vacaciones: any = [];
  ObtenerVacaciones(formato_fecha: string) {
    this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idPerVacacion = datos;
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
        this.vacaciones.forEach(v => {
          // TRATAMIENTO DE FECHAS Y HORAS
          v.fec_ingreso_ = this.validar.FormatearFecha(v.fec_ingreso, formato_fecha, this.validar.dia_completo);
          v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
          v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
        })
      });
    });
  }

  // VENTANA PARA REGISTRAR VACACIONES DEL EMPLEADO
  AbrirVentanaVacaciones(): void {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos[0];
        this.ventana.open(RegistrarVacacionesComponent,
          {
            width: '900px', data: {
              idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion.id,
              idContrato: this.idPerVacacion.idcontrato, idCargo: this.datoActual.id_cargo,
              idContratoActual: this.datoActual.id_contrato
            }
          })
          .afterClosed().subscribe(item => {
            this.ObtenerVacaciones(this.formato_fecha);
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones.', '', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.toastr.info('El usuario no tiene registrado Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA EDITAR REGISTRO DE VACACION
  EditarVacaciones(v) {
    this.ventana.open(EditarVacacionesEmpleadoComponent,
      {
        width: '900px',
        data: {
          info: v, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }

  // METODO PARA ELIMINAR REGISTRO DE VACACIONES
  CancelarVacaciones(v) {
    this.ventana.open(CancelarVacacionesComponent,
      {
        width: '450px',
        data: {
          id: v.id, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }


  /** *************************************************************************************** **
   ** **                 METODO PARA MOSTRAR DATOS DE HORAS EXTRAS                         ** **
   ** *************************************************************************************** **/

  // METODO DE BUSQUEDA DE HORAS EXTRAS
  hora_extra: any = [];
  solicita_horas: boolean = true;
  ObtenerlistaHorasExtrasEmpleado(formato_fecha: string, formato_hora: string) {
    this.hora_extra = [];
    this.restHE.ObtenerListaEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.hora_extra = res;
      this.hora_extra.forEach(h => {
        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), formato_hora);

        h.fec_solicita_ = this.validar.FormatearFecha(h.fec_solicita, formato_fecha, this.validar.dia_completo);
      })

    }, err => {
      //return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  CancelarHoraExtra(h: any) {
    this.ventana.open(CancelarHoraExtraComponent,
      { width: '450px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        this.ObtenerlistaHorasExtrasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  /** *************************************************************************************** **
   ** **                 METODO PARA MOSTRAR DATOS DE HORAS EXTRAS                         ** **
   ** *************************************************************************************** **/

  // METODO DE BUSQUEDA DE HORAS EXTRAS
  hora_extra_plan: any = [];
  plan_horas: boolean = false;
  ObtenerPlanHorasExtras(formato_fecha: string, formato_hora: string) {
    this.hora_extra_plan = [];
    this.plan_hora.ListarPlanificacionUsuario(parseInt(this.idEmpleado)).subscribe(res => {
      this.hora_extra_plan = res;
      this.hora_extra_plan.forEach(h => {
        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        h.fecha_inicio_ = this.validar.FormatearFecha(h.fecha_desde, formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(h.hora_inicio, formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(h.fecha_hasta, formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(h.hora_fin, formato_hora);
      })

    }, err => {
      // return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  MostrarPlanH() {
    this.solicita_horas = false;
    this.plan_horas = true;
  }

  MostrarSolicitaH() {
    this.solicita_horas = true;
    this.plan_horas = false;
  }

  // METODO PARA ABRIR FORMULARIO DE INGRESO DE PLANIFICACION DE HE
  PlanificarHoras() {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      let datos = {
        id_contrato: this.datoActual.id_contrato,
        id_cargo: this.datoActual.id_cargo,
        nombre: this.datoActual.nombre + ' ' + this.datoActual.apellido,
        cedula: this.datoActual.cedula,
        codigo: this.datoActual.codigo,
        correo: this.datoActual.correo,
        id: this.datoActual.id,
      }
      this.ventana.open(
        PlanHoraExtraComponent,
        {
          width: '800px',
          data: { planifica: datos, actualizar: false }
        })
        .afterClosed().subscribe(item => {
          this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  AbrirEditarPlan(datoSeleccionado: any) {
    this.ventana.open(EditarPlanHoraExtraComponent, {
      width: '600px',
      data: { planifica: datoSeleccionado, modo: 'individual' }
    })
      .afterClosed().subscribe(id_plan => {
        this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
      });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeletePlan(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanEmpleado(datos.id_plan, datos.id_empleado, datos);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanEmpleado(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fecha_desde, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fecha_hasta, this.formato_fecha, this.validar.dia_completo);
    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    this.plan_hora.EliminarPlanEmpleado(id_plan, id_empleado).subscribe(res => {
      this.NotificarPlanHora(desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreoPlanH(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
    });
  }

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanHora(desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACIÓN DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras eliminada desde ' +
        desde + ' hasta ' +
        hasta + ' horario de ' + h_inicio + ' a ' + h_fin,
    }
    this.plan_hora.EnviarNotiPlanificacion(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    });
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE HORAS EXTRAS
  EnviarCorreoPlanH(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      id_empl_envia: this.idEmpleadoLogueado,
      observacion: datos.descripcion,
      proceso: 'eliminado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'ELIMINACION DE PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde,
      hasta: hasta,
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE HE
    this.plan_hora.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  /** ****************************************************************************************** **
   ** **         METODO PARA MOSTRAR DATOS DE ADMINISTRACION MODULO DE ALIMENTACION           ** **
   ** ****************************************************************************************** **/

  // MOSTRAR DATOS DE USUARIO - ADMINISTRACIÓN DE MÓDULO DE ALIMENTACIÓN
  administra_comida: any = [];
  VerAdminComida() {
    this.administra_comida = [];
    this.restU.BuscarDatosUser(parseInt(this.idEmpleado)).subscribe(res => {
      this.administra_comida = res;
    });
  }

  // VENTANA PARA REGISTRAR ADMINISTRACION DE MÓDULO DE ALIMENTACIÓN
  AbrirVentanaAdminComida(): void {
    this.ventana.open(AdministraComidaComponent,
      { width: '450px', data: { idEmpleado: this.idEmpleado } })
      .afterClosed().subscribe(item => {
        this.VerAdminComida();
      });
  }

  /** *************************************************************************************** **
   ** **          METODO DE PRESENTACION DE DATOS DE SERVICIO DE ALIMENTACION              ** **
   ** *************************************************************************************** **/

  // METODO PARA MOSTRAR DATOS DE PLANIFICACION DE ALMUERZOS
  planComidas: any = [];
  ObtenerPlanComidasEmpleado(formato_fecha: string, formato_hora: string) {
    this.planComidas = [];
    this.restPlanComidas.ObtenerPlanComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.planComidas = res;
      this.FormatearFechas(this.planComidas, formato_fecha, formato_hora);
    });
  }

  // METODO PARA FORMATEAR FECHAS Y HORAS
  FormatearFechas(datos: any, formato_fecha: string, formato_hora: string) {
    datos.forEach(c => {
      // TRATAMIENTO DE FECHAS Y HORAS
      c.fecha_ = this.validar.FormatearFecha(c.fecha, formato_fecha, this.validar.dia_completo);

      if (c.fec_comida != undefined) {
        c.fec_comida_ = this.validar.FormatearFecha(c.fec_comida, formato_fecha, this.validar.dia_completo);
      }
      else {
        c.fec_inicio_ = this.validar.FormatearFecha(c.fec_inicio, formato_fecha, this.validar.dia_completo);
        c.fec_final_ = this.validar.FormatearFecha(c.fec_final, formato_fecha, this.validar.dia_completo);
      }

      c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, formato_hora);
      c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, formato_hora);

    })
  }

  // VENTANA PARA INGRESAR PLANIFICACION DE COMIDAS
  AbrirVentanaPlanificacion(): void {
    console.log(this.idEmpleado);
    var info = {
      id_contrato: this.datoActual.id_contrato,
      id_cargo: this.datoActual.id_cargo,
      nombre: this.datoActual.nombre + ' ' + this.datoActual.apellido,
      cedula: this.datoActual.cedula,
      correo: this.datoActual.correo,
      codigo: this.datoActual.codigo,
      id: this.datoActual.id,
    }
    this.ventana.open(PlanificacionComidasComponent, {
      width: '600px',
      data: { servicios: info }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS
  AbrirEditarPlanComidas(datoSeleccionado): void {
    if (datoSeleccionado.fec_inicio != undefined) {
      // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
      let datosConsumido = {
        id_plan_comida: datoSeleccionado.id,
        id_empleado: datoSeleccionado.id_empleado
      }
      this.restPlanComidas.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
        this.toastr.info('No es posible actualizar la planificación de alimentación de ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + ' ya que presenta registros de servicio de alimentación consumidos.', '', {
          timeOut: 6000,
        })
      }, error => {
        this.VentanaEditarPlanComida(datoSeleccionado, EditarPlanComidasComponent, 'individual');
      });
    }
    else {
      this.VentanaEditarPlanComida(datoSeleccionado, EditarSolicitudComidaComponent, 'administrador')
    }
  }

  // VENTANA DE PLANIFICACION DE COMIDAS
  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeletePlanComidas(datos: any) {
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restPlanComidas.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('Proceso no válido. Usuario ' + this.empleadoUno[0].nombre + ' '
        + this.empleadoUno[0].apellido + ' tiene registros de alimentación consumidos.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          } else {
            this.router.navigate(['/verEmpleado/', this.idEmpleado]);
          }
        });
    });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    const data = {
      user_name: this.user_name,
      ip: this.ip,
    }


    this.restPlanComidas.EliminarPlanComida(id_plan, id_empleado, data).subscribe(res => {
      this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
    });
  }

  /** ***************************************************************************************************** **
   ** **                METODO DE BUSQUEDA DE PLANIFICACIONES DE SERVICIO DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/
  plan_comida: boolean = false;
  MostrarPlanComida() {
    this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
    this.solicita_comida = false;
    this.plan_comida = true;
  }

  solicita_comida: boolean = true;
  MostrarSolicitaComida() {
    this.ObtenerSolComidas(this.formato_fecha, this.formato_hora);
    this.solicita_comida = true;
    this.plan_comida = false;
  }

  // METODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE ALMUERZOS
  solicitaComida: any = [];
  ObtenerSolComidas(formato_fecha: string, formato_hora: string) {
    this.solicitaComida = [];
    this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(sol => {
      this.solicitaComida = sol;
      this.FormatearFechas(this.solicitaComida, formato_fecha, formato_hora);
    });
  }


  /** ***************************************************************************************************** **
   ** **               METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE SERVICIO DE ALIMENTACION
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, id_empleado_recibe: number) {
    let mensaje = {
      id_comida: datos.id_detalle,
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: id_empleado_recibe,
      tipo: 20, // PLANIFICACIÓN DE ALIMENTACION
      mensaje: 'Planificación de alimentación eliminada desde ' +
        desde + ' hasta ' +
        hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
      user_name: this.user_name,
      ip: this.ip
    }
    this.restPlanComidas.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACION
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      observacion: datos.observacion,
      id_comida: datos.id_detalle,
      id_envia: this.idEmpleadoLogueado,
      nombres: usuario,
      proceso: 'eliminado',
      asunto: 'ELIMINACION DE PLANIFICACION DE ALIMENTACION',
      correo: cuenta_correo,
      inicio: h_inicio,
      extra: datos.extra,
      desde: desde,
      hasta: hasta,
      final: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE ALIMENTACION
    this.restPlanComidas.EnviarCorreoPlan(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
      console.log(res.message);
    })
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE PRSENTACION DE DATOS DE PROCESOS                          ** **
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE LOS PROCESOS DEL EMPLEADO
  empleadoProcesos: any = [];
  ObtenerEmpleadoProcesos(formato_fecha: string) {
    this.empleadoProcesos = [];
    this.restEmpleadoProcesos.ObtenerProcesoUsuario(parseInt(this.idEmpleado)).subscribe(datos => {
      this.empleadoProcesos = datos;
      this.empleadoProcesos.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA INGRESAR PROCESOS DEL EMPLEADO
  AbrirVentanaProcesos(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistrarEmpleProcesoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo } })
        .afterClosed().subscribe(item => {
          this.ObtenerEmpleadoProcesos(this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR PROCESOS DEL EMPLEADO
  AbrirVentanaEditarProceso(datoSeleccionado: any): void {
    this.ventana.open(EditarEmpleadoProcesoComponent,
      { width: '500px', data: { idEmpleado: this.idEmpleado, datosProcesos: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerEmpleadoProcesos(this.formato_fecha);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PROCESOS
  EliminarProceso(id_plan: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.restEmpleadoProcesos.EliminarRegistro(id_plan, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerEmpleadoProcesos(this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteProceso(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarProceso(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }


  /** ******************************************************************************************* **
   ** **                METODO DE PRESENTACION DE DATOS DE AUTORIZACION                        ** **
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS
  autorizacionesTotales: any = [];
  ObtenerAutorizaciones() {
    this.autorizacionesTotales = [];
    this.restAutoridad.BuscarAutoridadEmpleado(parseInt(this.idEmpleado)).subscribe(datos => {
      this.autorizacionesTotales = datos;
      console.log('depa autoriza: ', this.autorizacionesTotales[0]);
    })
  }

  // VENTANA PARA REGISTRAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS
  AbrirVentanaAutorizar(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistroAutorizacionDepaComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo } })
        .afterClosed().subscribe(item => {
          this.ObtenerAutorizaciones();
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS
  AbrirEditarAutorizar(datoSeleccionado: any): void {
    this.ventana.open(EditarAutorizacionDepaComponent,
      { width: '600px', data: { idEmpleado: this.idEmpleado, datosAuto: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerAutorizaciones();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarAutorizacion(id_auto: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.restAutoridad.EliminarRegistro(id_auto, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerAutorizaciones();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDeleteAutorizacion(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarAutorizacion(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /** ***************************************************************************************** **
   ** **                      METODO DE MANEJO DE BOTONES DE PERFIL                          ** **
   ** ***************************************************************************************** **/

  // VENTANA PARA MODIFICAR CONTRASEÑA
  CambiarContrasena(): void {
    this.ventana.open(CambiarContrasenaComponent, { width: '350px', data: this.idEmpleado })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.sesion.logout();
        }
      });
  }

  // INGRESAR FRASE
  IngresarFrase(): void {
    this.restU.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
      if (data[0].frase === null || data[0].frase === '') {
        this.ventana.open(FraseSeguridadComponent, { width: '450px', data: this.idEmpleado })
          .afterClosed()
          .subscribe((confirmado: Boolean) => {
            if (confirmado) {
              this.VerEmpresa();
            }
          });
      }
      else {
        this.CambiarFrase();
      }
    });
  }

  // CAMBIAR FRASE
  CambiarFrase(): void {
    this.ventana.open(CambiarFraseComponent, { width: '450px', data: this.idEmpleado })
      .disableClose = true;
  }

  // VER BOTON FRASE DE ACUERDO A LA CONFIGURACION DE SEGURIDAD
  empresa: any = [];
  frase: boolean = false;
  cambiar_frase: boolean = false;
  activar_frase: boolean = false;
  VerEmpresa() {
    this.empresa = [];
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].seg_frase === true) {
        this.activar_frase = true;
        this.restU.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
          if (data[0].frase === null || data[0].frase === '') {
            this.frase = true;
            this.cambiar_frase = false;
          }
          else {
            this.frase = false;
            this.cambiar_frase = true;
          }
        });
      }
      else {
        this.activar_frase = false;
      }
    });
  }

  // MOSTRAR BOTON CAMBIAR CONTRASEÑA
  activar: boolean = false;
  VerAccionContrasena() {
    if (parseInt(this.idEmpleado) === this.idEmpleadoLogueado) {
      this.activar = true;
    }
    else {
      this.activar = false;
    }
  }



  /** ****************************************************************************************** **
   ** **                               PARA LA GENERACION DE PDFs                             ** **                                           *
   ** ****************************************************************************************** **/

  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(this.empleadoUno[0].nombre + '_' + this.empleadoUno[0].apellido + '.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    let estadoCivil = this.EstadoCivilSelect[this.empleadoUno[0].esta_civil - 1];
    let genero = this.GeneroSelect[this.empleadoUno[0].genero - 1];
    let estado = this.EstadoSelect[this.empleadoUno[0].estado - 1];
    let nacionalidad: any;
    this.nacionalidades.forEach(element => {
      if (this.empleadoUno[0].id_nacionalidad == element.id) {
        nacionalidad = element.nombre;
      }
    });
    sessionStorage.setItem('profile', this.empleadoUno);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -30, 0, 5] },
        {
          text: (this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido).toUpperCase(),
          bold: true, fontSize: 14,
          alignment: 'left',
          margin: [0, 15, 0, 18]
        },
        {
          columns: [
            [
              { image: this.imagenEmpleado, width: 120, margin: [10, -10, 0, 5] },
            ],
            [
              { text: 'Cédula: ' + this.empleadoUno[0].cedula, style: 'item' },
              { text: 'Nacionalidad: ' + nacionalidad },
              { text: 'Fecha Nacimiento: ' + this.empleadoUno[0].fec_nacimiento_, style: 'item' },
              { text: 'Estado civil: ' + estadoCivil, style: 'item' },
              { text: 'Género: ' + genero, style: 'item' },
            ],
            [
              { text: 'Código: ' + this.empleadoUno[0].codigo, style: 'item' },
              { text: 'Estado: ' + estado, style: 'item' },
              { text: 'Domicilio: ' + this.empleadoUno[0].domicilio, style: 'item' },
              { text: 'Correo: ' + this.empleadoUno[0].correo, style: 'item' },
              { text: 'Teléfono: ' + this.empleadoUno[0].telefono, style: 'item' },
            ],
          ]
        },
        { text: (this.discapacidadUser.length > 0 ? 'DISCAPACIDAD' : ''), style: 'header' },
        this.PresentarDataPDFdiscapacidadEmpleado(),
        { text: (this.tituloEmpleado.length > 0 ? 'TÍTULOS' : ''), style: 'header' },
        this.PresentarDataPDFtitulosEmpleado(),
        { text: 'CONTRATO', style: 'header' },
        this.PresentarDataPDFcontratoEmpleado(),
        { text: 'CARGO', style: 'header' },
        this.PresentarDataPDFcargoEmpleado(),
      ],
      info: {
        title: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + '_PERFIL',
        author: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
        subject: 'Perfil',
        keywords: 'Perfil, Empleado',
      },
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 20, 0, 10] },
        name: { fontSize: 14, bold: true },
        item: { fontSize: 12, bold: false },
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        tableCell: { fontSize: 12, alignment: 'center', },
      }
    };
  }

  PresentarDataPDFtitulosEmpleado() {
    if (this.tituloEmpleado.length > 0) {
      return {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'NOMBRE', style: 'tableHeader' },
              { text: 'NIVEL', style: 'tableHeader' }
            ],
            ...this.tituloEmpleado.map(obj => {
              return [{ text: obj.nombre, style: 'tableCell' }, { text: obj.nivel, style: 'tableCell' }];
            })
          ]
        }
      };
    }

  }

  PresentarDataPDFcontratoEmpleado() {

    return {
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'RÉGIMEN', style: 'tableHeader' },
            { text: 'FECHA DESDE', style: 'tableHeader' },
            { text: 'FECHA HASTA', style: 'tableHeader' },
            { text: 'MODALIDAD LABORAL', style: 'tableHeader' },
            { text: 'CONTROL ASISTENCIA', style: 'tableHeader' },
            { text: 'CONTROL VACACIONES', style: 'tableHeader' },
          ],
          ...this.contratoEmpleado.map(contrato => {
            return [
              { text: contrato.descripcion, style: 'tableCell' },
              { text: contrato.fec_ingreso_, style: 'tableCell' },
              { text: contrato.fec_salida === null ? 'Sin fecha' : contrato.fec_salida_, style: 'tableCell' },
              { text: contrato.nombre_contrato, style: 'tableCell' },
              { text: contrato.asis_controla ? 'Si' : 'No', style: 'tableCell' },
              { text: contrato.vaca_controla ? 'Si' : 'No', style: 'tableCell' },
            ];
          }),
        ],
      },
    };
  }

  PresentarDataPDFcargoEmpleado() {
    return {
      table: {
        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'SUCURSAL', style: 'tableHeader' },
            { text: 'DEPARTAMENTO', style: 'tableHeader' },
            { text: 'CARGO', style: 'tableHeader' },
            { text: 'FECHA DESDE', style: 'tableHeader' },
            { text: 'FECHA HASTA', style: 'tableHeader' },
            { text: 'HORAS DE TRABAJO', style: 'tableHeader' },
            { text: 'SUELDO', style: 'tableHeader' },
          ],
          ...this.cargoEmpleado.map(cargo => {
            return [
              { text: cargo.sucursal, style: 'tableCell' },
              { text: cargo.departamento, style: 'tableCell' },
              { text: cargo.nombre_cargo, style: 'tableCell' },
              { text: cargo.fec_inicio_, style: 'tableCell' },
              { text: cargo.fec_final === null ? 'Sin fecha' : cargo.fec_final_, style: 'tableCell' },
              { text: cargo.hora_trabaja, style: 'tableCell' },
              { text: cargo.sueldo, style: 'tableCell' },
            ]
          })
        ]
      }
    };
  }

  PresentarDataPDFdiscapacidadEmpleado() {
    if (this.discapacidadUser.length > 0) {
      return {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'CARNET CONADIS', style: 'tableHeader' },
              { text: 'TIPO', style: 'tableHeader' },
              { text: 'PORCENTAJE', style: 'tableHeader' },
            ],
            ...this.discapacidadUser.map(obj => {
              return [
                { text: obj.carn_conadis, style: 'tableCell' },
                { text: obj.tipo, style: 'tableCell' },
                { text: obj.porcentaje + ' %', style: 'tableCell' },
              ];
            })
          ]
        }
      };
    }
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                        ** **                           *
   ** ******************************************************************************************* **/

  obtenerDatos() {
    let objeto: any;
    let objetoTitulo: any;
    let objetoDiscapacidad: any;
    let objetoContrato: any;
    let objetoCargo: any;
    let arregloEmpleado: any = [];
    let arregloDiscapacidad: any = [];
    let arregloTitulo: any = [];
    let arregloContrato: any = [];
    let arregloCargo: any = [];
    this.empleadoUno.forEach((obj: any) => {
      let estadoCivil = this.EstadoCivilSelect[obj.esta_civil - 1];
      let genero = this.GeneroSelect[obj.genero - 1];
      let estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach(element => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      objeto = {
        'Codigo': obj.codigo,
        "Apellido": obj.apellido,
        "Nombre": obj.nombre,
        "Cedula": obj.cedula,
        "Estado Civil": estadoCivil,
        "Genero": genero,
        "Correo": obj.correo,
        "Fecha de Nacimiento": new Date(obj.fec_nacimiento_.split(" ")[1]),
        "Estado": estado,
        "Domicilio": obj.domicilio,
        "Telefono": obj.telefono,
        "Nacionalidad": nacionalidad,
      };
      if (obj.longitud !== null) {
        objeto.empleado.longitud = obj.longitud;
      }
      if (obj.latitud !== null) {
        objeto.empleado.latitud = obj.latitud;
      }
      arregloEmpleado.push(objeto);
    });

    if (this.discapacidadUser !== null) {
      this.discapacidadUser.map(discapacidad => {
        objetoDiscapacidad = {
          'Carnet Conadis': discapacidad.carn_conadis,
          'Tipo': discapacidad.tipo,
          'Porcentaje': discapacidad.porcentaje + '%',
        };
        arregloDiscapacidad.push(objetoDiscapacidad);
      });
    };
    if (this.tituloEmpleado !== null) {
      this.tituloEmpleado.map(titulo => {
        objetoTitulo = {
          'Nombre': titulo.nombre,
          'Nivel': titulo.nivel,
        };
        arregloTitulo.push(objetoTitulo);
      });
    };
    if (this.contratoEmpleado !== null) {
      this.contratoEmpleado.map((contrato: any) => {
        let fechaI = contrato.fec_ingreso_.split(" ");
        let fechaS: string = contrato.fec_salida === null ? 'Sin fecha' : contrato.fec_salida_.split(" ")[1];
        objetoContrato = {
          'Regimen': contrato.descripcion,
          'Fecha desde': fechaI[1],
          'Fecha hasta': fechaS,
          'Modalidad laboral': contrato.nombre_contrato,
          'Control asistencia': contrato.asis_controla ? 'Si' : 'No',
          'Control vacaciones': contrato.vaca_controla ? 'Si' : 'No',
        };
        arregloContrato.push(objetoContrato);
      });
    };
    if (this.cargoEmpleado !== null) {
      this.cargoEmpleado.map((cargo: any) => {
        let fechaI = cargo.fec_inicio_.split(" ");
        let fechaS: string = cargo.fec_final === null ? 'Sin fecha' : cargo.fec_final_.split(" ")[1];
        objetoCargo = {
          'Sucursal': cargo.sucursal,
          'Departamento': cargo.departamento,
          'Cargo': cargo.nombre_cargo,
          'Fecha desde': fechaI[1],
          'Fecha hasta': fechaS,
          'Sueldo': cargo.sueldo,
          'Horas trabaja': cargo.hora_trabaja,
        };
        arregloCargo.push(objetoCargo);
      });
    };
    return [arregloEmpleado, arregloContrato, arregloCargo];
  }


  ExportToExcel() {
    const datos: any = this.obtenerDatos();
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[0]);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'PERFIL');
    if (this.discapacidadUser.length > 0) {
      const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
      xlsx.utils.book_append_sheet(wb, wsd, 'DISCAPACIDA');
    }
    if (this.tituloEmpleado.length > 0) {
      const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
      xlsx.utils.book_append_sheet(wb, wst, 'TITULOS');
    }
    if (this.contratoEmpleado.length > 0) {
      const wsco: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[1]);
      xlsx.utils.book_append_sheet(wb, wsco, 'CONTRATO');
    }
    if (this.cargoEmpleado.length > 0) {
      const wsca: xlsx.WorkSheet = xlsx.utils.json_to_sheet(datos[2]);
      xlsx.utils.book_append_sheet(wb, wsca, 'CARGO');
    }
    xlsx.writeFile(wb, (datos[0])[0].Nombre + "_" + (datos[0])[0].Apellido + '.xlsx');
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS CSV                          ** **                                *
   ** ******************************************************************************************* **/

  ExportToCVS() {
    const datos: any = this.obtenerDatos();
    const datosEmpleado: any = [];
    const objeto = {
      ...datos[0][0],
      ...this.discapacidadUser[0],
      ...this.tituloEmpleado[0],
      ...datos[1][0],
      ...datos[2][0],
    };
    datosEmpleado.push(objeto);
    const csvDataE = xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(datosEmpleado));
    const data: Blob = new Blob([csvDataE], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, (datos[0])[0].Nombre + "_" + (datos[0])[0].Apellido + '.csv');
  }

  /** ******************************************************************************************* **
   ** **                             METODO PARA IMPRIMIR EN XML                               ** **
   ** ******************************************************************************************* **/

  nacionalidades: any = [];
  ObtenerNacionalidades() {
    this.restEmpleado.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];

  urlxml: string;
  data: any = [];
  ExportToXML() {
    let objeto: any;
    let arregloEmpleado: any = [];
    this.empleadoUno.forEach(obj => {
      let estadoCivil = this.EstadoCivilSelect[obj.esta_civil - 1];
      let genero = this.GeneroSelect[obj.genero - 1];
      let estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach(element => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });

      objeto = {
        "empleado": {
          "$": { "codigo": obj.codigo },
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "cedula": obj.cedula,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fec_nacimiento_,
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
        }
      };
      if (obj.longitud !== null) {
        objeto.empleado.longitud = obj.longitud;
      }
      if (obj.latitud !== null) {
        objeto.empleado.latitud = obj.latitud;
      }
      if (this.discapacidadUser !== null) {
        this.discapacidadUser.map(discapacidad => {
          objeto.empleado.discapacidad = {
            'carnet_conadis': discapacidad.carn_conadis,
            'tipo': discapacidad.tipo,
            'porcentaje': discapacidad.porcentaje + '%',
          }
        });
      };
      if (this.tituloEmpleado !== null) {
        this.tituloEmpleado.map(titulo => {
          objeto.empleado.titulos = {
            'nombre': titulo.nombre,
            'Nivel': titulo.nivel,
          }
        });
      };
      if (this.contratoEmpleado !== null) {
        this.contratoEmpleado.map((contrato: any) => {
          objeto.empleado.contrato = {
            'regimen': contrato.descripcion,
            'fecha_desde': contrato.fec_ingreso_,
            'fecha_hasta': contrato.fec_salida === null ? 'Sin fecha' : contrato.fec_salida_,
            'modalidad_laboral': contrato.nombre_contrato,
            'control_asistencia': contrato.asis_controla ? 'Si' : 'No',
            'control_vacaciones': contrato.vaca_controla ? 'Si' : 'No',
          };
        });

      }
      if (this.cargoEmpleado !== null) {
        this.cargoEmpleado.map((cargo: any) => {
          objeto.empleado.cargo = {
            'sucursal': cargo.sucursal,
            'departamento': cargo.departamento,
            'cargo': cargo.nombre_cargo,
            'fecha_desde': cargo.fec_inicio_,
            'fecha_hasta': cargo.fec_final === null ? 'Sin fecha' : cargo.fec_final_,
            'sueldo': cargo.sueldo,
            'horas_trabaja': cargo.hora_trabaja,
          };
        });
      }
      arregloEmpleado.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder();
    const xml = xmlBuilder.buildObject(objeto);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // Abrir una nueva pestaña o ventana con el contenido XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // Evitar que la nueva pestaña tenga acceso a la ventana padre
      newTab.focus(); // Dar foco a la nueva pestaña
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = objeto.empleado.nombre + '-' + objeto.empleado.apellido + '.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
  }

}

