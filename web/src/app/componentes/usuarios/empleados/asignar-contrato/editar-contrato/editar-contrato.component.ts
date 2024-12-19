import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DateTime } from 'luxon';

import { RegimenService } from 'src/app/servicios/configuracion/parametrizacion/catRegimen/regimen.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { ProvinciaService } from 'src/app/servicios/configuracion/localizacion/catProvincias/provincia.service';

import { VerEmpleadoComponent } from '../../datos-empleado/ver-empleado/ver-empleado.component';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-contrato',
  templateUrl: './editar-contrato.component.html',
  styleUrls: ['./editar-contrato.component.css']
})

export class EditarContratoComponent implements OnInit {
  ips_locales: any = '';

  @Input() contrato: any;
  @Input() pagina: any;

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  controlVacacionesF = new FormControl('', Validators.required);
  controlAsistenciaF = new FormControl('', Validators.required);
  fechaIngresoF = new FormControl('', Validators.required);
  fechaSalidaF = new FormControl('', Validators.required);
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
    public componentev: VerEmpleadoComponent,
    public validar: ValidacionesService,
    public pais: ProvinciaService,
    private rest: EmpleadoService,
    private toastr: ToastrService,
    private restRegimen: RegimenService,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

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
      return this.paises.filter((pais: any) => pais.nombre.toLowerCase().includes(filterValue));
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
      this.paises.forEach((obj: any) => {
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
    const { fecha_ingreso, fecha_salida, controlar_vacacion, controlar_asistencia,
      id_modalidad_laboral } = this.contrato;
    this.ContratoForm.patchValue({
      controlVacacionesForm: controlar_vacacion,
      controlAsistenciaForm: controlar_asistencia,
      fechaIngresoForm: fecha_ingreso,
      fechaSalidaForm: fecha_salida,
      tipoForm: id_modalidad_laboral
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
        descripcion: form.contratoForm,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
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
    if (DateTime.fromISO(datos.fec_ingreso).hasSame(DateTime.fromISO(this.contrato.fecha_ingreso), 'day') &&
      DateTime.fromISO(datos.fec_salida).hasSame(DateTime.fromISO(this.contrato.fecha_salida), 'day')) {
      this.VerificarInformacion(datos, form);
    }
    else {
      this.ValidarDuplicidad(datos, form);
    }
  }

  // METODO PARA TOMAR DATOS DEL CONTRATO
  ActualizarContrato(form: any) {
    let datosContrato = {
      subir_documento: false,
      id_tipo_contrato: form.tipoForm,
      vaca_controla: form.controlVacacionesForm,
      asis_controla: form.controlAsistenciaForm,
      id_empleado: this.idEmpleado,
      fec_ingreso: form.fechaIngresoForm,
      fec_salida: form.fechaSalidaForm,
      id_regimen: form.idRegimenForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
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
    let editar = {
      id_empleado: this.contrato.id_empleado,
      id_contrato: this.contrato.id
    }
    this.rest.BuscarContratosEmpleadoEditar(editar).subscribe(data => {
      this.revisarFecha = data;
      var ingreso = this.validar.DarFormatoFecha(datos.fec_ingreso, 'yyyy-MM-dd');
      // COMPARACION DE CADA REGISTRO
      for (var i = 0; i <= this.revisarFecha.length - 1; i++) {
        var fecha_salida = this.validar.DarFormatoFecha(this.revisarFecha[i].fecha_salida, 'yyyy-MM-dd');
        if (ingreso < fecha_salida) {
          this.duplicado = 1;
        }
      }
      // SI EL REGISTRO ESTA DUPLICADO SE INDICA AL USUARIO
      if (this.duplicado === 1) {
        this.toastr.warning('Existe un contrato en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
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
      if (response.message === 'error') {
        this.toastr.warning('Intente nuevamente.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
      else {
        if (this.opcion === 2) {
          this.EliminarDocumentoServidor();
          this.CargarContrato(this.contrato.id);
        }
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
      }

    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    });
  }

  // VERIFICACION DE OPCIONES SELECCIONADOS PARA ACTUALIZACION DE ARCHIVOS
  VerificarInformacion(datos: any, form: any) {
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.contrato.documento,
        id: parseInt(this.contrato.id),
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.GuardarDatos(datos);
      this.rest.EliminarArchivo(eliminar).subscribe(res => {
      });
      this.Cancelar(2);
    }
    else if (this.opcion === 2) {
      if (form.documentoForm != '' && form.documentoForm != null) {
        datos.subir_documento = true;
        this.GuardarDatos(datos);
        this.Cancelar(2);
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarDatos(datos);
      this.Cancelar(2);
    }
  }

  // ELIMINAR DOCUMENTO DEL SERVIDOR
  EliminarDocumentoServidor() {
    let eliminar = {
      documento: this.contrato.documento,
      id: this.idEmpleado
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
  CargarContrato(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.rest.SubirContrato(formData, id).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    }, error => {
      this.toastr.info('Verifique que este usuario tenga creadas capetas', 'No se ha podido cargar el archivo.', {
        timeOut: 6000,
      });
    }
    );
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
  Cancelar(opcion: any) {
    this.componentev.ver_contrato_cargo = true;
    if (this.pagina === 'ver-empleado') {
      this.componentev.editar_contrato = false;
      if (opcion === 2) {
        this.componentev.VerDatosActuales(this.componentev.formato_fecha);
      }
    }
  }

  // METODO PARA CERRAR VISTA DE DOCUMENTO
  VerDocumento(opcion: any) {
    if (opcion === false) {
      this.activar = false;
      this.opcion = 0;
    }
  }

}
