import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ITableEmpleados, tim } from 'src/app/model/reportes.model';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { IReporteAtrasos } from 'src/app/model/reportes.model';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-reporte-atrasos-multiples',
  templateUrl: './reporte-atrasos-multiples.component.html',
  styleUrls: ['./reporte-atrasos-multiples.component.css']
})
export class ReporteAtrasosMultiplesComponent implements OnInit, OnDestroy {

  get rangoFechas () { return this.reporteService.rangoFechas; }

  get opcion () { return this.reporteService.opcion; }

  get bool() { return this.reporteService.criteriosBusqueda; }
  
  respuesta: any [];
  sucursales: any = [];
  departamentos: any = [];
  empleados: any = [];
 
  data_pdf: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  
  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }
  
  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };

  
  constructor(
    private toastr: ToastrService,
    private reporteService: ReportesService,
    private validacionService: ValidacionesService,
    private R_asistencias: ReportesAsistenciasService,
    private restEmpre: EmpresaService
  ) { 
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_atrasos');
    this.R_asistencias.DatosGeneralesUsuarios().subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_atrasos', JSON.stringify(res))
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
      
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ngOnDestroy(): void {
    this.respuesta = [];
    this.sucursales = [];
    this.departamentos = [];
    this.empleados = [];
  }

  /**
   * VALIDACIONES REPORT
   */
  validacionReporte(action) {

    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de busqueda') 
    if (this.bool.bool_suc === false && this.bool.bool_dep === false && this.bool.bool_emp === false) return this.toastr.error('Seleccione un criterio de búsqueda') 

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
      default:
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  ModelarSucursal(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_atrasos') as any)

    let suc = respuesta.filter(o => {
      var bool =  this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    console.log('SUCURSAL', suc);
    this.data_pdf = []
    this.R_asistencias.ReporteAtrasosMultiples(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_atrasos') as any)

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
    this.R_asistencias.ReporteAtrasosMultiples(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarEmpleados(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_atrasos') as any)

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
    this.R_asistencias.ReporteAtrasosMultiples(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
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
    const documentDefinition = this.getDocumentDefinicion();
    var f = new Date()
    let doc_name = "Reporte atrasos" + f.toLocaleString() + ".pdf";
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
      pageMargins: [ 30, 60, 30, 40 ],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        var time = h.toJSON().split("T")[1].split(".")[0];
        
        return [
          {
            table: {
              widths: ['auto','auto'],
              body: [
                [
                  { text: 'Cal Dec: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Calculo del tiempo de atraso en formato hora decimal.', border: [false, false, false, false], style: ['quote', 'small'] },
                ],
                [
                  { text: 'HH:MM:SS ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Horas, minutos y segundos.', border: [false, false, false, false], style: ['quote', 'small'] },
                ]
              ]
            }
          },
          {
            margin: [10,2,0,-2],
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
        ]
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'Reporte - Atrasos Justificados y No Justificados', bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " +  this.rangoFechas.fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5]  },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableTotal: { fontSize: 13, bold: true, alignment: 'rigth', fillColor: this.p_color },
        tableTotalSucursal: { fontSize: 13, bold: true, alignment: 'center', fillColor: this.s_color},
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderTotalSuc: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3]},
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] },
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 8, 0, 8], fillColor: this.p_color },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any []): Array<any>{
    let array: any = [];
    data.forEach(obj => {
      obj.departamentos.forEach(obj1 => {
        obj1.empleado.forEach(obj2 => {
          array.push(obj2.timbres.length)
        })
      })
    })
    let cont = this.SumarRegistros(array)
    
    return this.EstandarImpresionPDF(data, cont)
  }

  EstandarImpresionPDF(data: any [], num_registros: number) {
    let n: any = []
    let c = 0;
    let arr_total_dep: any = []
    let arr_total_suc: any = []

    n.push(
      { text: 'N° Registros totales: ' + num_registros, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5]  },
    )

    data.forEach((obj: IReporteAtrasos) => {
      arr_total_suc = []
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
        arr_total_dep = [];

        // LA CABECERA CUANDO SE GENERA EL PDF POR DEPARTAMENTOS
        if (this.bool.bool_dep === true) {
          let arr_reg = obj1.empleado.map((o: any) => { return o.timbres.length})
          let reg = this.SumarRegistros(arr_reg);
          n.push({
            table: {
              widths: ['*','*'],
              body: [
                [
                  {
                    border: [true, false, false, true],
                    text: 'DEPARTAMENTO: ' + obj1.name_dep,
                    style: 'itemsTableInfoBlanco'
                  },
                  {
                    border: [true, false, true, true],
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

          let arr = obj2.timbres.map(o => { return o.atraso_dec})
          let suma_dec = this.SumarValoresArray(arr);
          let suma_HHMM = this.HorasDecimalToHHMM(parseFloat(suma_dec))
          arr_total_dep.push(suma_dec) 
          arr_total_suc.push(suma_dec)

          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto','auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { rowSpan: 2, text: 'N°', style: 'tableHeader', margin: [0,7,0,0]},
                  { rowSpan: 2, text: 'Fecha', style: 'tableHeader', margin: [0,7,0,0] },
                  { rowSpan: 2, text: 'Horario', style: 'tableHeader', margin: [0,7,0,0] },
                  { rowSpan: 2, text: 'Timbre', style: 'tableHeader', margin: [0,7,0,0] },
                  { rowSpan: 2, text: 'Tipo permiso', style: 'tableHeader', margin: [0,7,0,0] },
                  { rowSpan: 2, text: 'Desde', style: 'tableHeader', margin: [0,7,0,0] },
                  { rowSpan: 2, text: 'Hasta', style: 'tableHeader', margin: [0,7,0,0] },
                  { colSpan: 2, text: 'Permiso', style: 'tableHeader' },
                  '',
                  { colSpan: 2, text: 'Atraso', style: 'tableHeader' },
                  ''
                ],                  
                [
                  '', '', '', '', '', '', '', 
                  { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
                  { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
                ],                  
                ...obj2.timbres.map(obj3 => {
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTable', text: obj3.fecha },
                    { style: 'itemsTable', text: obj3.horario },
                    { style: 'itemsTable', text: obj3.timbre },
                    { style: 'itemsTable', text: '' },
                    { style: 'itemsTable', text: '' },
                    { style: 'itemsTable', text: '' },
                    { style: 'itemsTable', text: '' },
                    { style: 'itemsTable', text: '' },
                    { style: 'itemsTable', text: obj3.atraso_dec },
                    { style: 'itemsTable', text: obj3.atraso_HHMM },
                  ]
                }),
                [
                  { rowSpan: 2, colSpan: 7, text: 'TOTAL EMPLEADO', style: 'tableTotal', margin:[0,5,15,0], alignment: 'right'},
                  '','','','','','',
                  { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
                  { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
                ], 
                [
                  '','','','','','','',
                  { text: ' ', style: 'itemsTable'},
                  { text: ' ', style: 'itemsTable'},
                  { text: suma_dec, style: 'itemsTable'},
                  { text: suma_HHMM, style: 'itemsTable'},
                ]
              ]
            },
            layout: {
              fillColor: function (rowIndex) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          })
        });

        // SI GENERA PFD POR DEPARTAMENTO SE IMPRIME ESTE TOTAL AL FINAL DE CADA DEPARTAMENTO
        if (this.bool.bool_dep === true) {
          let suma_dep = this.SumarValoresArray(arr_total_dep)
          let suma_dep_HHMM = this.HorasDecimalToHHMM(parseFloat(suma_dep))
          n.push({
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { rowSpan: 3, colSpan: 7, text: 'TOTAL DEPARTAMENTO: ' + obj1.name_dep, style: 'tableTotalSucursal', margin:[15,10,15,0], alignment: 'right'},
                  '','','','','','',
                  { colSpan: 2, text: 'Permiso', style: 'tableHeaderTotalSuc' },
                  '',
                  { colSpan: 2, text: 'Atraso', style: 'tableHeaderTotalSuc' },
                  ''
                ],
                [
                  '','','','','','','', 
                  { text: 'Tiem Dec', style: 'tableHeaderTotalSuc', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeaderTotalSuc', fontSize: 7 },
                  { text: 'Tiem Dec', style: 'tableHeaderTotalSuc', fontSize: 7 },
                  { text: 'HH:MM:SS', style: 'tableHeaderTotalSuc', fontSize: 7 },
                ], 
                [
                  '','','','','','','',
                  { text: ' ', style: 'itemsTable'},
                  { text: ' ', style: 'itemsTable'},
                  { text: suma_dep, style: 'itemsTable'},
                  { text: suma_dep_HHMM, style: 'itemsTable'},
                ]
              ]
            }
          })
        }

      })

      // SI GENERA PFD POR SUCURSAL SE IMPRIME ESTE TOTAL AL FINAL DE CADA SUCURSAL
      if (this.bool.bool_suc === true) {
        let suma_suc = this.SumarValoresArray(arr_total_suc)
        let suma_suc_HHMM = this.HorasDecimalToHHMM(parseFloat(suma_suc))
        n.push({
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { rowSpan: 3, colSpan: 7, text: 'TOTAL SUCURSAL: ' +  obj.name_suc, style: 'tableTotalSucursal', margin:[15,10,15,0], alignment: 'right'},
                '','','','','','',
                { colSpan: 2, text: 'Permiso', style: 'tableHeaderTotalSuc' },
                '',
                { colSpan: 2, text: 'Atraso', style: 'tableHeaderTotalSuc' },
                ''
              ],
              [
                '','','','','','','', 
                { text: 'Cal Dec', style: 'tableHeaderTotalSuc', fontSize: 7 },
                { text: 'HH:MM:SS', style: 'tableHeaderTotalSuc', fontSize: 7 },
                { text: 'Cal Dec', style: 'tableHeaderTotalSuc', fontSize: 7 },
                { text: 'HH:MM:SS', style: 'tableHeaderTotalSuc', fontSize: 7 },
              ], 
              [
                '','','','','','','',
                { text: ' ', style: 'itemsTable'},
                { text: ' ', style: 'itemsTable'},
                { text: suma_suc, style: 'itemsTable'},
                { text: suma_suc_HHMM, style: 'itemsTable'},
              ]
            ]
          }
        })
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


  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
   exportToExcel(): void {

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Atrasos');
    xlsx.writeFile(wb, "Atrasos_default" + new Date().getTime() + '.xlsx');
    
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteAtrasos) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4:tim ) => {
            let ele = {
              'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc, 
              'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
              'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Dia': obj4.fecha.split(' ')[0], 'Fecha': obj4.fecha.split(' ')[1], 'Horario': obj4.horario, 'Hora Timbre': obj4.timbre.split(' ')[0],
              'HH:MM:SS': obj4.atraso_HHMM, 'Decimal': obj4.atraso_dec
            }
            nuevo.push(ele)
          })
        })
      })
    })
    return nuevo
  }

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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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
     // this.nombre_suc.reset();
     // this.Filtrar('', 1)
    }
    else if (this.opcion === 'd') {
      //this.nombre_dep.reset();
      //this.Filtrar('', 2)
    }
    else if (this.opcion === 'e') {
    /*  this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }

}
