// IMPORTAR LIBRERIAS
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';

import { TipoVacunaComponent } from '../tipo-vacuna/tipo-vacuna.component';

@Component({
  selector: 'app-crear-vacuna',
  templateUrl: './crear-vacuna.component.html',
  styleUrls: ['./crear-vacuna.component.css'],
})

export class CrearVacunaComponent implements OnInit {

  idEmploy: any;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;


  constructor(
    public restVacuna: VacunacionService, // CONSULTA DE SERVICIOS DATOS DE VACUNACIÓN
    public toastr: ToastrService, // VARIABLE USADA PARA MENSAJES DE NOTIFICACIONES
    public ventana: MatDialog,
    private ventana_: MatDialogRef<CrearVacunaComponent>,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.idEmploy = this.datos.idEmpleado;
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  certificadoF = new FormControl('');
  archivoF = new FormControl('');
  nombreF = new FormControl('');
  vacunaF = new FormControl('');
  fechaF = new FormControl('');

  // FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    certificadoForm: this.certificadoF,
    archivoForm: this.archivoF,
    vacunaForm: this.vacunaF,
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

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoF.patchValue('');
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.HabilitarBtn = false;
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarRegistro() {
    this.ventana_.close();
  }

  // METODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      certificadoForm: '',
    });
  }

  // METODO PARA VISUALIZAR CAMPO REGISTRO DE TIPO DE VACUNA
  AbrirVentana(form: any) {
    if (form.vacunaForm === undefined) {
      this.AbrirTipoVacuna();
    }
  }

  // METODO PARA ABRIR VENTANA REGISTRO TIPO VACUNA
  AbrirTipoVacuna() {
    this.ventana.open(TipoVacunaComponent,
      { width: '300px' }).afterClosed().subscribe(item => {
        this.ObtenerTipoVacunas();
      });
  }

  // METODO PARA GUARDAR DATOS DE REGISTRO DE VACUNACIÓN
  GuardarDatosCarnet(form: any) {
    let dataCarnet = {
      id_tipo_vacuna: form.vacunaForm,
      descripcion: form.nombreForm,
      id_empleado: parseInt(this.idEmploy),
      fecha: form.fechaForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    // VERIIFCAR EXISTENCIA DEL REGISTRO DE VACUNA
    let vacuna = {
      id_empleado: dataCarnet.id_empleado,
      fecha: dataCarnet.fecha,
      id_vacuna: dataCarnet.id_tipo_vacuna
    }
    this.restVacuna.BuscarVacunaFechaTipo(vacuna).subscribe(response => {
      this.toastr.warning('Registro de vacunación ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }, vacio => {
      this.GuardarDatosSistema(dataCarnet, form);
    });
  }

  // METODO PARA REGISTRAR DATOS EN EL SISTEMA
  GuardarDatosSistema(datos: any, form: any) {
    if (form.certificadoForm != '' && form.certificadoForm != null && form.certificadoForm != undefined) {
      this.VerificarArchivo(datos);
    }
    else {
      this.Registrar_sinCarnet(datos);
      this.CerrarRegistro();
    }
  }

  Registrar_sinCarnet(datos: any) {
    this.restVacuna.RegistrarVacunacion(datos).subscribe(response => {
      this.toastr.success('', 'Registro guardado.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA GUARDAR DATOS DE REGISTROS SI EL ARCHIVO CUMPLE CON LOS REQUISITOS
  VerificarArchivo(datos: any) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.CargarDocumento(datos);
      this.CerrarRegistro();
    }
    else {
      this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA GUARDAR ARCHIVO SELECCIONADO
  CargarDocumento(datos: any) {
    this.restVacuna.RegistrarVacunacion(datos).subscribe(vacuna => {
      let formData = new FormData();
      for (var i = 0; i < this.archivoSubido.length; i++) {
        formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
      }

      formData.append('user_name', this.user_name as string);
      formData.append('ip', this.ip as string);

      this.restVacuna.SubirDocumento(formData, vacuna.id, this.idEmploy).subscribe(res => {
        this.archivoF.reset();
        this.nameFile = '';
        this.toastr.success('', 'Registro guardado.', {
          timeOut: 6000,
        });
      }, error => {
        this.toastr.info('Verifique que este usuario tenga creadas capetas', 'No se ha podido cargar el archivo.', {
          timeOut: 6000,
        });
      }

      );
    });
  }

}


