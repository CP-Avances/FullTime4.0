// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';

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
  documentoBase64: string;
  HabilitarBtn: boolean = false;

  // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION
  idEmpleadoLogueado: any;
  nombre: string;
  capturar_segundos: number = 60;  // 60 = TOMAR SOLO HORAS Y MINUTOS  -  1 TOMAR HORAS, MINUTOS Y SEGUNDOS

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
    public restP: ParametrosService,
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
    this.BuscarParametros();
  }

  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametros() {
    let datos: any = [];
    let detalles = { parametros: '5' };
    this.capturar_segundos = 60;
    this.restP.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        datos.forEach((p: any) => {
          // id_tipo_parametro PARA CONSIDERAR O NO SEGUNDOS = 5
          if (p.id_parametro === 5) {
            if (p.descripcion === 'Si') {
              this.capturar_segundos = 1;
            }
          }
        })
      });
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
    this.ventana.close();

    var hora_timbre = form.horaForm;
    if (this.capturar_segundos === 60) {
      hora_timbre = form.horaForm + ':00';
    }
    let timbre = {
      fec_hora_timbre: form.fechaForm.toJSON().split('T')[0] + 'T' + hora_timbre,
      tecl_funcion: this.TeclaFuncion(form.accionForm),
      observacion: 'Timbre creado por ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + ', ' + form.observacionForm,
      id_empleado: '',
      id_reloj: 98,
      longitud: this.longitud,
      latitud: this.latitud,
      accion: form.accionForm,
      documento: this.documentoBase64,
      user_name: this.user_name,
      ip: this.ip,
    }
    if (this.data.length === undefined) {
      timbre.id_empleado = this.data.id;
      this.ventana.close(timbre);
    }
    else {
      this.contador = 0;
      const ids_empleados = this.data.map((empl: any) => empl.id);

      timbre.id_empleado = ids_empleados;
      this.restTimbres.RegistrarTimbreAdmin(timbre).subscribe(res => {
    
          this.toastr.success('Operación exitosa.', 'Se registro un total de ' + this.data.length + ' timbres exitosamente.', {
            timeOut: 6000,
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

        // CONVERTIR EL ARCHIVO A BASE64
        try {
          this.ReducirCalidadYConvertirABase64(this.archivoSubido[0]).then((base64: string) => {
            this.documentoBase64 = base64;
          });
        } catch (error) {
          this.toastr.error('No se pudo cargar la imagen', 'Imagen', {
            timeOut: 6000,
          });
        }

        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA REDUCIR CALIDAD Y CONVERTIR ARCHIVO A BASE64
  ReducirCalidadYConvertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = img.width;
          let height = img.height;

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // CONVERTIR A BASE64 CON CALIDAD REDUCIDA
          const quality = 0.9; // AJUSTA LA CALIDAD SEGUN SEA NECESARIO (0.0 - 1.0)
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
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
