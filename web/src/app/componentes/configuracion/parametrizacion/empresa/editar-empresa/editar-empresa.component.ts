// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

import { VerEmpresaComponent } from '../ver-empresa/ver-empresa.component';

@Component({
  selector: 'app-editar-empresa',
  templateUrl: './editar-empresa.component.html',
  styleUrls: ['./editar-empresa.component.css']
})
export class EditarEmpresaComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES USADAS PARA VER U OCULTAR OPCIONES
  valor = 'Representante';

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  establecimientoF = new FormControl('');
  representanteF = new FormControl('', [Validators.required]);
  dias_cambioF = new FormControl('');
  direccionF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  telefonoF = new FormControl('', Validators.required);
  cambiosF = new FormControl('');
  numeroF = new FormControl('');
  nombreF = new FormControl('', [Validators.required, Validators.minLength(2)]);
  correoF = new FormControl('', [Validators.required, Validators.email]);
  otroF = new FormControl('');
  otroE = new FormControl('');
  tipoF = new FormControl('');
  rucF = new FormControl('', Validators.required);

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  @Input() idEmpresa: number;

  constructor(
    private formulario: FormBuilder,
    private toastr: ToastrService,
    private rest: EmpresaService,
    public validar: ValidacionesService,
    public componentei: VerEmpresaComponent,
  ) { }

  // VARIABLES USADAS PARA MOSTRAR U OCULTAR OPCIONES
  HabilitarOtroE: boolean = false;
  habilitarDias: boolean = false;
  HabilitarOtro: boolean = false;

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.CargarDatosEmpresa();
    this.ValidarFormulario();
  }

  // VALIDACIONES DE FORMULARIO
  ValidarFormulario() {
    this.primerFormulario = this.formulario.group({
      direccionForm: this.direccionF,
      telefonoForm: this.telefonoF,
      nombreForm: this.nombreF,
      correoForm: this.correoF,
      numeroForm: this.numeroF,
      rucForm: this.rucF,
    });
    this.segundoFormulario = this.formulario.group({
      representanteForm: this.representanteF,
      dias_cambioForm: this.dias_cambioF,
      otroEForm: this.otroE,
      otroForm: this.otroF,

      establecimientoForm: this.establecimientoF,
      tipoForm: this.tipoF,
      cambiosForm: this.cambiosF
    });
  }

  // CARGAR DATOS DE EMPRESA
  data: any = [];
  CargarDatosEmpresa() {
    this.data = [];
    this.rest.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.data = datos[0];
      this.ImprimirDatos();
    });
  }

  // CARGARA DATOS DE EMPRESA EN FORMULARIO
  ImprimirDatos() {

    // PRIMER FORMULARIO
    this.nombreF.setValue(this.data.nombre);
    this.rucF.setValue(this.data.ruc);
    this.numeroF.setValue(this.data.numero_partida);
    this.telefonoF.setValue(this.data.telefono);
    this.direccionF.setValue(this.data.direccion);
    this.correoF.setValue(this.data.correo_empresa);

    // SEGUNDO FORMULARIO
    this.representanteF.setValue(this.data.representante);

    if (this.data.tipo_empresa === 'Publica' ||
      this.data.tipo_empresa === 'Privada' ||
      this.data.tipo_empresa === 'ONG' ||
      this.data.tipo_empresa === 'Persona Natural') {
      this.tipoF.setValue(this.data.tipo_empresa);
    }
    else {
      this.HabilitarOtro = true;
      this.valor = 'Representante legal';
      this.tipoF.setValue('Otro');
      this.otroF.setValue(this.data.tipo_empresa);
    }

    if (this.data.establecimiento === 'Sucursales' ||
      this.data.establecimiento === 'Agencias') {
      this.establecimientoF.setValue(this.data.establecimiento);
    }
    else {
      this.HabilitarOtroE = true;
      this.establecimientoF.setValue('Otros');
      this.otroE.setValue(this.data.establecimiento);
    }

    if (this.data.cambios === true) {
      this.habilitarDias = true;
      this.cambiosF.setValue('true');
      this.dias_cambioF.setValue(this.data.dias_cambio);
    }
    else {
      this.cambiosF.setValue('false');
    }
  }

  // GUARDAR DATOS DE EMPRESA
  InsertarEmpresa(form1: any, form2: any) {

    // VALIDAR INGRESO DE DATOS OBLIGATORIOS
    var verificar_tipo = 0;
    var verificar_establecimiento = 0;
    var verificar_dias = 0;
    let empresa = {
      id: this.data.id,
      ruc: form1.rucForm,
      nombre: form1.nombreForm,
      telefono: form1.telefonoForm,
      direccion: form1.direccionForm,
      num_partida: form1.numeroForm,
      correo_empresa: form1.correoForm,

      establecimiento: form2.establecimientoForm,
      representante: form2.representanteForm,
      tipo_empresa: form2.tipoForm,
      dias_cambio: form2.dias_cambioForm,
      cambios: true,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    if (form2.tipoForm === 'Otro') {
      empresa.tipo_empresa = form2.otroForm;
      if (empresa.tipo_empresa === '' || empresa.tipo_empresa === null) {
        verificar_tipo = 1;
      }
    }

    if (form2.establecimientoForm === 'Otros') {
      empresa.establecimiento = form2.otroEForm;
      if (empresa.establecimiento === '' || empresa.establecimiento === null) {
        verificar_establecimiento = 1;
      }
    }

    if (form2.cambiosForm === 'false') {
      empresa.cambios = false;
      empresa.dias_cambio = 0;
    }
    else {
      if (empresa.dias_cambio === '' || empresa.dias_cambio === null) {
        verificar_dias = 1;
      }
    }

    if (verificar_dias === 0 && verificar_establecimiento === 0 && verificar_tipo === 0) {
      this.GuardarDatos(empresa);
    }
    else {
      this.toastr.warning('Ingresar toda la información requerida.', '', {
        timeOut: 4000,
      })
    }
  }

  // GUARDAR DATOS DE EMPRESA
  GuardarDatos(datos: any) {
    this.rest.ActualizarEmpresa(datos).subscribe(response => {
      this.Salir(2);
      this.toastr.success('Operación exitosa.', 'Datos actualizados.', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA SELECCION TIPO DE EMPRESA, ESTABLECIMIENTOS Y RESTRICCIONES
  SeleccionarTipo(event: MatRadioChange) {
    var opcion = event.value;

    // TIPO DE EMPRESA
    if (opcion === 'Persona Natural' || opcion === 'Privada' || opcion === 'ONG') {
      this.HabilitarOtro = false;
      this.valor = 'Representante legal';
      this.otroF.setValue('');
    }
    else if (opcion === 'Publica') {
      this.HabilitarOtro = false;
      this.valor = 'Máxima autoridad';
      this.otroF.setValue('');
    }
    else if (opcion === 'Otro') {
      this.HabilitarOtro = true;
      this.toastr.info('Ingresar nuevo tipo de empresa.', '', {
        timeOut: 4000,
      });
      this.valor = 'Representante legal';
      this.otroF.setValue('');
    }

    // ESTABLECIMIENTO
    else if (opcion === 'Sucursales' || opcion === 'Agencias') {
      this.HabilitarOtroE = false;
      this.otroE.setValue('');
    }
    else if (opcion === 'Otros') {
      this.HabilitarOtroE = true;
      this.toastr.info('Ingresar identificación general del establecimiento.', '', {
        timeOut: 3000,
      })
      this.otroE.setValue('');
    }

    // AUTORIZACIONES
    else if (opcion === 'false') {
      this.habilitarDias = false;
      this.dias_cambioF.setValue('');
    }
    else if (opcion === 'true') {
      this.dias_cambioF.setValue('');
      this.habilitarDias = true;
      this.toastr.info(
        `Ingresar número de días previos a la fecha de expiración de la solicitud para realizar cambios
        en el estado de la aprobación realizada.`, '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA CONTROLAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA CERRAR VENTANA DE EDICION DE DATOS
  Salir(opcion: number) {
    this.componentei.ver_informacion = true;
    this.componentei.ver_editar = false;
    if (opcion === 2) {
      this.componentei.CargarDatosEmpresa();
    }
  }

}
