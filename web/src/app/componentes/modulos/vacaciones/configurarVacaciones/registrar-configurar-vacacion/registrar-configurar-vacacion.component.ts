import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ConfigurarVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/configurar-vacaciones/configurar-vacaciones.service';

import { ListarConfigurarVacacionComponent } from '../listar-configurar-vacacion/listar-configurar-vacacion.component';

// PERMISO POR HORAS - DIAS
interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registrar-configurar-vacacion',
  standalone: false,
  templateUrl: './registrar-configurar-vacacion.component.html',
  styleUrl: './registrar-configurar-vacacion.component.css'
})

export class RegistrarConfigurarVacacionComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;


  // DEFINIR DIAS - HORAS
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  // FORMULARIOS
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  constructor(
    private rest: ConfigurarVacacionesService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private _formBuilder: FormBuilder,
    public router: Router,
    public componentel: ListarConfigurarVacacionComponent,
  ) { }

  // CONTROLES DE CAMPOS OCULTOS
  HabilitarHoras: boolean = true;
  HabilitarDias: boolean = true;

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ValidarFormulario();
    this.ObtenerConfiguraciones();
  }

  // METODO DE BUSQUEDA DE TIPOS DE PERMISOS
  listaConfiguraciones: any = [];
  ObtenerConfiguraciones() {
    this.listaConfiguraciones = [];
    this.rest.BuscarConfiguracionVacaciones().subscribe(datos => {
      this.listaConfiguraciones = datos;
    });
  }

  // METODO PARA VALIDAR FORMULARIO
  ValidarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      nombreForm: ['', Validators.required],
      diasHorasForm: ['', Validators.required],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      feriadosForm: [false],
      documentoForm: [''],
    });
    this.segundoFormGroup = this._formBuilder.group({
    });
  }

  // METODO PARA ACTIVAR DIAS - HORAS
  ActivarDiasHoras(form: any) {
    if (form.diasHorasForm === 'Dias') {
      this.primeroFormGroup.patchValue({
        numDiaMaximoForm: '',
      });
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días mínimos de vacaciones.', '', {
        timeOut: 6000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({
        numHoraMaximoForm: '',
      });
      this.HabilitarHoras = false;
      this.HabilitarDias = true;
      this.toastr.info('Ingresar número de horas y minutos mínimos de vacaciones.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CAMBIAR VALORES DIAS - HORAS
  CambiarValoresDiasHoras(form: any, datos: any) {
    if (form.diasHorasForm === 'Dias') {
      datos.permitir_horas = false;
      if (datos.minimo_dias === '') {
        this.toastr.info('Ingresar número de días mínimos de vacaciones.', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.minimo_horas = '00:00';
        this.VerificarDuplicidad(datos);
      }
    }
    else if (form.diasHorasForm === 'Horas') {
      datos.permitir_horas = true;
      if (datos.minimo_horas === '') {
        this.toastr.info('Ingresar número de horas y minutos mínimos de vacaciones.', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.minimo_dias = 0;
        this.VerificarDuplicidad(datos);
      }
    }
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  InsertarConfiguracion(form1: any, form2: any) {
    let configuracion = {
      // FORMULARIO UNO
      descripcion: form1.nombreForm,
      permitir_horas: false,
      minimo_dias: form1.numDiaMaximoForm,
      minimo_horas: form1.numHoraMaximoForm,
      documento: form1.documentoForm,
      incluir_feriados: form1.feriadosForm,
      estado: true,
      // FORMULARIO DOS

      user_name: this.user_name,
      ip: this.ip,
      ip_local: this.ips_locales,
    }

    console.log('ver configuracion ', configuracion)
    this.CambiarValoresDiasHoras(form1, configuracion);
  }

  // METODO PARA CREAR REGISTRO
  IngresarDatos(datos: any) {
    this.rest.CrearConfiguracion(datos).subscribe(res => {
      if (res.estado === 'OK') {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.CerrarVentana(2, res.id)
      }
      else {
        this.toastr.warning('Intente más tarde.', 'Ups! algo salio mal.', {
          timeOut: 6000,
        });
      }
    }, error => {
      this.toastr.error('Intente más tarde.', 'Ups! algo salio mal.', {
        timeOut: 6000,
      });
    });
  }


  VerificarDuplicidad(datos: any) {
    let contador = 0;
    this.listaConfiguraciones.forEach((obj: any) => {
      if (obj.descripcion.toUpperCase() === datos.descripcion.toUpperCase()) {
        contador = 1;
      }
    })
    if (contador === 0) {
      this.IngresarDatos(datos);
    }
    else {
      this.toastr.warning('Descripción ya se encuentra registrada.', 'Ups! algo salio mal.', {
        timeOut: 6000,
      });
    }
  }


  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana(opcion: number, datos: number) {
    this.componentel.ver_registrar = false;
    if (opcion === 1) {
      this.componentel.ver_lista = true;
    }
    else if (opcion === 2) {
      this.componentel.VerDatosConfiguracion(datos);
    }
  }

}

