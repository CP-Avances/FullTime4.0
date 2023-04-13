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
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';

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

  buscador !: FormGroup;

  // FORMULARIO FILTROS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);

  // METODO PARA FILTROS
  filtroNombreSuc_: string = '';
  filtroNombreDep_: string = '';
  filtroCodigo_: number;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';

  idEmpleado: number;
  comunicados: any = [];

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];

  // FORMULARIO DE MENSAJE DE COMUNICADO
  tituloF = new FormControl('', [Validators.required]);
  mensajeF = new FormControl('', [Validators.required]);

  public comunicadoForm = new FormGroup({
    tituloForm: this.tituloF,
    mensajeForm: this.mensajeF,
  })

  constructor(
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private validar: ValidacionesService,
    private restR: ReportesService,
    private restP: ParametrosService,
    private data: ReportesAsistenciasService,
  ) {
    var item = localStorage.getItem('empleado');
    if (item) {
      this.idEmpleado = parseInt(item);
    }
  }


  ngOnInit(): void {
    this.check = this.restR.checkOptions(3);
    this.BuscarDatos();
    this.BuscarParametro();
  }

  // METODO PARA CERARR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion(0);
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // METODO DE VARIABLES DE ALMACENAMIENTO
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any = [];
  empleados: any = [];

  // METODO PARA CARGAR DATOS DE USUARIO
  BuscarDatos() {
    this.comunicados = [];
    this.data.DatosGeneralesUsuarios().subscribe((res: any[]) => {
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
            nombre: ele.name_dep
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
  opcion: number;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      default:
        break;
    }
  }

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

  // BUSQUEDA DE DATOS CON FILTROS
  get filtroNombreSuc() { return this.restR.filtroNombreSuc }
  get filtroNombreDep() { return this.restR.filtroNombreDep }
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };


  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

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
    if (this.opcion === 1) {
      this.ModelarSucursal(form);
    }
    else if (this.opcion === 2) {
      this.ModelarDepartamentos(form);
    }
    else {
      this.ModelarEmpleados(form);
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    this.comunicadoForm.reset();
    if (this._booleanOptions.bool_emp === true || this._booleanOptions.bool_tab === true ||
      this._booleanOptions.bool_inc === true) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this._booleanOptions.bool_tab = false;
      this._booleanOptions.bool_inc = false;
    }
    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
    }
    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
    }
    this.seleccion.reset();
  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    if (this.opcion === 1) {
      this.nombre_suc.reset();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 2) {
      this.nombre_dep.reset();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 3) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)
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
