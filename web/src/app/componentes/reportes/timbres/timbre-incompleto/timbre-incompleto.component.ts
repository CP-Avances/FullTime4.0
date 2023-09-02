
// IMPORTACION DE LIBRERIAS
import { ITableEmpleados, IReporteTimbresIncompletos } from 'src/app/model/reportes.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTACION DE SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-timbre-incompleto',
  templateUrl: './timbre-incompleto.component.html',
  styleUrls: ['./timbre-incompleto.component.css']
})

export class TimbreIncompletoComponent implements OnInit, OnDestroy {

  // METODO PARA VERIFICACIÓN DE INGRESO DE FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };
  // VARIABLE QUE INDICA NÚMERO DE OPCIONES DE BUSQUEDA
  get opcion() { return this.reporteService.opcion };
  // METODO QUE INDICA OPCIONES DE BUSQUEDA SELECCIONADOS
  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  respuesta: any[];
  empleados: any = [];
  sucursales: any = [];
  incompletos: any = [];
  departamentos: any = [];

  // VARIABLE DE ALMACENAMIENTO DE DATOS PARA PDF
  data_pdf: any = [];

  // VARIABLES DE SELECCIÓN DE DATOS DE BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;
  pageSizeOptions_suc = [5, 10, 20, 50];
  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;
  pageSizeOptions_dep = [5, 10, 20, 50];
  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;
  pageSizeOptions_emp = [5, 10, 20, 50];
  // ITEMS DE PAGINACION DE LA TABLA INCOMPLETOS
  tamanio_pagina_inc: number = 5;
  numero_pagina_inc: number = 1;
  pageSizeOptions_inc = [5, 10, 20, 50];

  // VARIABLES DE FILTROS DE SUCURSALES
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }
  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  // VARIABLES DE FILTROS DE EMPLEADOS
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };

  // VARIABLE DE FILTROS DE TIMBRE INCOMPLETO
  get filtroCodigo_inc() { return this.reporteService.filtroCodigo_inc };
  get filtroCedula_inc() { return this.reporteService.filtroCedula_inc };
  get filtroNombreInc() { return this.reporteService.filtroNombreInc };

  constructor(
    private R_asistencias: ReportesAsistenciasService, // SERVICIO DATOS DE TIMBRES
    private validacionService: ValidacionesService, // VALIDACIONES LETRAS Y NÚMEROS
    private reporteService: ReportesService, // SERVICIO DATOS DE FILTRADOS
    private restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE MANEJO DE NOTIFICACIONES
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_timbres_incompleto');
    this.R_asistencias.DatosGeneralesUsuarios().subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_timbres_incompleto', JSON.stringify(res))
      // DATOS DE SUCURSALES
      this.sucursales = res.map(obj => {
        return {
          id: obj.id_suc,
          nombre: obj.name_suc
        }
      });
      // DATOS DE DEPARTAMENTOS
      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            nombre: ele.name_dep
          })
        })
      })
      // DATOS DE EMPLEADOS
      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula
            }
            this.empleados.push(elemento)
            this.incompletos.push(elemento)
          })
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ngOnDestroy() {
    this.respuesta = [];
    this.sucursales = [];
    this.departamentos = [];
    this.empleados = [];
    this.incompletos = [];
  }

  // VALIDACIONES REPORTES
  validacionReporte(action) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.info('Validar fechas de búsqueda.')
    if (this.bool.bool_suc === false && this.bool.bool_dep === false &&
      this.bool.bool_emp === false && this.bool.bool_inc === false) return this.toastr.warning('Seleccionar criterio de búsqueda.')
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.warning('Seleccionar sucursal o establecimiento.', '')
        this.ModelarSucursal(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.warning('Seleccionar departamento.', '')
        this.ModelarDepartamento(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Seleccionar empleado.', '')
        this.ModelarTimbresIncompleto(action);
        break;
      default:
        this.toastr.error('Ups! algo salio mal.', 'Seleccionar criterio de búsqueda.')
        this.reporteService.DefaultFormCriterios();
        break;
    }
  }

  ModelarSucursal(accion) {
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_incompleto') as any)
    let suc = respuesta.filter(o => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })
    this.data_pdf = []
    this.R_asistencias.ReporteTabuladoTimbresIncompletos(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.exportToExcel('incompleto'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_incompleto') as any)
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
    this.data_pdf = []
    this.R_asistencias.ReporteTabuladoTimbresIncompletos(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.exportToExcel('incompleto'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarTimbresIncompleto(accion) {
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_incompleto') as any)
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
    this.data_pdf = []
    this.R_asistencias.ReporteTabuladoTimbresIncompletos(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.exportToExcel('incompleto'); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })

  }

  /** ******************************** *
   *   COLORES Y LOGO PARA EL REPORTE  *
   ** ******************************** */

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

  /* **************************************************** *
   *          GENERACIÓN DE ARCHIVOS PDF                    *
   * **************************************************** */

  generarPdf(action) {
    let documentDefinition;
    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true) {
      documentDefinition = this.getDocumentDefinicion();
    }
    var f = new Date()
    let doc_name = "Reporte TimbreIncompleto" + f.toLocaleString() + ".pdf";
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
      footer: function (currentPage: any, pageCount: any, fecha: any) {
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
        { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'Reporte - Timbre Incompleto', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 5] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 20] },
        tableMarginCabecera: { margin: [0, 5, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    data.forEach((obj: IReporteTimbresIncompletos) => {
      // PRESENTACIÓN DATOS DE SUCURSAL
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
        // LA CABECERA QUE GENERA EL PDF POR DEPARTAMENTOS
        if (this.bool.bool_dep === true) {
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    border: [true, true, true, true],
                    text: 'DEPARTAMENTO: ' + obj1.name_dep,
                    style: 'itemsTableInfoBlanco'
                  }
                ]
              ]
            }
          })
        }

        obj1.empleado.forEach((obj2: any) => {
          // METODO PARA CONTAR NÚMERO DE REGISTROS DE TIMBRES INCOMPLETOS
          let total = [];
          obj2.timbres.forEach(t => {
            total = total.concat(t.timbres_hora);
            return total.length;
          })
          // METODO PARA MOSTRAR GÉNERO DE LA PERSONA
          let genero = '';
          (obj2.genero === 1) ? genero = 'M' : genero = 'F';
          // LA CABECERA QUE GENERA EL PDF POR EMPLEADOS
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + obj2.name_empleado,
                    style: 'itemsTableInfoBlanco'
                  },
                  {
                    border: [false, true, false, false],
                    text: 'Género: ' + genero,
                    style: 'itemsTableInfoBlanco'
                  },
                  {
                    border: [false, true, false, false],
                    text: 'C.I.: ' + obj2.cedula,
                    style: 'itemsTableInfoBlanco'
                  },
                  {
                    border: [false, true, false, false],
                    text: 'COD: ' + obj2.codigo,
                    style: 'itemsTableInfoBlanco'
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° REGISTROS: ' + total.length,
                    style: 'itemsTableInfoBlanco'
                  }
                ]
              ]
            }
          });

          // METODO PARA TOMAR SOLO TIMBRES INCOMPLETOS DEL EMPLEADO
          let datos: number = 0;
          let timbre_i = [];
          let arr_reg = obj2.timbres.map(t => {
            datos = datos + 1;
            timbre_i = timbre_i.concat(t.timbres_hora);
            if (datos === obj2.timbres.length) {
              return timbre_i
            }
          })
          // PRESENTACIÓN DE DATOS EN PDF
          let c = 0;
          arr_reg.map((obj4: any) => {
            if (obj4) {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', '*', '*', '*'],
                  body: [
                    [
                      { text: 'N°', style: 'tableHeader' },
                      { text: 'Fecha', style: 'tableHeader' },
                      { text: 'Tipo', style: 'tableHeader' },
                      { text: 'Hora de Timbre', style: 'tableHeader' },
                    ],
                    ...obj4.map((obj5: any) => {
                      let accion = '';
                      if (obj5.tipo === 'E') {
                        accion = 'Entrada'
                      }
                      if (obj5.tipo === 'S') {
                        accion = 'Salida'
                      }
                      if (obj5.tipo === 'F/A') {
                        accion = 'Fin Comida'
                      }
                      if (obj5.tipo === 'I/A') {
                        accion = 'Inicio Comida'
                      }
                      c = c + 1;
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: obj5.fecha_timbre },
                        { style: 'itemsTable', text: accion },
                        { style: 'itemsTable', text: obj5.hora }
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
          })
        });
      });
    })
    return n
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'incompleto':
        const wsr_inc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfTimbresIncompletos(this.data_pdf));
        const wb_inc: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_inc, wsr_inc, 'Timbre Incompleto');
        xlsx.writeFile(wb_inc, "Timbres_Incompletos" + new Date().getTime() + '.xlsx');
        break;
    }

  }

  MapingDataPdfTimbresIncompletos(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteTimbresIncompletos) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach(obj4 => {
            obj4.timbres_hora.forEach(obj5 => {
              let genero = '';
              (obj3.genero === 1) ? genero = 'M' : genero = 'F';
              let accion = '';
              if (obj5.tipo === 'E') {
                accion = 'Entrada'
              }
              if (obj5.tipo === 'S') {
                accion = 'Salida'
              }
              if (obj5.tipo === 'F/A') {
                accion = 'Fin Comida'
              }
              if (obj5.tipo === 'I/A') {
                accion = 'Inicio Comida'
              }
              let ele = {
                'Ciudad': obj1.ciudad,
                'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Contrato': obj3.contrato,
                'Cargo': obj3.cargo,
                'Empleado': obj3.name_empleado,
                'Cédula': obj3.cedula,
                'Código': obj3.codigo,
                'Género': genero,
                'Fecha Timbre': obj4.fecha,
                'Tipo': accion, 'Hora': obj5.hora,
              }
              nuevo.push(ele)
            })
          })
        })
      })
    })
    return nuevo
  }

  /* *************************************************************************** *
   *             VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.               *
   * *************************************************************************** */

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

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
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

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
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

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA MANEJO DE PIE DE PÁGINA
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
    }
  }

  // METODOS DE VALIDACIONES DE INGRESO DE LETRAS Y NÚMEROS
  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }

  MostrarLista() {
    if (this.opcion === 's') {
     /* this.nombre_suc.reset();
      this.Filtrar('', 1)*/
    }
    else if (this.opcion === 'd') {
     /* this.nombre_dep.reset();
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

}
