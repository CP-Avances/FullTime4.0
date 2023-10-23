// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

@Component({
  selector: 'app-crear-timbre',
  templateUrl: './crear-timbre.component.html',
  styleUrls: ['./crear-timbre.component.css'],
})

export class CrearTimbreComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  teclaFuncionF = new FormControl('');
  accionF = new FormControl('', Validators.required);
  FechaF = new FormControl('', Validators.required);
  HoraF = new FormControl('', Validators.required);

  // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  idEmpleadoLogueado: any;
  nombre: string;

  // VARIABLES DE ALMACENMAIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  // LISTA DE ACCIONES DE TIMBRES
  accion: any = [
    { value: 'E', name: 'Entrada' },
    { value: 'S', name: 'Salida' },
    { value: 'I/A', name: 'Inicio alimentación' },
    { value: 'F/A', name: 'Fin alimentación' },
    { value: 'I/P', name: 'Inicio permiso' },
    { value: 'F/P', name: 'Fin permiso' },
  ]

  // AGREGAR CAMPOS DE FORMULARIO A UN GRUPO
  public formulario = new FormGroup({
    horaForm: this.HoraF,
    fechaForm: this.FechaF,
    accionForm: this.accionF,
    teclaFuncionForm: this.teclaFuncionF,
  });

  // METODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  constructor(
    public ventana: MatDialogRef<CrearTimbreComponent>, // VARIABLE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE MANEJO DE NOTIFICACIONES
    private validar: ValidacionesService, // VARIABLE DE CONTROL DE VALIDACIÓN
    private restTimbres: TimbresService, // SERVICIO DATOS DE TIMBRES
    private restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    @Inject(MAT_DIALOG_DATA) public data: any, // MANEJO DE DATOS ENTRE VENTANAS
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.data.length === undefined) {
      this.nombre = this.data.name_empleado;
    }
    this.VerDatosEmpleado(this.idEmpleadoLogueado);
    this.Geolocalizar();
  }

  // METODO DE BUSQUEDA DE DATOS DE EMPLEADO
  empleadoUno: any = [];
  VerDatosEmpleado(idemploy: number) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoUno = data;
    })
  }

  // METODO PARA TOMAR CORDENAS DE UBICACIÓN
  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              console.log('NO SE HA PERMITIDO ACCEDER A POSICIÓN DEL USUARIO.');
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

  // METODO DE INGRESO DE ACCIONES DEL TIMBRE
  TeclaFuncion(opcion: string) {
    if (opcion == 'E') {
      return 0;
    }
    else if (opcion == 'S') {
      return 1
    }
    else if (opcion == 'I/A') {
      return 2
    }
    else if (opcion == 'F/A') {
      return 3
    }
    else if (opcion == 'I/P') {
      return 4
    }
    else if (opcion == 'F/P') {
      return 5
    }
  }

  // VARIABLE DE ALMACENAMIENTO DE DATOS
  data_nueva: any = [];

  // METODO DE INGRESO DE TIMBRES
  contador: number = 0;
  InsertarTimbre(form: any) {

    let timbre = {
      fec_hora_timbre: form.fechaForm.toJSON().split('T')[0] + 'T' + form.horaForm + ':00',
      tecl_funcion: this.TeclaFuncion(form.accionForm),
      observacion: 'Timbre creado por Admin. ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
      id_empleado: '',
      id_reloj: 98,
      longitud: this.longitud,
      latitud: this.latitud,
      accion: form.accionForm,
      tipo: 'admin',
    }

    if (this.data.length === undefined) {
      console.log(' id' + this.data.id);
      timbre.id_empleado = this.data.id;
      this.ventana.close(timbre);
    }
    else {
      this.contador = 0;
      this.data.map(obj => {
        timbre.id_empleado = obj.id;
        // LIMPIAR VARIABLE Y ALMACENAR DATOS
        this.data_nueva = [];
        this.data_nueva = timbre;
        // METODO DE INSERCIoN DE TIMBRES
        this.restTimbres.RegistrarTimbreAdmin(timbre).subscribe(res => {
          // METODO PARA AUDITAR TIMBRES
          this.data_nueva.id_empleado = obj.id;
          this.validar.Auditar('app-web', 'timbres', '', this.data_nueva, 'INSERT');
          this.contador = this.contador + 1;
          if (this.contador === this.data.length) {
            this.ventana.close();
            this.toastr.success('Operación exitosa.', 'Se registro un total de ' + this.data.length + ' timbres exitosamente.', {
              timeOut: 6000,
            })
          }
        })
      })
    }
  }

}
