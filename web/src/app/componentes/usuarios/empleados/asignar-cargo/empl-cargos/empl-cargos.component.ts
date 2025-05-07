import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { CatTipoCargosService } from 'src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

import { VerEmpleadoComponent } from '../../datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-empl-cargos',
  standalone: false,
  templateUrl: './empl-cargos.component.html',
  styleUrls: ['./empl-cargos.component.css'],
})

export class EmplCargosComponent implements OnInit {
  ips_locales: any = '';

  @Input() datoEmpleado: any;

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
  administraF = new FormControl(false);
  fechaFinal = new FormControl('', Validators.required);
  idSucursal = new FormControl('', [Validators.required]);
  personalF = new FormControl(false);
  sueldo = new FormControl('', [Validators.required]);
  cargoF = new FormControl('', [Validators.minLength(3)]);
  tipoF = new FormControl('', Validators.required);
  jefeF = new FormControl(false);

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
    public ventana: VerEmpleadoComponent,
    public validar: ValidacionesService,
    public tipocargo: CatTipoCargosService,
  ) {
  }

  ngOnInit(): void {
    //console.log('datos ', this.datoEmpleado)
    this.idEmpleado = this.datoEmpleado.idEmpleado;
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.BuscarDatosContrato()
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.BuscarDatosCargo();
    this.BuscarUsuarioDepartamento();
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
    if (form.tipoForm === undefined || form.tipoForm === 'OTRO') {
      this.formulario.patchValue({
        cargoForm: '',
      });
      this.habilitarCargo = true;
      this.habilitarSeleccion = false;

      this.cargoF.setValidators([Validators.required, Validators.minLength(3)]);
      this.cargoF.updateValueAndValidity();

      this.tipoF.clearValidators();
      this.tipoF.setValue(null);
      this.tipoF.updateValueAndValidity();

      this.toastr.info('Ingresar nombre del nuevo cargo.', 'Etiqueta Cargo a desempeñar activa.', {
        timeOut: 4000,
      });

    } else {
      // Ocultar input, limpiar campo y revalidar correctamente
      this.habilitarCargo = false;
      this.habilitarSeleccion = true;

      this.cargoF.clearValidators();
      this.cargoF.setValue('');
      this.cargoF.updateValueAndValidity();

      this.tipoF.setValidators(Validators.required);
      this.tipoF.updateValueAndValidity();
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
    //console.log('fechas ', form.fecInicioForm, ' ----  ', form.fecFinalForm)
    // FORMATEAR FECHAS AL FORMATO YYYY-MM-DD
    let registro_inicio = this.validar.DarFormatoFecha(form.fecInicioForm, 'yyyy-MM-dd')!;
    let registro_fin = this.validar.DarFormatoFecha(form.fecFinalForm, 'yyyy-MM-dd')!;
    let contrato_inicio = DateTime.fromISO(this.contrato_actual.fecha_ingreso).toFormat('yyyy-MM-dd')!;
    let contrato_fin = DateTime.fromISO(this.contrato_actual.fecha_salida).toFormat('yyyy-MM-dd')!;

    // COMPARAR FECHAS INGRESADAS CON EL CONTRATO ACTUAL
    if ((contrato_inicio <= registro_inicio) &&
      (contrato_fin >= registro_fin)) {
      if (registro_inicio < registro_fin) {
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
      ip: this.ip, ip_local: this.ips_locales,
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
      this.toastr.warning('Existe un cargo en las fechas ingresadas.', 'Ups! algo salio mal.', {
        timeOut: 6000,
      });
    }, vacio => {
      if (!form.tipoForm || form.tipoForm === 'OTRO') {
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
      this.VerificarAsignaciones(form);
      this.CambiarEstado();
      this.CerrarVentana(2);
    });
  }

  // METODO PARA REGISTRAR TIPO CARGO
  IngresarTipoCargo(form: any, datos: any) {
    if (form.cargoForm != '') {
      let tipo_cargo = {
        cargo: form.cargoForm,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
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
      this.toastr.warning('El tipo de cargo registrado ya existe en el sistema.', 'Ups! algo salio mal.', {
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
  CerrarVentana(opcion: any) {
    this.LimpiarCampos();
    this.ventana.ver_contrato_cargo = true;
    this.ventana.crear_cargo = false;
    if (opcion === 2) {
      this.ventana.VerDatosActuales(this.ventana.formato_fecha);
    }
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
  listar_asignaciones: any = [];
  BuscarUsuarioDepartamento() {
    let datos = {
      id_empleado: this.idEmpleado,
    }
    this.listar_asignaciones = [];
    this.usuario.BuscarAsignacionesUsuario(datos).subscribe(res => {
      if (res != null) {
        this.listar_asignaciones = res;
      }
    });
  }

  // METODO PARA VERIFICAR ASIGNACIONES
  VerificarAsignaciones(form: any) {
    let principal_false = 0;
    let principal_true = 0;
    console.log('asignaciones ', this.listar_asignaciones)
    if (this.listar_asignaciones.length != 0) {
      this.listar_asignaciones.forEach((a: any) => {
        console.log('res dep ', form.idDeparForm)
        if (a.id_departamento === form.idDeparForm) {
          if (a.principal === false) {
            principal_false = a.id;
          }
          else if (a.principal === true) {
            principal_true = a.id;
          }
        }
        else if (a.principal === true) {
          principal_true = a.id;
        }
      })

      console.log('ver datos ', principal_false, ' true ', principal_true)
      if (principal_false != 0) {
        this.EliminarAsignacion(principal_true);
        this.ActualizarUsuarioDepartamento(form, principal_false);
      }
      else if (principal_true != 0) {
        this.ActualizarUsuarioDepartamento(form, principal_true);
      }
      else {
        this.IngresarUsuarioDepartamento(form);
      }
    }
    else {
      this.IngresarUsuarioDepartamento(form);
    }
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
      ip: this.ip, ip_local: this.ips_locales,
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
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.usuario.ActualizarUsuarioDepartamento(datos).subscribe(res => {
    });
  }

  // METODO PARA ELIMINAR ASIGNACION
  EliminarAsignacion(id: number) {
    const datos = {
      id: id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.usuario.EliminarUsuarioDepartamento(datos).subscribe(data => {
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
      ip: this.ip, ip_local: this.ips_locales,
    }
    if (this.cargo_id != 0) {
      this.cargos.EditarEstadoCargo(valores).subscribe(data => {
      });
    }
  }

}
