import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-empl-cargos',
  templateUrl: './empl-cargos.component.html',
  styleUrls: ['./empl-cargos.component.css'],
})

export class EmplCargosComponent implements OnInit {

  habilitarCargo: boolean = false;
  idEmpleado: string;

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  departamento: any = [];
  sucursales: any = [];
  tipoCargo: any = [];
  empresas: any = [];

  // VARIABLES DE FORMULARIO
  idEmpleContrato = new FormControl('', [Validators.required]);
  idDepartamento = new FormControl('', [Validators.required]);
  horaTrabaja = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idSucursal = new FormControl('', [Validators.required]);
  sueldo = new FormControl('', [Validators.required]);
  cargoF = new FormControl('', [Validators.minLength(3)]);
  tipoF = new FormControl('');

  // AGREGAR CAMPOS DE FORMULARIO
  public formulario = new FormGroup({
    horaTrabajaForm: this.horaTrabaja,
    idSucursalForm: this.idSucursal,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    idDeparForm: this.idDepartamento,
    sueldoForm: this.sueldo,
    cargoForm: this.cargoF,
    tipoForm: this.tipoF
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private restEmpleado: EmpleadoService,
    private cargos: EmplCargosService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<EmplCargosComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpleado = datoEmpleado.idEmpleado;
  }

  ngOnInit(): void {
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
  }

  // METODO DE BUSQUEDA DE TIPOS DE CARGOS
  BuscarTiposCargos() {
    this.tipoCargo = [];
    this.cargos.ObtenerTipoCargos().subscribe(datos => {
      this.tipoCargo = datos;
      this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
    })
  }

  // METODO DE BUSQUEDA DE ESTABLECIMIENTOS
  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No se han encontrado registros de Sucursales.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA ACTIVAR INGRESO DE CARGO
  IngresarOtro(form: any) {
    if (form.tipoForm === undefined) {
      this.formulario.patchValue({
        cargoForm: '',
      });
      this.habilitarCargo = true;
      this.toastr.info('Ingresar nombre del nuevo cargo.', 'Etiqueta Cargo a desempeñar activa.', {
        timeOut: 4000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // METODO PARA MOSTRAR LISTA DE CARGOS
  habilitarSeleccion: boolean = true;
  VerTiposCargos() {
    this.formulario.patchValue({
      cargoForm: '',
    });
    this.habilitarCargo = false;
    this.habilitarSeleccion = true;
  }

  // METODO PARA VALIDAR INFORMACION
  ValidarDatosRegistro(form: any) {
    let datosBusqueda = {
      id_contrato: this.datoEmpleado.idContrato,
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fecInicioForm)) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
          this.insertarEmpleadoCargo(form);
        }
        else {
          this.toastr.info(
            'La fecha de finalización de actividades debe ser posterior a la fecha de inicio de actividades.', '', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.info(
          'La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    });
  }

  // METODO PARA GUARDAR REGISTRO
  insertarEmpleadoCargo(form: any) {
    let cargo = {
      id_empl_contrato: this.datoEmpleado.idContrato,
      id_departamento: form.idDeparForm,
      hora_trabaja: form.horaTrabajaForm,
      id_sucursal: form.idSucursalForm,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      sueldo: form.sueldoForm,
      cargo: form.tipoForm
    }
    // FORMATEAR HORAS
    if (cargo.hora_trabaja.split(':').length === 1) {
      if (parseInt(cargo.hora_trabaja) < 10) {
        cargo.hora_trabaja = '0' + parseInt(cargo.hora_trabaja) + ':00:00'
      }
      else {
        cargo.hora_trabaja = cargo.hora_trabaja + ':00:00'
      }
    }
    else {
      if (parseInt(cargo.hora_trabaja.split(':')[0]) < 10) {
        cargo.hora_trabaja = '0' + parseInt(cargo.hora_trabaja.split(':')[0]) + ':' + cargo.hora_trabaja.split(':')[1] + ':00'
      }
    }

    if (form.tipoForm === undefined) {
      this.IngresarTipoCargo(form, cargo);
    }
    else {
      this.cargos.RegistrarCargo(cargo).subscribe(res => {
        this.toastr.success('Operación exitosa.', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      });
    }
  }

  // METODO PARA REGISTRAR TIPO CARGO
  IngresarTipoCargo(form: any, datos: any) {
    if (form.cargoForm != '') {
      let tipo_cargo = {
        cargo: form.cargoForm
      }
      this.cargos.CrearTipoCargo(tipo_cargo).subscribe(res => {
        datos.cargo = res.id;
        this.cargos.RegistrarCargo(datos).subscribe(res => {
          this.toastr.success('Operación exitosa.', 'Registro guardado.', {
            timeOut: 6000,
          });
          this.CerrarVentana();
        });
      });
    }
    else {
      this.toastr.info('Ingresar el nuevo cargo a desempeñar.', 'Verificar datos.', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA VALIDAR INGRESO DE HORAS
  IngresarNumeroCaracter(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
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

  // MENSAJE QUE INDICA FORMATO DE INGRESO DE NUMERO DE HORAS
  ObtenerMensajeErrorHoraTrabajo() {
    if (this.horaTrabaja.hasError('pattern')) {
      return 'Indicar horas y minutos. Ejemplo: 12:05';
    }
  }

}
