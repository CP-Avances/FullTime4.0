// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

@Component({
  selector: 'app-editar-horario',
  templateUrl: './editar-horario.component.html',
  styleUrls: ['./editar-horario.component.css']
})

export class EditarHorarioComponent implements OnInit {

  // OPCIONES DE REGISTRO DE HORARIO
  nocturno = false;
  detalle = false;

  // VALIDACIONES PARA EL FORMULARIO
  horaTrabajo = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  archivoForm = new FormControl('');
  minAlmuerzo = new FormControl(0, Validators.pattern('[0-9]*'));
  documentoF = new FormControl('');
  seleccion = new FormControl('');
  detalleF = new FormControl('');
  codigoF = new FormControl('', [Validators.required]);
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  tipoF = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    horarioHoraTrabajoForm: this.horaTrabajo,
    horarioMinAlmuerzoForm: this.minAlmuerzo,
    documentoForm: this.documentoF,
    detalleForm: this.detalleF,
    nombreForm: this.nombre,
    codigoForm: this.codigoF,
    tipoForm: this.tipoF,
  });

  // VARIABLES DE CONTROL
  contador: number = 0;
  isChecked: boolean = false;

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    public ventana: MatDialogRef<EditarHorarioComponent>, // VARIABLES DE NAVEGACIÓN ENTRE VENTANAS
    public validar: ValidacionesService, // VARIABLE DE CONTROL DE VALIDACIONES
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
    public restD: DetalleCatHorariosService, // SERVICIO DE DATOS GENERALES
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE DE DATOS DE VENTANAS
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  // MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {

    // FORMATEAR HORAS
    if (this.data.horario.hora_trabajo.split(':').length === 3) {
      this.horaTrabajo.setValue(this.data.horario.hora_trabajo.split(':')[0] + ':' + this.data.horario.hora_trabajo.split(':')[1]);
    }
    else if (this.data.horario.hora_trabajo.split(':').length === 2) {
      if (parseInt(this.data.horario.hora_trabajo.split(':')[0]) < 10) {
        this.horaTrabajo.setValue('0' + parseInt(this.data.horario.hora_trabajo.split(':')[0]) + ':00');
      }
      else {
        this.horaTrabajo.setValue(this.data.horario.hora_trabajo);
      }
    }


    this.formulario.patchValue({
      horarioMinAlmuerzoForm: this.data.horario.min_almuerzo,
      detalleForm: this.data.horario.detalle,
      nombreForm: this.data.horario.nombre,
      codigoForm: this.data.horario.codigo,
      tipoForm: this.data.horario.nocturno,
    });

    if (this.data.horario.nocturno === true) {
      this.nocturno = true;
    }
    else {
      this.nocturno = false;
    }

    if (this.data.horario.detalle === true) {
      this.detalle = true;
    }
    else {
      this.detalle = false;
    }
  }

  // METODO PARA REGISTRAR DATOS DE HORARIO
  ModificarHorario(form: any) {
    this.habilitarprogress = true;
    let dataHorario = {
      min_almuerzo: form.horarioMinAlmuerzoForm,
      hora_trabajo: form.horarioHoraTrabajoForm,
      nocturno: form.tipoForm,
      detalle: form.detalleForm,
      nombre: form.nombreForm,
      codigo: form.codigoForm
    };

    // FORMATEAR HORAS
    if (dataHorario.hora_trabajo.split(':').length === 1) {
      if (parseInt(dataHorario.hora_trabajo) < 10) {
        dataHorario.hora_trabajo = '0' + parseInt(dataHorario.hora_trabajo) + ':00'
      }
      else {
        dataHorario.hora_trabajo = dataHorario.hora_trabajo + ':00'
      }
    }
    else {
      if (parseInt(dataHorario.hora_trabajo.split(':')[0]) < 10) {
        dataHorario.hora_trabajo = '0' + parseInt(dataHorario.hora_trabajo.split(':')[0]) + ':' + dataHorario.hora_trabajo.split(':')[1]
      }
    }

    // VALIDAR REGISTRO DE DETALLE DE HORARIO
    if (dataHorario.detalle === false) {
      dataHorario.hora_trabajo = dataHorario.hora_trabajo + ':00';
    }

    // SI EL HORARIO ES >= 24:00 Y < 72:00 HORAS (NO REGISTRA ALIMENTACION)
    if ((dataHorario.hora_trabajo >= '24:00' && dataHorario.hora_trabajo < '72:00') &&
      (dataHorario.hora_trabajo >= '24:00:00' && dataHorario.hora_trabajo < '72:00:00')) {
      this.minAlmuerzo.setValue(0);
      dataHorario.min_almuerzo = 0;
    }
    else if (dataHorario.hora_trabajo >= '72:00' || dataHorario.hora_trabajo >= '72:00:00') {
      dataHorario.hora_trabajo = moment(dataHorario.hora_trabajo, 'HH:mm:ss').format('HH:mm:ss');
    }

    // VALIDAR INGRESO DE MINUTOS DE ALIMENTACION
    if (dataHorario.min_almuerzo === '' || dataHorario.min_almuerzo === null || dataHorario.min_almuerzo === undefined) {
      dataHorario.min_almuerzo = 0;
    }

    // SI EL NOMBRE Y CODIGO DE HORARIO SON IGUALES NO VERIFICA DUPLICADOS
    if (form.nombreForm === this.data.horario.nombre && form.codigoForm === this.data.horario.codigo) {
      this.VerificarInformacion(dataHorario, form);
    }
    else {
      // VERIFICAR DUPLICADOS
      this.VerificarDuplicidad(form, dataHorario);
    }
  }

  // VERIFICAR DUPLICIDAD DE NOMBRES Y CODIGOS
  VerificarDuplicidad(form: any, horario: any) {
    let data = {
      id: parseInt(this.data.horario.id),
      nombre: form.nombreForm,
      codigo: form.codigoForm
    }
    this.rest.BuscarHorarioNombre_(data).subscribe(response => {
      this.toastr.info('Nombre de horario ya se encuentra registrado.', 'Verificar Datos.', {
        timeOut: 6000,
      });
      this.habilitarprogress = false;
    }, error => {
      this.VerificarInformacion(horario, form);
    });
  }


  // VERIFICACION DE OPCIONES SELECCIONADOS PARA ACTUALIZACION DE ARCHIVOS
  VerificarInformacion(datos: any, form: any) {
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.data.horario.documento,
        id: parseInt(this.data.horario.id)
      }
      this.rest.EliminarArchivo(eliminar).subscribe(res => {
      });
      this.GuardarDatos(datos);
    }
    else if (this.opcion === 2) {
      if (form.documentoForm != '' && form.documentoForm != null) {
        this.ActualizarDatosArchivo(datos, form);
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      }
    }
    else {
      this.GuardarDatos(datos);
    }
  }

  // ELIMINAR DOCUMENTO DEL SERVIDOR
  EliminarDocumentoServidor() {
    let eliminar = {
      documento: this.data.horario.documento,
    }
    this.rest.EliminarArchivoServidor(eliminar).subscribe(res => {
    });
  }

  // METODO PARA INGRESAR DATOS CON ARCHIVO
  ActualizarDatosArchivo(datos: any, form: any) {
    this.habilitarprogress = true;
    this.EliminarDocumentoServidor();
    this.rest.ActualizarHorario(this.data.horario.id, datos).subscribe(response => {
      this.RegistrarAuditoria(datos);
      this.SubirRespaldo(this.data.horario.id);
      this.habilitarprogress = false;
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      if (datos.min_almuerzo === 0) {
        this.EliminarDetallesComida();
      }
      if (datos.detalle === false) {
        this.EliminarTodoDetalles();
      }
      this.SalirActualizar(datos, response);
    }, error => {
      this.habilitarprogress = false;
      this.toastr.error('Limite de horas superado.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.CerrarVentana();
    });
  }

  // METODO PARA GUARDAR DATOS SIN UN ARCHIVO SELECCIONADO
  GuardarDatos(datos: any) {
    this.rest.ActualizarHorario(this.data.horario.id, datos).subscribe(response => {
      this.RegistrarAuditoria(datos);
      this.habilitarprogress = false;
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      if (datos.min_almuerzo === 0) {
        this.EliminarDetallesComida();
      }
      if (datos.detalle === false) {
        this.EliminarTodoDetalles();
      }
      this.SalirActualizar(datos, response);
    }, error => {
      this.habilitarprogress = false;
      this.toastr.error('Limite de horas superado.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.CerrarVentana()
    });
  }

  // METODO PARA NAVEGAR ENTRE VENTANAS
  SalirActualizar(datos: any, response: any) {
    if (this.data.actualizar === false) {
      this.ventana.close(response);
      if (datos.detalle != false) {
        this.router.navigate(['/verHorario/', this.data.horario.id]);
      }
    }
    else {
      this.ventana.close(response);
      if (datos.detalle != true) {
        this.router.navigate(['/horario']);
      }
    }
  }

  /** *********************************************************************************************** **
   ** **                             METODO PARA SUBIR ARCHIVO                                     ** ** 
   ** *********************************************************************************************** **/

  // METODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.contador = 1;
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      if (this.archivoSubido[0].size <= 2e+6) {
        this.formulario.patchValue({ documentoForm: name });
        this.HabilitarBtn = true
      }
      else {
        this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA GUARDAR DATOS DE ARCHIVO SELECCIONADO
  SubirRespaldo(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirArchivo(formData, id, this.data.horario.documento, this.data.horario.codigo).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // LIMPIAR CAMPO DE NOMBRE DE ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      documentoForm: '',
    });
  }

  // METODO PARA HABILITAR VISTA DE SELECCIÓN DE ARCHIVO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
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


  /** *********************************************************************************************** **
   ** **                   METODOS PARA ELIMINAR DETALLES DE HORARIO                               ** **
   ** *********************************************************************************************** **/

  // METODO PARA BUSCAR DETALLES Y ELIMINAR SOLO DETALLES DE COMIDA
  detalles_horarios: any = [];
  EliminarDetallesComida() {
    this.restD.ConsultarUnDetalleHorario(this.data.horario.id).subscribe(res => {
      this.detalles_horarios = res;
      this.detalles_horarios.map(det => {
        if (det.tipo_accion === 'F/A') {
          this.EliminarDetalle(det.id);
        }
        if (det.tipo_accion === 'I/A') {
          this.EliminarDetalle(det.id);
        }
      })
    }, error => { })
  }

  // CONSULTAR DETALLES DE HORARIO - PROCESO DE ELIMINACION TOTAL
  EliminarTodoDetalles() {
    this.restD.ConsultarUnDetalleHorario(this.data.horario.id).subscribe(res => {
      this.detalles_horarios = res;
      this.detalles_horarios.map(det => {
        this.EliminarDetalle(det.id);
      })
    })
  }

  // METODO PARA ELIMINAR DETALLES EN LA BASE DE DATOS
  EliminarDetalle(id_detalle: number) {
    this.restD.EliminarRegistro(id_detalle).subscribe(res => {
    });
  }

  // METODO PARA AUDITAR CATALOGO HORARIOS
  data_nueva: any = [];
  RegistrarAuditoria(dataHorario: any) {
    this.data_nueva = [];
    this.data_nueva = dataHorario;
    this.validar.Auditar('app-web', 'cg_horarios', this.data.horario, this.data_nueva, 'UPDATE');
  }

  // METODO PARA INGRESAR SOLO NUMEROS Y CARACTERES
  IngresarNumeroCaracter(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 58) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumerosEnteros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // MENSAJE DE FORMATO DE INGRESO DE HORAS LABORABLES
  ObtenerMensajeErrorHoraTrabajo() {
    if (this.horaTrabajo.hasError('pattern')) {
      return 'Indicar horas y minutos. Ejemplo: 12:05';
    }
  }

  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

  // METODO PARA VER FORMULARIO DE ARCHIVO
  VerificarArchivo(ob: MatCheckboxChange) {
    if (ob.checked === true) {
      this.isChecked = true;
    }
    else {
      this.isChecked = false;
      this.LimpiarAcciones();
    }
  }

}
