import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { DepartamentosService } from 'src/app/servicios/configuracion/localizacion/catDepartamentos/departamentos.service';
import { CatTipoCargosService } from 'src/app/servicios/configuracion/parametrizacion/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmplCargosService } from 'src/app/servicios/usuarios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/configuracion/localizacion/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario/usuario.service';

import { VerEmpleadoComponent } from '../../datos-empleado/ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-editar-cargo',
  templateUrl: './editar-cargo.component.html',
  styleUrls: ['./editar-cargo.component.css']
})

export class EditarCargoComponent implements OnInit {

  @Input() idSelectCargo: number;
  @Input() idEmpleado: string;
  @Input() idRol: number;

  // VARIABLES DE ALMACENAMIENTO
  departamento: any = [];
  sucursales: any = [];
  empresas: any = [];
  cargo: any = [];
  ver_personal: boolean = false;
  personal: boolean = false;
  idAsignacion: number;

  idEmpleadoAcceso: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  asignacionesAcceso: any;
  idSucursalesAcceso: any = [];
  idDepartamentosAcceso: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES DE FORMULARIO
  idDepartamento = new FormControl('', [Validators.required]);
  horaTrabaja = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idSucursal = new FormControl('', [Validators.required]);
  sueldo = new FormControl('', [Validators.required]);
  cargoF = new FormControl('', [Validators.minLength(3)]);
  tipoF = new FormControl('');
  jefeF = new FormControl();
  administraF = new FormControl();
  personalF = new FormControl(false);

  // AGREGAR CAMPOS A UN GRUPO
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

    personalForm: this.personalF,
    administraForm: this.administraF,
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restEmplCargos: EmplCargosService,
    private restSucursales: SucursalService,
    private restEmpleado: EmpleadoService,
    private verEmpleado: VerEmpleadoComponent,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private usuario: UsuarioService,
    public tipocargo: CatTipoCargosService,
  ) { }

  ngOnInit(): void {
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
    this.idEmpleadoAcceso = localStorage.getItem('empleado');
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerAsignacionesUsuario(this.idEmpleadoAcceso);
    this.BuscarUsuarioDepartamento();
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.ObtenerCargoEmpleado();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };

    console.log('id cargo ', this.idSelectCargo)
  }

  // BUSCAR DATOS DE CONTRATO
  contrato_actual: any = [];
  BuscarDatosContrato() {
    let datosBusqueda = {
      id_contrato: this.id_empl_contrato,
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      this.contrato_actual = response[0];
    });
  }

  // METODO PARA LISTAR SUCURSALES
  FiltrarSucursales() {
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

  // METODO PARA CONSULTAR ASIGNACIONES DE ACCESO
  async ObtenerAsignacionesUsuario(idEmpleado: any) {
    const dataEmpleado = {
      id_empleado: Number(idEmpleado)
    }

    const res = await firstValueFrom(this.usuario.BuscarUsuarioDepartamento(dataEmpleado));
    this.asignacionesAcceso = res;
    //console.log('res ', res)
    if (this.asignacionesAcceso) {
      this.asignacionesAcceso.map((asignacion: any) => {
        if (asignacion.principal && !asignacion.administra) {
          return;
        }
        this.idDepartamentosAcceso = [...new Set([...this.idDepartamentosAcceso, asignacion.id_departamento])];
        this.idSucursalesAcceso = [...new Set([...this.idSucursalesAcceso, asignacion.id_sucursal])];
      });
    }
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
  }

  // METODO PARA LISTAR DEARTAMENTOS SEGUN SUCURSAL
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

  // METODO DE BUSQUEDA DE DEPARTAMENTOS
  ObtenerDepartamentosImprimir(id: number) {
    this.departamento = [];
    this.restCatDepartamento.BuscarDepartamentoSucursal(id).subscribe(datos => {
      this.departamento = this.rolEmpleado === 1 ? datos : this.FiltrarDepartamentosAsignados(datos);
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA OBTENER DATOS DE CARGO
  id_empl_contrato: number;
  ObtenerCargoEmpleado() {
    this.restEmplCargos.BuscarCargoID(this.idSelectCargo).subscribe(res => {
      this.cargo = res;
      this.id_empl_contrato = this.cargo[0].id_contrato;
      this.cargo.forEach((obj: any) => {
        this.ObtenerDepartamentosImprimir(obj.id_sucursal);
        // FORMATEAR HORAS
        if (obj.hora_trabaja.split(':').length === 3) {
          this.horaTrabaja.setValue(obj.hora_trabaja.split(':')[0] + ':' + obj.hora_trabaja.split(':')[1]);
        }
        else if (obj.hora_trabaja.split(':').length === 2) {
          if (parseInt(obj.hora_trabaja.split(':')[0]) < 10) {
            this.horaTrabaja.setValue('0' + parseInt(obj.hora_trabaja.split(':')[0]) + ':00');
          }
          else {
            this.horaTrabaja.setValue(obj.hora_trabaja);
          }
        }
        this.formulario.patchValue({
          idSucursalForm: obj.id_sucursal,
          fecInicioForm: obj.fecha_inicio,
          fecFinalForm: obj.fecha_final,
          idDeparForm: obj.id_departamento,
          sueldoForm: obj.sueldo.split('.')[0],
          tipoForm: obj.id_tipo_cargo,
          jefeForm: obj.jefe,
          administraForm: this.administra,
          personalForm: this.personal,
        })
      });

      // BUSCAR DATOS DE CONTRATO
      this.BuscarDatosContrato();
    })
  }

  // METODO DE BUSQUEDA DE TIPO DE CARGOS
  tipoCargo: any = [];
  BuscarTiposCargos() {
    this.tipoCargo = [];
    this.restEmplCargos.ObtenerTipoCargos().subscribe(datos => {
      this.tipoCargo = datos;
      this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
    })
  }

  // METODO PARA VALIDAR INFORMACION
  ValidarDatosRegistro(form: any) {
    // FORMATEAR FECHAS AL FORMATO YYYY-MM-DD
    let registro_inicio = this.validar.DarFormatoFecha(form.fecInicioForm, 'yyyy-MM-dd');
    let registro_fin = this.validar.DarFormatoFecha(form.fecFinalForm, 'yyyy-MM-dd');
    let contrato_inicio = this.validar.DarFormatoFecha(this.contrato_actual.fecha_ingreso, 'yyyy-MM-dd');
    let contrato_fin = this.validar.DarFormatoFecha(this.contrato_actual.fecha_salida, 'yyyy-MM-dd');
    /*console.log('inicio ', registro_inicio)
    console.log('fin ', registro_fin)
    console.log('inicio ', contrato_inicio)
    console.log('fin ', contrato_fin)
    */
    // COMPARAR FECHAS INGRESADAS CON EL CONTRATO ACTUAL
    if ((contrato_inicio <= registro_inicio) &&
      (contrato_fin >= registro_fin)) {
      if (registro_inicio < registro_fin) {
        this.ActualizarEmpleadoCargo(form);
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

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarEmpleadoCargo(form: any) {
    let cargo = {
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
    // VERIFICAR DUPLICIDAD DE CONTRATOS
    this.ValidarFechasCargo(form, cargo);
  }


  // METODO PARA VALIDAR REGISTRO DE FECHAS DE CARGO
  ValidarFechasCargo(form: any, datos: any) {
    let verficar = {
      id_cargo: this.idSelectCargo,
      id_empleado: this.idEmpleado,
      fecha_inicio: datos.fec_inicio,
      fecha_fin: datos.fec_final
    }
    this.restEmplCargos.BuscarCargoFechaEditar(verficar).subscribe(res => {
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

  // METODO DE ALMACENAMIENTO DE DATOS EN EL SISTEMA
  AlmacenarDatos(form: any, datos: any) {
    this.restEmplCargos.ActualizarCargoEmpleado(this.idSelectCargo, this.id_empl_contrato, datos).subscribe(res => {
      this.verEmpleado.VerDatosActuales(this.verEmpleado.formato_fecha);
      if (this.verEmpleado.fechaICargo.value) {
        this.verEmpleado.ActualizarDatosCargoSeleccionado(this.verEmpleado.fechaICargo.value);
      }
      //console.log('estado', this.cargo[0].estado)
      if (this.cargo[0].estado === true) {
        this.VerificarAsignaciones(form);
      }
      this.Cancelar();
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA MOSTRAR INGRESO DE CARGO
  habilitarCargo: boolean = false;
  habilitarSeleccion: boolean = true;
  IngresarOtro(form: any) {
    if (form.tipoForm === undefined) {
      this.formulario.patchValue({
        cargoForm: '',
      });
      this.habilitarCargo = true;
      this.toastr.info('Ingresar nombre del nuevo cargo.', 'Etiqueta Cargo a desempeñar activa.', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // METODO PARA MOSTRAR LISTA DE TIPO CARGOS
  VerTiposCargos() {
    this.formulario.patchValue({
      cargoForm: '',
    });
    this.habilitarCargo = false;
    this.habilitarSeleccion = true;
  }

  // METODO PARA REGISTRAR TIPO CARGO
  IngresarTipoCargo(form: any, datos: any) {
    if (form.cargoForm != '') {
      let tipo_cargo = {
        cargo: form.cargoForm,
        user_name: this.user_name,
        ip: this.ip,
      }
      this.restEmplCargos.CrearTipoCargo(tipo_cargo).subscribe(res => {
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

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA FINALIZAR PROCESO
  Cancelar() {
    this.verEmpleado.btnActualizarCargo = false;
    this.verEmpleado.ver_contrato_cargo = true;
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
   **                             METODOS TABLA USUARIO - DEPARTAMENTO                                 ** **
   ** *************************************************************************************************** **/

  // METODO PARA BUSCAR USUARIO - DEPARTAMENTO
  administra: boolean;
  asignaciones: any = [];
  principal_false: number = 0;
  principal_true: number = 0;
  BuscarUsuarioDepartamento() {
    this.asignaciones = [];
    this.principal_false = 0;
    this.principal_true = 0;
    let datos = {
      id_empleado: this.idEmpleado,
    }
    this.usuario.BuscarAsignacionesUsuario(datos).subscribe(res => {
      if (res != null) {
        console.log('res ', res)
        this.asignaciones = res;
        this.asignaciones.forEach((a: any) => {
          if (a.principal === true) {
            this.personal = a.personal;
            this.administra = a.administra;
          }
        })
      }
    });
  }

  // METODO PARA VERIFICAR ASIGNACIONES
  VerificarAsignaciones(form: any) {
    this.asignaciones.forEach((a: any) => {
      //console.log('res dep ', form.idDeparForm)
      if (a.id_departamento === form.idDeparForm) {
        if (a.principal === false) {
          this.principal_false = a.id;
        }
        else if (a.principal === true) {
          this.principal_true = a.id;
        }
      }
      else if (a.principal === true) {
        this.principal_true = a.id;
      }
    })

    console.log('ver datos ', this.principal_false, ' true ', this.principal_true)
    if (this.principal_false != 0) {
      this.EliminarAsignacion(this.principal_true);
      this.ActualizarUsuarioDepartamento(form, this.principal_false);
    }
    else {
      this.ActualizarUsuarioDepartamento(form, this.principal_true);
    }
  }

  // METODO PARA ACTUALIZAR USUARIO - DEPARTAMENTO
  ActualizarUsuarioDepartamento(form: any, id_asignacion: any) {
    let datos = {
      id: id_asignacion,
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

  // METODO PARA ELIMINAR ASIGNACION
  EliminarAsignacion(id: number) {
    const datos = {
      id: id,
      user_name: this.user_name,
      ip: this.ip
    };
    this.usuario.EliminarUsuarioDepartamento(datos).subscribe(data => {
    });
  }


}
