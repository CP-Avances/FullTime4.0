import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
  rol: string;

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
    this.rol = localStorage.getItem('rol') as string;

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;

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
  async FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = this.rol === '1' ? datos : this.FiltrarSucursalesAsignadas(datos);
    }, error => {
      this.toastr.info('No se han encontrado registros de Sucursales.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.includes(sucursal.id));
  }

  // METODO PARA LISTAR DEPARTAMENTOS
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = this.rol === '1' ? datos : this.FiltrarDepartamentosAsignados(datos);
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA FILTRAR DEPARTAMENTOS ASIGNADOS
  FiltrarDepartamentosAsignados(data: any) {
    return data.filter((departamento: any) => this.idDepartamentosAcceso.includes(departamento.id));
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
      if (Date.parse(response[0].fecha_ingreso.split('T')[0]) < Date.parse(form.fecInicioForm)) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
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
          'La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    });
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
      this.toastr.warning('Existe un cargo vigente en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
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

}
