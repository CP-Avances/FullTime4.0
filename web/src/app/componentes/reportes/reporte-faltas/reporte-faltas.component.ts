import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { IReporteFaltas, ITableEmpleados } from 'src/app/model/reportes.model';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-reporte-faltas',
  templateUrl: './reporte-faltas.component.html',
  styleUrls: ['./reporte-faltas.component.css']
})
export class ReporteFaltasComponent implements OnInit, OnDestroy {

  get rangoFechas () { return this.reporteService.rangoFechas; }

  get opcion () { return this.reporteService.opcion; }

  get bool() { return this.reporteService.criteriosBusqueda; }
  
  respuesta: any [];
  sucursales: any = [];
  departamentos: any = [];
  empleados: any = [];
  tabular: any = [];
  
  data_pdf: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionTab = new SelectionModel<ITableEmpleados>(true, []);
  
  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }
  
  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };

  get filtroCodigo_tab() { return this.reporteService.filtroCodigo_tab };
  get filtroCedula_tab() { return this.reporteService.filtroCedula_tab };
  get filtroNombreTab() { return this.reporteService.filtroNombreTab };
  
  constructor(
    private toastr: ToastrService,
    private reporteService: ReportesService,
    private R_asistencias: ReportesAsistenciasService,
    private restEmpre: EmpresaService
  ) { 
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_faltas');
    this.R_asistencias.DatosGeneralesUsuarios().subscribe((res: any[]) => {
      console.log('RESPUESTA:', res);
      
      sessionStorage.setItem('reporte_faltas', JSON.stringify(res))
      this.sucursales = res.map(obj => {
        return {
          id: obj.id_suc,
          nombre: obj.name_suc
        }
      });

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
            this.tabular.push({
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula
            })
            this.empleados.push({
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula
            })
          })
        })
      })
      console.log('SUCURSALES',this.sucursales);
      console.log('DEPARTAMENTOS',this.departamentos);
      console.log('EMPLEADOS',this.empleados);
      console.log('TABULAR',this.tabular);
      
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ngOnDestroy(): void {
    this.sucursales = [];
    this.departamentos = [];
    this.empleados = [];
    this.tabular = [];

  }

  /**
   * VALIDACIONES REPORT
   */
  validacionReporte(action) {

    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de busqueda') 
    if (this.bool.bool_suc === false && this.bool.bool_dep === false && this.bool.bool_emp === false && this.bool.bool_tab === false) return this.toastr.error('Seleccione un criterio de búsqueda') 

    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione sucursal')
        this.ModelarSucursal(action);
      break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione departamentos')
        this.ModelarDepartamento(action);
      break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione empleados')
        this.ModelarEmpleados(action);
      break;
      case 't':
        if (this.selectionTab.selected.length === 0) return this.toastr.error('Seleccione empleados a tabular', 'Seleccione empleados')
        this.ModelarTabulacion(action);
      break;
      default:
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  ModelarSucursal(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_faltas') as any)

    let suc = respuesta.filter(o => {
      var bool =  this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    console.log('SUCURSAL', suc);
    this.data_pdf = []
    this.R_asistencias.ReporteFaltasMultiples(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_faltas') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos =  obj.departamentos.filter(o => {
        var bool =  this.selectionDep.selected.find(obj1 => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter(obj => { 
      return obj.departamentos.length > 0
    });
    console.log('DEPARTAMENTOS', dep);
    this.data_pdf = []
    this.R_asistencias.ReporteFaltasMultiples(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarEmpleados(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_faltas') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach(element => {
        element.empleado = element.empleado.filter(o => {
          var bool =  this.selectionEmp.selected.find(obj1 => {
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
    
    console.log('EMPLEADOS', emp);
    this.data_pdf = []
    this.R_asistencias.ReporteFaltasMultiples(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarTabulacion(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_faltas') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach(element => {
        element.empleado = element.empleado.filter(o => {
          var bool =  this.selectionTab.selected.find(obj1 => {
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
    
    console.log('TABULACION', emp);
    this.data_pdf = []
    this.R_asistencias.ReporteFaltasMultiplesTabulado(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('tabulado'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  /***************************
   * 
   * COLORES Y LOGO PARA EL REPORTE
   * 
   *****************************/

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
   *******************************************/

  generarPdf(action) {
    let documentDefinition; 
    if (this.bool.bool_tab === true) {
      documentDefinition = this.getDocumentDefinicionLandscape();
    } else {
      documentDefinition = this.getDocumentDefinicionPortrait();
    }
    var f = new Date()
    let doc_name = "Reporte faltas" + f.toLocaleString() + ".pdf";
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicionPortrait() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [ 40, 40, 40, 40 ],
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
            { text: [
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -35, 0, 10] },
        { text: 'Reporte de Faltas', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 7] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " + this.rangoFechas.fec_final, bold: true, fontSize: 12, alignment: 'center' },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableInfo: { fontSize: 12, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableMarginSuc: { margin: [0, 10, 0, 10] },
        tableMarginDep: { margin: [0, 10, 0, 0] },
        tableMarginEmp: { margin: [0, 0, 0, 10] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  getDocumentDefinicionLandscape() {
    
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [ 40, 40, 40, 40 ],
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
            { text: [
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -35, 0, 10] },
        { text: 'Reporte Tabulado de Faltas', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 7] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " + this.rangoFechas.fec_final, bold: true, fontSize: 12, alignment: 'center'  },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableInfo: { fontSize: 12, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableMarginSuc: { margin: [0, 10, 0, 10] },
        tableMarginDep: { margin: [0, 10, 0, 0] },
        tableMarginEmp: { margin: [0, 0, 0, 10] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any []): Array<any> {

    if (this.bool.bool_tab === true) {
      return this.TabulacionPDF(data)
    } else {
      return this.EstandarPDFsinTabulacion(data)
    }
  }

  TabulacionPDF(data: any []): Array<any> {
    let n: any = []
    let c = 0;

    data.forEach((obj: IReporteFaltas) => {
      obj.departamentos.forEach(obj1 => {
        obj1.empleado.forEach((obj2: any) => {
          (obj2.genero === 1) ? obj2.genero = 'M' : obj2.genero = 'F';

          n.push({
            style: 'tableMarginDep',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', '*', '*'],
              body: [
                [
                  { text: 'N°', style: 'tableHeader'},
                  { text: 'Empleado', style: 'tableHeader'},
                  { text: 'Cédula', style: 'tableHeader'},
                  { text: 'Código', style: 'tableHeader'},
                  { text: 'Género', style: 'tableHeader'},
                  { text: 'Ciudad', style: 'tableHeader'},
                  { text: 'Departamento', style: 'tableHeader'},
                  { text: 'Cargo', style: 'tableHeader'},
                  { text: 'Contrato', style: 'tableHeader'},
                  { text: 'Fecha', style: 'tableHeader'}
                ],
                ...obj2.faltas.map(obj3 => {
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: obj2.name_empleado },
                    { style: 'itemsTableCentrado', text: obj2.cedula },
                    { style: 'itemsTableCentrado', text: obj2.codigo },
                    { style: 'itemsTableCentrado', text: obj2.genero },
                    { style: 'itemsTableCentrado', text: obj.ciudad },
                    { style: 'itemsTableCentrado', text: obj1.name_dep },
                    { style: 'itemsTableCentrado', text: obj2.cargo },
                    { style: 'itemsTableCentrado', text: obj2.contrato},
                    { style: 'itemsTableCentrado', text: obj3.fecha },
                  ]
                }),
                [
                  { colSpan: 9, text: 'Total Faltas Registradas: ', style: 'itemsTableInfo', alignment: 'right'},
                  '', '', '', '', '', '', '', '',
                  { text: obj2.faltas.length, bold: true, fontSize: 15, alignment: 'center', margin: [0, 5, 0, 5]}
                ]
              ]
            }
          });
        });
      });
    })
    
    return n
  }

  EstandarPDFsinTabulacion(data: any []): Array<any> {
    let n: any = []
    let c = 0;
    let arr_dep_subtotal: any = []

    data.forEach((obj: IReporteFaltas) => {
      
      if (this.bool.bool_suc === true || this.bool.bool_emp === true) {
        let arr_suc = obj.departamentos.map(o => { return o.empleado.length});
        let suma_suc = this.SumarRegistros(arr_suc);
        
        n.push({
          style: 'tableMarginSuc',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'CIUDAD: ' + obj.ciudad,
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, false, true],
                  text: 'SUCURSAL: ' + obj.name_suc,
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, true, true],
                  text: 'N° Empleados: ' + suma_suc,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        });

        arr_dep_subtotal = [];
        obj.departamentos.forEach(o => {
          o.empleado.forEach((e: any) => {
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*', 'auto', 'auto'],
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: 'EMPLEADO: ' + e.name_empleado,
                      style: 'itemsTableInfoBlanco'
                    },
                    {
                      border: [false, true, false, false],
                      text: 'C.C.: ' + e.cedula,
                      style: 'itemsTableInfoBlanco'
                    },
                    {
                      border: [false, true, true, false],
                      text: 'COD: ' + e.codigo,
                      style: 'itemsTableInfoBlanco'
                    }
                  ]
                ]
              }
            });

            n.push({
              style: 'tableMarginEmp',
              table: {
                widths: [20, '*', 30],
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { colSpan: 2, text: 'INASISTENCIA', style: 'tableHeader' },
                    { text: '', style: 'tableHeader'}
                  ], 
                  ...e.faltas.map(obj3 => {
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTableCentrado', colSpan:2, text: obj3.fecha },
                      { style: 'itemsTableCentrado', text: '' },
                    ]
                  }),
                  [
                    { colSpan: 2, text: 'Total Faltas Empleado ' , fillColor: this.s_color, alignment: 'right', margin: [0,3,15,3], fontSize: 10},
                    { text: '', fillColor: this.s_color},
                    { text: e.faltas.length, bold: true, fontSize: 13, alignment: 'center', margin: [0, 3, 0, 3] }
                  ]
                ],
                layout: {
                  fillColor: function (rowIndex) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  }
                }
              }
            }); 
            arr_dep_subtotal.push(e.faltas.length);
          })
        })

        if (this.bool.bool_suc === true) {
          n.push({ text: 'Total Faltas Sucursal: ' + this.SumarRegistros(arr_dep_subtotal), bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10]})
        }

      }

      if (this.bool.bool_dep === true) {
        
        obj.departamentos.forEach(obj1 => {
          arr_dep_subtotal = [];

          let reg = obj1.empleado.length
          n.push({
            style: 'tableMarginDep',
            table: {
              widths: ['*','*'],
              body: [
                [
                  {
                    border: [true, true, false, true],
                    text: 'DEPARTAMENTO: ' + obj1.name_dep,
                    style: 'itemsTableInfo'
                  },
                  {
                    border: [true, true, true, true],
                    text: 'N° EMPLEADOS DEPARTAMENTO: ' + reg,
                    style: 'itemsTableInfo'
                  }
                ]
              ]
            }
          })

          obj1.empleado.forEach((obj2: any) => {

            n.push({
              style: 'tableMarginDep',
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

            n.push({
              style: 'tableMarginEmp',
              table: {
                widths: [20, '*', 30],
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { colSpan: 2, text: 'INASISTENCIA', style: 'tableHeader' },
                    { text: '', style: 'tableHeader'}
                  ], 
                  ...obj2.faltas.map(obj3 => {
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTableCentrado', colSpan:2, text: obj3.fecha },
                      { style: 'itemsTableCentrado', text: '' },
                    ]
                  }),
                  [
                    { colSpan: 2, text: 'Total Faltas Empleado ' , fillColor: this.s_color, alignment: 'right', margin: [0,3,15,3], fontSize: 10},
                    { text: '', fillColor: this.s_color},
                    { text: obj2.faltas.length, bold: true, fontSize: 13, alignment: 'center', margin: [0, 3, 0, 3] }
                  ]
                ],
                layout: {
                  fillColor: function (rowIndex) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  }
                }
              }
            }); 
            arr_dep_subtotal.push(obj2.faltas.length);
          });

          n.push({ text: 'Total Faltas Departamento: ' + this.SumarRegistros(arr_dep_subtotal), bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10]})

        });  

      }

    })
    
    return n
  }

  SumarValoresArray(array: any []) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + parseFloat(array[i]);
    }
    return valor.toFixed(2)
  }
  
  SumarRegistros(array: any []) {
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

  /****************************************************************************************************** 
   *                                       METODO PARA EXPORTAR A EXCEL
   ******************************************************************************************************/
   exportToExcel(tipo: string): void {
    switch (tipo) {        
      case 'tabulado':
        const wsr_tab: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfTabulado(this.data_pdf));
        const wb_tab: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_tab, wsr_tab, 'Faltas');
        xlsx.writeFile(wb_tab, "Faltas_Tabulado" + new Date().getTime() + '.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Faltas');
        xlsx.writeFile(wb, "Faltas_default" + new Date().getTime() + '.xlsx');
        break;
    }
    
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteFaltas) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.faltas.forEach((obj4) => {
            let ele = {
              'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc, 
              'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
              'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Fecha': obj4.fecha.split(' ')[0],
            }
            nuevo.push(ele)
          })
        })
      })
    })
    return nuevo
  }
  
  MapingDataPdfTabulado(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteFaltas) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.faltas.forEach((obj4) => {
            let ele = {
              'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc, 
              'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
              'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Contrado': obj3.contrato, 'Cargo': obj3.cargo,
              'Fecha': obj4.fecha.split(' ')[0]
            }
            nuevo.push(ele)
          })
        })
      })
    })
    return nuevo
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedTab() {
    const numSelected = this.selectionTab.selected.length;
    return numSelected === this.tabular.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleTab() {
    this.isAllSelectedTab() ?
      this.selectionTab.clear() :
      this.tabular.forEach(row => this.selectionTab.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelTab(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedTab() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionTab.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach(row => this.selectionDep.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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
      /*this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }
}
