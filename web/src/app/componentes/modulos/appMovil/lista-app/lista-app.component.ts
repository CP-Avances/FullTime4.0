import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { ITableEmpleados } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-lista-app',
  templateUrl: './lista-app.component.html',
  styleUrls: ['./lista-app.component.css']
})

export class ListaAppComponent implements OnInit {

  idEmpleadoLogueado: any;

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_carg = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };

  public check: checkOptions[];

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA HABILITADOS
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  cargos: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  pageSizeOptions_reg = [5, 10, 20, 50];
  tamanio_pagina_reg: number = 5;
  numero_pagina_reg: number = 1;

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

  // FILTRO CARGOS
  filtroNombreCarg_: string = '';
  get filtroNombreCarg() { return this.restR.filtroNombreCarg };

  // FILTRO REGIMEN
  filtroNombreReg_: string = '';
  get filtroNombreReg() { return this.restR.filtroNombreReg };


  /** ********************************************************************************************************************** **
   ** **                         INICIALIZAR VARIABLES DE USUARIOS DESHABILITADOS TIMBRE WEB                              ** ** 
   ** ********************************************************************************************************************** **/

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo_dh = new FormControl('');
  cedula_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_emp_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_dep_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_suc_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_reg_dh = new FormControl('', [Validators.minLength(2)]);
  nombre_carg_dh = new FormControl('', [Validators.minLength(2)]);
  seleccion_dh = new FormControl('');

  public _booleanOptions_dh: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_cargo: false,
  };

  public check_dh: checkOptions[];

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA DESHABILITADOS
  departamentos_dh: any = [];
  sucursales_dh: any = [];
  empleados_dh: any = [];
  respuesta_dh: any[];
  regimen_dh: any = [];
  cargos_dh: any = [];

  selectionSuc_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionCarg_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp_dh = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg_dh = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc_dh = [5, 10, 20, 50];
  tamanio_pagina_suc_dh: number = 5;
  numero_pagina_suc_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  pageSizeOptions_reg_dh = [5, 10, 20, 50];
  tamanio_pagina_reg_dh: number = 5;
  numero_pagina_reg_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  pageSizeOptions_car_dh = [5, 10, 20, 50];
  tamanio_pagina_car_dh: number = 5;
  numero_pagina_car_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep_dh = [5, 10, 20, 50];
  tamanio_pagina_dep_dh: number = 5;
  numero_pagina_dep_dh: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp_dh = [5, 10, 20, 50];
  tamanio_pagina_emp_dh: number = 5;
  numero_pagina_emp_dh: number = 1;

  // FILTROS SUCURSALES
  dh_filtroNombreSuc_: string = '';
  get dh_filtroNombreSuc() { return this.restR.filtroNombreSuc }

  // FILTROS DEPARTAMENTOS
  dh_filtroNombreDep_: string = '';
  get dh_filtroNombreDep() { return this.restR.filtroNombreDep }

  // FILTROS EMPLEADO
  dh_filtroCodigo_: any;
  dh_filtroCedula_: string = '';
  dh_filtroNombreEmp_: string = '';
  get dh_filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get dh_filtroCodigo() { return this.restR.filtroCodigo };
  get dh_filtroCedula() { return this.restR.filtroCedula };

  // FILTROS CARGOS
  dh_filtroNombreCarg_: string = '';
  get dh_filtroNombreCarg() { return this.restR.filtroNombreCarg };

  // FILTRO REGIMEN
  dh_filtroNombreReg_: string = '';
  get dh_filtroNombreReg() { return this.restR.filtroNombreReg };

  // HABILITAR O DESHABILITAR EL ICONO DE PROCESO INDIVIDUAL
  individual: boolean = true;
  individual_dh: boolean = true;

  get habilitarMovil(): boolean { return this.funciones.app_movil; }

  constructor(
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private funciones: MainNavService,
    public informacion: UsuarioService,
    public general: DatosGeneralesService,
    public restR: ReportesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarMovil === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.check = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'r' }, { opcion: 'c' }, { opcion: 'd' }, { opcion: 'e' }]);
      this.check_dh = this.restR.checkOptions([{ opcion: 's' }, { opcion: 'r' }, { opcion: 'c' }, { opcion: 'd' }, { opcion: 'e' }]);;
      this.PresentarInformacion();
    }
  }

  ngOnDestroy() {
    this.restR.GuardarCheckOpcion('');
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
  }

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  PresentarInformacion() {
    let informacion = { id_empleado: this.idEmpleadoLogueado };
    let respuesta: any = [];
    this.general.ObtenerInformacionUserRol(informacion).subscribe(res => {
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

    this.departamentos_dh = [];
    this.sucursales_dh = [];
    this.empleados_dh = [];
    this.regimen_dh = [];
    this.cargos_dh = [];

    this.usua_sucursales = [];
    let respuesta: any = [];
    let codigos = '';
    //console.log('empleado ', empleado)
    this.informacion.BuscarUsuarioSucursal(empleado).subscribe(data => {
      respuesta = data;
      respuesta.forEach((obj: any) => {
        if (codigos === '') {
          codigos = '\'' + obj.id_sucursal + '\''
        }
        else {
          codigos = codigos + ', \'' + obj.id_sucursal + '\''
        }
      })
      //console.log('ver sucursales ', codigos);

      // VERIFICACION DE BUSQUEDA DE INFORMACION SEGUN PRIVILEGIOS DE USUARIO
      if (usuario.id_rol === 1 && usuario.jefe === false) {
        this.usua_sucursales = { id_sucursal: codigos };
        this.BuscarInformacionAdministrador(this.usua_sucursales, false, this.sucursales_dh, this.regimen_dh, this.departamentos_dh, this.cargos_dh, this.empleados_dh);
        this.BuscarInformacionAdministrador(this.usua_sucursales, true, this.sucursales, this.regimen, this.departamentos, this.cargos, this.empleados);
      }
      else if (usuario.id_rol === 1 && usuario.jefe === true) {
        this.usua_sucursales = { id_sucursal: codigos, id_departamento: usuario.id_departamento };
        this.BuscarInformacionJefe(this.usua_sucursales, false, this.sucursales_dh, this.regimen_dh, this.departamentos_dh, this.cargos_dh, this.empleados_dh);
        this.BuscarInformacionJefe(this.usua_sucursales, true, this.sucursales, this.regimen, this.departamentos, this.cargos, this.empleados);
      }
      else if (usuario.id_rol === 3) {
        this.BuscarInformacionSuperAdministrador(false, this.sucursales_dh, this.regimen_dh, this.departamentos_dh, this.cargos_dh, this.empleados_dh);
        this.BuscarInformacionSuperAdministrador(true, this.sucursales, this.regimen, this.departamentos, this.cargos, this.empleados);
      }
    });
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL SUPERADMINISTRADOR
  BuscarInformacionSuperAdministrador(estado: any, sucursales_: any, regimenes_: any, departamentos_: any, cargos_: any, empleados_: any) {
    this.informacion.UsuariosTimbreMovil_SUPERADMIN(1, estado).subscribe((res: any[]) => {
      if (estado === false) {
        this.inactivar = true;
        this.ver_imagen = true;
      }
      else {
        this.activar = true;
        this.ver_imagen = true;
      }
      this.ProcesarDatos(res, sucursales_, regimenes_, departamentos_, cargos_, empleados_, estado);
    }, err => {
      if (estado === false) {
        this.inactivar = false;
      }
      else {
        this.activar = false;
      }
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR
  BuscarInformacionAdministrador(buscar: string, estado: any, sucursales_: any, regimenes_: any, departamentos_: any, cargos_: any, empleados_: any) {
    this.informacion.UsuariosTimbreMovil_ADMIN(1, estado, buscar).subscribe((res: any[]) => {
      if (estado === false) {
        this.inactivar = true;
        this.ver_imagen = true;
      }
      else {
        this.activar = true;
        this.ver_imagen = true;
      }
      this.ProcesarDatos(res, sucursales_, regimenes_, departamentos_, cargos_, empleados_, estado);
    }, err => {
      if (estado === false) {
        this.inactivar = false;
      }
      else {
        this.activar = false;
      }
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR - JEFE
  BuscarInformacionJefe(buscar: string, estado: any, sucursales_: any, regimenes_: any, departamentos_: any, cargos_: any, empleados_: any) {
    this.informacion.UsuariosTimbreMovil_JEFE(1, estado, buscar).subscribe((res: any[]) => {
      if (estado === false) {
        this.inactivar = true;
        this.ver_imagen = true;
      }
      else {
        this.activar = true;
        this.ver_imagen = true;
      }
      this.ProcesarDatos(res, sucursales_, regimenes_, departamentos_, cargos_, empleados_, estado);
    }, err => {
      if (estado === false) {
        this.inactivar = false;
      }
      else {
        this.activar = false;
      }
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any, sucursales_: any, regimenes_: any, departamentos_: any, cargos_: any, empleados_: any, estado: boolean) {
    informacion.forEach(obj => {
      //console.log('ver obj ', obj)
      sucursales_.push({
        id: obj.id_suc,
        sucursal: obj.name_suc
      })
    })

    informacion.forEach(reg => {
      reg.regimenes.forEach(obj => {
        regimenes_.push({
          id: obj.id_regimen,
          nombre: obj.name_regimen,
          sucursal: obj.name_suc,
          id_suc: reg.id_suc
        })
      })
    })

    informacion.forEach(reg => {
      reg.regimenes.forEach(dep => {
        dep.departamentos.forEach(obj => {
          departamentos_.push({
            id: obj.id_depa,
            departamento: obj.name_dep,
            sucursal: obj.name_suc,
            id_suc: reg.id_suc,
            id_regimen: obj.id_regimen,
          })
        })
      })
    })

    informacion.forEach(reg => {
      reg.regimenes.forEach(dep => {
        dep.departamentos.forEach(car => {
          car.cargos.forEach(obj => {
            cargos_.push({
              id: obj.id_cargo_,
              nombre: obj.name_cargo,
              sucursal: obj.name_suc,
              id_suc: reg.id_suc
            })
          })
        })
      })
    })

    informacion.forEach(reg => {
      reg.regimenes.forEach(dep => {
        dep.departamentos.forEach(car => {
          car.cargos.forEach(empl => {
            empl.empleado.forEach(obj => {
              let elemento = {
                id: obj.id,
                nombre: obj.nombre + ' ' + obj.apellido,
                codigo: obj.codigo,
                cedula: obj.cedula,
                sucursal: obj.name_suc,
                id_suc: obj.id_suc,
                id_regimen: obj.id_regimen,
                id_depa: obj.id_depa,
                id_cargo_: obj.id_cargo_, // TIPO DE CARGO
                web_habilita: obj.web_habilita,
                userid: obj.userid,
              }
              empleados_.push(elemento)
            })
          })
        })
      })
    })

    this.OmitirDuplicados(departamentos_, cargos_, estado);


    console.log('ver sucursales ', sucursales_)
    console.log('ver regimenes ', regimenes_)
    console.log('ver departamentos ', departamentos_)
    console.log('ver cargos ', cargos_)
    console.log('ver empleados ', empleados_)
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicados(departamentos_: any, cargos_: any, estado) {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = departamentos_.filter((objeto, indice, valor) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });


    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = cargos_.filter((objeto, indice, valor) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });

    if (estado === false) {
      this.departamentos_dh = verificados_dep;
      this.cargos_dh = verificados_car;

    } else {
      this.departamentos = verificados_dep;
      this.cargos = verificados_car;
    }

  }

  // CONTROL DE BOTONES
  activar: boolean = false;
  inactivar: boolean = false;
  ver_imagen: boolean = true;
  activar_habilitados: boolean = false;
  activar_deshabilitados: boolean = false;
  VerTablas(tipo: number) {
    this.activar = false;
    this.inactivar = false;
    this.ver_imagen = false;
    if (tipo === 1) {
      this.activar_habilitados = true;
    }
    else {
      this.activar_deshabilitados = true;
    }
  }


  /** ************************************************************************************************************** **
   ** **                        MANEJO DE DATOS DE USUARIOS DESHABILITADOS TIMBRE MOVIL                           ** **
   ** ************************************************************************************************************** **/

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple_dh: boolean = false;
  multiple_dh_: boolean = false;
  HabilitarSeleccion_dh() {
    this.multiple_dh = true;
    this.multiple_dh_ = true;
    this.individual_dh = false;
    this.activar_seleccion_dh = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion_dh: string;
  activar_boton_dh: boolean = false;
  activar_seleccion_dh: boolean = true;
  BuscarPorTipo_dh(e: MatRadioChange) {
    this.opcion_dh = e.value;
    this.activar_boton_dh = true;
    this.activar_habilitados = false;
    this.MostrarLista_DH();
    switch (this.opcion_dh) {
      case 's':
        this.ControlarOpcionesDeshabilitados(true, false, false, false, false);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
      case 'r':
        this.ControlarOpcionesDeshabilitados(false, false, false, false, true);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
      case 'c':
        this.ControlarOpcionesDeshabilitados(false, true, false, false, false);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
      case 'd':
        this.ControlarOpcionesDeshabilitados(false, false, true, false, false);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
      case 'e':
        this.ControlarOpcionesDeshabilitados(false, false, false, true, false);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
      default:
        this.ControlarOpcionesDeshabilitados(false, false, false, false, false);
        this.ControlarBotonesDeshabilitados(true, false, true);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions_dh);
    this.restR.GuardarCheckOpcion(this.opcion_dh)
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA
  ControlarOpcionesDeshabilitados(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: boolean) {
    this._booleanOptions_dh.bool_suc = sucursal;
    this._booleanOptions_dh.bool_reg = regimen;
    this._booleanOptions_dh.bool_cargo = cargo;
    this._booleanOptions_dh.bool_dep = departamento;
    this._booleanOptions_dh.bool_emp = empleado;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotonesDeshabilitados(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.activar_seleccion_dh = seleccion;
    this.multiple_dh = multiple;
    this.multiple_dh_ = multiple;
    this.individual_dh = individual;
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros_DH(valor: any) {
    let tipo: number = 1;
    if (this.opcion_dh === 's') {
      this.ModelarSucursal(valor.id, tipo, this.empleados_dh, this.selectionSuc_dh);
    }
    if (this.opcion_dh === 'r') {
      this.ModelarRegimen(valor.id, valor.id_suc, tipo, this.empleados_dh, this.selectionReg_dh);
    }
    else if (this.opcion_dh === 'c') {
      this.ModelarCargo(valor.id, valor.id_suc, tipo, this.empleados_dh, this.selectionCarg_dh);
    }
    else if (this.opcion_dh === 'd') {
      this.ModelarDepartamentos(valor.id, valor.id_suc, tipo, this.empleados_dh, this.selectionDep_dh);
    }
    else {
      this.ModelarEmpleados(tipo, this.empleados_dh, this.selectionEmp_dh);
    }
  }

  // MOSTRAR DATOS DE USUARIOS
  MostrarLista_DH() {
    if (this.opcion_dh === 's') {
      this.nombre_suc_dh.reset();
      this.dh_filtroNombreSuc_ = '';
      this.selectionEmp_dh.clear();
      this.selectionCarg_dh.clear();
      this.selectionSuc_dh.clear();
      this.selectionReg_dh.clear();
      this.Filtrar_DH('', 1)
    }
    else if (this.opcion_dh === 'r') {
      this.nombre_reg_dh.reset();
      this.dh_filtroNombreReg_ = '';
      this.nombre_suc_dh.reset();
      this.dh_filtroNombreSuc_ = '';
      this.selectionDep_dh.clear();
      this.selectionCarg_dh.clear();
      this.selectionEmp_dh.clear();
      this.selectionSuc_dh.clear();
      this.Filtrar_DH('', 1)
      this.Filtrar_DH('', 12)
    }
    else if (this.opcion_dh === 'c') {
      this.nombre_carg_dh.reset();
      this.dh_filtroNombreCarg_ = '';
      this.nombre_suc_dh.reset();
      this.dh_filtroNombreSuc_ = '';
      this.selectionEmp_dh.clear();
      this.selectionDep_dh.clear();
      this.selectionSuc_dh.clear();
      this.selectionReg_dh.clear();
      this.Filtrar_DH('', 1)
      this.Filtrar_DH('', 2)
    }
    else if (this.opcion_dh === 'd') {
      this.nombre_dep_dh.reset();
      this.dh_filtroNombreDep_ = '';
      this.nombre_suc_dh.reset();
      this.dh_filtroNombreSuc_ = '';
      this.selectionEmp_dh.clear();
      this.selectionCarg_dh.clear();
      this.selectionSuc_dh.clear();
      this.selectionReg_dh.clear();
      this.Filtrar_DH('', 1)
      this.Filtrar_DH('', 3)
    }
    else if (this.opcion_dh === 'e') {
      this.codigo_dh.reset();
      this.cedula_dh.reset();
      this.nombre_emp_dh.reset();
      this.dh_filtroCodigo_ = '';
      this.dh_filtroCedula_ = '';
      this.dh_filtroNombreEmp_ = '';
      this.nombre_suc_dh.reset();
      this.dh_filtroNombreSuc_ = '';
      this.selectionDep_dh.clear();
      this.selectionCarg_dh.clear();
      this.selectionSuc_dh.clear();
      this.selectionReg_dh.clear();
      this.Filtrar_DH('', 1)
      this.Filtrar_DH('', 4)
      this.Filtrar_DH('', 5)
      this.Filtrar_DH('', 6)
    }
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar_DH(e: any, orden: number) {
    this.ControlarFiltrado_DH(e);
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreCarg(e); break;
      case 3: this.restR.setFiltroNombreDep(e); break;
      case 4: this.restR.setFiltroCodigo(e); break;
      case 5: this.restR.setFiltroCedula(e); break;
      case 6: this.restR.setFiltroNombreEmp(e); break;
      case 12: this.restR.setFiltroNombreReg(e); break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado_DH(e: any) {
    if (e === '') {
      if (this.multiple_dh === true) {
        this.activar_seleccion_dh = false;
      }
      else {
        if (this.activar_seleccion_dh === false) {
          this.multiple_dh = true;
          this.individual_dh = false;
        }
      }
    }
    else {
      if (this.activar_seleccion_dh === true) {
        this.activar_seleccion_dh = false;
        this.multiple_dh_ = true;
        this.individual_dh = false;
      }
      else {
        this.multiple_dh = false;
      }
    }
  }

  /** ************************************************************************************** **
   ** **            METODOS DE SELECCION DE DATOS DE USUARIOS DESHABILITADOS              ** **
   ** ************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedSuc_DH() {
    const numSelected = this.selectionSuc_dh.selected.length;
    return numSelected === this.sucursales_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleSuc_DH() {
    this.isAllSelectedSuc_DH() ?
      this.selectionSuc_dh.clear() :
      this.sucursales_dh.forEach(row => this.selectionSuc_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedReg_DH() {
    const numSelected = this.selectionReg_dh.selected.length;
    return numSelected === this.regimen_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleReg_DH() {
    this.isAllSelectedReg_DH() ?
      this.selectionReg_dh.clear() :
      this.regimen_dh.forEach(row => this.selectionReg_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelReg_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedCarg_DH() {
    const numSelected = this.selectionCarg_dh.selected.length;
    return numSelected === this.cargos_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleCarg_DH() {
    this.isAllSelectedCarg_DH() ?
      this.selectionCarg_dh.clear() :
      this.cargos_dh.forEach(row => this.selectionCarg_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCarg_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCarg_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCarg_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedDep_DH() {
    const numSelected = this.selectionDep_dh.selected.length;
    return numSelected === this.departamentos_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleDep_DH() {
    this.isAllSelectedDep_DH() ?
      this.selectionDep_dh.clear() :
      this.departamentos_dh.forEach(row => this.selectionDep_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
  isAllSelectedEmp_DH() {
    const numSelected = this.selectionEmp_dh.selected.length;
    return numSelected === this.empleados_dh.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleEmp_DH() {
    this.isAllSelectedEmp_DH() ?
      this.selectionEmp_dh.clear() :
      this.empleados_dh.forEach(row => this.selectionEmp_dh.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp_DH(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp_DH() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp_dh.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO DE PAGINACION DE DATOS
  ManejarPaginaResultados_DH(e: PageEvent) {
    if (this._booleanOptions_dh.bool_suc === true) {
      this.tamanio_pagina_suc_dh = e.pageSize;
      this.numero_pagina_suc_dh = e.pageIndex + 1;
    }
    else if (this._booleanOptions_dh.bool_dep === true) {
      this.tamanio_pagina_dep_dh = e.pageSize;
      this.numero_pagina_dep_dh = e.pageIndex + 1;
    }
    else if (this._booleanOptions_dh.bool_emp === true) {
      this.tamanio_pagina_emp_dh = e.pageSize;
      this.numero_pagina_emp_dh = e.pageIndex + 1;
    }
    else if (this._booleanOptions_dh.bool_cargo === true) {
      this.tamanio_pagina_car_dh = e.pageSize;
      this.numero_pagina_car_dh = e.pageIndex + 1;
    }
    else if (this._booleanOptions_dh.bool_reg === true) {
      this.tamanio_pagina_reg_dh = e.pageSize;
      this.numero_pagina_reg_dh = e.pageIndex + 1;
    }
  }


  /** ************************************************************************************************************** **
   ** **                         MANEJO DE DATOS DE USUARIOS HABILITADOS TIMBRE MOVIL                             ** **
   ** ************************************************************************************************************** **/

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  multiple: boolean = false;
  multiple_: boolean = false;
  HabilitarSeleccion() {
    this.multiple = true;
    this.multiple_ = true;
    this.individual = false;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: string;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.activar_boton = true;
    this.activar_deshabilitados = false;
    this.MostrarLista();
    switch (this.opcion) {
      case 's':
        this.ControlarOpciones(true, false, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'r':
        this.ControlarOpciones(false, false, false, false, true);
        this.ControlarBotones(true, false, true);
        break;
      case 'c':
        this.ControlarOpciones(false, true, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'd':
        this.ControlarOpciones(false, false, true, false, false);
        this.ControlarBotones(true, false, true);
        break;
      case 'e':
        this.ControlarOpciones(false, false, false, true, false);
        this.ControlarBotones(true, false, true);
        break;
      default:
        this.ControlarOpciones(false, false, false, false, false);
        this.ControlarBotones(true, false, true);
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)
  }

  // METODO PARA CONTROLAR OPCIONES DE BUSQUEDA
  ControlarOpciones(sucursal: boolean, cargo: boolean, departamento: boolean, empleado: boolean, regimen: any) {
    this._booleanOptions.bool_suc = sucursal;
    this._booleanOptions.bool_reg = regimen;;
    this._booleanOptions.bool_cargo = cargo;
    this._booleanOptions.bool_dep = departamento;
    this._booleanOptions.bool_emp = empleado;
  }

  // METODO PARA CONTROLAR VISTA DE BOTONES
  ControlarBotones(seleccion: boolean, multiple: boolean, individual: boolean) {
    this.activar_seleccion = seleccion;
    this.multiple = multiple;
    this.multiple_ = multiple;
    this.individual = individual;
  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    this.ControlarFiltrado(e);
    switch (orden) {
      case 6: this.restR.setFiltroNombreSuc(e); break;
      case 7: this.restR.setFiltroNombreCarg(e); break;
      case 8: this.restR.setFiltroNombreDep(e); break;
      case 9: this.restR.setFiltroCodigo(e); break;
      case 10: this.restR.setFiltroCedula(e); break;
      case 11: this.restR.setFiltroNombreEmp(e); break;
      case 13: this.restR.setFiltroNombreReg(e); break;
      default:
        break;
    }
  }

  // METODO PARA CONTROLAR FILTROS DE BUSQUEDA
  ControlarFiltrado(e: any) {
    if (e === '') {
      if (this.multiple === true) {
        this.activar_seleccion = false;
      }
      else {
        if (this.activar_seleccion === false) {
          this.multiple = true;
          this.individual = false;
        }
      }
    }
    else {
      if (this.activar_seleccion === true) {
        this.activar_seleccion = false;
        this.multiple_ = true;
        this.individual = false;
      }
      else {
        this.multiple = false;
      }
    }
  }

  /** ************************************************************************************** **
   ** **            METODOS DE SELECCION DE DATOS DE USUARIOS HABILITADOS                 ** **
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
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
  masterToggleReg() {
    this.isAllSelectedReg() ?
      this.selectionReg.clear() :
      this.regimen.forEach(row => this.selectionReg.select(row));
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

  // METODO DE PAGINACION DE DATOS
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

  // METODO PARA PRESENTAR DATOS DE SUCURSALES
  ModelarSucursal(id: number, tipo: number, lista: any, selector: any) {
    let usuarios: any = [];
    if (id === 0) {
      lista.forEach((empl: any) => {
        selector.selected.find(selec => {
          if (empl.id_suc === selec.id) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      lista.forEach((empl: any) => {
        if (empl.id_suc === id) {
          usuarios.push(empl)
        }
      })
    }
    this.RegistrarMultiple(usuarios, tipo);
  }

  // METODO PARA PRESENTAR DATOS DE REGIMEN
  ModelarRegimen(id: number, sucursal: any, tipo: number, lista: any, selector: any) {
    let usuarios: any = [];
    if (id === 0) {
      lista.forEach((empl: any) => {
        selector.selected.find(selec => {
          if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      lista.forEach((empl: any) => {
        if (empl.id_regimen === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }
    this.RegistrarMultiple(usuarios, tipo);
  }

  // METODO PARA MOSTRAR DATOS DE CARGOS
  ModelarCargo(id: number, sucursal: any, tipo: number, lista: any, selector: any) {
    let usuarios: any = [];
    if (id === 0) {
      lista.forEach((empl: any) => {
        selector.selected.find(selec => {
          if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      lista.forEach((empl: any) => {
        if (empl.id_cargo_ === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }
    this.RegistrarMultiple(usuarios, tipo);
  }

  // METODO PARA PRESENTAR DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number, sucursal: any, tipo: number, lista: any, selector: any) {
    let usuarios: any = [];
    if (id === 0) {
      lista.forEach((empl: any) => {
        selector.selected.find(selec => {
          if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
            usuarios.push(empl)
          }
        })
      })
    }
    else {
      lista.forEach((empl: any) => {
        if (empl.id_depa === id && empl.id_suc === sucursal) {
          usuarios.push(empl)
        }
      })
    }
    this.RegistrarMultiple(usuarios, tipo);
  }

  // METODO PARA PRESENTAR DATOS DE EMPLEADO
  ModelarEmpleados(tipo: any, lista: any, selector: any) {
    let respuesta: any = [];
    lista.forEach((obj: any) => {
      selector.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.RegistrarMultiple(respuesta, tipo);
  }


  /** ************************************************************************************** **
   ** **               METODOS DE ACTUALIZACION DE ESTADO DE TIMBRE WEB                   ** ** 
   ** ************************************************************************************** **/

  RegistrarConfiguracion(usuario: any, tipo: number) {
    this.Registrar(usuario, tipo);
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  RegistrarMultiple(data: any, tipo: number) {
    if (data.length > 0) {
      this.Registrar(data, tipo);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA CONFIGURAR DATOS
  Registrar(seleccionados: any, tipo: number) {
    if (seleccionados.length === undefined) {
      seleccionados = [seleccionados];
    }
    this.informacion.ActualizarEstadoTimbreMovil(seleccionados).subscribe(res => {
      this.toastr.success(res.message)
      this.individual = true;
      this.individual_dh = true;
      this.LimpiarFormulario(tipo);
      this.PresentarInformacion();
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(valor: any) {
    let tipo: number = 2;
    if (this.opcion === 's') {
      this.ModelarSucursal(valor.id, tipo, this.empleados, this.selectionSuc);
    }
    if (this.opcion === 'r') {
      this.ModelarRegimen(valor.id, valor.id_suc, tipo, this.empleados, this.selectionReg);
    }
    else if (this.opcion === 'c') {
      this.ModelarCargo(valor.id, valor.id_suc, tipo, this.empleados, this.selectionCarg);
    }
    else if (this.opcion === 'd') {
      this.ModelarDepartamentos(valor.id, valor.id_suc, tipo, this.empleados, this.selectionDep);
    }
    else {
      this.ModelarEmpleados(tipo, this.empleados, this.selectionEmp);
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario(tipo: number) {

    this.activar_deshabilitados = false;
    this.activar_habilitados = false;

    if (this.sucursales.length > 0) {
      this.activar = true;
    }
    if (this.sucursales_dh.length > 0) {
      this.inactivar = true;
    }

    if (tipo === 2) {
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


      if (this._booleanOptions.bool_reg) {
        this.nombre_reg.reset();
        this._booleanOptions.bool_reg = false;
        this.selectionReg.deselect();
        this.selectionReg.clear();
      }

      this.seleccion.reset();
      this.activar_boton = false;
    }
    else {
      if (this._booleanOptions_dh.bool_emp) {
        this.codigo_dh.reset();
        this.cedula_dh.reset();
        this.nombre_emp_dh.reset();
        this._booleanOptions_dh.bool_emp = false;
        this.selectionEmp_dh.deselect();
        this.selectionEmp_dh.clear();
      }

      if (this._booleanOptions_dh.bool_dep) {
        this.nombre_dep_dh.reset();
        this._booleanOptions_dh.bool_dep = false;
        this.selectionDep_dh.deselect();
        this.selectionDep_dh.clear();
      }

      if (this._booleanOptions_dh.bool_suc) {
        this.nombre_suc_dh.reset();
        this._booleanOptions_dh.bool_suc = false;
        this.selectionSuc_dh.deselect();
        this.selectionSuc_dh.clear();
      }

      if (this._booleanOptions_dh.bool_cargo) {
        this._booleanOptions_dh.bool_cargo = false;
        this.selectionCarg_dh.deselect();
        this.selectionCarg_dh.clear();
      }


      if (this._booleanOptions_dh.bool_reg) {
        this.nombre_reg_dh.reset();
        this._booleanOptions_dh.bool_reg = false;
        this.selectionReg_dh.deselect();
        this.selectionReg_dh.clear();
      }

      this.seleccion_dh.reset();
      this.activar_boton_dh = false;
    }
  }

  // MOSTRAR DATOS DE USUARIO
  MostrarLista() {
    if (this.opcion === 's') {
      this.nombre_suc.reset();
      this.filtroNombreSuc_ = '';
      this.selectionDep.clear();
      this.selectionCarg.clear();
      this.selectionEmp.clear();
      this.selectionReg.clear();
      this.Filtrar('', 6)
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
      this.Filtrar('', 6)
      this.Filtrar('', 13)
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
      this.Filtrar('', 6)
      this.Filtrar('', 7)
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
      this.Filtrar('', 6)
      this.Filtrar('', 8)
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
      this.Filtrar('', 6)
      this.Filtrar('', 9)
      this.Filtrar('', 10)
      this.Filtrar('', 11)
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}