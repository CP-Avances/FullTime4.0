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

import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

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
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  idEmpleado: number;
  comunicados: any = [];

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_cargo: false,
  };

  public check: checkOptions[];

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  pageSizeOptions_car = [5, 10, 20, 50];
  tamanio_pagina_car: number = 5;
  numero_pagina_car: number = 1;

  // FILTROS SUCURSALES
  filtroNombreSuc_: string = '';
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  filtroNombreDep_: string = '';
  get filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  filtroCodigo_: any;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  // FILTRO CARGO
  filtroNombreCarg_: string = '';
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  // MODELO DE SELECCION DE DATOS
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // METODO DE VARIABLES DE ALMACENAMIENTO
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any = [];
  empleados: any = [];

  // FORMULARIO DE MENSAJE DE COMUNICADO
  tituloF = new FormControl('', [Validators.required]);
  mensajeF = new FormControl('', [Validators.required]);

  public comunicadoForm = new FormGroup({
    tituloForm: this.tituloF,
    mensajeForm: this.mensajeF,
  })

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private restR: ReportesService,
    private restP: ParametrosService,
  ) {
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = parseInt(item);
    }
  }

  ngOnInit(): void {
    this.check = this.restR.checkOptions([{ opcion: 'c' }, { opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
    this.BuscarDatos();
    this.BuscarCargos();
    this.BuscarParametro();
  }

  // METODO PARA CERARR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.comunicados = [];
    this.origen_cargo = [];
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  cargos: any = [];
  BuscarCargos() {
    this.origen_cargo = [];
    this.informacion.ObtenerCargosComunicados().subscribe((res: any[]) => {
      this.origen_cargo = JSON.stringify(res);

      res.forEach(obj => {
        this.cargos.push({
          id: obj.id_cargo,
          nombre: obj.name_cargo,
        })
      })

      res.forEach(obj => {
        obj.empleados.forEach(r => {
          if (r.comunicado_mail === true || r.comunicado_noti === true) {
            this.empleados_cargos.push({
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula,
              correo: r.correo,
              comunicado_mail: r.comunicado_mail,
              comunicado_noti: r.comunicado_noti
            })
          }
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA CARGAR DATOS DE USUARIO
  BuscarDatos() {
    this.comunicados = [];
    this.informacion.ObtenerInformacionComunicados().subscribe((res: any[]) => {
      this.comunicados = JSON.stringify(res);

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
            nombre: ele.sucursal
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            if (r.comunicado_mail === true || r.comunicado_noti === true) {
              let elemento = {
                id: r.id,
                nombre: r.name_empleado,
                codigo: r.codigo,
                cedula: r.cedula,
                correo: r.correo,
                comunicado_mail: r.comunicado_mail,
                comunicado_noti: r.comunicado_noti,
              }
              this.empleados.push(elemento)
            }
          })
        })
      })
    }, err => {
      this.toastr.info(err.error.message)
    })
  }

  // METODO PARA MOSTRAR OPCIONES DE SELECCION
  opcion: string;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.MostrarLista();
    switch (this.opcion) {
      case 's':
        this.ControlarOpciones(true, false, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'c':
        this.ControlarOpciones(false, true, false, false);
        this.ControlarBotones(true, false);
        break;
      case 'd':
        this.ControlarOpciones(false, false, true, false);
        this.ControlarBotones(true, false);
        break;
      case 'e':
        this.ControlarOpciones(false, false, false, true);
        this.ControlarBotones(true, false);
        break;
      default:
        this.ControlarOpciones(false, false, false, false);
        this.ControlarBotones(true, false);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)
  }

  // METODO PARA CONTROLAR VISUALIZACION DE OPCIONES
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean) {
    this._booleanOptions.bool_suc = sucursal;
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
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

  // METODO PARA MANEJAR PAGINACION
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
    else if (this._booleanOptions.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
  }

  // METODO PARA MOSTRAR DATOS DE SUCURSAL
  ModelarSucursal(form: any) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.comunicados);
    respuesta.forEach((obj: any) => {
      this.selectionSuc.selected.find(obj1 => {
        if (obj.id_suc === obj1.id) {
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          })
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // METODO PARA MOSTRAR DATOS DE EMPLEADO
  ModelarEmpleados(form: any) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.EnviarNotificaciones(respuesta, form);
  }

  // METODO PARA MOSTRAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(form: any) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.comunicados);
    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((obj1: any) => {
        this.selectionDep.selected.find(obj2 => {
          if (obj1.id_depa === obj2.id) {
            obj1.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          }
        })
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(form: any) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen_cargo)
    respuesta.forEach((obj: any) => {
      this.selectionCarg.selected.find(obj1 => {
        if (obj.id_cargo === obj1.id) {
          obj.empleados.forEach((obj3: any) => {
            if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
              usuarios.push(obj3);
            }
          })
        }
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  // VALIDACIONES PARA ENVIO DE CORREOS
  cont: number = 0;
  EnviarNotificaciones(data: any, form) {
    if (data.length > 0) {
      this.ContarCorreos(data);
      if (this.cont_correo <= this.correos) {
        this.cont = 0;
        data.forEach((obj: any) => {

          this.cont = this.cont + 1;

          if (obj.comunicado_noti === true) {
            this.NotificarPlanificacion(this.idEmpleado, obj.id, form);
          }
          if (this.cont === data.length) {
            if (this.info_correo === '') {
              this.toastr.success('Mensaje enviado exitosamente.', '', {
                timeOut: 6000,
              });
            }
            else {
              this.EnviarCorreo(this.info_correo, form);
            }
            this.LimpiarFormulario();
            this.BuscarParametro();
          }
        })
      }
      else {
        this.toastr.warning('Trata de enviar un total de ' + this.cont_correo +
          ' correos, sin embargo solo tiene permitido enviar un total de ' + this.correos +
          ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIARSE
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      if (obj.comunicado_mail === true) {
        this.cont_correo = this.cont_correo + 1
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
      mensaje: form.tituloForm + '; ' + form.mensajeForm,
      tipo: 6,  // ES EL TIPO DE NOTIFICACIÓN - COMUNICADOS
    }
    this.realTime.EnviarMensajeGeneral(mensaje).subscribe(res => {
      this.realTime.RecibirNuevosAvisos(res.respuesta);
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
      this.filtroNombreSuc_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.filtroNombreCarg_ = '';
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 'd') {
      this.nombre_dep.reset();
      this.filtroNombreDep_ = '';
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionEmp.clear();
      this.selectionCarg.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 3)
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
      this.selectionSuc.clear();
      this.Filtrar('', 4)
      this.Filtrar('', 5)
      this.Filtrar('', 6)
    }
  }

  // METODO PARA LEER NUMERO DE CORREOS PERMITIDOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREO = 24
    let datos: any = [];
    this.restP.ListarDetalleParametros(24).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

  // METODO USADO PARA ENVIAR COMUNICADO POR CORREO
  EnviarCorreo(correos: any, form: any) {
    let datosCorreo = {
      id_envia: this.idEmpleado,
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
