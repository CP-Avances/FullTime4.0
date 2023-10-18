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
    this.VerificarFunciones();
    this.BuscarParametro();
    this.Geolocalizar();
  }

  // METODO PARA CONSULTAR FUNCIONES ACTIVAS DEL SISTEMA
  funciones: any = [];
  VerificarFunciones() {
    this.restF.ListarFunciones().subscribe(res => {
      this.funciones = res;
    })
  }

  // METODO PARA OBTENER RANGO DE PERIMETRO
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACION = 22
    let datos: any = [];
    this.restP.ListarDetalleParametros(22).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.rango = ((parseInt(datos[0].descripcion) * (0.0048)) / 500)
        }
        else {
          this.rango = 0.00
        }
      });
  }

  // METODO PARA TOMAR CORDENAS DE UBICACION
  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              console.log('NO SE HA PERMITIDO EL ACCESO A POSICIÓN DEL USUARIO.');
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              console.log('NO SE HA PODIDO ACCEDER A INFORMACIÓN DE SU POSICIÓN.');
              break;
            case objPositionError.TIMEOUT:
              console.log('EL SERVICIO HA TARDADO DEMASIADO TIEMPO EN RESPONDER.');
              break;
            default:
              console.log('ERROR DESCONOCIDO.');
          }
        }, this.options);
    }
    else {
      console.log('SU NAVEGADOR NO SOPORTA API DE GEOLOCALIZACIÓN.');
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
    let dataTimbre = {
      fec_hora_timbre: this.f.toLocaleString(),
      tecl_funcion: this.teclaFuncionF,
      observacion: form.observacionForm,
      ubicacion: ubicacion,
      longitud: this.longitud,
      id_reloj: 98,
      latitud: this.latitud,
      accion: this.accionF,
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
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: String(latitud),
      lng1: String(longitud),
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
          this.CompararCoordenadas(informacion, form, obj.descripcion, datosUbicacion);
        })
      }, error => {
        this.ValidarDomicilio(informacion, form);
      });
  }

  // METODO PARA VERIFICAR ACTIVACION DE MODULO DE GEOLOCALIZACION
  ValidarModulo(latitud: any, longitud: any, rango: any, form: any) {
    if (this.funciones[0].geolocalizacion === true) {
      this.BuscarUbicacion(latitud, longitud, rango, form);
    }
    else {
      this.RegistrarDatosTimbre(form, this.ubicacion);
    }
  }

  // METODO PARA VALIDAR UBICACION DOMICILIO
  ValidarDomicilio(informacion: any, form: any) {
    this.restE.BuscarUbicacion(this.id_empl).subscribe(res => {
      if (res[0].longitud != null) {

        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;

        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
          if (resu[0].verificar === 'ok') {
            this.ubicacion = 'DOMICILIO';
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info('Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
              timeOut: 6000,
            })
          }
          else {
            this.ubicacion = 'DESCONOCIDO';
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
              timeOut: 6000,
            })
          }
        })
      }
      else {
        this.ubicacion = 'DESCONOCIDO';
        this.RegistrarDatosTimbre(form, this.ubicacion);
        this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
          timeOut: 6000,
        })
      }
    })
  }

}
