// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR MODELOS
import { ITableEmpleados, IReporteTimbres } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-timbre-virtual',
  templateUrl: './timbre-virtual.component.html',
  styleUrls: ['./timbre-virtual.component.css']
})

export class TimbreVirtualComponent implements OnInit, OnDestroy {

  get timbreDispositivo() { return this.reporteService.mostrarTimbreDispositivo };

  get rangoFechas() { return this.reporteService.rangoFechas };

  get opcion() { return this.reporteService.opcion };

  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];
  origen: any = [];

  data_pdf: any = [];

  // ESTADO HORA SERVIDOR
  dispositivo: boolean = false;

  //VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

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

  // FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }

  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  constructor(
    private R_asistencias: ReportesAsistenciasService,
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
    if (parseInt(localStorage.getItem('rol') as string) === 1) {
      this.dispositivo = true;
    }
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.AdministrarSucursalesUsuario(this.opcionBusqueda);
    this.BuscarParametro();
    this.BuscarHora();
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
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

  // METODO PARA BUSCAR SUCURSALES QUE ADMINSITRA EL USUARIO
  usua_sucursales: any = [];
  AdministrarSucursalesUsuario(opcion: number) {
    let empleado = { id_empleado: this.idEmpleadoLogueado };
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
      console.log('ver sucursales ', codigos);
      this.usua_sucursales = { id_sucursal: codigos };
      this.BuscarInformacion(opcion, this.usua_sucursales);
      this.BuscarCargos(opcion, this.usua_sucursales);
    });
  }

  // METODO DE BUSQUEDA DE DATOS
  BuscarInformacion(opcion: number, buscar: any) {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.origen = [];
    this.informacion.ObtenerInformacion(opcion, buscar).subscribe(
      (res: any[]) => {
        this.origen = JSON.stringify(res);
        res.forEach((obj: any) => {
          this.sucursales.push({
            id: obj.id_suc,
            nombre: obj.name_suc,
          });
        });

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            this.departamentos.push({
              id: departamento.id_depa,
              departamento: departamento.name_dep,
              nombre: departamento.sucursal,
            });
          });
        });

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            departamento.empleado.forEach((r: any) => {
              let elemento = {
                id: r.id,
                nombre: r.name_empleado,
                codigo: r.codigo,
                cedula: r.cedula,
                correo: r.correo,
                cargo: r.cargo,
                id_contrato: r.id_contrato,
                hora_trabaja: r.hora_trabaja,
                sucursal: r.sucursal,
                departamento: r.departamento,
                ciudad: r.ciudad,
                regimen: r.regimen,
              };
              this.empleados.push(elemento);
            });
          });
        });

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            departamento.empleado.forEach((reg: any) => {
              reg.regimen.forEach((r: any) => {
                this.regimen.push({
                  id: r.id_regimen,
                  nombre: r.name_regimen,
                });
              });
            });
          });
        });

        this.regimen = this.regimen.filter(
          (obj: any, index: any, self: any) => index === self.findIndex((o: any) => o.id === obj.id)
        );
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  BuscarCargos(opcion: number, buscar: any) {
    this.empleados_cargos = [];
    this.origen_cargo = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionCargo(opcion, buscar).subscribe(
      (res: any[]) => {
        this.origen_cargo = JSON.stringify(res);

        res.forEach((obj: any) => {
          this.cargos.push({
            id: obj.id_cargo,
            nombre: obj.name_cargo,
          });
        });

        res.forEach((obj: any) => {
          obj.empleados.forEach((r: any) => {
            this.empleados_cargos.push({
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula,
              correo: r.correo,
              ciudad: r.ciudad,
              id_cargo: r.id_cargo,
              id_contrato: r.id_contrato,
              hora_trabaja: r.hora_trabaja,
            });
          });
        });
      });
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
    this.AdministrarSucursalesUsuario(this.opcionBusqueda);
  }

  // VALIDACIONES REPORTES
  ValidarReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda.')

    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione sucursal.')
        this.ModelarSucursal(action);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione régimen.')
        this.ModelarRegimen(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione departamentos.')
        this.ModelarDepartamento(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione cargos.')
        this.ModelarCargo(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione empleados.')
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

    let suc = respuesta.filter((o: any) => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreRelojVirtual(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.VerDatos(); break;
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
    respuesta.forEach((obj: any) => {
      this.selectionReg.selected.find((regimen) => {
        objeto = {
          regimen: {
            id: regimen.id,
            nombre: regimen.nombre,
          },
        };
        empleados = [];
        obj.departamentos.forEach((departamento: any) => {
          departamento.empleado.forEach((empleado: any) => {
            empleado.regimen.forEach((r: any) => {
              if (regimen.id === r.id_regimen) {
                empleados.push(empleado);
              }
            });
          });
        });
        objeto.empleados = empleados;
        reg.push(objeto);
      });
    });

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreRelojVirtualRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o: any) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreRelojVirtualRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);

    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((o: any) => {
        var bool = this.selectionDep.selected.find(obj1 => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter((obj: any) => {
      return obj.departamentos.length > 0
    });
    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreRelojVirtual(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  // TRATAMIENTO DE DATOS POR EMPLEADOS
  ModelarEmpleados(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((departamento: any) => {
        departamento.empleado = departamento.empleado.filter((o: any) => {
          var bool = this.selectionEmp.selected.find(obj1 => {
            return obj1.id === o.id
          })
          return bool != undefined
        })
      });
    })
    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((e: any) => {
        return e.empleado.length > 0
      })
    });

    let emp = respuesta.filter((obj: any) => {
      return obj.departamentos.length > 0
    });

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreRelojVirtual(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.VerDatos(); break;
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
    }

    let doc_name = `Timbres_virtuales_movil_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `TIMBRES (APLICACIÓN MÓVIL) - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    var accionT: string = '';

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1) => {
        let arr_reg = obj1.empleados.map((o: any) => { return o.timbres.length })
        let reg = this.SumarRegistros(arr_reg);
        if (this.bool.bool_cargo === true) {
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
                    text: 'CARGO: ' + obj1.name_cargo,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, true],
                    text: 'N° Registros: ' + reg,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        } else {
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
                    text: 'RÉGIMEN: ' + obj1.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, true],
                    text: 'N° Registros: ' + reg,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }

        obj1.empleados.forEach((obj2: any) => {
          n.push({
            style: 'tableMarginCabeceraEmpleado',
            table: {
              widths: ['*', 'auto', 'auto'],
              headerRows: 2,
              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + obj2.name_empleado,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, false, false],
                    text: 'C.C.: ' + obj2.cedula,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'COD: ' + obj2.codigo,
                    style: 'itemsTableInfoEmpleado',
                  },
                ],
                [
                  {
                    border: [true, false, false, false],
                    text: 'DEPARTAMENTO: ' + obj2.departamento,
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, false, false],
                    text: this.bool.bool_reg ? 'CARGO: ' + obj2.cargo : '',
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, true, false],
                    text: '',
                    style: 'itemsTableInfoEmpleado'
                  }
                ]
              ]
            },
          });
          c = 0;
          if (this.timbreDispositivo === true) {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    {},
                    { colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                  ],
                  [
                    {},
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    {}, {}, {}, {}, {}
                  ],
                  ...obj2.timbres.map((obj3: any) => {
                    let servidor_fecha = '';
                    let servidor_hora = '';
                    if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                      servidor_fecha = this.validacionService.FormatearFecha(
                        obj3.fec_hora_timbre_servidor.split(' ')[0],
                        this.formato_fecha,
                        this.validacionService.dia_abreviado);
                      servidor_hora = this.validacionService.FormatearHora(
                        obj3.fec_hora_timbre_servidor.split(' ')[1],
                        this.formato_hora);
                    }

                    const fechaTimbre = this.validacionService.FormatearFecha(
                      obj3.fec_hora_timbre.split(' ')[0],
                      this.formato_fecha,
                      this.validacionService.dia_abreviado);

                    const horaTimbre = this.validacionService.FormatearHora(
                      obj3.fec_hora_timbre.split(' ')[1],
                      this.formato_hora);

                    switch (obj3.accion) {
                      case 'EoS': accionT = 'Entrada o salida'; break;
                      case 'AES': accionT = 'Inicio o fin alimentación'; break;
                      case 'PES': accionT = 'Inicio o fin permiso'; break;
                      case 'E': accionT = 'Entrada'; break;
                      case 'S': accionT = 'Salida'; break;
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/P': accionT = 'Inicio permiso'; break;
                      case 'F/P': accionT = 'Fin permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    }

                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: servidor_fecha },
                      { style: 'itemsTable', text: servidor_hora },
                      { style: 'itemsTable', text: fechaTimbre },
                      { style: 'itemsTable', text: horaTimbre },
                      { style: 'itemsTableCentrado', text: obj3.id_reloj },
                      { style: 'itemsTableCentrado', text: accionT },
                      { style: 'itemsTable', text: obj3.observacion },
                      { style: 'itemsTable', text: obj3.longitud },
                      { style: 'itemsTable', text: obj3.latitud },
                    ]
                  })

                ]
              },
              layout: {
                fillColor: function (rowIndex: any) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            })
          } else {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' },
                  ],
                  [
                    {},
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    {}, {}, {}, {}, {}
                  ],
                  ...obj2.timbres.map((obj3: any) => {
                    let servidor_fecha = '';
                    let servidor_hora = '';
                    if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                      servidor_fecha = this.validacionService.FormatearFecha(
                        obj3.fec_hora_timbre_servidor.split(' ')[0],
                        this.formato_fecha,
                        this.validacionService.dia_abreviado);
                      servidor_hora = this.validacionService.FormatearHora(
                        obj3.fec_hora_timbre_servidor.split(' ')[1],
                        this.formato_hora);
                    };

                    switch (obj3.accion) {
                      case 'EoS': accionT = 'Entrada o salida'; break;
                      case 'AES': accionT = 'Inicio o fin alimentación'; break;
                      case 'PES': accionT = 'Inicio o fin permiso'; break;
                      case 'E': accionT = 'Entrada'; break;
                      case 'S': accionT = 'Salida'; break;
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/P': accionT = 'Inicio permiso'; break;
                      case 'F/P': accionT = 'Fin permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    };
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: servidor_fecha },
                      { style: 'itemsTable', text: servidor_hora },
                      { style: 'itemsTableCentrado', text: obj3.id_reloj },
                      { style: 'itemsTableCentrado', text: accionT },
                      { style: 'itemsTable', text: obj3.observacion },
                      { style: 'itemsTable', text: obj3.longitud },
                      { style: 'itemsTable', text: obj3.latitud },
                    ];
                  }),
                ],
              },
              layout: {
                fillColor: function (rowIndex: any) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });
          };
        });
      });
    } else {
      data.forEach((obj: IReporteTimbres) => {

        if (this.bool.bool_suc === true) {
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
                    text: 'CIUDAD: ' + obj.ciudad,
                    style: 'itemsTableInfo'
                  },
                  {
                    border: [false, true, true, true],
                    text: 'SUCURSAL: ' + obj.name_suc,
                    style: 'itemsTableInfo'
                  }
                ]
              ]
            }
          })
        }

        obj.departamentos.forEach(obj1 => {

          // LA CABECERA CUANDO SE GENERA EL PDF POR DEPARTAMENTOS
          if (this.bool.bool_dep === true) {
            let arr_reg = obj1.empleado.map((o: any) => { return o.timbres.length })
            let reg = this.SumarRegistros(arr_reg);
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*', '*'],
                headerRows: 1,
                body: [
                  [
                    {
                      border: [true, true, false, true],
                      text: 'DEPARTAMENTO: ' + obj1.name_dep,
                      style: 'itemsTableInfo'
                    },
                    {
                      border: [false, true, true, true],
                      text: 'N° REGISTROS: ' + reg,
                      style: 'itemsTableInfo'
                    }
                  ]
                ]
              }
            })
          }

          obj1.empleado.forEach((obj2: any) => {

            n.push({
              style: 'tableMarginCabeceraEmpleado',
              table: {
                widths: ['*', 'auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: 'EMPLEADO: ' + obj2.name_empleado,
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, true, false, false],
                      text: 'C.C.: ' + obj2.cedula,
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, true, true, false],
                      text: 'COD: ' + obj2.codigo,
                      style: 'itemsTableInfoEmpleado'
                    }
                  ],
                  [
                    {
                      border: [true, false, false, false],
                      text: this.bool.bool_suc || this.bool.bool_emp ? 'DEPARTAMENTO: ' + obj2.departamento : '',
                      style: 'itemsTableInfoEmpleado'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'CARGO: ' + obj2.cargo,
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
            if (this.timbreDispositivo === true) {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                  headerRows: 2,
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      {},
                      { colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
                      {},
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                    ],
                    [
                      {},
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      {}, {}, {}, {}, {}
                    ],
                    ...obj2.timbres.map((obj3: any) => {
                      let servidor_fecha = '';
                      let servidor_hora = '';
                      if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                        servidor_fecha = this.validacionService.FormatearFecha(
                          obj3.fec_hora_timbre_servidor.split(' ')[0],
                          this.formato_fecha,
                          this.validacionService.dia_abreviado);
                        servidor_hora = this.validacionService.FormatearHora(
                          obj3.fec_hora_timbre_servidor.split(' ')[1],
                          this.formato_hora);
                      }

                      const fechaTimbre = this.validacionService.FormatearFecha(
                        obj3.fec_hora_timbre.split(' ')[0],
                        this.formato_fecha,
                        this.validacionService.dia_abreviado);

                      const horaTimbre = this.validacionService.FormatearHora(
                        obj3.fec_hora_timbre.split(' ')[1],
                        this.formato_hora);

                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/P': accionT = 'Inicio permiso'; break;
                        case 'F/P': accionT = 'Fin permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      };

                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: servidor_fecha },
                        { style: 'itemsTable', text: servidor_hora },
                        { style: 'itemsTable', text: fechaTimbre },
                        { style: 'itemsTable', text: horaTimbre },
                        { style: 'itemsTableCentrado', text: obj3.id_reloj },
                        { style: 'itemsTableCentrado', text: accionT },
                        { style: 'itemsTable', text: obj3.observacion },
                        { style: 'itemsTable', text: obj3.longitud },
                        { style: 'itemsTable', text: obj3.latitud },
                      ];
                    }),
                  ],
                },
                layout: {
                  fillColor: function (rowIndex: any) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  },
                },
              });
            } else {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                  headerRows: 2,
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      {},
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' },
                    ],
                    [
                      {},
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      {}, {}, {}, {}, {}
                    ],
                    ...obj2.timbres.map((obj3: any) => {
                      let servidor_fecha = '';
                      let servidor_hora = '';
                      if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                        servidor_fecha = this.validacionService.FormatearFecha(
                          obj3.fec_hora_timbre_servidor.split(' ')[0],
                          this.formato_fecha,
                          this.validacionService.dia_abreviado);
                        servidor_hora = this.validacionService.FormatearHora(
                          obj3.fec_hora_timbre_servidor.split(' ')[1],
                          this.formato_hora);
                      };

                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/P': accionT = 'Inicio permiso'; break;
                        case 'F/P': accionT = 'Fin permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      }
                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: servidor_fecha },
                        { style: 'itemsTable', text: servidor_hora },
                        { style: 'itemsTableCentrado', text: obj3.id_reloj },
                        { style: 'itemsTableCentrado', text: accionT },
                        { style: 'itemsTable', text: obj3.observacion },
                        { style: 'itemsTable', text: obj3.longitud },
                        { style: 'itemsTable', text: obj3.latitud },
                      ]
                    })

                  ]
                },
                layout: {
                  fillColor: function (rowIndex: any) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  }
                }
              })
            }
          });
        });
      });
    }
    return n;
  }

  // METODO PARA SUMAR REGISTROS
  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor;
  }


  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcelRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Timbres');
        xlsx.writeFile(wb_regimen_cargo, `Timbres_virtuales_movil_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Timbres');
        xlsx.writeFile(wb, `Timbres_virtuales_movil_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
    }
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let accionT = '';
    let n = 0;
    array.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            n++;
            let ele: any;
            let servidor_fecha: any = '';
            let servidor_hora = '';
            if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
              servidor_fecha = new Date(obj4.fec_hora_timbre_servidor);
              servidor_hora = this.validacionService.FormatearHora(
                obj4.fec_hora_timbre_servidor.split(' ')[1],
                this.formato_hora);
            };

            const horaTimbre = this.validacionService.FormatearHora(
              obj4.fec_hora_timbre.split(' ')[1],
              this.formato_hora);

            switch (obj4.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/P': accionT = 'Inicio permiso'; break;
              case 'F/P': accionT = 'Fin permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
            if (this.timbreDispositivo) {
              ele = {
                'N°': n, 'Código': obj3.codigo, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula,
                'Sucursal': obj1.name_suc, 'Ciudad': obj1.ciudad, 'Régimen': obj3.regimen[0].name_regimen,
                'Departamento': obj2.name_dep, 'Cargo': obj3.cargo,
                'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
                'Fecha Timbre Dispositivo': new Date(obj4.fec_hora_timbre), 'Hora Timbre Dispositivo': horaTimbre,
                'Reloj': obj4.id_reloj, 'Acción': accionT, 'Observación': obj4.observacion,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud,
              }
            } else {
              ele = {
                'N°': n, 'Código': obj3.codigo, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula,
                'Sucursal': obj1.name_suc, 'Ciudad': obj1.ciudad, 'Régimen': obj3.regimen[0].name_regimen,
                'Departamento': obj2.name_dep, 'Cargo': obj3.cargo,
                'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
                'Reloj': obj4.id_reloj, 'Acción': accionT, 'Observación': obj4.observacion,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud
              }
            }
            nuevo.push(ele);
          })
        })
      })
    })
    return nuevo;
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let accionT = '';
    let n = 0;
    array.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          n++;
          let ele: any;
          let servidor_fecha: any = '';
          let servidor_hora = '';
          if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
            servidor_fecha = new Date(obj3.fec_hora_timbre_servidor);
            servidor_hora = this.validacionService.FormatearHora(
              obj3.fec_hora_timbre_servidor.split(' ')[1],
              this.formato_hora);
          };

          const horaTimbre = this.validacionService.FormatearHora(
            obj3.fec_hora_timbre.split(' ')[1],
            this.formato_hora);

          switch (obj3.accion) {
            case 'EoS': accionT = 'Entrada o salida'; break;
            case 'AES': accionT = 'Inicio o fin alimentación'; break;
            case 'PES': accionT = 'Inicio o fin permiso'; break;
            case 'E': accionT = 'Entrada'; break;
            case 'S': accionT = 'Salida'; break;
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }
          if (this.timbreDispositivo) {
            ele = {
              'N°': n, 'Código': obj2.codigo, 'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula,
              'Sucursal': obj2.sucursal, 'Ciudad': obj2.ciudad, 'Régimen': obj2.regimen[0].name_regimen,
              'Departamento': obj2.departamento, 'Cargo': obj2.cargo,
              'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
              'Fecha Timbre Dispositivo': new Date(obj3.fec_hora_timbre), 'Hora Timbre Dispositivo': horaTimbre,
              'Reloj': obj3.id_reloj, 'Acción': accionT, 'Observación': obj3.observacion,
              'Latitud': obj3.latitud, 'Longitud': obj3.longitud,
            }
          } else {
            ele = {
              'N°': n, 'Código': obj2.codigo, 'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula,
              'Sucursal': obj2.sucursal, 'Ciudad': obj2.ciudad, 'Régimen': obj2.regimen[0].name_regimen,
              'Departamento': obj2.departamento, 'Cargo': obj2.cargo,
              'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
              'Reloj': obj3.id_reloj, 'Acción': accionT, 'Observación': obj3.observacion,
              'Latitud': obj3.latitud, 'Longitud': obj3.longitud
            }
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
    let accionT = '';
    this.data_pdf.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            n = n + 1;
            let servidor_fecha = '';
            let servidor_hora = '';
            if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
              servidor_fecha = this.validacionService.FormatearFecha(
                obj4.fec_hora_timbre_servidor.split(' ')[0],
                this.formato_fecha,
                this.validacionService.dia_abreviado);
              servidor_hora = this.validacionService.FormatearHora(
                obj4.fec_hora_timbre_servidor.split(' ')[1],
                this.formato_hora);
            };

            const fechaTimbre = this.validacionService.FormatearFecha(
              obj4.fec_hora_timbre.split(' ')[0],
              this.formato_fecha,
              this.validacionService.dia_abreviado);

            const horaTimbre = this.validacionService.FormatearHora(
              obj4.fec_hora_timbre.split(' ')[1],
              this.formato_hora);

            switch (obj4.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/P': accionT = 'Inicio permiso'; break;
              case 'F/P': accionT = 'Fin permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
            let ele = {
              n: n,
              ciudad: obj1.ciudad, sucursal: obj1.name_suc,
              departamento: obj2.name_dep,
              empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
              fechaTimbre, horaTimbre,
              fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
              accion: accionT, reloj: obj4.id_reloj,
              latitud: obj4.latitud, longitud: obj4.longitud, observacion: obj4.observacion
            }

            this.timbres.push(ele);
          })
        })
      })
    })
  }

  ExtraerTimbresRegimenCargo() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          n = n + 1;
          let servidor_fecha = '';
          let servidor_hora = '';
          if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
            servidor_fecha = this.validacionService.FormatearFecha(
              obj3.fec_hora_timbre_servidor.split(' ')[0],
              this.formato_fecha,
              this.validacionService.dia_abreviado);
            servidor_hora = this.validacionService.FormatearHora(
              obj3.fec_hora_timbre_servidor.split(' ')[1],
              this.formato_hora);
          }

          const fechaTimbre = this.validacionService.FormatearFecha(
            obj3.fec_hora_timbre.split(' ')[0],
            this.formato_fecha,
            this.validacionService.dia_abreviado);

          const horaTimbre = this.validacionService.FormatearHora(
            obj3.fec_hora_timbre.split(' ')[1],
            this.formato_hora);

          switch (obj3.accion) {
            case 'EoS': accionT = 'Entrada o salida'; break;
            case 'AES': accionT = 'Inicio o fin alimentación'; break;
            case 'PES': accionT = 'Inicio o fin permiso'; break;
            case 'E': accionT = 'Entrada'; break;
            case 'S': accionT = 'Salida'; break;
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }
          let ele = {
            n: n,
            ciudad: obj2.ciudad, sucursal: obj2.sucursal,
            departamento: obj2.departamento,
            empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
            fechaTimbre, horaTimbre,
            fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
            accion: accionT, reloj: obj3.id_reloj,
            latitud: obj3.latitud, longitud: obj3.longitud, observacion: obj3.observacion
          }
          this.timbres.push(ele);
        })
      })
    })
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

  // METODO PARA MANEJAR EVENTOS DE PAGINACION
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

  // METODO PARA VER UBICACION DE TIMBRE
  AbrirMapa(latitud: string, longitud: string) {
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }

  // METODOS PARA CONTROLAR INGRESO DE LETRAS

  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  //MOSTRAR DETALLES
  VerDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg) {
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

}
