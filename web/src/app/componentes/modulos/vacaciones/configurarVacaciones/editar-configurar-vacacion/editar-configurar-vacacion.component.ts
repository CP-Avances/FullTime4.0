import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ConfigurarVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/configurar-vacaciones/configurar-vacaciones.service';

import { ListarConfigurarVacacionComponent } from '../listar-configurar-vacacion/listar-configurar-vacacion.component';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-configurar-vacacion',
  standalone: false,
  templateUrl: './editar-configurar-vacacion.component.html',
  styleUrl: './editar-configurar-vacacion.component.css'
})

export class EditarConfigurarVacacionComponent implements OnInit {

  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // TIPO DE SOLICITUD
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  validarGuardar: boolean = false;

  // FORMULARIO
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  @Input() idConfiguracion: number;
  @Input() pagina: string = '';

  constructor(
    private rest: ConfigurarVacacionesService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public router: Router,
    public validar: ValidacionesService,
    public componentel: ListarConfigurarVacacionComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip'); this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.ValidarFormulario();
    this.CargarDatosVacaciones();
    this.ObtenerConfiguraciones();
  }

  // METODO PARA VALIDAR FORMULARIOS
  ValidarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      nombreForm: ['', Validators.required],
      diasHorasForm: ['', Validators.required],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      feriadosForm: [false],
      documentoForm: [''],
      estadoForm: [false],
    });
    this.segundoFormGroup = this._formBuilder.group({
    });
  }

  // METODO DE BUSQUEDA DE TIPOS DE PERMISOS
  listaConfiguraciones: any = [];
  ObtenerConfiguraciones() {
    this.listaConfiguraciones = [];
    this.rest.BuscarConfiguracionVacaciones().subscribe(datos => {
      this.listaConfiguraciones = datos;
      this.listaConfiguraciones = this.listaConfiguraciones.filter((item: any) => item.id !== this.datosConfiguracion.id);
    });
  }

  // METODO PARA LISTAR DATOS DE PERMISO
  datosConfiguracion: any = [];
  CargarDatosVacaciones() {
    this.datosConfiguracion = [];
    this.rest.BuscarUnaConfiguracion(this.idConfiguracion).subscribe(datos => {
      this.datosConfiguracion = datos[0];
      this.ImprimirDatos();
    })
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ImprimirDatos() {
    // TIPO PERMISO HORAS - DIAS
    this.ActivarDiasHorasSet();
    //console.log(' ver ', this.datosConfiguracion)
    // PRIMER FORMULARIO
    this.primeroFormGroup.patchValue({
      nombreForm: this.datosConfiguracion.descripcion,
      numDiaMaximoForm: this.datosConfiguracion.minimo_dias,
      numHoraMaximoForm: this.datosConfiguracion.minimo_horas,
      feriadosForm: this.datosConfiguracion.incluir_feriados,
      documentoForm: this.datosConfiguracion.documento,
      estadoForm: this.datosConfiguracion.estado,
    });
    // SEGUNDO FORMULARIO
    this.segundoFormGroup.patchValue({

    });
  }

  // METODO PARA CONTROLAR DIAS - HORAS
  ActivarDiasHoras(form: any) {
    if (form.diasHorasForm === 'Dias') {
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: this.datosConfiguracion.minimo_dias });
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: '00:00' });
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
      this.permitir_horas = true;
      this.toastr.info('Ingresar número de días mínimos de vacaciones.', '', {
        timeOut: 4000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.datosConfiguracion.minimo_horas });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0 });
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
      this.permitir_horas = false;
      this.toastr.info('Ingresar número de horas y minutos mínimos de vacaciones.', '', {
        timeOut: 4000,
      });
    }
  }

  // METODO PARA IMPRIMIR DATOS DE HORAS - DIAS DE PERMISO
  HabilitarDias: boolean = false;
  HabilitarHoras: boolean = false;
  permitir_horas: boolean = false;
  ActivarDiasHorasSet() {
    if (this.datosConfiguracion.minimo_dias === 0) {
      this.primeroFormGroup.patchValue({
        diasHorasForm: this.diasHoras[1].valor
      })
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
      this.permitir_horas = true;
    } else if (this.datosConfiguracion.minimo_horas === '00:00:00') {
      this.primeroFormGroup.patchValue({
        diasHorasForm: this.diasHoras[0].valor
      })
      this.permitir_horas = false;
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
    }
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  contador: number = 0;
  ModificarConfiguracion(form1: any, form2: any) {
    this.contador = 0;
    let configurar = {
      // FORMULARIO UNO
      descripcion: form1.nombreForm,
      permite_horas: this.permitir_horas,
      minimo_dias: form1.numDiaMaximoForm,
      minimo_horas: form1.numHoraMaximoForm,
      documento: form1.documentoForm,
      incluir_feriados: form1.feriadosForm,
      estado: form1.estadoForm,

      // FORMULARIO DOS

      id: this.datosConfiguracion.id,
      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    }

    if (this.datosConfiguracion.descripcion.toUpperCase() === configurar.descripcion.toUpperCase()) {
      this.Actualizar(configurar);
    }
    else {
      this.listaConfiguraciones.forEach((obj: any) => {
        if (obj.descripcion.toUpperCase() === configurar.descripcion.toUpperCase()) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.Actualizar(configurar);
      }
      else {
        this.toastr.warning('Descripción ya se encuentra registrada.', 'Ups! algo salio mal.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  Actualizar(datos: any) {
    this.rest.ActualizarConfiguracion(datos).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana(2);
    });
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number) {
    this.componentel.ver_editar = false;
    if (opcion === 1 && this.pagina === 'configurar-vacaciones') {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2 && this.pagina === 'configurar-vacaciones') {
      this.componentel.VerDatosConfiguracion(this.idConfiguracion);
    }
    else if (opcion === 1 && this.pagina === 'ver-datos') {
      this.componentel.ver_datos = true;
    }
    else if (opcion === 2 && this.pagina === 'ver-datos') {
      this.componentel.VerDatosConfiguracion(this.idConfiguracion);
    }
  }

}
