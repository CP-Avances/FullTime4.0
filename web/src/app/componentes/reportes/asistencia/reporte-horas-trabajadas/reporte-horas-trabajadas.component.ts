// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { TiempoLaboradoService } from 'src/app/servicios/reportes/tiempoLaborado/tiempo-laborado.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { IReporteHorasTrabaja } from 'src/app/model/reportes.model';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-reporte-horas-trabajadas',
  templateUrl: './reporte-horas-trabajadas.component.html',
  styleUrls: ['./reporte-horas-trabajadas.component.css']
})
export class ReporteHorasTrabajadasComponent implements OnInit, OnDestroy {

  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCIÓN DE BUSQUEDA DE DATOS SEGÚN OPCIÓN
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGÚN OPCIÓN SELECCIONADA
  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  data_pdf: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];
  origen: any = [];

  // VARIABLES PARA ALMACENAR TIEMPOS DE SALIDAS ANTICIPADAS
  tiempoDepartamentos: any = [];
  tiempoSucursales: any = [];
  tiempoRegimen: any = [];
  tiempoCargos: any = [];

  // VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  numero_pagina_suc: number = 1;
  tamanio_pagina_suc: number = 5;
  pageSizeOptions_suc = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  numero_pagina_reg: number = 1;
  tamanio_pagina_reg: number = 5;
  pageSizeOptions_reg = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  numero_pagina_car: number = 1;
  tamanio_pagina_car: number = 5;
  pageSizeOptions_car = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  numero_pagina_dep: number = 1;
  tamanio_pagina_dep: number = 5;
  pageSizeOptions_dep = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  numero_pagina_emp: number = 1;
  tamanio_pagina_emp: number = 5;
  pageSizeOptions_emp = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLE
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  constructor(
    private reportesTiempoLaborado: TiempoLaboradoService,
    private validacionService: ValidacionesService,
    private informacion: DatosGeneralesService,
    private reporteService: ReportesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
    public restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.PresentarInformacion(this.opcionBusqueda);
    this.BuscarParametro();
    this.BuscarHora();
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE HORA
  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  PresentarInformacion(opcion: any) {
    let informacion = { id_empleado: this.idEmpleadoLogueado };
    let respuesta: any = [];
    this.informacion.ObtenerInformacionUserRol(informacion).subscribe(res => {
      respuesta = res[0];
      this.AdministrarInformacion(opcion, respuesta, informacion);
    }, vacio => {
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA BUSCAR SUCURSALES QUE ADMINSITRA EL USUARIO
  usua_sucursales: any = [];
  AdministrarInformacion(opcion: any, usuario: any, empleado: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.origen = [];

    this.usua_sucursales = [];
    let respuesta: any = [];
    let codigos = '';
    //console.log('empleado ', empleado)
    this.restUsuario.BuscarUsuarioSucursal(empleado).subscribe(data => {
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
        this.BuscarInformacionAdministrador(opcion, this.usua_sucursales);
      }
      else if (usuario.id_rol === 1 && usuario.jefe === true) {
        this.usua_sucursales = { id_sucursal: codigos, id_departamento: usuario.id_departamento };
        this.BuscarInformacionJefe(opcion, this.usua_sucursales);
      }
      else if (usuario.id_rol === 3) {
        this.BuscarInformacionSuperAdministrador(opcion);
      }
    });
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL SUPERADMINISTRADOR
  BuscarInformacionSuperAdministrador(opcion: any) {
    this.informacion.ObtenerInformacion_SUPERADMIN(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR
  BuscarInformacionAdministrador(opcion: any, buscar: string) {
    this.informacion.ObtenerInformacion_ADMIN(opcion, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR - JEFE
  BuscarInformacionJefe(opcion: any, buscar: string) {
    this.informacion.ObtenerInformacion_JEFE(opcion, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.origen = JSON.stringify(informacion);
    informacion.forEach((suc: any) => {
      // LISTA SUCURSALES
      this.sucursales.push({
        id: suc.id_suc,
        sucursal: suc.name_suc,
        ciudad: suc.ciudad
      })
      // LISTA REGIMENES
      suc.regimenes.forEach((reg: any) => {
        this.regimen.push({
          id: reg.id_regimen,
          nombre: reg.name_regimen,
          sucursal: reg.name_suc,
          id_suc: suc.id_suc
        })
        // LISTA DEPARTAMENTOS
        reg.departamentos.forEach((dep: any) => {
          this.departamentos.push({
            id: dep.id_depa,
            departamento: dep.name_dep,
            sucursal: dep.name_suc,
            id_suc: suc.id_suc,
            id_regimen: dep.id_regimen,
          })
          // LISTA CARGOS
          dep.cargos.forEach((car: any) => {
            this.cargos.push({
              id: car.id_cargo_,
              nombre: car.name_cargo,
              sucursal: car.name_suc,
              id_suc: suc.id_suc
            })
            // LISTA EMPLEADOS
            car.empleado.forEach((empl: any) => {
              let elemento = {
                id: empl.id,
                nombre: empl.nombre,
                apellido: empl.apellido,
                codigo: empl.codigo,
                cedula: empl.cedula,
                correo: empl.correo,
                id_cargo: empl.id_cargo,
                id_contrato: empl.id_contrato,
                sucursal: empl.name_suc,
                id_suc: empl.id_suc,
                id_regimen: empl.id_regimen,
                id_depa: empl.id_depa,
                id_cargo_: empl.id_cargo_, // TIPO DE CARGO
                ciudad: empl.ciudad,
                regimen: empl.name_regimen,
                departamento: empl.name_dep,
                cargo: empl.name_cargo,
                hora_trabaja: empl.hora_trabaja
              }
              this.empleados.push(elemento)
            })
          })
        })
      })
    })
    // RETIRAR DATOS DUPLICADOS
    this.OmitirDuplicados();

    console.log('ver sucursales ', this.sucursales)
    console.log('ver regimenes ', this.regimen)
    console.log('ver departamentos ', this.departamentos)
    console.log('ver cargos ', this.cargos)
    console.log('ver empleados ', this.empleados)
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

  ObtenerTipoUsuario($event: string) {
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.PresentarInformacion(this.opcionBusqueda);
  }

  // VALIDACIONES DE OPCIONES DE REPORTE
  ValidarReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda.');

    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione sucursal.')
        this.ModelarSucursal(action);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione régimen.')
        this.ModelarRegimen(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione departamentos.')
        this.ModelarDepartamento(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione cargos.')
        this.ModelarCargo(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione empleados.')
        this.ModelarEmpleados(action);
        break;
      default:
        this.toastr.error('Ups !!! algo salio mal.', 'Seleccione criterio de búsqueda.')
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);
    let suc = respuesta.filter((empl: any) => {
      var bool = this.selectionSuc.selected.find(selec => {
        return empl.id_suc === selec.id
      })
      return bool != undefined;
    });
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      console.log('DATA PDF', this.data_pdf);
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen);
    let empleados: any = [];
    let reg: any = [];
    let objeto: any;
    respuesta.forEach((res: any) => {
      this.selectionReg.selected.find((selec: any) => {
        objeto = {
          regimen: {
            id: selec.id,
            nombre: selec.nombre,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_regimen && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
            });
          });
        });
        objeto.empleados = empleados;
        reg.push(objeto);
      });
    });
    this.data_pdf = [];
    this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen);
    let empleados: any = [];
    let dep: any = [];
    let objeto: any;
    respuesta.forEach((res: any) => {
      this.selectionDep.selected.find((selec: any) => {
        objeto = {
          depa: {
            id: selec.id,
            nombre: selec.departamento,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_depa && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
            });
          });
        });
        objeto.empleados = empleados;
        dep.push(objeto);
      });
    });
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen);
    let empleados: any = [];
    let car: any = [];
    let objeto: any;
    respuesta.forEach((res: any) => {
      this.selectionCar.selected.find((selec: any) => {
        objeto = {
          cargo: {
            id: selec.id,
            nombre: selec.nombre,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_cargo_ && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
            });
          });
        });
        objeto.empleados = empleados;
        car.push(objeto);
      });
    });
    this.data_pdf = [];
    this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      console.log('data pdf cargo', this.data_pdf);
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)
    respuesta.forEach((obj: any) => {
      obj.regimenes.forEach((regimen: any) => {
        regimen.departamentos.forEach((departamento: any) => {
          departamento.cargos.forEach((cargo: any) => {
            cargo.empleado = cargo.empleado.filter((o: any) => {
              var bool = this.selectionEmp.selected.find(selec => {
                return (selec.id === o.id && selec.id_suc === o.id_suc)
              })
              return bool != undefined
            })
          })
        });
      })
    })
    respuesta.forEach((obj: any) => {
      obj.regimenes.forEach((regimen: any) => {
        regimen.departamentos.forEach((departamento: any) => {
          departamento.cargos = departamento.cargos.filter((e: any) => {
            return e.empleado.length > 0
          })
        });
      });
    });
    let emp = respuesta.filter((obj: any) => {
      return obj.regimenes.length > 0
    });
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  /** ****************************************************************************************** **
   **                                              PDF                                           **
   ** ****************************************************************************************** **/

  GenerarPDF(action: any) {
    let documentDefinition: any;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.GetDocumentDefinicion();
    };

    let doc_name = `Tiempo_laborado_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  GetDocumentDefinicion() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        let f = moment();
        fecha = f.format('YYYY-MM-DD');
        let time = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `TIEMPO LABORADO - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 8, alignment: 'center', fillColor: '#EE4444' },
        itemsTableCentradoMenor: { fontSize: 8, alignment: 'right', fillColor: '#55EE44' },
        itemsTableCentradoColores: { fontSize: 9, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginColores: { margin: [0, 15, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    let totalTiempoLaboradoEmpleado: number = 0;
    let totalTiempoPlanificadoEmpleado: number = 0;
    let totalTiempoLaboradoSucursal: number = 0;
    let totalTiempoPlanificadoSucursal: number = 0;
    let totalTiempoLaboradoCargo = 0;
    let totalTiempoPlanificadoCargo = 0;
    let totalTiempoLaboradoRegimen = 0;
    let totalTiempoPlanificadoRegimen = 0;
    let totalTiempoLaboradoDepartamento = 0;
    let totalTiempoPlanificadoDepartamento = 0;
    this.tiempoDepartamentos = [];
    this.tiempoSucursales = [];
    this.tiempoRegimen = [];
    this.tiempoCargos = [];

    n.push({
      style: 'tableMarginColores',
      table: {
        widths: ['*', 'auto', 50, 'auto', 50],
        headerRows: 1,
        body: [
          [
            {
              text: 'CÓDIGO DE COLOR',
              style: 'itemsTableCentradoColores'
            },
            {
              text: 'FALTA TIMBRE',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoFT'
            },
            {
              text: 'TIEMPO LABORADO MENOR AL PLANIFICADO',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoMenor'
            },
          ]
        ]
      }
    });

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true || this.bool.bool_dep === true) {
      data.forEach((selec: any) => {
        if (this.bool.bool_cargo === true) {
          totalTiempoLaboradoCargo = 0;
          totalTiempoPlanificadoCargo = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'CARGO: ' + selec.cargo.nombre,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }
        else if (this.bool.bool_reg === true) {
          totalTiempoLaboradoRegimen = 0;
          totalTiempoPlanificadoRegimen = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'RÉGIMEN: ' + selec.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }
        else {
          totalTiempoPlanificadoDepartamento = 0;
          totalTiempoLaboradoDepartamento = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    text: 'DEPARTAMENTO: ' + selec.depa.nombre,
                    style: 'itemsTableInfo'
                  },
                ]
              ]
            }
          })
        }

        selec.empleados.forEach((empl: any) => {
          n.push({
            style: 'tableMarginCabeceraEmpleado',
            table: {
              widths: ['*', 'auto', 'auto'],
              headerRows: 2,
              body: [
                [
                  {
                    border: [false, true, false, false],
                    text: 'C.C.: ' + empl.cedula,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'COD: ' + empl.codigo,
                    style: 'itemsTableInfoEmpleado',
                  },
                ],
                [
                  {
                    border: [true, false, false, false],
                    text: 'DEPARTAMENTO: ' + empl.name_dep,
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, false, false],
                    text: this.bool.bool_reg || this.bool.bool_dep ? 'CARGO: ' + empl.name_cargo : '',
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, true, false],
                    text: '',
                    style: 'itemsTableInfoEmpleado'
                  }
                ]
              ],
            },
          });
          c = 0;
          totalTiempoLaboradoEmpleado = 0;
          totalTiempoPlanificadoEmpleado = 0;
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*', '*', '*'],
              headerRows: 2,
              body: [
                [
                  { rowSpan: 2, text: 'N°', style: 'centrado' },
                  { rowSpan: 2, text: 'FECHA', style: 'centrado' },
                  { colSpan: 2, rowSpan: 1, text: 'ENTRADA', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'SALIDA', style: 'tableHeader' },
                  {},
                  { rowSpan: 2, colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'centrado' },
                  {},
                  { rowSpan: 2, colSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                  {}
                ],
                [
                  {}, {},
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                  {}, {}, {}, {}
                ],
                ...empl.timbres.map((usu: any) => {
                  c = c + 1;

                  //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                  const fecha = this.validacionService.FormatearFecha(
                    usu.entrada.fec_horario,
                    this.formato_fecha,
                    this.validacionService.dia_abreviado);

                  const entradaHorario = this.validacionService.FormatearHora(usu.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
                  const salidaHorario = this.validacionService.FormatearHora(usu.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
                  const inicioAlimentacionHorario = usu.tipo == 'EAS'
                    ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                    : '';
                  const finAlimentacionHorario = usu.tipo == 'EAS'
                    ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                    : '';
                  const entrada = usu.entrada.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                  const salida = usu.salida.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                  const inicioAlimentacion = usu.tipo == 'EAS'
                    ? (usu.inicioAlimentacion.fec_hora_timbre != null
                      ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                      : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                    : '';
                  const finAlimentacion = usu.tipo == 'EAS'
                    ? (usu.finAlimentacion.fec_hora_timbre != null
                      ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                      : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                    : '';

                  const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
                  const minutosPlanificados = diferenciaEnMinutos[0];
                  const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
                  const minutosLaborados = diferenciaEnMinutos[1];
                  const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);

                  totalTiempoPlanificadoDepartamento += minutosPlanificados;
                  totalTiempoPlanificadoEmpleado += minutosPlanificados;
                  totalTiempoPlanificadoRegimen += minutosPlanificados;
                  totalTiempoPlanificadoCargo += minutosPlanificados;

                  totalTiempoLaboradoDepartamento += minutosLaborados;
                  totalTiempoLaboradoEmpleado += minutosLaborados;
                  totalTiempoLaboradoRegimen += minutosLaborados;
                  totalTiempoLaboradoCargo += minutosLaborados;
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: fecha },
                    { style: 'itemsTableCentrado', text: entradaHorario },
                    { style: entrada == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: entrada },
                    { style: 'itemsTableCentrado', text: inicioAlimentacionHorario },
                    { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                    { style: 'itemsTableCentrado', text: finAlimentacionHorario },
                    { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                    { style: 'itemsTableCentrado', text: salidaHorario },
                    { style: salida == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: salida },
                    { style: 'itemsTableDerecha', text: tiempoPlanificado },
                    { style: 'itemsTableDerecha', text: minutosPlanificados.toFixed(2) },
                    { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: tiempoLaborado },
                    { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: minutosLaborados.toFixed(2) },
                  ];
                }),
                [
                  {
                    border: [true, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                  { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoPlanificadoEmpleado.toFixed(2))) },
                  { style: 'itemsTableTotal', text: totalTiempoPlanificadoEmpleado.toFixed(2) },
                  { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoLaboradoEmpleado.toFixed(2))) },
                  { style: 'itemsTableTotal', text: totalTiempoLaboradoEmpleado.toFixed(2) },
                ],
              ],
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        });
        if (this.bool.bool_cargo) {
          totalTiempoPlanificadoCargo = Number(totalTiempoPlanificadoCargo.toFixed(2));
          totalTiempoLaboradoCargo = Number(totalTiempoLaboradoCargo.toFixed(2));
          let cargo = {
            cargo: selec.cargo.nombre,
            minutosPlanificados: totalTiempoPlanificadoCargo.toFixed(2),
            tiempoPlanificado: this.MinutosAHorasMinutosSegundos(totalTiempoPlanificadoCargo),
            minutosLaborados: totalTiempoLaboradoCargo.toFixed(2),
            tiempoLaborado: this.MinutosAHorasMinutosSegundos(totalTiempoLaboradoCargo)
          }
          this.tiempoCargos.push(cargo);
        };

        if (this.bool.bool_reg) {
          totalTiempoPlanificadoRegimen = Number(totalTiempoPlanificadoRegimen.toFixed(2));
          totalTiempoLaboradoRegimen = Number(totalTiempoLaboradoRegimen.toFixed(2));
          let regimen = {
            regimen: selec.regimen.nombre,
            minutosPlanificados: totalTiempoPlanificadoRegimen.toFixed(2),
            tiempoPlanificado: this.MinutosAHorasMinutosSegundos(totalTiempoPlanificadoRegimen),
            minutosLaborados: totalTiempoLaboradoRegimen.toFixed(2),
            tiempoLaborado: this.MinutosAHorasMinutosSegundos(totalTiempoLaboradoRegimen)
          }
          this.tiempoRegimen.push(regimen);
        };

        if (this.bool.bool_dep) {
          totalTiempoPlanificadoDepartamento = Number(totalTiempoPlanificadoDepartamento.toFixed(2));
          totalTiempoLaboradoDepartamento = Number(totalTiempoLaboradoDepartamento.toFixed(2));
          let departamento = {
            departamento: selec.depa.nombre,
            minutosPlanificados: totalTiempoPlanificadoDepartamento.toFixed(2),
            tiempoPlanificado: this.MinutosAHorasMinutosSegundos(totalTiempoPlanificadoDepartamento),
            minutosLaborados: totalTiempoLaboradoDepartamento.toFixed(2),
            tiempoLaborado: this.MinutosAHorasMinutosSegundos(totalTiempoLaboradoDepartamento)
          }
          this.tiempoDepartamentos.push(departamento);
        };
      });

      if (this.bool.bool_cargo) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL CARGOS',
                  style: 'itemsTableInfoTotal'
                },
                { colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'itemsTableInfoTotal' },
                {},
                { colSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
                {},
              ],
              ...this.tiempoCargos.map((cargo: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: cargo.cargo,
                    style: 'itemsTableCentrado'
                  },
                  { text: cargo.tiempoPlanificado, style: 'itemsTableDerecha' },
                  { text: cargo.minutosPlanificados, style: 'itemsTableDerecha' },
                  { text: cargo.tiempoLaborado, style: 'itemsTableDerecha' },
                  { text: cargo.minutosLaborados, style: 'itemsTableDerecha' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

      if (this.bool.bool_reg) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL REGIMENES',
                  style: 'itemsTableInfoTotal'
                },
                { colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'itemsTableInfoTotal' },
                {},
                { colSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
                {},
              ],
              ...this.tiempoRegimen.map((regimen: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: regimen.regimen,
                    style: 'itemsTableCentrado'
                  },
                  { text: regimen.tiempoPlanificado, style: 'itemsTableDerecha' },
                  { text: regimen.minutosPlanificados, style: 'itemsTableDerecha' },
                  { text: regimen.tiempoLaborado, style: 'itemsTableDerecha' },
                  { text: regimen.minutosLaborados, style: 'itemsTableDerecha' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

      if (this.bool.bool_dep) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL DEPARTAMENTOS',
                  style: 'itemsTableInfoTotal'
                },
                { colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'itemsTableInfoTotal' },
                {},
                { colSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
                {},
              ],
              ...this.tiempoDepartamentos.map((departamento: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: departamento.departamento,
                    style: 'itemsTableCentrado'
                  },
                  { text: departamento.tiempoPlanificado, style: 'itemsTableDerecha' },
                  { text: departamento.minutosPlanificados, style: 'itemsTableDerecha' },
                  { text: departamento.tiempoLaborado, style: 'itemsTableDerecha' },
                  { text: departamento.minutosLaborados, style: 'itemsTableDerecha' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

    } else {
      data.forEach((suc: any) => {

        totalTiempoPlanificadoSucursal = 0;
        totalTiempoLaboradoSucursal = 0;
        n.push({
          style: 'tableMarginCabecera',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'CIUDAD: ' + suc.ciudad,
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, true, true],
                  text: 'SUCURSAL: ' + suc.name_suc,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        })

        suc.regimenes.forEach((reg: any) => {
          reg.departamentos.forEach((dep: any) => {
            dep.cargos.forEach((car: any) => {
              car.empleado.forEach((empl: any) => {
                n.push({
                  style: 'tableMarginCabeceraEmpleado',
                  table: {
                    widths: ['*', 'auto', 'auto',],
                    headerRows: 2,
                    body: [
                      [
                        {
                          border: [false, true, false, false],
                          text: 'C.C.: ' + empl.cedula,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [true, true, false, false],
                          text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [false, true, true, false],
                          text: 'COD: ' + empl.codigo,
                          style: 'itemsTableInfoEmpleado'
                        }
                      ],
                      [
                        {
                          border: [true, false, false, false],
                          text: 'DEPARTAMENTO: ' + empl.name_dep,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [false, false, false, false],
                          text: 'CARGO: ' + empl.name_cargo,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [false, false, true, false],
                          text: '',
                          style: 'itemsTableInfoEmpleado'
                        }
                      ]
                    ]
                  }
                });
                c = 0;
                totalTiempoPlanificadoEmpleado = 0;
                totalTiempoLaboradoEmpleado = 0;
                n.push({
                  style: 'tableMargin',
                  table: {
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*', '*', '*'],
                    headerRows: 2,
                    body: [
                      [
                        { rowSpan: 2, text: 'N°', style: 'centrado' },
                        { rowSpan: 2, text: 'FECHA', style: 'centrado' },
                        { colSpan: 2, rowSpan: 1, text: 'ENTRADA', style: 'tableHeader' },
                        {},
                        { colSpan: 2, rowSpan: 1, text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                        {},
                        { colSpan: 2, rowSpan: 1, text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                        {},
                        { colSpan: 2, rowSpan: 1, text: 'SALIDA', style: 'tableHeader' },
                        {},
                        { rowSpan: 2, colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'centrado' },
                        {},
                        { rowSpan: 2, colSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                        {}
                      ],
                      [
                        {}, {},
                        { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                        { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                        { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                        { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                        { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                        { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                        { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                        { rowSpan: 1, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                        {}, {}, {}, {}
                      ],
                      ...empl.timbres.map((usu: any) => {
                        c = c + 1;

                        //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                        const fecha = this.validacionService.FormatearFecha(
                          usu.entrada.fec_horario,
                          this.formato_fecha,
                          this.validacionService.dia_abreviado);

                        const entradaHorario = this.validacionService.FormatearHora(usu.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
                        const salidaHorario = this.validacionService.FormatearHora(usu.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
                        const inicioAlimentacionHorario = usu.tipo == 'EAS'
                          ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                          : '';
                        const finAlimentacionHorario = usu.tipo == 'EAS'
                          ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                          : '';
                        const entrada = usu.entrada.fec_hora_timbre != null
                          ? this.validacionService.FormatearHora(usu.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
                          : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                        const salida = usu.salida.fec_hora_timbre != null
                          ? this.validacionService.FormatearHora(usu.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                          : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                        const inicioAlimentacion = usu.tipo == 'EAS'
                          ? (usu.inicioAlimentacion.fec_hora_timbre != null
                            ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                          : '';
                        const finAlimentacion = usu.tipo == 'EAS'
                          ? (usu.finAlimentacion.fec_hora_timbre != null
                            ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                          : '';

                        const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
                        const minutosPlanificados = diferenciaEnMinutos[0];
                        const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
                        const minutosLaborados = diferenciaEnMinutos[1];
                        const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);

                        totalTiempoPlanificadoEmpleado += minutosPlanificados;
                        totalTiempoPlanificadoDepartamento += minutosPlanificados;
                        totalTiempoPlanificadoSucursal += minutosPlanificados;
                        totalTiempoLaboradoEmpleado += minutosLaborados;
                        totalTiempoLaboradoDepartamento += minutosLaborados;
                        totalTiempoLaboradoSucursal += minutosLaborados;

                        return [
                          { style: 'itemsTableCentrado', text: c },
                          { style: 'itemsTableCentrado', text: fecha },
                          { style: 'itemsTableCentrado', text: entradaHorario },
                          { style: entrada == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: entrada },
                          { style: 'itemsTableCentrado', text: inicioAlimentacionHorario },
                          { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                          { style: 'itemsTableCentrado', text: finAlimentacionHorario },
                          { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                          { style: 'itemsTableCentrado', text: salidaHorario },
                          { style: salida == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: salida },
                          { style: 'itemsTableDerecha', text: tiempoPlanificado },
                          { style: 'itemsTableDerecha', text: minutosPlanificados.toFixed(2) },
                          { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: tiempoLaborado },
                          { style: minutosLaborados < minutosPlanificados ? 'itemsTableCentradoMenor' : 'itemsTableDerecha', text: minutosLaborados.toFixed(2) },
                        ];
                      }),
                      [
                        {
                          border: [true, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        {
                          border: [false, true, false, true],
                          text: '',
                          style: 'itemsTableCentradoTotal'
                        },
                        { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                        { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoPlanificadoEmpleado.toFixed(2))) },
                        { style: 'itemsTableTotal', text: totalTiempoPlanificadoEmpleado.toFixed(2) },
                        { style: 'itemsTableTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoLaboradoEmpleado.toFixed(2))) },
                        { style: 'itemsTableTotal', text: totalTiempoLaboradoEmpleado.toFixed(2) },
                      ],
                    ],
                  },
                  layout: {
                    fillColor: function (rowIndex: any) {
                      return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                    }
                  }
                });
              });
            });
          })
        })

        if (this.bool.bool_suc) {
          totalTiempoPlanificadoSucursal = Number(totalTiempoPlanificadoSucursal.toFixed(2));
          totalTiempoLaboradoSucursal = Number(totalTiempoLaboradoSucursal.toFixed(2));
          let sucursal = {
            sucursal: suc.name_suc,
            minutosPlanificados: totalTiempoPlanificadoSucursal.toFixed(2),
            tiempoPlanificado: this.MinutosAHorasMinutosSegundos(totalTiempoPlanificadoSucursal),
            minutosLaborados: totalTiempoLaboradoSucursal.toFixed(2),
            tiempoLaborado: this.MinutosAHorasMinutosSegundos(totalTiempoLaboradoSucursal)
          }
          this.tiempoSucursales.push(sucursal);
        };
      });
    }

    if (this.bool.bool_suc) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL SUCURSALES',
                style: 'itemsTableInfoTotal'
              },
              { colSpan: 2, text: 'TIEMPO PLANIFICADO', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
              {},
            ],
            ...this.tiempoSucursales.map((sucursal: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: sucursal.sucursal,
                  style: 'itemsTableCentrado'
                },
                { text: sucursal.tiempoPlanificado, style: 'itemsTableDerecha' },
                { text: sucursal.minutosPlanificados, style: 'itemsTableDerecha' },
                { text: sucursal.tiempoLaborado, style: 'itemsTableDerecha' },
                { text: sucursal.minutosLaborados, style: 'itemsTableDerecha' },
              ]
            })
          ]
        },
        layout: {
          fillColor: function (rowIndex: any) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    };

    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcelRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Tiempo_laborado');
        xlsx.writeFile(wb_regimen_cargo, `Tiempo_laborado_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Tiempo_laborado');
        xlsx.writeFile(wb, `Tiempo_laborado_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
    }
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((suc: any) => {
      suc.regimenes.forEach((reg: any) => {
        reg.departamentos.forEach((dep: any) => {
          dep.cargos.forEach((car: any) => {
            car.empleado.forEach((empl: any) => {
              empl.timbres.forEach((usu: any) => {
                n++;
                //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
                const entradaHorario = this.validacionService.FormatearHora(usu.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
                const salidaHorario = this.validacionService.FormatearHora(usu.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
                const inicioAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const finAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const entrada = usu.entrada.fec_hora_timbre != null
                  ? this.validacionService.FormatearHora(usu.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const salida = usu.salida.fec_hora_timbre != null
                  ? this.validacionService.FormatearHora(usu.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const inicioAlimentacion = usu.tipo == 'EAS'
                  ? (usu.inicioAlimentacion.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';
                const finAlimentacion = usu.tipo == 'EAS'
                  ? (usu.finAlimentacion.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';

                const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
                const minutosPlanificados = diferenciaEnMinutos[0];
                const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
                const minutosLaborados = diferenciaEnMinutos[1];
                const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
                let ele = {
                  'N°': n,
                  'Cédula': empl.cedula,
                  'Nombre Empleado': empl.apellido + ' ' + empl.nombre,
                  'Código': empl.codigo,
                  'Ciudad': empl.ciudad,
                  'Sucursal': empl.name_suc,
                  'Régimen': empl.name_regimen,
                  'Departamento': empl.name_dep,
                  'Cargo': empl.name_cargo,
                  'Fecha': new Date(usu.entrada.fec_hora_horario),
                  'Horario Entrada': entradaHorario,
                  'Timbre Entrada': entrada,
                  'Horario Inicio Alimentación': inicioAlimentacionHorario,
                  'Timbre Inicio Alimentación': inicioAlimentacion,
                  'Horario Fin Alimentación': finAlimentacionHorario,
                  'Timbre Fin Alimentación': finAlimentacion,
                  'Horario Salida': salidaHorario,
                  'Timbre Salida': salida,
                  'Tiempo Planificado HH:MM:SS': tiempoPlanificado,
                  'Tiempo Planificado Minutos': minutosPlanificados.toFixed(2),
                  'Tiempo Laborado HH:MM:SS': tiempoLaborado,
                  'Tiempo Laborado Minutos': minutosLaborados.toFixed(2),
                }
                nuevo.push(ele);
              })
            })
          })
        })
      })
    })
    return nuevo;
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.timbres.forEach((obj3: any) => {
          n++;
          //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
          const entradaHorario = this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = obj3.tipo == 'EAS'
            ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = obj3.tipo == 'EAS'
            ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = obj3.entrada.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const salida = obj3.salida.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const inicioAlimentacion = obj3.tipo == 'EAS'
            ? (obj3.inicioAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT'))
            : '';
          const finAlimentacion = obj3.tipo == 'EAS'
            ? (obj3.finAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT'))
            : '';

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(obj3);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);

          let ele = {
            'N°': n,
            'Cédula': empl.cedula,
            'Nombre Empleado': empl.name_empleado,
            'Código': empl.codigo,
            'Ciudad': empl.ciudad,
            'Sucursal': empl.sucursal,
            'Régimen': empl.name_regimen,
            'Departamento': empl.departamento,
            'Cargo': empl.name_cargo,
            'Fecha': new Date(obj3.entrada.fec_hora_horario),
            'Horario Entrada': entradaHorario,
            'Timbre Entrada': entrada,
            'Horario Inicio Alimentación': inicioAlimentacionHorario,
            'Timbre Inicio Alimentación': inicioAlimentacion,
            'Horario Fin Alimentación': finAlimentacionHorario,
            'Timbre Fin Alimentación': finAlimentacion,
            'Horario Salida': salidaHorario,
            'Timbre Salida': salida,
            'Tiempo Planificado HH:MM:SS': tiempoPlanificado,
            'Tiempo Planificado Minutos': minutosPlanificados.toFixed(2),
            'Tiempo Laborado HH:MM:SS': tiempoLaborado,
            'Tiempo Laborado Minutos': minutosLaborados.toFixed(2),
          }
          nuevo.push(ele);
        })
      })
    })
    return nuevo;
  }


  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerTimbres() {
    this.timbres = [];
    let n = 0;
    this.data_pdf.forEach((suc: any) => {
      suc.regimenes.forEach((reg: any) => {
        reg.departamentos.forEach((dep: any) => {
          dep.cargos.forEach((car: any) => {
            car.empleado.forEach((empl: any) => {
              empl.timbres.forEach((usu: any) => {
                //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                const fecha = this.validacionService.FormatearFecha(
                  usu.entrada.fec_horario,
                  this.formato_fecha,
                  this.validacionService.dia_abreviado);

                const entradaHorario = this.validacionService.FormatearHora(usu.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
                const salidaHorario = this.validacionService.FormatearHora(usu.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
                const inicioAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const finAlimentacionHorario = usu.tipo == 'EAS'
                  ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
                  : '';
                const entrada = usu.entrada.fec_hora_timbre != null
                  ? this.validacionService.FormatearHora(usu.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const salida = usu.salida.fec_hora_timbre != null
                  ? this.validacionService.FormatearHora(usu.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
                const inicioAlimentacion = usu.tipo == 'EAS'
                  ? (usu.inicioAlimentacion.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';
                const finAlimentacion = usu.tipo == 'EAS'
                  ? (usu.finAlimentacion.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
                  : '';

                const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
                const minutosPlanificados = diferenciaEnMinutos[0];
                const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
                const minutosLaborados = diferenciaEnMinutos[1];
                const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
                n = n + 1;
                const ele = {
                  n,
                  cedula: empl.cedula,
                  empleado: empl.apellido + ' ' + empl.nombre,
                  codigo: empl.codigo,
                  ciudad: empl.ciudad,
                  sucursal: empl.name_suc,
                  departamento: empl.name_dep,
                  regimen: empl.name_regimen,
                  fecha, entradaHorario,
                  entrada, salidaHorario,
                  salida,
                  inicioAlimentacionHorario,
                  inicioAlimentacion,
                  finAlimentacionHorario,
                  finAlimentacion,
                  tiempoPlanificado,
                  minutosPlanificados: minutosPlanificados.toFixed(2),
                  tiempoLaborado,
                  minutosLaborados: minutosLaborados.toFixed(2),
                }
                this.timbres.push(ele);
              })
            })
          })
        })
      })
    })
  }

  ExtraerTimbresRegimenCargo() {
    this.timbres = [];
    let n = 0;
    this.data_pdf.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.timbres.forEach((usu: any) => {
          //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
          const fecha = this.validacionService.FormatearFecha(
            usu.entrada.fec_horario,
            this.formato_fecha,
            this.validacionService.dia_abreviado);

          const entradaHorario = this.validacionService.FormatearHora(usu.entrada.fec_hora_horario.split(' ')[1], this.formato_hora);
          const salidaHorario = this.validacionService.FormatearHora(usu.salida.fec_hora_horario.split(' ')[1], this.formato_hora);
          const inicioAlimentacionHorario = usu.tipo == 'EAS'
            ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const finAlimentacionHorario = usu.tipo == 'EAS'
            ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_horario.split(' ')[1], this.formato_hora)
            : '';
          const entrada = usu.entrada.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(usu.entrada.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
          const salida = usu.salida.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(usu.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT');
          const inicioAlimentacion = usu.tipo == 'EAS'
            ? (usu.inicioAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(usu.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
            : '';
          const finAlimentacion = usu.tipo == 'EAS'
            ? (usu.finAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(usu.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (usu.origen === 'L' || usu.origen === 'FD' ? usu.origen : 'FT'))
            : '';

          const diferenciaEnMinutos = this.CalcularDiferenciaFechas(usu);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const tiempoPlanificado = this.MinutosAHorasMinutosSegundos(minutosPlanificados);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.MinutosAHorasMinutosSegundos(minutosLaborados);
          n = n + 1;
          const ele = {
            n,
            cedula: empl.cedula,
            empleado: empl.apellido + ' ' + empl.nombre,
            codigo: empl.codigo,
            ciudad: empl.ciudad,
            sucursal: empl.name_suc,
            departamento: empl.name_dep,
            regimen: empl.name_regimen,
            fecha, entradaHorario,
            entrada, salidaHorario, salida,
            inicioAlimentacionHorario,
            inicioAlimentacion,
            finAlimentacionHorario,
            finAlimentacion,
            tiempoPlanificado,
            minutosPlanificados: minutosPlanificados.toFixed(2),
            tiempoLaborado,
            minutosLaborados: minutosLaborados.toFixed(2),
          }
          this.timbres.push(ele);
        })
      })
    })
  }

  /** ****************************************************************************************** **
   ** **                                   CALCULOS Y CONVERSIONES                            ** **
   ** ****************************************************************************************** **/

  CalcularDiferenciaFechas(timbre: any) {
    if (timbre.origen === 'L' || timbre.origen === 'FD') {
      return [0, 0];
    }

    if (timbre.tipo === 'ES') {
      const { entrada, salida } = timbre;
      let minutosPlanificados = this.CalcularMinutosDiferencia(entrada.fec_hora_horario, salida.fec_hora_horario);

      if (entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null) {
        const minutosLaborados = this.CalcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre);
        return [minutosPlanificados, Number(minutosLaborados.toFixed(2))];
      }

      return [minutosPlanificados, 0];
    } else {
      const { entrada, inicioAlimentacion, finAlimentacion, salida } = timbre;
      const min_alimentacion: number = timbre.inicioAlimentacion.min_alimentacion;

      const minutosPlanificados = Number((this.CalcularMinutosDiferencia(entrada.fec_hora_horario, salida.fec_hora_horario) - min_alimentacion).toFixed(2));
      const minutosLaborados = entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null ? this.CalcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre) : 0;
      const minutosAlimentacion = inicioAlimentacion.fec_hora_timbre !== null && finAlimentacion.fec_hora_timbre !== null ? this.CalcularMinutosDiferencia(inicioAlimentacion.fec_hora_timbre, finAlimentacion.fec_hora_timbre) : min_alimentacion;
      return minutosLaborados == 0 ? [minutosPlanificados, minutosLaborados] : [minutosPlanificados, Number((minutosLaborados - minutosAlimentacion).toFixed(2))];
    }
  }

  CalcularMinutosDiferencia(inicio: any, fin: any): number {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
  }

  SegundosAMinutosConDecimales(segundos: number) {
    return Number((segundos / 60).toFixed(2));
  }

  MinutosAHorasMinutosSegundos(minutos: number) {
    let seconds = minutos * 60;
    let hour: string | number = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    let minute: string | number = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    let second: string | number = Number((seconds % 60).toFixed(0));
    second = (second < 10) ? '0' + second : second;
    return `${hour}:${minute}:${second}`;
  }

  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

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
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCar() {
    const numSelected = this.selectionCar.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar() ?
      this.selectionCar.clear() :
      this.cargos.forEach((row: any) => this.selectionCar.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCar(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCar() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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

  // METODO PARA EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this.bool.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
    else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA MANEJAR PAGINACION DETALLE
  ManejarPaginaDetalle(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }


  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  verDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg || this.bool.bool_dep) {
      this.ExtraerTimbresRegimenCargo();
    } else {
      this.ExtraerTimbres();
    }
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }

  //METODODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  obtenerClaseTiempo(planificado: any, laborado: any) {
    const tPlanificado = Number(planificado);
    const tLaborado = Number(laborado);
    if (tLaborado < tPlanificado) {
      return 'verde';
    }
  }

  ObtenerClaseTimbre(valor: any) {
    if (valor == 'FT') {
      return 'rojo';
    }
  }
}
