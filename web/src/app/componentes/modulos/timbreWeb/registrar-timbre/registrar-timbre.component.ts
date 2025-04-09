// IMPORTAR LIBRERIAS
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

// SECCION DE SERVICIOS
import { EmpleadoUbicacionService } from 'src/app/servicios/modulos/empleadoUbicacion/empleado-ubicacion.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';

import { TimbreWebComponent } from '../timbre-empleado/timbre-web.component';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-registrar-timbre',
  templateUrl: './registrar-timbre.component.html',
  styleUrls: ['./registrar-timbre.component.css']
})

export class RegistrarTimbreComponent implements OnInit {
  ips_locales: any = '';

  // PARA MANEJAR LA IMAGEN CAPTURADA
  private trigger: Subject<void> = new Subject<void>();
  camara_: MediaDeviceInfo[] = [];
  convertida: string | ArrayBuffer | null = null;
  imagenCamara: any;
  existe_camara: boolean = false;
  permisos_camara: boolean = false;
  indiceDispositivo: number = 0;  // INDICE PARA RASTREAR LA CAMARA ACTUAL
  seleccionarDispositivo: string | null = null;
  camaraFrontal: MediaDeviceInfo | null = null;
  camaraTrasera: MediaDeviceInfo | null = null;
  mostrarWebcam = true; // CONTROLA LA VISUALIZACION DEL COMPONENTE WEBCAM
  camaraSeleccionada: any = '';
  videoOptions: MediaTrackConstraints = {
    deviceId: this.seleccionarDispositivo ? { exact: this.seleccionarDispositivo } : undefined
  };

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  // CAMPOS DEL FORMULARIO Y VALIDACIONES
  observacionF = new FormControl('');

  // CAMPOS DENTRO DEL FORMULARIO EN UN GRUPO
  public formulario = new FormGroup({
    observacionForm: this.observacionF,
  });

  // VARIABLE DE SELECCION DE OPCION
  boton_abierto: boolean = false;
  ver_timbrar: boolean = true;

  // VARIABLES DE ALMACENMAIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  // METODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  // VARIABLES DE ALMACENAMIENTO DE FECHA Y HORA DEL TIMBRE
  f: Date = new Date();
  currentTime: string;
  formato = 'HH:mm:ss';
  timeZone: string;
  gmt_dispositivo: string;

  // ID EMPLEADO QUE INICIO SESION
  id_empl: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private restTimbres: TimbresService,
    public ventana: TimbreWebComponent, // VARIABLE DE USO DE VENTANA DE DIALOGO
    public restP: ParametrosService,
    public restE: EmpleadoService,
    public restU: EmpleadoUbicacionService,
    public restF: FuncionesService,
    private toastr: ToastrService, // VARIABLE DE USO EN NOTIFICACIONES
    public validar: ValidacionesService,
  ) {
    this.id_empl = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ObtenerZonaHoraria();
    this.VerificarCamara();
    this.VerificarFunciones();
    this.BuscarOpcionMarcacion();
    this.BuscarParametros();
  }

  // METODO PARA FORMATEAR LA HORA
  private FormatearHora(date: Date, opcion: number): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(seconds).padStart(2, '0');
    if (this.capturar_segundos === false) {
      formattedSeconds = '00';
    }

    if (opcion === 1) {
      if (this.formato === 'hh:mm:ss a') {
        // CONVERTIR HORAS A FORMATO DE 12 HORAS
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
      }
      else {
        const formattedHours = String(date.getHours()).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      }
    }
    else {
      // OBTENER LA FECHA (DIA, MES, AÑO)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // LOS MESES COMIENZAN DESDE 0
      const year = date.getFullYear();
      // CONVERTIR HORAS A FORMATO DE 12 HORAS
      const formattedHours = hours % 12 || 12;
      return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;;
    }

  }

  // METODO PARA MOSTRAR HORA EN TIEMPO REAL
  MostrarHora() {
    interval(1000)
      .pipe(map(() => new Date()))
      .subscribe(date => {
        this.currentTime = this.FormatearHora(date, 1);
        this.fecha_hora = this.FormatearHora(date, 2)
      });

    // INICIALIZA EL TIEMPO INMEDIATAMENTE
    this.currentTime = this.FormatearHora(new Date(), 1);
    this.fecha_hora = this.FormatearHora(new Date(), 2);
  }

  // METODO PARA OBTENER ZONA HORARIA
  ObtenerZonaHoraria() {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // OBTENER EL OFFSET GMT EN MINUTOS
    const gmt_minutos = new Date().getTimezoneOffset();
    // CONVERTIR EL OFFSET A HORAS
    const gmt_horas = -gmt_minutos / 60;
    // FORMATEAR COMO GMT
    this.gmt_dispositivo = `GMT${gmt_horas >= 0 ? '+' : ''}${gmt_horas.toString().padStart(2, '0')}`;
  }

  // METODO PARA MOSTRAR FOTO
  triggerSnapshot(): void {
    this.trigger.next();
  }

  // METODO PARA CONVERTIR LA IMAGEN
  handleImage(webcamImage: WebcamImage): void {
    this.VoltearImagen(webcamImage.imageAsDataUrl)
  }

  async VerificarCamara(): Promise<void> {
    try {
      // OBTENER TODOS LOS DISPOSITIVOS
      const dispositivos = await navigator.mediaDevices.enumerateDevices();
      // FILTRAR PARA ENCONTRAR LAS CAMARAS
      const camaras = dispositivos.filter(dispositivo => dispositivo.kind === 'videoinput');
      this.camara_ = camaras;
      this.existe_camara = camaras.length > 0;
      if (this.existe_camara) {
        await this.VerificarPermisosCamara();
        camaras.forEach(camara => {
          const label = camara.label.toLowerCase();
          if (label.includes('front') || label.includes('user') || label.includes('frontal')) {
            this.camaraFrontal = camara;
          } else if (label.includes('back') || label.includes('environment') || label.includes('trasera')) {
            this.camaraTrasera = camara;
          }
        });
      } else {
      }
    } catch (error) {
      this.existe_camara = false;
    }
  }

  // METODO SEPARADO PARA VERIFICAR LOS PERMISOS DE LA CAMARA
  async VerificarPermisosCamara(): Promise<void> {
    try {
      // INTENTAR OBTENER ACCESO A LA CAMARA
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.permisos_camara = true;
      // SI SE DETECTA ALGUNA CAMARA, SELECCIONAR UNA POR DEFECTO
      this.seleccionarDispositivo = this.camaraFrontal?.deviceId || this.camaraTrasera?.deviceId || '';
      if (this.camaraFrontal && this.camaraTrasera) {
        // IMPRIMIR EL LABEL DE LA CAMARA SELECCIONADA
        this.camaraSeleccionada = this.seleccionarDispositivo === this.camaraFrontal?.deviceId
          ? 'Cámara Frontal'
          : 'Cámara Trasera';
      }
      // DETENER EL STREAM DESPUES DE VERIFICAR EL ACCESO
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      this.permisos_camara = false;
    }
  }

  // METODO PARA SELECCIONAR ENTRE LAS CAMARAS EXISTENTES
  SeleccionarCamara(): void {
    if (this.camaraFrontal && this.camaraTrasera) {
      // ALTERNAR ENTRE CAMARA FRONTAL Y TRASERA
      this.seleccionarDispositivo = this.seleccionarDispositivo === this.camaraFrontal.deviceId
        ? this.camaraTrasera.deviceId
        : this.camaraFrontal.deviceId;
      // FORZAR LA RECREACION DEL COMPONENTE WEBCAM
      this.mostrarWebcam = false;
      setTimeout(() => {
        this.videoOptions = {
          deviceId: this.seleccionarDispositivo ? { exact: this.seleccionarDispositivo } : undefined
        };
        this.mostrarWebcam = true;
      }, 0);
      // IMPRIMIR EL LABEL DE LA CAMARA SELECCIONADA
      this.camaraSeleccionada = this.seleccionarDispositivo === this.camaraFrontal?.deviceId
        ? 'Cámara Frontal'
        : 'Cámara Trasera';
      //console.log(`Cambiando a: ${camaraSeleccionada}`);
    } else {
      //console.warn('No hay suficientes cámaras para alternar.');
    }
  }

  // METOOD PARA VOLTEAR LA IMAGEN HORIZONTALMENTE
  VoltearImagen(src: any) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0); // MUEVE EL ORIGEN AL BORDE DERECHO DEL CANVAS
        ctx.scale(-1, 1); // APLICA LA ESCALA NEGATIVA
        ctx.drawImage(img, 0, 0); // DIBUJA LA IMAGEN EN EL CANVAS
        const flippedImage = canvas.toDataURL();
        this.imagenCamara = flippedImage;
        // CONVERTIR A BASE64 CON CALIDAD REDUCIDA
        const quality = 0.9; // AJUSTA LA CALIDAD SEGUN SEA NECESARIO (0.0 - 1.0)
        this.convertida = canvas.toDataURL('image/jpeg', quality);
      } else {
        this.toastr.warning(
          'Ups!!! algo salio mal.', 'Intente nuevamente.', {
          timeOut: 6000,
        })
      }
    };
    img.onerror = () => {
      this.toastr.warning(
        'Error al cargar la imagen', '', {
        timeOut: 6000,
      })
    };
    img.src = src;
  }

  // METODO PARA CONSULTAR FUNCIONES ACTIVAS DEL SISTEMA
  funciones: any = [];
  VerificarFunciones() {
    let funcionesSistema = {
      "direccion": (localStorage.getItem('empresaURL') as string)
    }

    this.restF.ListarFunciones(funcionesSistema).subscribe(res => {
      this.funciones = res;
    })
  }

  // METODO PARA OBTENER RANGO DE PERIMETRO
  rango: number = 0;
  desconocida: boolean = false;
  capturar_segundos: boolean = false;
  foto: boolean = false;
  especial: boolean = false;
  foto_obligatorio: boolean = false;
  opcional: boolean = false;

  BuscarParametros() {
    let datos: any = [];
    let detalles = { parametros: '4, 7, 2, 5' };
    this.restP.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('parametros ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro PARA RANGO DE UBICACION = 4
          if (p.id_parametro === 4) {
            this.rango = (parseInt(p.descripcion))
          }
          // id_tipo_parametro PARA CONSIDERAR SEGUNDOS O NO = 5
          if (p.id_parametro === 5) {
            if (p.descripcion === 'Si') {
              this.capturar_segundos = true;
            }
          }
          // id_tipo_parametro PARA VERIFICAR USO SSL = 7
          if (p.id_parametro === 7) {
            if (p.descripcion === 'Si') {
              this.Geolocalizar();
            }
          }
          // id_tipo_parametro FORMATO DE HORA = 2
          if (p.id_parametro === 2) {
            this.formato = p.descripcion;
          }
        })
        this.MostrarHora();
      }, vacio => {
        this.MostrarHora();
      });
  }

  // METODO PARA BUSCAR OPCIONES DE MARCACION DEL USUARIO
  BuscarOpcionMarcacion() {
    let buscar = {
      id_empleado: this.id_empl,
    }
    this.foto = false;
    this.especial = false;
    this.desconocida = false;
    this.foto_obligatorio = false
    this.restTimbres.BuscarVariasOpcionesMarcacionWeb(buscar).subscribe((a) => {
      //console.log('veificar datos ', a.respuesta);
      this.foto = a.respuesta[0].timbre_foto;
      this.especial = a.respuesta[0].timbre_especial;
      this.desconocida = a.respuesta[0].timbre_ubicacion_desconocida;
      this.foto_obligatorio = a.respuesta[0].opcional_obligatorio;
    });
  }

  // METODO PARA TOMAR COORDENAS DE UBICACION
  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
          console.log('ingresa aqui ', this.latitud, ' - ', this.longitud)
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              this.toastr.warning(
                'No se ha permitido el acceso a la posición del usuario.', '', {
                timeOut: 6000,
              })
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              this.toastr.warning(
                'No se ha podido acceder a la información de su posición.', '', {
                timeOut: 6000,
              })
              break;
            case objPositionError.TIMEOUT:
              this.toastr.warning(
                'El servicio ha tardado demasiado tiempo en responder.', '', {
                timeOut: 6000,
              })
              break;
            default:
              this.toastr.warning(
                'Ups!!! algo salio mal.', 'Volver a intentar.', {
                timeOut: 6000,
              })
          }
        }, this.options);
    }
    else {
      this.toastr.warning(
        'Ups!!! algo salio mal.', 'Su navegador no soporta la API de geolocalización.', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA GUARDAR DATOS DEL TIMBRE SEGUN LA OPCION INGRESADA
  ver_informacion: boolean = false;
  teclaFuncionF: number;
  asistencia: string = '';
  fecha_hora: any;
  accionF: string = '';
  AlmacenarDatos(opcion: number) {
    //console.log('entra1')
    this.boton_abierto = false;
    switch (opcion) {
      case 1:
        this.accionF = 'E';
        this.teclaFuncionF = 0;
        this.asistencia = 'ENTRADA';
        break;
      case 2:
        this.accionF = 'S';
        this.teclaFuncionF = 1;
        this.asistencia = 'SALIDA';
        break;
      case 3:
        this.accionF = 'I/A';
        this.teclaFuncionF = 2;
        this.asistencia = 'INICIO ALIMENTACIÓN';
        break;
      case 4:
        this.accionF = 'F/A';
        this.teclaFuncionF = 3;
        this.asistencia = 'FIN ALIMENTACIÓN';
        break;
      case 5:
        this.accionF = 'I/P';
        this.teclaFuncionF = 4;
        this.asistencia = 'INICIO PERMISO';
        break;
      case 6:
        this.accionF = 'F/P';
        this.teclaFuncionF = 5;
        this.asistencia = 'FIN PERMISO';
        break;
      case 7:
        this.accionF = 'HA';
        this.teclaFuncionF = 7;
        this.asistencia = 'TIMBRE ESPECIAL';
        this.boton_abierto = true;
        break;
      default:
        this.accionF = 'D';
        this.asistencia = 'DESCONOCIDO';
        break;
    }
    this.ver_informacion = true;
    this.ver_timbrar = false;
    this.ver_camara = false;
    this.InsertarTimbre();
  }

  // METODO PARA TOMAR DATOS DEL TIMBRE
  InsertarTimbre() {
    // VERIFICAR USO DE LA CAMARA
    if (this.foto === true) {

      console.log("ver valor de this.foto_obligatorio: ", this.foto_obligatorio)
      if (this.foto_obligatorio) {
        this.opcional = false;

        if (this.existe_camara) {
          if (this.permisos_camara === true) {
            this.ver_camara = true;
            this.ValidarModulo(this.latitud, this.longitud, this.rango);
          }
          else {
            this.MostrarMensaje('Permisos de cámara no otorgados o denegados.', '');
          }
        }
        else {
          this.MostrarMensaje('Fotografía es requerida.', 'No se ha encontrado ninguna cámara disponible.');
        }
      } else {

        this.opcional = true;

        if (this.existe_camara) {
          if (this.permisos_camara === true) {
            //this.ver_camara = true;
            this.ValidarModulo(this.latitud, this.longitud, this.rango);
          }
          else {
            if (this.ver_camara === true) {
              this.MostrarMensaje('Permisos de cámara no otorgados o denegados.', '');
            }else {
              this.ValidarModulo(this.latitud, this.longitud, this.rango);

            }
          }
        }
        else {
          this.ValidarModulo(this.latitud, this.longitud, this.rango);
        }
      }

    }
    else {
      this.ValidarModulo(this.latitud, this.longitud, this.rango);
    }
  }

  // METODO PARA LEER MENSAJE ERROR
  MostrarMensaje(mensaje1: string, mensaje2: string) {
    this.ver_camara = false;
    this.CerrarVentana();
    this.toastr.warning(
      mensaje1, mensaje2, {
      timeOut: 6000,
    });
  }

  // METODO PARA TOMAR DATOS DE MARCACION 
  informacion_timbre: any;
  dataTimbre: any;
  RegistrarDatosTimbre(ubicacion: any) {

    this.dataTimbre = {
      capturar_segundos: this.capturar_segundos,
      zona_dispositivo: this.timeZone,
      gmt_dispositivo: this.gmt_dispositivo,
      fec_hora_timbre: '',
      tecl_funcion: this.teclaFuncionF,
      observacion: '',
      ubicacion: ubicacion,
      longitud: this.longitud,
      id_reloj: 98,
      latitud: this.latitud,
      accion: this.accionF,
      ip: this.ip, ip_local: this.ips_locales,
      user_name: this.user_name,
    }
    console.log('data timbre.... ', this.dataTimbre)
    this.informacion_timbre = this.dataTimbre;
  }

  //  METODO PARA REGISTRAR DATOS DEL TIMBRE
  RegistrarTimbre(data: any) {
    data.fec_hora_timbre = this.fecha_hora;
    //data.fec_hora_timbre = '11/09/2024 5:09:00 PM'
    //console.log('data timbre ', data)
    this.restTimbres.RegistrarTimbreWeb(data).subscribe(res => {
      data.id_empleado = this.id_empl;
      this.ventana.BuscarParametro();
      this.CerrarProcesos();
      //console.log('res message', res.message)
      if (res.message === 'Registro guardado.') {
        this.toastr.success(res.message);
      }
      else if (res.message === 'Registro duplicado.') {
        this.toastr.info(res.message);
      }
      else if (res.message === 'Ups!!! algo salio mal.') {
        this.toastr.warning(res.message);
      }
      else {
        this.toastr.error(res.message);
      }

    }, err => {
      this.toastr.error(err.message)
    })
  }

  // METODO PARA GUARDAR TIMBRE CON IMAGEN
  GuardarImagen(form: any): void {
    //console.log('observacion ', form.observacionForm)
    if (this.imagenCamara) {
      this.informacion_timbre.imagen = this.convertida;
    }
    this.informacion_timbre.observacion = form.observacionForm;
    if (this.boton_abierto === true) {
      if (form.observacionForm != '' && form.observacionForm != undefined) {
        this.RegistrarTimbre(this.informacion_timbre);
      }
      else {
        this.toastr.info(
          'Ingresar descripción del timbre.', 'Campo observación es obligatorio.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.RegistrarTimbre(this.informacion_timbre);
    }
  }


  // METODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERIMETRO DEFINIDO
  contar: number = 0;
  ubicacion: string = '';
  sin_ubicacion: number = 0;
  CompararCoordenadas(informacion: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
          this.contar = this.contar + 1;
          this.ubicacion = descripcion;
          if (this.contar === 1) {
            this.RegistrarDatosTimbre(this.ubicacion);
            this.toastr.info(
              'Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.sin_ubicacion = this.sin_ubicacion + 1;
          if (this.sin_ubicacion === data.length) {
            this.ValidarDomicilio(informacion);
          }
        }
      });
  }

  // METODO QUE PERMITE VALIDACIONES DE UBICACION
  BuscarUbicacion(latitud: any, longitud: any, rango: any) {
    //console.log('entra4')
    var longitud_ = '';
    var latitud_ = '';
    if (longitud && latitud) {
      longitud_ = String(longitud);
      latitud_ = String(latitud)
    }
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: latitud_,
      lng1: longitud_,
      lat2: '',
      lng2: '',
      valor: rango
    }
    this.restU.ListarCoordenadasUsuario(this.id_empl).subscribe(
      res => {
        datosUbicacion = res;
        datosUbicacion.forEach((obj: any) => {
          informacion.lat2 = obj.latitud;
          informacion.lng2 = obj.longitud;
          //console.log(informacion.lat1, ' ---------- ', informacion.lng1)
          if (informacion.lat1 && informacion.lng1) {
            this.CompararCoordenadas(informacion, obj.descripcion, datosUbicacion);
          }
          else {
            if (this.desconocida === true) {
              this.RegistrarDatosTimbre('SIN UBICACION');
            }
            else {
              this.toastr.warning('Es necesario el uso de Certificados de Seguridad para acceder a la ubicación del usuario.', '', {
                timeOut: 6000,
              })
              this.CerrarProcesos();
            }
          }
        })
      }, error => {
        this.ValidarDomicilio(informacion);
      });
  }

  // METODO PARA VERIFICAR ACTIVACION DE MODULO DE GEOLOCALIZACION
  ValidarModulo(latitud: any, longitud: any, rango: any) {
    //console.log('entra3')
    //console.log('coordenadas ', latitud, ' long ', longitud)
    if (this.funciones[0].geolocalizacion === true) {
      this.BuscarUbicacion(latitud, longitud, rango);
    }
    else {
      this.RegistrarDatosTimbre(this.ubicacion);
    }
  }

  // METODO PARA VALIDAR UBICACION DOMICILIO
  ValidarDomicilio(informacion: any) {
    this.restE.BuscarUbicacion(this.id_empl).subscribe(res => {
      if (res[0].longitud != null && res[0].latitud != null) {
        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        //console.log('lat ', informacion.lat1, ' long ', informacion.lng1, 'res ', res, 'informacion ', informacion)
        if (informacion.lat2 && informacion.lng2) {
          this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
            if (resu[0].verificar === 'ok') {
              this.ubicacion = 'DOMICILIO';
              this.RegistrarDatosTimbre(this.ubicacion);
              this.toastr.info('Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
                timeOut: 6000,
              })
            }
            else {
              this.ProcesoPerimetroDesconocido();
            }
          })
        }
        else {
          this.toastr.warning('Es necesario el uso de Certificados de Seguridad para acceder a la ubicación del usuario.', '', {
            timeOut: 6000,
          })
          this.CerrarProcesos();
        }
      }
      else {
        this.ProcesoPerimetroDesconocido()
      }
    })
  }


  // METODO PARA REGISTRAR TIMBRE CON PERIMETRO DESCONOCIDO
  ProcesoPerimetroDesconocido() {
    // PUEDE TIMBRAR EN PERIMETROS DESCONOCIDOS
    if (this.desconocida === true) {
      this.ubicacion = 'DESCONOCIDO';
      this.RegistrarDatosTimbre(this.ubicacion);
      this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
        timeOut: 6000,
      })
    }
    else {
      this.toastr.warning('No tiene permitido timbrar en perímetros desconocidos.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.CerrarProcesos();
    }

  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    if (this.ver_informacion === false) {
      this.ventana.ver_principal = true;
      this.ventana.ver_timbre = false;
    }
    else {
      this.ver_informacion = false;
      this.ver_camara = false;
    }
    this.CerrarCamara();
  }

  // METODO PARA CERRAR PROCESO
  CerrarProcesos() {
    this.ventana.ver_principal = true;
    this.ventana.ver_timbre = false;
  }


  private _ver_camara: boolean = false;

  get ver_camara(): boolean {
    return this._ver_camara;
  }

  set ver_camara(value: boolean) {
    this._ver_camara = value;
    if (!value) {
      this.CerrarCamara();
    }
  }

  CerrarCamara() {
    // Método para cerrar la cámara
    this.imagenCamara = null;
    console.log('Cámara cerrada y variable imagenCamara reiniciada');
  }


}
