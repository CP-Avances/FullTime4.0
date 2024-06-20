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

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { firstValueFrom } from 'rxjs';

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
  asignacionesAcceso: any;
  idCargosAcceso: any = [];
  idUsuariosAcceso: any = [];
  idSucursalesAcceso: any = [];
  idDepartamentosAcceso: any = [];

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
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

  // FILTRO REGIMEN
  filtroNombreReg_: string = '';
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
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private restR: ReportesService,
    private restP: ParametrosService,
    private restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.check = this.restR.checkOptions([{ opcion: 'c' }, { opcion: 'r' }, { opcion: 's' }, { opcion: 'd' }, { opcion: 'e' }]);
    this.PresentarInformacion();
    this.BuscarParametro();
  }

  // METODO PARA CERARR PROCESOS
  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  async PresentarInformacion() {
    let informacion = { id_empleado: this.idEmpleadoLogueado };
    let respuesta: any = [];
    await this.ObtenerAsignacionesUsuario(this.idEmpleadoLogueado);
    this.informacion.ObtenerInformacionUserRol(informacion).subscribe(res => {
      respuesta = res[0];
      this.AdministrarInformacion(respuesta, informacion);
    }, vacio => {
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA BUSCAR SUCURSALES QUE ADMINSITRA EL USUARIO
  usua_sucursales: any = [];
  AdministrarInformacion(usuario: any, empleado: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];

    this.usua_sucursales = [];

    //console.log('empleado ', empleado)
    this.restUsuario.BuscarUsuarioSucursal(empleado).subscribe((data: any) => {
      const codigos = data.map((obj: any) => `'${obj.id_sucursal}'`).join(', ');
      //console.log('ver sucursales ', codigos);

      // VERIFICACION DE BUSQUEDA DE INFORMACION SEGUN PRIVILEGIOS DE USUARIO
      if (usuario.id_rol === 1 && usuario.jefe === false) {
        this.usua_sucursales = { id_sucursal: codigos };
        this.BuscarInformacionAdministrador(this.usua_sucursales);
      }
      else if (usuario.id_rol === 1 && usuario.jefe === true) {
        this.usua_sucursales = { id_sucursal: codigos, id_departamento: usuario.id_departamento };
        this.BuscarInformacionJefe(this.usua_sucursales);
      }
      else if (usuario.id_rol === 3) {
        this.BuscarInformacionSuperAdministrador();
      }
    });
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL SUPERADMINISTRADOR
  BuscarInformacionSuperAdministrador() {
    this.informacion.ObtenerInformacionComunicados_SUPERADMIN(1).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR
  BuscarInformacionAdministrador(buscar: string) {
    this.informacion.ObtenerInformacionComunicados_ADMIN(1, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR - JEFE
  BuscarInformacionJefe(buscar: string) {
    this.informacion.ObtenerInformacionComunicados_JEFE(1, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    //console.log('ver original ', this.origen)
    informacion.forEach((obj: any) => {
      //console.log('ver obj ', obj)
      this.sucursales.push({
        id: obj.id_suc,
        sucursal: obj.name_suc
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((obj: any) => {
        this.regimen.push({
          id: obj.id_regimen,
          nombre: obj.name_regimen,
          sucursal: obj.name_suc,
          id_suc: reg.id_suc
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((obj: any) => {
          this.departamentos.push({
            id: obj.id_depa,
            departamento: obj.name_dep,
            sucursal: obj.name_suc,
            id_suc: reg.id_suc,
            id_regimen: obj.id_regimen,
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((obj: any) => {
            this.cargos.push({
              id: obj.id_cargo_,
              nombre: obj.name_cargo,
              sucursal: obj.name_suc,
              id_suc: reg.id_suc
            })
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((empl: any) => {
            empl.empleado.forEach((obj: any) => {
              let elemento = {
                id: obj.id,
                nombre: obj.nombre + ' ' + obj.apellido,
                codigo: obj.codigo,
                cedula: obj.cedula,
                correo: obj.correo,
                id_cargo: obj.id_cargo,
                id_contrato: obj.id_contrato,
                sucursal: obj.name_suc,
                id_suc: obj.id_suc,
                id_regimen: obj.id_regimen,
                id_depa: obj.id_depa,
                id_cargo_: obj.id_cargo_, // TIPO DE CARGO
                comunicado_mail: obj.comunicado_mail,
                comunicado_noti: obj.comunicado_notificacion
              }
              this.empleados.push(elemento)
            })
          })
        })
      })
    })

    this.OmitirDuplicados();

    // FILTRO POR ASIGNACION USUARIO - DEPARTAMENTO

    this.empleados = this.empleados.filter((empleado: any) => this.idUsuariosAcceso.includes(empleado.id));
    this.departamentos = this.departamentos.filter((departamento: any) => this.idDepartamentosAcceso.includes(departamento.id));
    this.sucursales = this.sucursales.filter((sucursal: any) => this.idSucursalesAcceso.includes(sucursal.id));
    this.regimen = this.regimen.filter((regimen: any) => this.idSucursalesAcceso.includes(regimen.id_suc));

    this.empleados.forEach((empleado: any) => {
      this.idCargosAcceso = [...new Set([...this.idCargosAcceso, empleado.id_cargo_])];
    });

    this.cargos = this.cargos.filter((cargo: any) =>
      this.idSucursalesAcceso.includes(cargo.id_suc) && this.idCargosAcceso.includes(cargo.id)
    );
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicados() {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = this.departamentos.filter((objeto, indice, valor) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.departamentos = verificados_dep;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = this.cargos.filter((objeto, indice, valor) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.cargos = verificados_car;
  }

  // METODO PARA CONSULTAR ASIGNACIONES DE ACCESO
  async ObtenerAsignacionesUsuario(idEmpleado: any) {
    const dataEmpleado = {
      id_empleado: Number(idEmpleado)
    }

    let noPersonal: boolean = false;

    const res = await firstValueFrom(this.restUsuario.BuscarUsuarioDepartamento(dataEmpleado));
    this.asignacionesAcceso = res;

    const promises = this.asignacionesAcceso.map((asignacion: any) => {
      if (asignacion.principal) {
        if (!asignacion.administra && !asignacion.personal) {
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        } else if (asignacion.administra && !asignacion.personal) {
          noPersonal = true;
        } else if (asignacion.personal && !asignacion.administra) {
          this.idUsuariosAcceso.push(this.idEmpleadoLogueado);
          return Promise.resolve(null); // Devuelve una promesa resuelta para mantener la consistencia de los tipos de datos
        }
      }

      this.idDepartamentosAcceso = [...new Set([...this.idDepartamentosAcceso, asignacion.id_departamento])];
      this.idSucursalesAcceso = [...new Set([...this.idSucursalesAcceso, asignacion.id_sucursal])];

      const data = {
        id_departamento: asignacion.id_departamento
      }
      return firstValueFrom(this.restUsuario.ObtenerIdUsuariosDepartamento(data));
    });

    const results = await Promise.all(promises);

    const ids = results.flat().map((res: any) => res?.id).filter(Boolean);
    this.idUsuariosAcceso.push(...ids);

    if (noPersonal) {
      this.idUsuariosAcceso = this.idUsuariosAcceso.filter((id: any) => id !== this.idEmpleadoLogueado);
    }

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
      this.selectionSuc.selected.find(selec => {
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
      this.selectionReg.selected.find(selec => {
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
      this.selectionEmp.selected.find(obj1 => {
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
      this.selectionDep.selected.find(selec => {
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
      this.selectionCarg.selected.find(selec => {
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
      this.ContarCorreos(data);
      if (this.cont_correo <= this.correos) {
        this.cont = 0;
        data.forEach((obj: any) => {

          this.cont = this.cont + 1;

          if (obj.comunicado_noti === true) {
            this.NotificarPlanificacion(this.idEmpleadoLogueado, obj.id, form);
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
      tipo: 6,  // ES EL TIPO DE NOTIFICACION - COMUNICADOS
      user_name: this.user_name,
      ip: this.ip
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
      this.filtroNombreSuc_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 'r') {
      this.nombre_reg.reset();
      this.filtroNombreReg_ = '';
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionSuc.clear();
      this.Filtrar('', 1)
      this.Filtrar('', 7)
    }
    else if (this.opcion === 'c') {
      this.nombre_carg.reset();
      this.filtroNombreCarg_ = '';
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionEmp.clear();
      this.selectionDep.clear();
      this.selectionSuc.clear();
      this.selectionReg.clear();
      this.Filtrar('', 1)
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
      this.selectionReg.clear();
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
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
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

  // METODO PARA LEER NUMERO DE CORREOS PERMITIDOS
  correos: number = 0;
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
