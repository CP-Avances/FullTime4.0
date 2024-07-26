import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import moment from 'moment';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { CatTipoCargosService } from 'src/app/servicios/catalogos/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/asignaciones/asignaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-empl-cargos',
  templateUrl: './empl-cargos.component.html',
  styleUrls: ['./empl-cargos.component.css'],
})

export class EmplCargosComponent implements OnInit {

  habilitarCargo: boolean = false;
  idEmpleado: string;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idSucursalesAcceso: any = [];
  idDepartamentosAcceso: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  departamento: any = [];
  sucursales: any = [];
  tipoCargo: any = [];
  empresas: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
  jefeF = new FormControl(false);
  administraF = new FormControl(false);
  personalF = new FormControl(false);

  // AGREGAR CAMPOS DE FORMULARIO
  public formulario = new FormGroup({
    horaTrabajaForm: this.horaTrabaja,
    idSucursalForm: this.idSucursal,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    idDeparForm: this.idDepartamento,
    sueldoForm: this.sueldo,
    cargoForm: this.cargoF,
    tipoForm: this.tipoF,
    jefeForm: this.jefeF,

    administraForm: this.administraF,
    personalForm: this.personalF,
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private asignaciones: AsignacionesService,
    private restSucursales: SucursalService,
    private restEmpleado: EmpleadoService,
    private cargos: EmplCargosService,
    private usuario: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<EmplCargosComponent>,
    public validar: ValidacionesService,
    public tipocargo: CatTipoCargosService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpleado = datoEmpleado.idEmpleado;
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;

    this.BuscarDatosContrato()
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.BuscarDatosCargo();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
  }

  // BUSCAR DATOS DE CONTRATO
  contrato_actual: any = [];
  BuscarDatosContrato() {
    let datosBusqueda = {
      id_contrato: this.datoEmpleado.idContrato,
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      this.contrato_actual = response[0];
      this.fechaInicio.setValue(this.contrato_actual.fecha_ingreso);
      this.fechaFinal.setValue(this.contrato_actual.fecha_salida);
    });
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
  async FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = this.rolEmpleado === 1 ? datos : this.FiltrarSucursalesAsignadas(datos);
    }, error => {
      this.toastr.info('No se han encontrado registros de Sucursales.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = this.rolEmpleado === 1 ? datos : this.FiltrarDepartamentosAsignados(datos);
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA FILTRAR DEPARTAMENTOS ASIGNADOS
  FiltrarDepartamentosAsignados(data: any) {
    return data.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
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
    // FORMATEAR FECHAS AL FORMATO YYYY-MM-DD
    let registro_inicio = moment(form.fecInicioForm).format('YYYY-MM-DD');
    let registro_fin = moment(form.fecFinalForm).format('YYYY-MM-DD');
    let contrato_inicio = moment(this.contrato_actual.fecha_ingreso).format('YYYY-MM-DD');
    let contrato_fin = moment(this.contrato_actual.fecha_salida).format('YYYY-MM-DD');
    /*console.log('inicio ', registro_inicio)
    console.log('inicio format ', Date.parse(registro_inicio))
    console.log('fin ', registro_fin)
    console.log('fin format ', Date.parse(registro_fin))
    console.log('inicio ', contrato_inicio)
    console.log('inicio format ', Date.parse(contrato_inicio))
    console.log('fin ', contrato_fin)
    console.log('fin format ', Date.parse(contrato_fin))*/
    // COMPARAR FECHAS INGRESADAS CON EL CONTRATO ACTUAL
    if ((Date.parse(contrato_inicio) <= Date.parse(registro_inicio)) &&
      (Date.parse(contrato_fin) >= Date.parse(registro_fin))) {
      if (Date.parse(registro_inicio) < Date.parse(registro_fin)) {
        this.RegistrarCargo(form);
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
        'Las fechas ingresadas no se encuentran dentro de las establecidas en el contrato laboral.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA GUARDAR REGISTRO
  RegistrarCargo(form: any) {
    let cargo = {
      id_empl_contrato: this.datoEmpleado.idContrato,
      id_departamento: form.idDeparForm,
      hora_trabaja: form.horaTrabajaForm,
      id_sucursal: form.idSucursalForm,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      sueldo: form.sueldoForm,
      cargo: form.tipoForm,
      jefe: form.jefeForm,
      user_name: this.user_name,
      ip: this.ip,
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

    // VALIDAR DUPLICIDAD EN LOS REGISTROS DE CARGOS
    this.ValidarFechasCargo(form, cargo);

  }

  // METODO PARA VALIDAR REGISTRO DE FECHAS DE CARGO
  ValidarFechasCargo(form: any, datos: any) {
    let verficar = {
      id_empleado: this.idEmpleado,
      fecha_verificar: datos.fec_inicio
    }
    this.cargos.BuscarCargoFecha(verficar).subscribe(res => {
      this.toastr.warning('Existe un cargo en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }, vacio => {
      if (form.tipoForm === undefined) {
        this.VerificarTipoCargo(form, datos);
      }
      else {
        this.AlmacenarDatos(form, datos);
      }
    });
  }

  // METODO PARA ALMACENAR DATOS DE CARGO EN EL SISTEMA
  AlmacenarDatos(form: any, cargo: any) {
    this.cargos.RegistrarCargo(cargo).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.BuscarUsuarioDepartamento(form);
      this.CambiarEstado();
      this.CerrarVentana();
    });
  }

  // METODO PARA REGISTRAR TIPO CARGO
  IngresarTipoCargo(form: any, datos: any) {
    if (form.cargoForm != '') {
      let tipo_cargo = {
        cargo: form.cargoForm,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.cargos.CrearTipoCargo(tipo_cargo).subscribe(res => {
        datos.cargo = res.id;
        this.AlmacenarDatos(form, datos);
      });
    }
    else {
      this.toastr.info('Ingresar el nuevo cargo a desempeñar.', 'Verificar datos.', {
        timeOut: 6000,
      });
    }
  }

  // VERIFICAR DUPLICIDAD TIPO DE CARGO
  VerificarTipoCargo(form: any, datos: any) {
    let verificar = {
      nombre: (form.cargoForm).toUpperCase()
    }
    this.tipocargo.BuscarTipoCargoNombre(verificar).subscribe(res => {
      this.toastr.warning('El tipo de cargo registrado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }, vacio => {
      this.IngresarTipoCargo(form, datos);
    });
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


  /** *************************************************************************************************** **
   **                              METODOS TABLA USUARIO - DEPARTAMENTO                                ** **
   ** *************************************************************************************************** **/

  // METODO PARA BUSCAR USUARIO - DEPARTAMENTO
  BuscarUsuarioDepartamento(form: any) {
    let datos = {
      id_empleado: this.idEmpleado,
    }
    this.usuario.BuscarAsignacionUsuarioDepartamento(datos).subscribe(res => {
      if (res != null) {
        const id = res[0].id;
        this.ActualizarUsuarioDepartamento(form, id);
      }
      else {
        this.IngresarUsuarioDepartamento(form);
      }
    });
  }

  // METODO PARA REGISTRAR USUARIO - DEPARTAMENTO
  IngresarUsuarioDepartamento(form: any) {
    let datos = {
      id_empleado: this.idEmpleado,
      id_departamento: form.idDeparForm,
      principal: true,
      personal: form.personalForm,
      administra: form.administraForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.usuario.RegistrarUsuarioDepartamento(datos).subscribe(res => {
    });
  }

  // METODO PARA ACTUALIZAR USUARIO - DEPARTAMENTO
  ActualizarUsuarioDepartamento(form: any, id: number) {
    let datos = {
      id: id,
      id_departamento: form.idDeparForm,
      principal: true,
      personal: form.personalForm,
      administra: form.administraForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.usuario.ActualizarUsuarioDepartamento(datos).subscribe(res => {
    });
  }

  /** ***************************************************************************************** **
 ** **                     METODO PARA ACTUALIZAR ESTADO DEL CARGOS                        ** **
 ** ***************************************************************************************** **/

  // METODO PARA BUSCAR CARGOS ACTIVOS
  cargo_id: number = 0;
  BuscarDatosCargo() {
    let valores = {
      id_empleado: this.idEmpleado,
    }
    this.cargos.BuscarCargoActivo(valores).subscribe(data => {
      if (data.message === 'contrato_cargo') {
        this.cargo_id = data.datos.id_cargo
      }
    });
  }

  // METODO PARA EDITAR ESTADO DEL CARGO
  CambiarEstado() {
    let valores = {
      user_name: this.user_name,
      id_cargo: this.cargo_id,
      estado: false,
      ip: this.ip,
    }
    if (this.cargo_id != 0) {
      this.cargos.EditarEstadoCargo(valores).subscribe(data => {
      });
    }
  }

}
