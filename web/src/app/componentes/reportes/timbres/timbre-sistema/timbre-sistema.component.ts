// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR MODELOS
import { ITableEmpleados, IReporteTimbres, tim_tabulado, timbre } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-timbre-sistema',
  templateUrl: './timbre-sistema.component.html',
  styleUrls: ['./timbre-sistema.component.css']
})

export class TimbreSistemaComponent implements OnInit, OnDestroy {

  get timbreServidor() { return this.reporteService.mostrarTimbreServidor };

  get rangoFechas() { return this.reporteService.rangoFechas };

  get opcion() { return this.reporteService.opcion };

  get bool() { return this.reporteService.criteriosBusqueda };

  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
  tabulado: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];
  origen: any = [];

  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionTab = new SelectionModel<ITableEmpleados>(true, []);


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

  // ITEMS DE PAGINACION DE LA TABLA TABULACIÓN
  pageSizeOptions_tab = [5, 10, 20, 50];
  tamanio_pagina_tab: number = 5;
  numero_pagina_tab: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DETALLE
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;


  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  get filtroCodigo_tab() { return this.reporteService.filtroCodigo_tab };
  get filtroCedula_tab() { return this.reporteService.filtroCedula_tab };
  get filtroNombreTab() { return this.reporteService.filtroNombreTab };

  // ESTADO HORA SERVIDOR
  servidor: boolean = false;

  constructor(
    private validacionService: ValidacionesService,
    private informacion: DatosGeneralesService,
    private reporteService: ReportesService,
    private R_asistencias: ReportesAsistenciasService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    if (parseInt(localStorage.getItem('rol') as string) === 1) {
      this.servidor = true;
    }
    this.BuscarInformacion();
    this.BuscarCargos();
  }

  // METODO DE BUSQUEDA DE DATOS
  BuscarInformacion() {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.origen = [];
    this.informacion.ObtenerInformacion(1).subscribe(
      (res: any[]) => {
        this.origen = JSON.stringify(res);
        sessionStorage.setItem(
          'reporte_timbres_multiple',
          JSON.stringify(res)
        );

        res.forEach((obj) => {
          this.sucursales.push({
            id: obj.id_suc,
            nombre: obj.name_suc,
          });
        });

        res.forEach((obj) => {
          obj.departamentos.forEach((ele) => {
            this.departamentos.push({
              id: ele.id_depa,
              departamento: ele.name_dep,
              nombre: ele.sucursal,
            });
          });
        });

        res.forEach((obj) => {
          obj.departamentos.forEach((ele) => {
            ele.empleado.forEach((r) => {
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

        res.forEach((obj) => {
          obj.departamentos.forEach((ele) => {
            ele.empleado.forEach((reg) => {
              reg.regimen.forEach((r) => {
                this.regimen.push({
                  id: r.id_regimen,
                  nombre: r.name_regimen,
                });
              });
            });
          });
        });

        this.regimen = this.regimen.filter(
          (obj, index, self) => index === self.findIndex((o) => o.id === obj.id)
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
  BuscarCargos() {
    this.empleados_cargos = [];
    this.origen_cargo = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionCargo(1).subscribe(
      (res: any[]) => {
        this.origen_cargo = JSON.stringify(res);

        res.forEach((obj) => {
          this.cargos.push({
            id: obj.id_cargo,
            nombre: obj.name_cargo,
          });
        });

        res.forEach((obj) => {
          obj.empleados.forEach((r) => {
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
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  ngOnDestroy() {
    this.respuesta = [];
    this.sucursales = [];
    this.departamentos = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
    this.empleados = [];
    this.tabulado = [];
  }


  // VALIDACIONES REPORT

  validacionReporte(action) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de busqueda')
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda')
    console.log('opcion:', this.opcion);
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione sucursal')
        this.ModelarSucursal(action);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione régimen')
        this.ModelarRegimen(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione departamentos')
        this.ModelarDepartamento(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione cargos')
        this.ModelarCargo(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione empleados')
        this.ModelarEmpleados(action);
        break;
      case 't':
        if (this.selectionTab.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione empleados')
        this.ModelarTabulado(action);
        break;
      default:
        this.toastr.error('Algo a pasado', 'Seleccione criterio de busqueda')
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  ModelarSucursal(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)

    let suc = respuesta.filter(o => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    // console.log('SUCURSAL', suc);
    this.data_pdf = []
    this.R_asistencias.ReporteTimbreSistema(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      // console.log('DATA PDF', this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarRegimen(accion) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)
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
            empleado.regimen.forEach((r) => {
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
    this.R_asistencias.ReporteTimbreSistemaRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log('DATA PDF', this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarCargo(accion) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreSistemaRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log('DATA PDF',this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter(o => {
        var bool = this.selectionDep.selected.find(obj1 => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });
    // console.log('DEPARTAMENTOS', dep);
    this.data_pdf = []
    this.R_asistencias.ReporteTimbreSistema(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      // console.log('DATA PDF',this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarEmpleados(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach(element => {
        element.empleado = element.empleado.filter(o => {
          var bool = this.selectionEmp.selected.find(obj1 => {
            return obj1.id === o.id
          })
          return bool != undefined
        })
      });
    })
    respuesta.forEach(obj => {
      obj.departamentos = obj.departamentos.filter(e => {
        return e.empleado.length > 0
      })
    });

    let emp = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });

    // console.log('EMPLEADOS', emp);
    this.data_pdf = []
    this.R_asistencias.ReporteTimbreSistema(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      // console.log('DATA PDF',this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarTabulado(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach(element => {
        element.empleado = element.empleado.filter(o => {
          var bool = this.selectionTab.selected.find(obj1 => {
            return obj1.id === o.id
          })
          return bool != undefined
        })
      });
    })
    respuesta.forEach(obj => {
      obj.departamentos = obj.departamentos.filter(e => {
        return e.empleado.length > 0
      })
    });

    let tab = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });

    // console.log('TABULADO', tab);
    this.data_pdf = []
    this.R_asistencias.ReporteTimbrestabulados(tab, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      // console.log('TABULADO PDF',this.data_pdf
      switch (accion) {
        case 'excel': this.exportToExcel('tabulado'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  /***********************************
   * 
   * COLORES Y LOGO PARA EL REPORTE
   * 
   ***********************************/

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

  /******************************************************
   * 
   *          PDF
   * 
   ******************************************************/

  generarPdf(action) {
    let documentDefinition;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.getDocumentDefinicion();
    } else if (this.bool.bool_tab === true) {
      documentDefinition = this.getDocumentDefinicionTabulado();
    }

    var f = new Date()
    let doc_name = "Timbres_virtuales.pdf";
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        var time = h.toJSON().split("T")[1].split(".")[0];

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'REPORTE TIMBRES VIRTUALES', bold: true, fontSize: 16, alignment: 'center', margin: [0, -5, 0, 5] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 2, 0, 18] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    var accionT: string = '';

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1) => {
        let arr_reg = obj1.empleados.map((o: any) => { return o.timbres.length })
        let reg = this.SumarRegistros(arr_reg);
        if (this.bool.bool_cargo === true) {
          n.push({
            style: 'tableMarginSuc',
            table: {
              widths: ['*', '*'],
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
            style: 'tableMarginSuc',
            table: {
              widths: ['*', '*'],
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
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + obj2.name_empleado,
                    style: 'itemsTableInfoBlanco',
                  },
                  {
                    border: [false, true, false, false],
                    text: 'C.C.: ' + obj2.cedula,
                    style: 'itemsTableInfoBlanco',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'COD: ' + obj2.codigo,
                    style: 'itemsTableInfoBlanco',
                  },
                ],
              ],
            },
          });
          c = 0;
          if (this.timbreServidor === true) {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    '',
                    { colSpan: 2, text: 'SERVIDOR', style: 'tableHeader' },
                    '',
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                  ],
                  [
                    '',
                    { text: 'FECHA', style: 'tableHeader' },
                    { text: 'HORA', style: 'tableHeader' },
                    { text: 'FECHA', style: 'tableHeader' },
                    { text: 'HORA', style: 'tableHeader' },
                    '', '', '', '', ''
                  ],
                  ...obj2.timbres.map(obj3 => {
                    let servidor_fecha = '';
                    let servidor_hora = '';
                    if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                      servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                      servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
                    }
                    switch (obj3.accion) {
                      case 'EoS': accionT = 'Entrada o salida'; break;
                      case 'AES': accionT = 'Inicio o fin alimentación'; break;
                      case 'PES': accionT = 'Inicio o fin permiso'; break;
                      case 'E': accionT = 'Entrada'; break;
                      case 'S': accionT = 'Salida'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'E/P': accionT = 'Fin permiso'; break;
                      case 'S/P': accionT = 'Inicio permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    }

                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                      { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                      { style: 'itemsTable', text: servidor_fecha },
                      { style: 'itemsTable', text: servidor_hora },
                      { style: 'itemsTable', text: obj3.id_reloj },
                      { style: 'itemsTable', text: accionT },
                      { style: 'itemsTable', text: obj3.observacion },
                      { style: 'itemsTable', text: obj3.longitud },
                      { style: 'itemsTable', text: obj3.latitud },
                    ]
                  })

                ]
              },
              layout: {
                fillColor: function (rowIndex) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            })
          } else {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', '*', '*', 'auto', 'auto', 'auto', '*', '*'],
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    '',
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                  ],
                  [
                    '',
                    { text: 'FECHA', style: 'tableHeader' },
                    { text: 'HORA', style: 'tableHeader' },
                    '', '', '', '', '',

                  ],
                  ...obj2.timbres.map(obj3 => {
                    switch (obj3.accion) {
                      case 'EoS': accionT = 'Entrada o salida'; break;
                      case 'AES': accionT = 'Inicio o fin alimentación'; break;
                      case 'PES': accionT = 'Inicio o fin permiso'; break;
                      case 'E': accionT = 'Entrada'; break;
                      case 'S': accionT = 'Salida'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'E/P': accionT = 'Fin permiso'; break;
                      case 'S/P': accionT = 'Inicio permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    }
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                      { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                      { style: 'itemsTable', text: obj3.id_reloj },
                      { style: 'itemsTable', text: accionT },
                      { style: 'itemsTable', text: obj3.observacion },
                      { style: 'itemsTable', text: obj3.longitud },
                      { style: 'itemsTable', text: obj3.latitud },
                    ]
                  })

                ]
              },
              layout: {
                fillColor: function (rowIndex) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });
          };
        });
      });
    } else {
      data.forEach((obj: IReporteTimbres) => {
  
        if (this.bool.bool_suc === true || this.bool.bool_dep === true) {
          n.push({
            table: {
              widths: ['*', '*'],
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
                body: [
                  [
                    {
                      border: [true, true, false, true],
                      text: 'DEPARTAMENTO: ' + obj1.name_dep,
                      style: 'itemsTableInfoBlanco'
                    },
                    {
                      border: [true, true, true, true],
                      text: 'N° REGISTROS: ' + reg,
                      style: 'itemsTableInfoBlanco'
                    }
                  ]
                ]
              }
            })
          }
  
          obj1.empleado.forEach((obj2: any) => {
  
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*', 'auto', 'auto'],
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: 'EMPLEADO: ' + obj2.name_empleado,
                      style: 'itemsTableInfoBlanco'
                    },
                    {
                      border: [false, true, false, false],
                      text: 'C.C.: ' + obj2.cedula,
                      style: 'itemsTableInfoBlanco'
                    },
                    {
                      border: [false, true, true, false],
                      text: 'COD: ' + obj2.codigo,
                      style: 'itemsTableInfoBlanco'
                    }
                  ]
                ]
              }
            });
            c = 0;
            if (this.timbreServidor === true) {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      '',
                      { colSpan: 2, text: 'SERVIDOR', style: 'tableHeader' },
                      '',
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                    ],
                    [
                      '',
                      { text: 'FECHA', style: 'tableHeader' },
                      { text: 'HORA', style: 'tableHeader' },
                      { text: 'FECHA', style: 'tableHeader' },
                      { text: 'HORA', style: 'tableHeader' },
                      '', '', '', '', ''
                    ],
                    ...obj2.timbres.map(obj3 => {
                      let servidor_fecha = '';
                      let servidor_hora = '';
                      if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                        servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                        servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
                      }
                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'E/P': accionT = 'Fin permiso'; break;
                        case 'S/P': accionT = 'Inicio permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      }
  
                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                        { style: 'itemsTable', text: servidor_fecha },
                        { style: 'itemsTable', text: servidor_hora },
                        { style: 'itemsTable', text: obj3.id_reloj },
                        { style: 'itemsTable', text: accionT },
                        { style: 'itemsTable', text: obj3.observacion },
                        { style: 'itemsTable', text: obj3.longitud },
                        { style: 'itemsTable', text: obj3.latitud },
                      ]
                    })
  
                  ]
                },
                layout: {
                  fillColor: function (rowIndex) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  }
                }
              })
            } else {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', '*', '*', 'auto', 'auto', 'auto', '*', '*'],
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      '',
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                    ],
                    [
                      '',
                      { text: 'FECHA', style: 'tableHeader' },
                      { text: 'HORA', style: 'tableHeader' },
                      '', '', '', '', '',
  
                    ],
                    ...obj2.timbres.map(obj3 => {
                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'E/P': accionT = 'Fin permiso'; break;
                        case 'S/P': accionT = 'Inicio permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      }
                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                        { style: 'itemsTable', text: obj3.id_reloj },
                        { style: 'itemsTable', text: accionT },
                        { style: 'itemsTable', text: obj3.observacion },
                        { style: 'itemsTable', text: obj3.longitud },
                        { style: 'itemsTable', text: obj3.latitud },
                      ]
                    })
  
                  ]
                },
                layout: {
                  fillColor: function (rowIndex) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  }
                }
              })
            }
          });
        });
      });
    }
    return n
  }

  getDocumentDefinicionTabulado() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        var time = h.toJSON().split("T")[1].split(".")[0];

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'REPORTE TABULADO TIMBRE TELETRABAJO', bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        this.impresionDatosPDFtabulado(this.data_pdf)
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 20] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDFtabulado(data: any[]) {
    let n = []
    let c = 0;
    let arrayTab: any = [];

    data.forEach((obj: IReporteTimbres) => {
      obj.departamentos.forEach(obj1 => {
        obj1.empleado.forEach((obj2: any) => {
          let cont_emp = 0;

          obj2.timbres.map((obj3: tim_tabulado) => {
            c = c + 1;
            cont_emp = cont_emp + 1;
            if (cont_emp === 1) {
              let ret = [
                { style: 'itemsTableCentrado', text: c },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj2.name_empleado },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj2.cedula },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj2.codigo },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj.ciudad },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj1.name_dep },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj2.cargo },
                { rowSpan: obj2.timbres.length, style: 'itemsTable', text: obj2.contrato },
                { style: 'itemsTable', text: obj3.fecha },
                { style: 'itemsTable', text: obj3.entrada },
                { style: 'itemsTable', text: obj3.sal_Alm },
                { style: 'itemsTable', text: obj3.ent_Alm },
                { style: 'itemsTable', text: obj3.salida },
                { style: 'itemsTable', text: obj3.desconocido },
              ]
              arrayTab.push(ret)
              return ret
            } else {
              let ret = [
                { style: 'itemsTableCentrado', text: c },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: '' },
                { style: 'itemsTable', text: obj3.fecha },
                { style: 'itemsTable', text: obj3.entrada },
                { style: 'itemsTable', text: obj3.sal_Alm },
                { style: 'itemsTable', text: obj3.ent_Alm },
                { style: 'itemsTable', text: obj3.salida },
                { style: 'itemsTable', text: obj3.desconocido },
              ]
              arrayTab.push(ret)
              return ret
            }

          })

        });

      });

    })

    return {
      style: 'tableMargin',
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'N°', style: 'tableHeader' },
            { text: 'Empleado', style: 'tableHeader' },
            { text: 'Cédula', style: 'tableHeader' },
            { text: 'Cod.', style: 'tableHeader' },
            { text: 'Ciudad', style: 'tableHeader' },
            { text: 'Departamento', style: 'tableHeader' },
            { text: 'Cargo', style: 'tableHeader' },
            { text: 'Contrato', style: 'tableHeader' },
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Entrada', style: 'tableHeader' },
            { text: 'Sal.Alm', style: 'tableHeader' },
            { text: 'Ent.Alm', style: 'tableHeader' },
            { text: 'Salida', style: 'tableHeader' },
            { text: 'Desco.', style: 'tableHeader' }
          ],
          ...arrayTab.map(obj3 => {
            return obj3
          })

        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }
  }

  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor
  }

  HorasDecimalToHHMM(dato: number) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = parseInt(dato.toString());
    var x = (dato - h) * 60;
    var m = parseInt(x.toString());

    let hora;
    let min;
    if (h < 10 && m < 10) {
      hora = '0' + h;
      min = '0' + m;
    } else if (h < 10 && m >= 10) {
      hora = '0' + h;
      min = m;
    } else if (h >= 10 && m < 10) {
      hora = h;
      min = '0' + m;
    } else if (h >= 10 && m >= 10) {
      hora = h;
      min = m;
    }

    return hora + ':' + min + ':00'
  }


  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'tabulado':
        const wsr_tab: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfTabulado(this.data_pdf));
        const wb_tab: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_tab, wsr_tab, 'Timbres');
        xlsx.writeFile(wb_tab, 'Timbres_Tabulado.xlsx');
        break;
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Timbres');
        xlsx.writeFile(wb_regimen_cargo, 'Timbres_virtuales.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Timbres');
        xlsx.writeFile(wb, 'Timbres_virtuales.xlsx');
        break;
    }

  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            let ele;
            if (this.timbreServidor) {
              let servidor_fecha = '';
              let servidor_hora = '';
              if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
                servidor_fecha = obj4.fec_hora_timbre_servidor.split(' ')[0];
                servidor_hora = obj4.fec_hora_timbre_servidor.split(' ')[1]
              }
              ele = {
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Fecha Timbre': obj4.fec_hora_timbre.split(' ')[0], 'Hora Timbre': obj4.fec_hora_timbre.split(' ')[1],
                'Fecha Timbre Servidor': servidor_fecha, 'Hora Timbre Servidor': servidor_hora,
                'Acción': obj4.accion=='HA'?'Timbre libre': obj4.accion=='HA'?'Timbre libre': obj4.accion, 'Reloj': obj4.id_reloj,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud, 'Observación': obj4.observacion
              }
            } else{
              ele = {
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Fecha Timbre': obj4.fec_hora_timbre.split(' ')[0], 'Hora Timbre': obj4.fec_hora_timbre.split(' ')[1],
                'Acción': obj4.accion=='HA'?'Timbre libre': obj4.accion, 'Reloj': obj4.id_reloj,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud, 'Observación': obj4.observacion
              }
            }
            nuevo.push(ele)
          })
        })
      })
    })
    return nuevo
  }

  MapingDataPdfRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: any) => {
        obj1.empleados.forEach((obj2: any) => {
          obj2.timbres.forEach((obj3: any) => {
            let ele;
            if (this.timbreServidor) {
              let servidor_fecha = '';
              let servidor_hora = '';
              if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
              }
              ele = {
                'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
                'Departamento': obj2.departamento,
                'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
                'Fecha Timbre': obj3.fec_hora_timbre.split(' ')[0], 'Hora Timbre': obj3.fec_hora_timbre.split(' ')[1],
                'Fecha Timbre Servidor': servidor_fecha, 'Hora Timbre Servidor': servidor_hora,
                'Acción': obj3.accion=='HA'?'Timbre libre': obj3.accion, 'Reloj': obj3.id_reloj,
                'Latitud': obj3.latitud, 'Longitud': obj3.longitud, 'Observación': obj3.observacion
              }
            } else{
              ele = {
                'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
                'Departamento': obj2.departamento,
                'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
                'Fecha Timbre': obj3.fec_hora_timbre.split(' ')[0], 'Hora Timbre': obj3.fec_hora_timbre.split(' ')[1],
                'Acción': obj3.accion=='HA'?'Timbre libre': obj3.accion, 'Reloj': obj3.id_reloj,
                'Latitud': obj3.latitud, 'Longitud': obj3.longitud, 'Observación': obj3.observacion
              }
            }
            
            nuevo.push(ele)
          })
        })
    })
    return nuevo
  }

  MapingDataPdfTabulado(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: tim_tabulado) => {
            let ele = {
              'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
              'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
              'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Contrado': obj3.contrato, 'Cargo': obj3.cargo,
              'Fecha Timbre': obj4.fecha.split(' ')[0], 'Hora Timbre': obj4.fecha.split(' ')[1], 'Género': obj3.genero,
              'Entrada': obj4.entrada, 'Salida Almuerzo': obj4.sal_Alm, 'Entrada Almuerzo': obj4.ent_Alm, 'Salida': obj4.salida,
              'Observación': obj4.desconocido
            }
            nuevo.push(ele)
          })
        })
      })
    })
    return nuevo
  }

  //METODOS PARA EXTRAER LOS TIMBRES EN UNA LISTA Y VISUALIZARLOS
  extraerTimbres() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            let ele: any;
            n = n + 1;
            switch (obj4.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'E/P': accionT = 'Fin permiso'; break;
              case 'S/P': accionT = 'Inicio permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
            if (this.timbreServidor) {
              let servidor_fecha = '';
              let servidor_hora = '';
              if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
                servidor_fecha = obj4.fec_hora_timbre_servidor.split(' ')[0];
                servidor_hora = obj4.fec_hora_timbre_servidor.split(' ')[1]
              }
              ele = {
                n: n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
                fechaTimbre: obj4.fec_hora_timbre.split(' ')[0], horaTimbre: obj4.fec_hora_timbre.split(' ')[1],
                fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
                accion: accionT, reloj: obj4.id_reloj,
                latitud: obj4.latitud, longitud: obj4.longitud, observacion: obj4.observacion
              }
            } else{
              ele = {
                n: n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
                fechaTimbre: obj4.fec_hora_timbre.split(' ')[0], horaTimbre: obj4.fec_hora_timbre.split(' ')[1],
                accion: accionT, reloj: obj4.id_reloj,
                latitud: obj4.latitud, longitud: obj4.longitud, observacion: obj4.observacion
              }
            }
            this.timbres.push(ele)
          })
        })
      })
    })
  }

  extraerTimbresRegimenCargo() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: any) => {
        obj1.empleados.forEach((obj2: any) => {
          obj2.timbres.forEach((obj3: any) => {
            let ele;
            n = n + 1;
            switch (obj3.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'E/P': accionT = 'Fin permiso'; break;
              case 'S/P': accionT = 'Inicio permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
            if (this.timbreServidor) {
              let servidor_fecha = '';
              let servidor_hora = '';
              if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
              }
              ele = {
                n: n,
                ciudad: obj2.ciudad, sucursal: obj2.sucursal,
                departamento: obj2.departamento,
                empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
                fechaTimbre: obj3.fec_hora_timbre.split(' ')[0], horaTimbre: obj3.fec_hora_timbre.split(' ')[1],
                fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
                accion: accionT, reloj: obj3.id_reloj,
                latitud: obj3.latitud, longitud: obj3.longitud, observacion: obj3.observacion
              }
            } else{
              ele = {
                n: n,
                ciudad: obj2.ciudad, sucursal: obj2.sucursal,
                departamento: obj2.departamento,
                empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
                fechaTimbre: obj3.fec_hora_timbre.split(' ')[0], horaTimbre: obj3.fec_hora_timbre.split(' ')[1],
                accion: accionT, reloj: obj3.id_reloj,
                latitud: obj3.latitud, longitud: obj3.longitud, observacion: obj3.observacion
              }
            }
            
            this.timbres.push(ele)
          })
        })
    })
  }

  /*****************************************************************************
   * 
   * 
   * Varios Metodos Complementarios al funcionamiento. 
   * 
   * 
   **************************************************************************/

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
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
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
      this.cargos.forEach(row => this.selectionCar.select(row));
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

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedTab() {
    const numSelected = this.selectionTab.selected.length;
    return numSelected === this.tabulado.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleTab() {
    this.isAllSelectedTab() ?
      this.selectionTab.clear() :
      this.tabulado.forEach(row => this.selectionTab.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelTab(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedTab() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionTab.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    } else if (this.bool.bool_tab === true) {
      this.tamanio_pagina_tab = e.pageSize;
      this.numero_pagina_tab = e.pageIndex + 1;
    }
  }

  // METODO PARA MANEJAR PAGINACION DETALLE
  ManejarPaginaDetalle(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }


  MostrarLista() {
    if (this.opcion === 's') {
      /*this.nombre_suc.reset();
      this.Filtrar('', 1)*/
    }
    else if (this.opcion === 'd') {
      /*this.nombre_dep.reset();
      this.Filtrar('', 2)*/
    }
    else if (this.opcion === 'e') {
     /* this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }

   //MOSTRAR DETALLES
  verDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg) {
      this.extraerTimbresRegimenCargo();
    } else{
      this.extraerTimbres();
    }
  }

  regresar(){
    this.verDetalle = false;
  }

}
