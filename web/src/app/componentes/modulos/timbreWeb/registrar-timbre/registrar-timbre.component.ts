// IMPORTAR LIBRERIAS
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

// SECCION DE SERVICIOS
import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import moment from 'moment';

@Component({
  selector: 'app-registrar-timbre',
  templateUrl: './registrar-timbre.component.html',
  styleUrls: ['./registrar-timbre.component.css']
})

export class RegistrarTimbreComponent implements OnInit {

  // CAMPOS DEL FORMULARIO Y VALIDACIONES
  observacionF = new FormControl('');

  // CAMPOS DENTRO DEL FORMULARIO EN UN GRUPO
  public formulario = new FormGroup({
    observacionForm: this.observacionF,
  });

  // VARIABLE DE SELECCION DE OPCION
  botones_normal: boolean = true;
  boton_abierto: boolean = false;

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

  // ID EMPLEADO QUE INICIO SESION
  id_empl: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restP: ParametrosService,
    public restE: EmpleadoService,
    public restU: EmpleadoUbicacionService,
    public restF: FuncionesService,
    public ventana: MatDialogRef<RegistrarTimbreComponent>, // VARIABLE DE USO DE VENTANA DE DIÁLOGO
    private toastr: ToastrService, // VARIABLE DE USO EN NOTIFICACIONES
  ) {
    this.id_empl = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.VerificarFunciones();
    this.BuscarParametroUbicacion();
    this.BuscarParametroCertificado();
    this.BuscarParametroDesconocida();
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
  rango: any;
  BuscarParametroUbicacion() {
    // id_tipo_parametro PARA RANGO DE UBICACION = 4
    let datos: any = [];
    this.restP.ListarDetalleParametros(4).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.rango = (parseInt(datos[0].descripcion))
        }
        else {
          this.rango = 0
        }
      });
  }

  // METODO PARA PERMITIR TIMBRE EN UBICACION DESCONOCIDA
  desconocida: boolean = false;
  BuscarParametroDesconocida() {
    // id_tipo_parametro PARA TIMBRAR UBICACION DESCONOCIDA = 5
    let datos: any = [];
    this.restP.ListarDetalleParametros(5).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          if (datos[0].descripcion === 'Si') {
            this.desconocida = true;
          }
        }
      });
  }

  // METODO PARA VERIFICAR USO DE CERTIFICADOS DE SEGURIDAD
  BuscarParametroCertificado() {
    // id_tipo_parametro PARA VERIFICAR USO SSL = 7
    let datos: any = [];
    this.restP.ListarDetalleParametros(7).subscribe(
      res => {
        datos = res;
        console.log('ingresa aqui res', res)
        if (datos.length != 0) {
          if (datos[0].descripcion === 'Si') {
            this.Geolocalizar();
          }
        }
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

  // METODO PARA ACTIVAR Y DESACTIVAR BOTONES
  boton: boolean = false;
  ActivarBotones() {
    if (this.boton_abierto === false) {
      this.boton_abierto = true;
      this.botones_normal = false;
    }
    else {
      this.boton_abierto = false;
      this.botones_normal = true;
    }
  }

  // METODO PARA GUARDAR DATOS DEL TIMBRE SEGUN LA OPCION INGRESADA
  accionF: string = '';
  teclaFuncionF: number;
  AlmacenarDatos(opcion: number, form: any) {
    switch (opcion) {
      case 1:
        this.accionF = 'E';
        this.teclaFuncionF = 0;
        break;
      case 2:
        this.accionF = 'S';
        this.teclaFuncionF = 1;
        break;
      case 3:
        this.accionF = 'I/A';
        this.teclaFuncionF = 2;
        break;
      case 4:
        this.accionF = 'F/A';
        this.teclaFuncionF = 3;
        break;
      case 5:
        this.accionF = 'I/P';
        this.teclaFuncionF = 4;
        break;
      case 6:
        this.accionF = 'F/P';
        this.teclaFuncionF = 5;
        break;
      case 7:
        this.accionF = 'HA';
        this.teclaFuncionF = 7;
        break;
      default:
        this.accionF = 'D';
        break;
    }
    this.InsertarTimbre(form);
  }

  // METODO PARA TOMAR DATOS DEL TIMBRE
  InsertarTimbre(form: any) {
    if (this.boton_abierto === true) {
      if (form.observacionForm != '' && form.observacionForm != undefined) {
        this.ValidarModulo(this.latitud, this.longitud, this.rango, form);
      }
      else {
        this.toastr.info(
          'Ingresar descripción del timbre.', 'Campo de observación es obligatorio.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.ValidarModulo(this.latitud, this.longitud, this.rango, form);
    }
  }

  // METODO PARA TOMAR DATOS DE MARCACION 
  RegistrarDatosTimbre(form: any, ubicacion: any) {
    // OBTENER LA FECHA Y HORA ACTUAL
    var now = moment();
    // FORMATEAR LA FECHA Y HORA ACTUAL EN EL FORMATO DESEADO
    var fecha_hora = now.format('DD/MM/YYYY, h:mm:ss a');
    let dataTimbre = {
      fec_hora_timbre: fecha_hora,
      tecl_funcion: this.teclaFuncionF,
      observacion: form.observacionForm,
      ubicacion: ubicacion,
      longitud: this.longitud,
      id_reloj: 98,
      latitud: this.latitud,
      accion: this.accionF,
      ip: this.ip,
      user_name: this.user_name
    }
    this.ventana.close(dataTimbre);
  }

  // METODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERIMETRO DEFINIDO
  contar: number = 0;
  ubicacion: string = '';
  sin_ubicacion: number = 0;
  CompararCoordenadas(informacion: any, form: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
          this.contar = this.contar + 1;
          this.ubicacion = descripcion;
          if (this.contar === 1) {
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info(
              'Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.sin_ubicacion = this.sin_ubicacion + 1;
          if (this.sin_ubicacion === data.length) {
            this.ValidarDomicilio(informacion, form);
          }
        }
      });
  }

  // METODO QUE PERMITE VALIDACIONES DE UBICACION
  BuscarUbicacion(latitud: any, longitud: any, rango: any, form: any) {
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
          console.log(informacion.lat1, ' ---------- ', informacion.lng1)
          if (informacion.lat1 && informacion.lng1) {
            this.CompararCoordenadas(informacion, form, obj.descripcion, datosUbicacion);
          }
          else {
            if (this.desconocida === true) {
              this.RegistrarDatosTimbre(form, 'SIN UBICACION');
            }
            else {
              this.toastr.warning('Es necesario el uso de Certificados de Seguridad para acceder a la ubicación del usuario.', '', {
                timeOut: 6000,
              })
            }
          }
        })
      }, error => {
        this.ValidarDomicilio(informacion, form);
      });
  }

  // METODO PARA VERIFICAR ACTIVACION DE MODULO DE GEOLOCALIZACION
  ValidarModulo(latitud: any, longitud: any, rango: any, form: any) {
    //console.log('coordenadas ', latitud, ' long ', longitud)
    if (this.funciones[0].geolocalizacion === true) {
      this.BuscarUbicacion(latitud, longitud, rango, form);
    }
    else {
      this.RegistrarDatosTimbre(form, this.ubicacion);
    }
  }

  // METODO PARA VALIDAR UBICACION DOMICILIO
  ValidarDomicilio(informacion: any, form: any) {
    console.log('ingresa a domicilio')
    this.restE.BuscarUbicacion(this.id_empl).subscribe(res => {
      if (res[0].longitud != null && res[0].latitud != null) {
        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        console.log('lat ', informacion.lat1, ' long ', informacion.lng1, 'res ', res, 'informacion ', informacion)
        if (informacion.lat2 && informacion.lng2) {
          this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
            if (resu[0].verificar === 'ok') {
              this.ubicacion = 'DOMICILIO';
              this.RegistrarDatosTimbre(form, this.ubicacion);
              this.toastr.info('Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
                timeOut: 6000,
              })
            }
            else {
              this.ProcesoPerimetroDesconocido(form);
            }
          })
        }
        else {
          this.toastr.warning('Es necesario el uso de Certificados de Seguridad para acceder a la ubicación del usuario.', '', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.ProcesoPerimetroDesconocido(form)
      }
    })
  }


  // METODO PARA REGISTRAR TIMBRE CON PERIMETRO DESCONOCIDO
  ProcesoPerimetroDesconocido(form: any) {
    // PUEDE TIMBRAR EN PERIMETROS DESCONOCIDOS
    if (this.desconocida === true) {
      this.ubicacion = 'DESCONOCIDO';
      this.RegistrarDatosTimbre(form, this.ubicacion);
      this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
        timeOut: 6000,
      })
    }
    else {
      this.toastr.warning('No tiene permitido timbrar en perímetros desconocidos.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }

  }

}
