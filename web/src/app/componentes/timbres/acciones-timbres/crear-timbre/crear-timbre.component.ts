// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
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
  observacionF = new FormControl('');
  accionF = new FormControl('', Validators.required);
  FechaF = new FormControl('', Validators.required);
  HoraF = new FormControl('', Validators.required);

  // VARIABLES DE ALMACENAMIENTO DE ARCHIVO
  nombreDocumento = new FormControl('');
  archivoForm = new FormControl('');
  nameFile: string;
  archivoSubido: Array<File>;
  documento: boolean = false;
  HabilitarBtn: boolean = false;

  // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION
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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // AGREGAR CAMPOS DE FORMULARIO A UN GRUPO
  public formulario = new FormGroup({
    horaForm: this.HoraF,
    fechaForm: this.FechaF,
    accionForm: this.accionF,
    teclaFuncionForm: this.teclaFuncionF,
    observacionForm: this.observacionF,
    nombreDocumentoForm: this.nombreDocumento,
  });

  constructor(
    public ventana: MatDialogRef<CrearTimbreComponent>, // VARIABLE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE MANEJO DE NOTIFICACIONES
    private restTimbres: TimbresService, // SERVICIO DATOS DE TIMBRES
    private restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    @Inject(MAT_DIALOG_DATA) public data: any, // MANEJO DE DATOS ENTRE VENTANAS
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    if (this.data.length === undefined) {
      this.nombre = this.data.name_empleado;
    }
    this.VerDatosEmpleado(this.idEmpleadoLogueado);
  }

  // METODO DE BUSQUEDA DE DATOS DE EMPLEADO
  empleadoUno: any = [];
  VerDatosEmpleado(idemploy: number) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoUno = data;
    })
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

  // METODO DE INGRESO DE TIMBRES
  contador: number = 0;
  InsertarTimbre(form: any) {
    let timbre = {
      fec_hora_timbre: form.fechaForm.toJSON().split('T')[0] + 'T' + form.horaForm + ':00',
      tecl_funcion: this.TeclaFuncion(form.accionForm),
      observacion: 'Timbre creado por ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + ', ' + form.observacionForm,
      id_empleado: '',
      id_reloj: 98,
      longitud: this.longitud,
      latitud: this.latitud,
      accion: form.accionForm,
      tipo: 'administrar',
      user_name: this.user_name,
      ip: this.ip,
    }
    if (this.data.length === undefined) {
      timbre.id_empleado = this.data.id;
      this.ventana.close(timbre);
    }
    else {
      this.contador = 0;
      this.data.map((obj: any) => {
        timbre.id_empleado = obj.id;
        // METODO DE INSERCIoN DE TIMBRES
        this.restTimbres.RegistrarTimbreAdmin(timbre).subscribe(res => {
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

  // SUBIR ARCHIVO DE JUSTIFICACION DE TIMBRES
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      // VALIDAR QUE EL DOCUEMNTO SUBIDO CUMPLA CON EL TAMAÑO ESPECIFICADO
      if (this.archivoSubido[0].size <= 2e+6) {
        const name = this.archivoSubido[0].name;
        this.formulario.patchValue({ nombreDocumentoForm: name });

        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // LIMPIAR EL NOMBRE DEL ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      nombreDocumentoForm: '',
    });
  }

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }

}
