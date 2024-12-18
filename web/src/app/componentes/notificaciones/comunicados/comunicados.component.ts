// LIBRERIAS
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR MODELOS
import { ITableEmpleados } from 'src/app/model/reportes.model';

import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/avisos/real-time.service';

export interface EmpleadoElemento {
  comunicado_mail: boolean;
  comunicado_noti: boolean;
  id_recibe: number;
  apellido: string;
  nombre: string;
  codigo: number;
  correo: string;
}

@Component({
  selector: 'app-comunicados',
  templateUrl: './comunicados.component.html',
  styleUrls: ['./comunicados.component.css']
})

export class ComunicadosComponent implements OnInit {

  // FORMULARIO FILTROS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  idEmpleadoLogueado: any;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION

  idCargosAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };

  mostrarTablas: boolean = false;

  public check: checkOptions[];

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  pageSizeOptions_reg = [5, 10, 20, 50];
  tamanio_pagina_reg: number = 5;
  numero_pagina_reg: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  pageSizeOptions_car = [5, 10, 20, 50];
  tamanio_pagina_car: number = 5;
  numero_pagina_car: number = 1;

  // FILTROS SUCURSALES
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS;
  get filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  // FILTRO CARGO
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  // FILTRO REGIMEN
  get filtroNombreReg() { return this.restR.filtroNombreReg };

  // MODELO DE SELECCION DE DATOS
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

  // METODO DE VARIABLES DE ALMACENAMIENTO
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  cargos: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // FORMULARIO DE MENSAJE DE COMUNICADO
  tituloF = new FormControl('', [Validators.required]);
  mensajeF = new FormControl('', [Validators.required]);

  public comunicadoForm = new FormGroup({
    tituloForm: this.tituloF,
    mensajeForm: this.mensajeF,
  })

  constructor(
    private asignaciones: AsignacionesService,
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private restR: ReportesService,
    private restP: ParametrosService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);
    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;
    this.idSucursalesAcceso = this.asignaciones.idSucursalesAcceso;
    this.idUsuariosAcceso = this.asignaciones.idUsuariosAcceso;

    this.check = this.restR.checkOptions([{ opcion: 'c' }, { opcion: 'r' }, { opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
    this.BuscarInformacionGeneralComunicados();
  }

  // METODO PARA CERARR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIOS
  BuscarInformacionGeneralComunicados() {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionComunicados(1).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);

    // FILTROS POR ASIGNACION USUARIO - DEPARTAMENTO
    // SI ES SUPERADMINISTRADOR NO FILTRAR
    if (this.rolEmpleado !== 1) {
      this.empleados = this.empleados.filter((empleado: any) => this.idUsuariosAcceso.has(empleado.id));

      // SI EL EMPLEADO TIENE ACCESO PERSONAL AÑADIR LOS DATOS A LOS ACCESOS CORRESPONDIENTES PARA VISUALIZAR
      const empleadoSesion = this.empleados.find((empleado: any) => empleado.id === this.idEmpleadoLogueado);
      if (empleadoSesion) {
        this.idSucursalesAcceso.add(empleadoSesion.id_suc);
        this.idDepartamentosAcceso.add(empleadoSesion.id_depa);
        this.idCargosAcceso.add(empleadoSesion.id_cargo_);
      }

      this.departamentos = this.departamentos.filter((departamento: any) => this.idDepartamentosAcceso.has(departamento.id));
      this.sucursales = this.sucursales.filter((sucursal: any) => this.idSucursalesAcceso.has(sucursal.id));
      this.regimen = this.regimen.filter((regimen: any) => this.idSucursalesAcceso.has(regimen.id_suc));

      this.empleados.forEach((empleado: any) => {
        this.idCargosAcceso.add(empleado.id_cargo_);
      });

      this.cargos = this.cargos.filter((cargo: any) =>
        this.idSucursalesAcceso.has(cargo.id_suc) && this.idCargosAcceso.has(cargo.id)
      );
    }

    this.mostrarTablas = true;
  }

  // METODO PARA MOSTRAR OPCIONES DE SELECCION
  opcion: string;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.MostrarLista();
    switch (this.opcion) {
      case 's':
        this.ControlarOpciones(true, false, false, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'r':
        this.ControlarOpciones(false, false, false, false, true);
        this.ControlarBotones(true, false);
        break;
      case 'c':
        this.ControlarOpciones(false, true, false, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'd':
        this.ControlarOpciones(false, false, true, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'e':
        this.ControlarOpciones(false, false, false, true, false);
        this.ControlarBotones(true, false);
        break;
      default:
        this.ControlarOpciones(false, false, false, false, false);
        this.ControlarBotones(true, false);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)
  }

  // METODO PARA CONTROLAR VISUALIZACION DE OPCIONES
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_reg = regimen;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean) {
    this.activar_seleccion = seleccion;
    this.multiple = multiple;
    this.multiple_ = multiple;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreCarg(e); break;
      case 3: this.restR.setFiltroNombreDep(e); break;
      case 4: this.restR.setFiltroCodigo(e); break;
      case 5: this.restR.setFiltroCedula(e); break;
      case 6: this.restR.setFiltroNombreEmp(e); break;
      case 7: this.restR.setFiltroNombreReg(e); break;
      default:
        break;
    }
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple: boolean = false;
  multiple_: boolean = false;
  HabilitarSeleccion() {
    this.multiple = true;
    this.multiple_ = true;
    this.activar_seleccion = false;
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  activar_seleccion: boolean = true;
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.multiple === true) {
        this.activar_seleccion = false;
      }
      else {
        if (this.activar_seleccion === false) {
          this.multiple = true;
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.multiple_ = true;
      }
      else {
        this.multiple = false;
      }
    }
  }


  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }


  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedSuc() ?
      this.selectionReg.clear() :
      this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCarg() {
    const numSelected = this.selectionCarg.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCarg() {
    this.isAllSelectedCarg() ?
      this.selectionCarg.clear() :
      this.cargos.forEach((row: any) => this.selectionCarg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCarg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCarg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCarg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
  }

  // METODO PARA MOSTRAR DATOS DE SUCURSAL
  ModelarSucursal(form: any) {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionSuc.selected.find((selec: any) => {
        if (empl.id_suc === selec.id) {
          if (empl.comunicado_mail === true || empl.comunicado_noti === true) {
            usuarios.push(empl);
          }
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // CONSULTA DE LOS DATOS REGIMEN
  ModelarRegimen(form: any) {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionReg.selected.find((selec: any) => {
        if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
          if (empl.comunicado_mail === true || empl.comunicado_noti === true) {
            usuarios.push(empl);
          }
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // METODO PARA MOSTRAR DATOS DE EMPLEADO
  ModelarEmpleados(form: any) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find((obj1: any) => {
        if (obj1.id === obj.id) {
          if (obj.comunicado_mail === true || obj.comunicado_noti === true) {
            respuesta.push(obj)
          }
        }
      })
    })
    this.EnviarNotificaciones(respuesta, form);
  }

  // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(form: any) {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionDep.selected.find((selec: any) => {
        if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
          if (empl.comunicado_mail === true || empl.comunicado_noti === true) {
            usuarios.push(empl);
          }
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(form: any) {
    let usuarios: any = [];
    this.empleados.forEach((empl: any) => {
      this.selectionCarg.selected.find((selec: any) => {
        if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
          if (empl.comunicado_mail === true || empl.comunicado_noti === true) {
            usuarios.push(empl);
          }
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // VALIDACIONES PARA ENVIO DE CORREOS
  cont: number = 0;
  EnviarNotificaciones(data: any, form: any) {
    if (data.length > 0) {
      this.LeerCorreos(data);
      this.cont = 0;
      let ids = data
        .filter((obj: any) => obj.comunicado_noti === true)
        .map((obj: any) => obj.id);
      this.NotificarPlanificacion(this.idEmpleadoLogueado, ids, form);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIARSE
  info_correo: string = '';
  LeerCorreos(data: any) {
    this.info_correo = '';
    data.forEach((obj: any) => {
      if (obj.comunicado_mail === true) {
        if (this.info_correo === '') {
          this.info_correo = obj.correo;
        }
        else {
          this.info_correo = this.info_correo + ', ' + obj.correo;
        }
      }
    })
  }

  // METODO PARA NOTIFICACION DE COMUNICADO
  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, form) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      descripcion: form.tituloForm,
      mensaje: form.mensajeForm,
      tipo: 6,  // ES EL TIPO DE NOTIFICACION - COMUNICADOS
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.realTime.EnviarMensajeGeneralMultiple(mensaje).subscribe(res => {

      res.respuesta.forEach((notificaciones: any) => {
        this.realTime.RecibirNuevosAvisos(notificaciones);
      })

      if (this.info_correo === '') {
        this.toastr.success('Mensaje enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.EnviarCorreo(this.info_correo, form);
      }
      this.LimpiarFormulario();
    }, error => {
      console.log("Error al enviar mensaje general")
    })
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(form: any) {
    if (this.opcion === 's') {
      this.ModelarSucursal(form);
    }
    else if (this.opcion === 'c') {
      this.ModelarCargo(form);
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentos(form);
    }
    else if (this.opcion === 'r') {
      this.ModelarRegimen(form);
    }
    else {
      this.ModelarEmpleados(form);
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    this.comunicadoForm.reset();
    if (this._booleanOptions.bool_emp) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this.selectionEmp.deselect();
      this.selectionEmp.clear();
    }
    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this._booleanOptions.bool_dep = false;
      this.selectionDep.deselect();
      this.selectionDep.clear();
    }
    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
      this.selectionSuc.deselect();
      this.selectionSuc.clear();
    }
    if (this._booleanOptions.bool_reg) {
      this.nombre_reg.reset();
      this._booleanOptions.bool_reg = false;
      this.selectionReg.deselect();
      this.selectionReg.clear();
    }
    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }
    this.seleccion.reset();
  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'r') {
      this.nombre_reg.reset();
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 7)
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.nombre_suc.reset();;
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 2)
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.nombre_suc.reset();
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 3)
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.nombre_suc.reset();
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 4)
      this.Filtrar('', 5)
      this.Filtrar('', 6)
    }
  }

  // METODO USADO PARA ENVIAR COMUNICADO POR CORREO
  EnviarCorreo(correos: any, form: any) {
    let datosCorreo = {
      id_envia: this.idEmpleadoLogueado,
      mensaje: form.mensajeForm,
      correo: correos,
      asunto: form.tituloForm,
    }
    this.realTime.EnviarCorreoComunicado(datosCorreo).subscribe(envio => {
      if (envio.message === 'ok') {
        this.toastr.success('Mensaje enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups !!! algo salio mal', 'No fue posible enviar correo electrónico.', {
          timeOut: 6000,
        });
      }
    });
  }


  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR SOLO INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
