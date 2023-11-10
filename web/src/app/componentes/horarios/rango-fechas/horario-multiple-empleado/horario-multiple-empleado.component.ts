// IMPORTAR LIBRERIAS
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-horario-multiple-empleado',
  templateUrl: './horario-multiple-empleado.component.html',
  styleUrls: ['./horario-multiple-empleado.component.css']
})

export class HorarioMultipleEmpleadoComponent implements OnInit {

  // VARIABLES VISTA DE PANTALLAS
  seleccionar: boolean = true;
  asignar: boolean = false;
  ventana_horario: boolean = false;
  ventana_busqueda: boolean = false;

  idEmpleadoLogueado: any;

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  filtroNombreCarg_: string = '';
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  filtroNombreDep_: string = '';
  get filtroNombreDep() { return this.restR.filtroNombreDep };

  filtroCodigo_: any;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  filtroNombreSuc_: string = '';
  get filtroNombreSuc() { return this.restR.filtroNombreSuc };

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_dep: false,
    bool_emp: false,
    bool_cargo: false,
  };

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  origen: any = [];

  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  pageSizeOptions_car = [5, 10, 20, 50];
  tamanio_pagina_car: number = 5;
  numero_pagina_car: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  public check: checkOptions[];

  constructor(
    public informacion: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public restCargo: EmplCargosService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NUMEROS
    public restR: ReportesService,
    public plan: PlanGeneralService,
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.check = this.restR.checkOptions([{ opcion: 'c' }, { opcion: 'd' }, { opcion: 'e' }]);
    this.BuscarInformacion();
    this.BuscarCargos();
  }

  // METODO PARA DESTRUIR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.origen = [];
    this.origen_cargo = [];
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  cargos: any = [];
  BuscarCargos() {
    this.informacion.ObtenerInformacionCargo(1).subscribe((res: any[]) => {
      this.origen_cargo = JSON.stringify(res);

      res.forEach(obj => {
        this.cargos.push({
          id: obj.id_cargo,
          nombre: obj.name_cargo
        })
      })

      res.forEach(obj => {
        obj.empleados.forEach(r => {
          this.empleados_cargos.push({
            id: r.id,
            nombre: r.name_empleado,
            codigo: r.codigo,
            cedula: r.cedula,
            correo: r.correo,
            id_cargo: r.id_cargo,
            id_contrato: r.id_contrato,
            hora_trabaja: r.hora_trabaja
          })
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA BUSCAR INFORMACION DE USUARIOS
  BuscarInformacion() {
    this.origen = [];
    this.informacion.ObtenerInformacion(1).subscribe((res: any[]) => {
      this.origen = JSON.stringify(res);

      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            departamento: ele.name_dep,
            nombre: ele.sucursal,
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula,
              correo: r.correo,
              id_cargo: r.id_cargo,
              id_contrato: r.id_contrato,
              hora_trabaja: r.hora_trabaja
            }
            this.empleados.push(elemento)
          })
        })
      })

    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: string;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.activar_boton = true;
    this.MostrarLista();
    switch (this.opcion) {
      case 'c':
        this.ControlarOpciones(true, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'd':
        this.ControlarOpciones(false, true, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'e':
        this.ControlarOpciones(false, false, true);
        this.ControlarBotones(true, false, true);
        break;
      default:
        this.ControlarOpciones(false, false, false);
        this.ControlarBotones(true, false, true);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.activar_seleccion = seleccion;
    this.plan_multiple = multiple;
    this.plan_multiple_ = multiple;
    this.auto_individual = individual;
  }

  ControlarOpciones(cargo: boolean, departamento: boolean, empleado: boolean,) {
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreCarg(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      case 6: this.restR.setFiltroNombreSuc(e); break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.plan_multiple === true) {
        this.activar_seleccion = false;
      }
      else {
        if (this.activar_seleccion === false) {
          this.plan_multiple = true;
          this.auto_individual = false;
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.plan_multiple_ = true;
        this.auto_individual = false;
      }
      else {
        this.plan_multiple = false;
      }
    }
  }

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedCarg() {
    const numSelected = this.selectionCarg.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleCarg() {
    this.isAllSelectedCarg() ?
      this.selectionCarg.clear() :
      this.cargos.forEach(row => this.selectionCarg.select(row));
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
      this.departamentos.forEach(row => this.selectionDep.select(row));
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
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // EVENTO DE PAGINACION DE TABLAS
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(id: number, tipo: string) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen_cargo)
    if (id === 0) {
      respuesta.forEach((obj: any) => {
        this.selectionCarg.selected.find(obj1 => {
          if (obj.id_cargo === obj1.id) {
            obj.empleados.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        if (obj.id_cargo === id) {
          obj.empleados.forEach((obj3: any) => {
            usuarios.push(obj3)
          })
        }
      })
    }
    if (tipo === 'p') {
      this.PlanificarMultiple(usuarios);
    }
    else if (tipo === 'b') {
      this.VerPlanificacion(usuarios);
    }
    else if (tipo === 'e') {
      this.EliminarHorarios(usuarios);
    }
    else if (tipo === 'm') {
      this.PlanificarRotativos(usuarios);
    }
  }

  // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number, tipo: string) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen)

    if (id === 0) {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          this.selectionDep.selected.find(obj2 => {
            if (obj1.id_depa === obj2.id) {
              obj1.empleado.forEach((obj3: any) => {
                usuarios.push(obj3)
              })
            }
          })
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          if (obj1.id_depa === id) {
            obj1.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    }

    if (tipo === 'p') {
      this.PlanificarMultiple(usuarios);
    }
    else if (tipo === 'b') {
      this.VerPlanificacion(usuarios);
    }
    else if (tipo === 'e') {
      this.EliminarHorarios(usuarios);
    }
    else if (tipo === 'm') {
      this.PlanificarRotativos(usuarios);
    }
  }

  // METODO PARA MOSTRAR DATOS DE EMPLEADOS
  ModelarEmpleados(tipo: string) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })

    if (tipo === 'p') {
      this.PlanificarMultiple(respuesta);
    }
    else if (tipo === 'b') {
      this.VerPlanificacion(respuesta);
    }
    else if (tipo === 'e') {
      this.EliminarHorarios(respuesta);
    }
    else if (tipo === 'm') {
      this.PlanificarRotativos(respuesta);
    }
  }


  /** ************************************************************************************** **
   ** **                     METODOS DE PLANIFICACION DE HORARIOS                         ** ** 
   ** ************************************************************************************** **/

  // METODO PARA ABRI VENTANA DE ASIGNACION DE HORARIO
  idCargo: any;
  data_horario: any = [];
  PlanificarIndividual(usuario: any, tipo: string): void {
    if (tipo === 'p') {
      this.seleccionar = false;
      this.ventana_horario = true;
      this.data_horario = {
        pagina: 'rango_fecha',
        codigo: usuario.codigo,
        idCargo: usuario.id_cargo,
        idEmpleado: usuario.id,
        horas_trabaja: usuario.hora_trabaja,
      }
    }
    else {
      this.VerPlanificacion([usuario]);
    }
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  PlanificarMultiple(data: any) {
    if (data.length > 0) {
      this.Planificar(data);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA INGRESAR PLANIFICACION DE HORARIOS A VARIOS EMPLEADOS
  seleccionados: any = [];
  Planificar(seleccionados: any) {
    if (seleccionados.length === 1) {
      this.PlanificarIndividual(seleccionados[0], 'p');
    } else {
      this.seleccionados = seleccionados;
      this.seleccionar = false;
      this.asignar = true;
    }
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE - ROTATIVOS
  plan_rotativo: boolean = false;
  data_rotativo: any = []
  PlanificarRotativos(data: any) {
    console.log('data rotativos ', data)
    this.data_horario = [];
    if (data.length > 0) {
      this.data_horario = {
        usuarios: data,
        pagina: 'multiple-empleado',
      }
      this.seleccionar = false;
      this.plan_rotativo = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(id: number, tipo: string) {
    if (this.opcion === 'c') {
      this.ModelarCargo(id, tipo);
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentos(id, tipo);
    }
    else {
      this.ModelarEmpleados(tipo);
    }
  }

  // METODO PARA MOSTRAR METODOS DE CONSULTAS
  MostrarLista() {
    if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.filtroNombreCarg_ = '';
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.filtroNombreDep_ = '';
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 2)
      this.Filtrar('', 6)
    }
    else if (this.opcion === 'e') {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.filtroCodigo_ = '';
      this.filtroCedula_ = '';
      this.filtroNombreEmp_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    if (this._booleanOptions.bool_emp === true) {

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
      this.selectionDep.clear();
      this.selectionDep.deselect();
    }

    if (this._booleanOptions.bool_cargo) {
      this._booleanOptions.bool_cargo = false;
      this.selectionCarg.deselect();
      this.selectionCarg.clear();
    }

    this.seleccion.reset();
    this.activar_boton = false;
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VER PLANIFICACION
  resultados: any = [];
  VerPlanificacion(data: any) {
    console.log('VerPlanificacion',data);
    if (data.length > 0) {
      this.resultados = data;
      this.seleccionar = false;
      this.ventana_busqueda = true;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VER PANTALLA DETALLE HORARIO
  ver_horario: boolean = false;
  horario_id: number;
  pagina: string = '';
  VerDetalleHorario(id: number) {
    this.ver_horario = true;
    this.horario_id = id;
    this.pagina = 'planificar';
  }

  /** ********************************************************************************************* **
   ** **                               ELIMINAR PLANIFICACIONES HORARIAS                         ** **
   ** ********************************************************************************************* **/
  eliminar_plan: boolean = false;
  eliminar_horarios: any = [];
  EliminarHorarios(respuesta: any) {
    if (respuesta.length > 0) {
      this.eliminar_horarios = {
        pagina: 'planificar',
        usuario: respuesta
      }
      this.eliminar_plan = true;
      this.seleccionar = false;
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  /** **************************************************************************************** **
   ** **                          METODO DE REGISTRO DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // VENTANA PARA REGISTRAR PLANIFICACION DE HORARIOS DEL EMPLEADO 
  rotativo: any = []
  registrar_rotativo: boolean = false;
  AbrirMultipleIndividual(usuario: any): void {
    //console.log('ver usuario ', usuario)
    this.rotativo = {
      idCargo: usuario.id_cargo,
      codigo: usuario.codigo,
      pagina: 'mutiple-horario',
      idEmpleado: usuario.id,
      horas_trabaja: usuario.hora_trabaja,
    }
    this.registrar_rotativo = true;
    this.seleccionar = false;
  }

}
