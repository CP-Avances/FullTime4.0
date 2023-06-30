import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';

@Component({
  selector: 'app-editar-contrato',
  templateUrl: './editar-contrato.component.html',
  styleUrls: ['./editar-contrato.component.css']
})

export class EditarContratoComponent implements OnInit {

  idSelectContrato: number;
  idEmpleado: number;

  // DATOS REGIMEN
  regimenLaboral: any = [];
  seleccionarRegimen: any;

  contador: number = 0;
  isChecked: boolean;
  habilitarSeleccion: boolean = true;
  habilitarContrato: boolean = false;

  // BUSQUEDA DE PAISES AL INGRESAR INFORMACION
  filtro: Observable<any[]>;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  controlVacacionesF = new FormControl('', Validators.required);
  controlAsistenciaF = new FormControl('', Validators.required);
  fechaIngresoF = new FormControl('', Validators.required);
  fechaSalidaF = new FormControl('');
  archivoForm = new FormControl('');
  nombrePaisF = new FormControl('');
  idRegimenF = new FormControl('', Validators.required);
  documentoF = new FormControl('');
  contratoF = new FormControl('', Validators.minLength(3));
  seleccion = new FormControl('');
  tipoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public ContratoForm = new FormGroup({
    controlVacacionesForm: this.controlVacacionesF,
    controlAsistenciaForm: this.controlAsistenciaF,
    fechaIngresoForm: this.fechaIngresoF,
    fechaSalidaForm: this.fechaSalidaF,
    nombrePaisForm: this.nombrePaisF,
    idRegimenForm: this.idRegimenF,
    documentoForm: this.documentoF,
    contratoForm: this.contratoF,
    tipoForm: this.tipoF,
  });

  constructor(
    public pais: ProvinciaService,
    private rest: EmpleadoService,
    private toastr: ToastrService,
    private ventana: MatDialogRef<EditarContratoComponent>,
    private restRegimen: RegimenService,
    @Inject(MAT_DIALOG_DATA) public contrato: any
  ) { }

  ngOnInit(): void {
    this.idSelectContrato = this.contrato.id;
    this.idEmpleado = this.contrato.id_empleado;
    this.ObtenerPaises();
    this.ObtenerEmpleados();
    this.ObtenerTipoContratos();
    this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
  }

  // APLICAR FILTROS DE BUSQUEDA DE PAISES
  private _filter(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // BUSQUEDA DE LISTA DE PAISES
  paises: any = [];
  ObtenerPaises() {
    this.paises = [];
    this.pais.BuscarPais('AMERICA').subscribe(datos => {
      this.paises = datos;
      this.filtro = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filter(value))
        );
      this.BuscarRegimenPais();
    })
  }

  // BUSQUEDA DE LISTA DE REGIMEN LABORAL
  regimen: any = [];
  BuscarRegimenPais() {
    var pais_ = '';
    this.regimen = [];
    this.restRegimen.ConsultarUnRegimen(this.contrato.id_regimen).subscribe(datos => {
      this.regimen = datos;
      // OBTENER NOMBRE DEL PAIS REGISTRADO
      this.paises.forEach(obj => {
        if (obj.id === this.regimen.id_pais) {
          pais_ = obj.nombre;
          this.nombrePaisF.setValue(obj.nombre);
        }
      });
      this.BuscarRegimen(pais_);
    })
  }

  // METODO PARA BUSCAR DATOS DE REGIMEN LABORAL
  BuscarRegimen(pais: string) {
    this.regimenLaboral = [];
    this.restRegimen.ConsultarRegimenPais(pais).subscribe(datos_ => {
      this.regimenLaboral = datos_;
      this.idRegimenF.setValue(this.contrato.id_regimen);
      this.ImprimirDatos();
    });
  }

  // BUSQUEDA DE REGIMEN LABORAL
  ObtenerRegimen(form: any) {
    var pais = form.nombrePaisForm;
    this.regimenLaboral = [];
    this.restRegimen.ConsultarRegimenPais(pais).subscribe(datos => {
      this.regimenLaboral = datos;
      console.log('ver id de regimen', this.regimenLaboral)
    }, error => {
      this.toastr.info('Pais seleccionado no tiene registros de Régimen Laboral.', '', {
        timeOut: 6000,
      });
      this.nombrePaisF.reset();
    })
  }

  // METODO PARA OBTENER TIPOS DE CONTRATOS MODALIDAD LABORAL
  tipoContrato: any = [];
  ObtenerTipoContratos() {
    this.tipoContrato = [];
    this.rest.BuscarTiposContratos().subscribe(datos => {
      this.tipoContrato = datos;
      this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
    })
  }

  // MOSTRAR LISTA DE MODALIDAD LABORAL
  VerTiposContratos() {
    this.ContratoForm.patchValue({
      contratoForm: '',
    });
    this.habilitarContrato = false;
    this.habilitarSeleccion = true;
  }

  // INGRESAR MODALIDAD LABORAL
  IngresarOtro(form: any) {
    if (form.tipoForm === undefined) {
      this.ContratoForm.patchValue({
        contratoForm: '',
      });
      this.habilitarContrato = true;
      this.toastr.info('Ingresar modalidad laboral.', '', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  empleados: any = [];
  ObtenerEmpleados() {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(this.idEmpleado).subscribe(data => {
      this.empleados = data[0];
      this.empleados.nombre_ = this.empleados.nombre.toUpperCase() + ' ' + this.empleados.apellido.toUpperCase();
    })
  }

  // METODO PARA MOSTRAR DATOS DEL FORMULARIO
  ImprimirDatos() {
    const { fec_ingreso, fec_salida, vaca_controla, asis_controla,
      id_tipo_contrato } = this.contrato;
    this.ContratoForm.patchValue({
      controlVacacionesForm: vaca_controla,
      controlAsistenciaForm: asis_controla,
      fechaIngresoForm: fec_ingreso,
      fechaSalidaForm: fec_salida,
      tipoForm: id_tipo_contrato
    });
  }

  // VALIDAR DATOS DE FECHAS
  ValidarDatosContrato(form: any) {
    if (form.fechaSalidaForm === '' || form.fechaSalidaForm === null) {
      form.fechaSalidaForm = null;
      this.ActualizarContrato(form);
    } else {
      if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
        this.ActualizarContrato(form);
      }
      else {
        this.toastr.info('Las fechas no se encuentran correctamente ingresadas.', '', {
          timeOut: 6000,
        })
      }
    }
  }

  // REGISTRAR MODALIDAD DE TRABAJO
  InsertarModalidad(form: any, datos: any) {
    if (form.contratoForm != '') {
      let tipo_contrato = {
        descripcion: form.contratoForm
      }
      this.rest.CrearTiposContrato(tipo_contrato).subscribe(res => {
        datos.id_tipo_contrato = res.id;
        this.VerificarDatos(datos, form);
      });
    }
    else {
      this.toastr.info('Ingresar modalidad laboral.', 'Verificar datos.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR SI EL REGISTRO ENTRA O NO A VERIFICACION DE DUPLICIDAD
  VerificarDatos(datos: any, form: any) {
    if (datos.fec_ingreso === this.contrato.fec_ingreso) {
      this.VerificarInformacion(datos, form);
    }
    else {
      this.ValidarDuplicidad(datos, form);
    }
  }

  // METODO PARA TOMAR DATOS DEL CONTRATO
  ActualizarContrato(form: any) {
    let datosContrato = {
      id_tipo_contrato: form.tipoForm,
      vaca_controla: form.controlVacacionesForm,
      asis_controla: form.controlAsistenciaForm,
      fec_ingreso: form.fechaIngresoForm,
      fec_salida: form.fechaSalidaForm,
      id_regimen: form.idRegimenForm,
    };
    if (form.tipoForm === undefined) {
      this.InsertarModalidad(form, datosContrato);
    }
    else {
      this.VerificarDatos(datosContrato, form);
    }
  }

  // VALIDACIONES DE DUPLICIDAD DE REGISTROS
  revisarFecha: any = [];
  duplicado: number = 0;
  ValidarDuplicidad(datos: any, form: any): any {
    this.revisarFecha = [];
    this.duplicado = 0;
    // BUSQUEDA DE CONTRATOS QUE TIENE EL USUARIO
    this.rest.BuscarContratosEmpleado(this.contrato.id_empleado).subscribe(data => {
      this.revisarFecha = data;
      var ingreso = String(moment(datos.fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
      // COMPARACION DE CADA REGISTRO
      for (var i = 0; i <= this.revisarFecha.length - 1; i++) {
        var fecha = String(moment(this.revisarFecha[i].fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
        if (fecha === ingreso) {
          this.duplicado = 1;
        }
      }
      // SI EL REGISTRO ESTA DUPLICADO SE INDICA AL USUARIO
      if (this.duplicado === 1) {
        this.toastr.error('La fecha de ingreso de contrato ya se encuentra registrada.', 'Contrato ya existe.', {
          timeOut: 6000,
        })
        this.duplicado = 0;
      }
      else {
        this.VerificarInformacion(datos, form);
      }
    }, error => {
      this.VerificarInformacion(datos, form);
    });
  }

  // GUARDAR DATOS DE CONTRATO
  GuardarDatos(datos: any) {
    this.rest.ActualizarContratoEmpleado(this.idSelectContrato, datos).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
    }, error => {
      this.toastr.error('Operación Fallida', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    });
  }

  // VERIFICACION DE OPCIONES SELECCIONADOS PARA ACTUALIZACION DE ARCHIVOS
  VerificarInformacion(datos: any, form: any) {
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.contrato.documento,
        id: parseInt(this.contrato.id)
      }
      this.GuardarDatos(datos);
      this.rest.EliminarArchivo(eliminar).subscribe(res => {
      });
      this.Cancelar();
    }
    else if (this.opcion === 2) {
      if (form.documentoForm != '' && form.documentoForm != null) {
        this.EliminarDocumentoServidor();
        this.GuardarDatos(datos);
        this.CargarContrato(this.contrato.id, form);
        this.Cancelar();
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarDatos(datos);
      this.Cancelar();
    }
  }

  // ELIMINAR DOCUMENTO DEL SERVIDOR
  EliminarDocumentoServidor() {
    let eliminar = {
      documento: this.contrato.documento,
    }
    this.rest.EliminarArchivoServidor(eliminar).subscribe(res => {
    });
  }

  /** ******************************************************************************************* **
   ** **                                METODO PARA SUBIR ARCHIVO                              ** **
   ** ******************************************************************************************* **/

  // SELECCIONAR ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.contador = 1;
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      if (this.archivoSubido[0].size <= 2e+6) {
        this.ContratoForm.patchValue({ documentoForm: name });
        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA GUARDAR DATOS DE DOCUMENTO
  CargarContrato(id: number, form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirContrato(formData, id, form.documentoForm).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // RETIRAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  QuitarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }

  // LIMPIAR CAMPO NOMBRE DE ARCHIVO
  LimpiarNombreArchivo() {
    this.ContratoForm.patchValue({
      documentoForm: '',
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
  RetirarArchivo() {
    this.acciones = true;
    this.activar = false;
    this.opcion = 1;
    this.QuitarArchivo();
  }

  // METODO PARA CANCELAR OPCION SELECCIONADA
  acciones: boolean = false;
  LimpiarAcciones() {
    this.seleccion.reset();
    this.isChecked = false;
    this.acciones = false;
    this.activar = false;
    this.QuitarArchivo();
    this.opcion = 0;
  }

  // CERRAR VENTA DE REGISTRO
  Cancelar() {
    this.ventana.close(false)
  }

}
