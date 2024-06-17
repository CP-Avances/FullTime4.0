import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { VerEmpleadoComponent } from '../../ver-empleado/ver-empleado.component';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { CatTipoCargosService } from 'src/app/servicios/catalogos/catTipoCargos/cat-tipo-cargos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { firstValueFrom } from 'rxjs';

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
  ver_jefe: boolean = false;
  ver_personal: boolean = false;
  personal: boolean = false;
  idAsignacion: number;

  idEmpleadoAcceso: any;
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
  jefeF = new FormControl('');
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
    this.idEmpleadoAcceso = localStorage.getItem('empleado');
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    if (this.idRol != 2) {
      this.ver_jefe = true;
    }
    this.ObtenerAsignacionesUsuario(this.idEmpleadoAcceso);
    this.BuscarUsuarioDepartamento();
    this.ObtenerCargoEmpleado();
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
  }

  // METODO PARA LISTAR SUCURSALES
  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = this.FiltrarSucursalesAsignadas(datos);
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

    const promises = this.asignacionesAcceso.map((asignacion: any) => {
      if (asignacion.principal) {
        if (!asignacion.administra ) {
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        }
      }

      this.idDepartamentosAcceso = [...new Set([...this.idDepartamentosAcceso, asignacion.id_departamento])];
      this.idSucursalesAcceso = [...new Set([...this.idSucursalesAcceso, asignacion.id_sucursal])];

      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.usuario.ObtenerIdUsuariosDepartamento(data));
    });

    await Promise.all(promises);

  }

  // METODO PARA FILTRAR SUCURSALES ASIGNADAS
  FiltrarSucursalesAsignadas(data: any) {
    return data.filter((sucursal: any) => this.idSucursalesAcceso.includes(sucursal.id));
  }

  // METODO PARA LISTAR DEARTAMENTOS SEGUN SUCURSAL
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = this.FiltrarDepartamentosAsignados(datos);
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

  // METODO DE BUSQUEDA DE DEPARTAMENTOS
  ObtenerDepartamentosImprimir(id: number) {
    this.departamento = [];
    this.restCatDepartamento.BuscarDepartamentoSucursal(id).subscribe(datos => {
      this.departamento = this.FiltrarDepartamentosAsignados(datos);
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
          personalForm: this.personal,
        })
      });
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
    let datosBusqueda = {
      id_contrato: this.id_empl_contrato
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      if (Date.parse(response[0].fecha_ingreso.split('T')[0]) < Date.parse(form.fecInicioForm)) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
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
          'La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    });
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
    //console.log('ver cargo ', cargo)

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
      fecha_verificar: datos.fec_inicio
    }
    this.restEmplCargos.BuscarCargoFechaEditar(verficar).subscribe(res => {
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

  // METODO DE ALMACENAMIENTO DE DATOS EN EL SISTEMA
  AlmacenarDatos(form: any, datos: any) {
    this.restEmplCargos.ActualizarContratoEmpleado(this.idSelectCargo, this.id_empl_contrato, datos).subscribe(res => {
      this.verEmpleado.ObtenerCargoEmpleado(this.idSelectCargo, this.verEmpleado.formato_fecha);
      this.  ActualizarUsuarioDepartamento(form);
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
    //if (verificar.nombre === )
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

  Cancelar() {
    this.verEmpleado.VerCargoEdicion(true);
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
  BuscarUsuarioDepartamento() {
    let datos = {
      id_empleado: this.idEmpleado,
    }

    this.usuario.BuscarAsignacionUsuarioDepartamento(datos).subscribe(res => {
      if (res != null) {
        this.personal = res[0].personal;
        this.idAsignacion = res[0].id;
      }
    });
  }

  // METODO PARA ACTUALIZAR USUARIO - DEPARTAMENTO
  ActualizarUsuarioDepartamento(form: any) {
    let datos = {
      id: this.idAsignacion,
      id_departamento: form.idDeparForm,
      principal: true,
      personal: form.personalForm,
      administra: form.jefeForm,
      user_name: this.user_name,
      ip: this.ip,
    }
    this.usuario.ActualizarUsuarioDepartamento(datos).subscribe(res => {
    });
  }


}
