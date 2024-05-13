import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';

@Component({
  selector: 'app-registro-contrato',
  templateUrl: './registro-contrato.component.html',
  styleUrls: ['./registro-contrato.component.css'],
})

export class RegistroContratoComponent implements OnInit {

  isChecked: boolean = false;
  habilitarSeleccion: boolean = true;
  habilitarContrato: boolean = false;

  // DATOS REGIMEN
  seleccionarRegimen: any;
  regimenLaboral: any = [];
  empleados: any = [];

  // BUSQUEDA DE PAISES AL INGRESAR INFORMACION
  filtro: Observable<any[]>;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
  tipoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
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
    private rest: EmpleadoService,
    private restR: RegimenService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistroContratoComponent>,
    public pais: ProvinciaService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
    })
  }

  // BUSQUEDA DE REGIMEN LABORAL
  ObtenerRegimen(form: any) {
    var pais = form.nombrePaisForm;
    this.regimenLaboral = [];
    this.restR.ConsultarRegimenPais(pais).subscribe(datos => {
      this.regimenLaboral = datos;
    }, error => {
      this.toastr.info('Pais seleccionado no tiene registros de Régimen Laboral.', '', {
        timeOut: 6000,
      });
      this.nombrePaisF.reset();
    })
  }

  // METODO PARA OBTENER TIPOS DE CONTRATOS
  tipoContrato: any = [];
  ObtenerTipoContratos() {
    this.tipoContrato = [];
    this.rest.BuscarTiposContratos().subscribe(datos => {
      this.tipoContrato = datos;
      this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
    })
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados() {
    this.empleados = [];
    this.rest.BuscarUnEmpleado(this.datoEmpleado).subscribe(data => {
      this.empleados = data[0];
      this.empleados.nombre_ = this.empleados.nombre.toUpperCase() + ' ' + this.empleados.apellido.toUpperCase();
    })
  }

  // METODO PARA MOSTRAR LISTA MODALIDAD DE TRABAJO
  VerTiposContratos() {
    this.formulario.patchValue({
      contratoForm: '',
    });
    this.habilitarContrato = false;
    this.habilitarSeleccion = true;
  }

  // VALIDACIONES DE INGRESO DE FECHAS
  ValidarDatosContrato(form: any) {
    if (form.fechaSalidaForm === '' || form.fechaSalidaForm === null) {
      form.fechaSalidaForm = null;
      this.InsertarContrato(form);
    } else {
      if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
        this.InsertarContrato(form);
      }
      else {
        this.toastr.info('Las fechas no se encuentran correctamente ingresadas.', '', {
          timeOut: 6000,
        })
      }
    }
  }

  // METODO PARA TOMAR DATOS DEL FORMULARIO
  contador: number = 0;
  InsertarContrato(form: any) {
    let datosContrato = {
      id_tipo_contrato: form.tipoForm,
      vaca_controla: form.controlVacacionesForm,
      asis_controla: form.controlAsistenciaForm,
      id_empleado: this.datoEmpleado,
      fec_ingreso: form.fechaIngresoForm,
      fec_salida: form.fechaSalidaForm,
      id_regimen: form.idRegimenForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    if (form.tipoForm === undefined) {
      this.InsertarModalidad(form, datosContrato);
    }
    else {
      this.ValidarDuplicidad(datosContrato, form);
    }
  }

  // ACTIVAR REGISTRO DE MODALIDAD DE TRABAJO
  IngresarOtro(form: any) {
    if (form.tipoForm === undefined) {
      this.formulario.patchValue({
        contratoForm: '',
      });
      this.habilitarContrato = true;
      this.toastr.info('Ingresar nueva modalidad de trabajo.', '', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // REGISTRAR MODALIDAD DE TRABAJO
  InsertarModalidad(form: any, datos: any) {
    if (form.contratoForm != '') {
      let tipo_contrato = {
        descripcion: form.contratoForm,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.rest.CrearTiposContrato(tipo_contrato).subscribe(res => {
        datos.id_tipo_contrato = res.id;
        this.ValidarDuplicidad(datos, form);
      });
    }
    else {
      this.toastr.info('Ingresar modalidad laboral.', 'Verificar datos.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA REGISTRAR DATOS DE CONTRATO
  RegistrarContrato(form: any, datos: any) {
    this.rest.CrearContratoEmpleado(datos).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      if (this.isChecked === true && form.documentoForm != '') {
        this.CargarContrato(response.id, form);
      }
      this.CerrarVentana();
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', '', {
        timeOut: 6000,
      })
    });
  }

  // VERIFICAR QUE EL REGISTRO NO SE DUPLIQUE
  revisarFecha: any = [];
  ValidarDuplicidad(datos: any, form: any): any {
    this.revisarFecha = [];
    this.contador = 0;
    // BUSQUEDA DE CONTRATOS QUE TIENE EL USUARIO
    this.rest.BuscarContratosEmpleado(this.datoEmpleado).subscribe(data => {
      this.revisarFecha = data;
      var ingreso = String(moment(datos.fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
      // COMPARACION DE CADA REGISTRO
      for (var i = 0; i <= this.revisarFecha.length - 1; i++) {
        var fecha = String(moment(this.revisarFecha[i].fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
        if (fecha === ingreso) {
          this.contador = 1;
        }
      }
      // SI EL REGISTRO ESTA DUPLICADO SE INDICA AL USUARIO
      if (this.contador === 1) {
        this.toastr.warning('La fecha de ingreso de contrato ya se encuentra registrada.', 'Contrato ya existe.', {
          timeOut: 6000,
        })
        this.contador = 0;
      }
      else {
        this.RegistrarContrato(form, datos);
      }

    }, error => {
      this.RegistrarContrato(form, datos);
    });
  }


  /** ***************************************************************************************** **
   ** **                   METODO PARA INGRESAR ARCHIVO CONTRATO                             ** **
   ** ***************************************************************************************** **/

  // SELECCIONAR ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      if (this.archivoSubido[0].size <= 2e+6) {
        this.formulario.patchValue({ documentoForm: name });
        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // GUARDAR DOCUMENTO CONTRATO
  CargarContrato(id: number, form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    formData.append('user_name', this.user_name as string);
    formData.append('ip', this.ip as string);

    this.rest.SubirContrato(formData, id).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Documento guardado.', {
        timeOut: 6000,
      });
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

  // LIMPIAR DE FORMULARIO NOMBRE DE ARCHIVO
  LimpiarNombreArchivo() {
    this.formulario.patchValue({
      documentoForm: '',
    });
  }

  // LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // CERRAR VENTANA DE REGISTRO DE CONTRATO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }


}
