// IMPORTAR LIBRERIAS
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';

// IMPORTAR COMPONENTES
import { TipoVacunaComponent } from '../tipo-vacuna/tipo-vacuna.component';

@Component({
  selector: 'app-editar-vacuna',
  templateUrl: './editar-vacuna.component.html',
  styleUrls: ['./editar-vacuna.component.css'],
})

export class EditarVacunaComponent implements OnInit {

  idEmploy: string;
  dvacuna: any;

  constructor(
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE VACUNACIÓN
    public validar: ValidacionesService, // VARIABLE USADA EN VALIDACIONES
    public toastr: ToastrService, // VARIABLE USADA EN NOTIFICACIONES
    private ventana_: MatDialogRef<EditarVacunaComponent>,
    public ventana: MatDialog,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.idEmploy = this.datos.idEmpleado;
    this.dvacuna = this.datos.vacuna;
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    this.MostrarDatos();
  }

  // VARIABLES DE ALMACENAMINETO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  certificadoF = new FormControl('');
  seleccion = new FormControl('');
  archivoF = new FormControl('');
  nombreF = new FormControl('');
  vacunaF = new FormControl('');
  fechaF = new FormControl('');

  // FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    certificadoForm: this.certificadoF,
    vacunaForm: this.vacunaF,
    archivoForm: this.archivoF,
    nombreForm: this.nombreF,
    fechaForm: this.fechaF,
  });

  // METODO PARA CONSULTAR DATOS DE TIPO DE VACUNA
  ObtenerTipoVacunas() {
    this.tipoVacuna = [];
    this.restVacuna.ListarTiposVacuna().subscribe(data => {
      this.tipoVacuna = data;
      this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA MOSTRAR DATOS DE VACUNA
  MostrarDatos() {
    this.formulario.patchValue({
      fechaForm: this.dvacuna.fecha,
      vacunaForm: this.dvacuna.id_vacuna,
      nombreForm: this.dvacuna.descripcion
    })
  }

  // VENTANA DE REGISTRO DE TIPO DE VACUNA
  AbrirTipoVacuna() {
    this.ventana.open(TipoVacunaComponent,
      { width: '300px' }).afterClosed().subscribe(item => {
        this.ObtenerTipoVacunas();
      });
  }

  // METODO PARA VISUALIZAR CAMPO REGISTRO DE TIPO DE VACUNA
  AbrirVentana(form: any) {
    if (form.vacunaForm === undefined) {
      this.AbrirTipoVacuna();
    }
  }

  // METODO PARA CAPTURRA DATOS 
  GuardarDatosCarnet(form: any) {
    let vacuna = {
      id_tipo_vacuna: form.vacunaForm,
      descripcion: form.nombreForm,
      id_empleado: parseInt(this.idEmploy),
      fecha: form.fechaForm,
    }
    // VERIFICAR SI EL REGISTRO ES SIMILAR AL EXISTENTE
    if (vacuna.fecha === this.dvacuna.fecha && vacuna.id_tipo_vacuna === this.dvacuna.id_vacuna) {
      this.VerificarInformacion(vacuna, form);
    }
    else {
      // VERIIFCAR EXISTENCIA DEL REGISTRO DE VACUNA
      let verificar = {
        id_empleado: vacuna.id_empleado,
        fecha: vacuna.fecha,
        id_vacuna: vacuna.id_tipo_vacuna
      }
      this.restVacuna.BuscarVacunaFechaTipo(verificar).subscribe(response => {
        this.toastr.warning('Registro de vacunación ya existe en el sistema.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }, vacio => {
        this.VerificarInformacion(vacuna, form);
      });
    }
  }

  // METODO PARA ACTUALIZAR DATOS DE REGISTRO DE VACUNACION
  GuardarDatos(datos: any) {
    this.restVacuna.ActualizarVacunacion(this.dvacuna.id, datos).subscribe(response => {
      this.toastr.success('', 'Registro Vacunación guardado.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA VERIFICAR LA INFORMACION INGRESADA
  VerificarInformacion(datos: any, form: any) {
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.dvacuna.carnet,
        id: parseInt(this.dvacuna.id)
      }
      this.GuardarDatos(datos);
      this.restVacuna.EliminarArchivo(eliminar).subscribe(res => {
      });
      this.CerrarRegistro();
    }
    else if (this.opcion === 2) {
      if (form.certificadoForm != '' && form.certificadoForm != null) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.EliminarCarnetServidor();
          this.GuardarDatos(datos);
          this.CargarDocumento(form);
          this.CerrarRegistro();
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarDatos(datos);
      this.CerrarRegistro();
    }
  }

  // METODO PARA ELIMINAR DOCUEMNTO DEL SERVIDOR
  EliminarCarnetServidor() {
    let eliminar = {
      documento: this.dvacuna.carnet,
      id: this.idEmploy
    }
    this.restVacuna.EliminarArchivoServidor(eliminar).subscribe(res => {
    });
  }

  /** ************************************************************************************************* **
   ** **                             CARGAR ARCHIVOS DE VACUNACION                                   ** **
   ** ************************************************************************************************* **/

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoF.patchValue('');
  }

  // METODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      certificadoForm: '',
    });
  }

  // METODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.formulario.patchValue({ certificadoForm: name });
      this.HabilitarBtn = true;
    }
  }

  // METODO PARA GUARDAR ARCHIVO SELECCIONADO
  CargarDocumento(form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restVacuna.SubirDocumento(formData, this.dvacuna.id, this.idEmploy).subscribe(res => {
      this.archivoF.reset();
      this.nameFile = '';
    });
  }

  // METODOS DE ACTIVACION DE CARGA DE ARCHIVO 
  activar: boolean = false;
  opcion: number = 0;
  ActivarArchivo() {
    this.acciones = true;
    this.activar = true;
    this.opcion = 2;
  }

  // METODO PARA INDICAR QUE SE ELIMINE EL ARCHIVO DEL REGISTRO
  QuitarArchivo() {
    this.acciones = true;
    this.activar = false;
    this.opcion = 1;
    this.RetirarArchivo();
  }

  // METODO PARA CANCELAR OPCION SELECCIONADA
  acciones: boolean = false;
  LimpiarAcciones() {
    this.seleccion.reset();
    this.acciones = false;
    this.activar = false;
    this.RetirarArchivo();
    this.opcion = 0;
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarRegistro() {
    this.ventana_.close();
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.HabilitarBtn = false;
  }
}
