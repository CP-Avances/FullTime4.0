import { Component, OnInit, OnDestroy } from '@angular/core';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { TiempoLaboradoService } from 'src/app/servicios/reportes/tiempoLaborado/tiempo-laborado.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { IReporteHorasTrabaja } from 'src/app/model/reportes.model';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

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
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
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

  // VARIABLES PARA ADMINISTRAR TOLERANCIA
  tolerancia: string = 'no_considerar';
  tipoTolerancia: string = '';

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
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
  ) { 
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.BuscarInformacion();
    this.BuscarCargos();
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
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
        );
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

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_horas_trab') as any)

    let suc = respuesta.filter(o => {
      var bool =  this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    console.log('SUCURSAL', suc);
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_horas_trab') as any)

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
    this.reportesTiempoLaborado.ReporteTiempoLaborado(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
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

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_horas_trab') as any)

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
    this.reportesTiempoLaborado.ReporteTiempoLaborado(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
        case 'ver': this.verDatos(); break;
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
    let doc_name = "Reporte horas trabajadas" + f.toLocaleString() + ".pdf";
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
      pageMargins: [ 40, 60, 40, 40 ],
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
              widths: ['auto','auto','auto','auto','auto','auto'],
              body: [
                [
                  { text: 'EoS: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Entrada o Salida.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'AES: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Entrada o Salida de almuerzo.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'PES: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Entrada o Salida de permisos.', border: [false, false, false, false], style: ['quote', 'small'] }
                ]
              ]
            }
          },
          {
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
        ]
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'Horas Registradas Según Timbres', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 10] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " + this.rangoFechas.fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 10]  },
        { text: 'Nota: El siguiente reporte muestra el horario de los empleados y sus timbres realizados. Estos timbres no refieren a horas suplementarias ni horas extras autorizadas.' , bold: true, fontSize: 7 },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableTotal: { fontSize: 13, bold: true, alignment: 'center', fillColor: this.s_color},
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.p_color},
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] },
        tableMargin: { margin: [0, 0, 0, 20] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 8, 0, 8], fillColor: this.p_color },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any []): Array<any>{    
    let n: any = []
    let c = 0;

    data.forEach((obj: IReporteHorasTrabaja) => {
      
      if (this.bool.bool_dep === true || this.bool.bool_suc === true) {
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
          let arr_reg = obj1.empleado.map((o: any) => { return o.timbres.length})
          let reg = this.SumarRegistros(arr_reg);
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*','*'],
              body: [
                [
                  {
                    border: [true, true, false, true],
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

          obj2.timbres.forEach((obj3) => {
            let item_color_total = (obj3.total_diferencia.includes('-')) ? 'red':'black';

            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', '*', '*', '*', '*', '*'],
                body: [
                  [
                    { colSpan: 6, text: 'FECHA: ' + obj3.fecha },
                    '', '', '', '',''
                  ],                  
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'Observación', style: 'tableHeader' },
                    { text: 'Acción', style: 'tableHeader' },
                    { text: 'Horario Trabajo', style: 'tableHeader' },
                    { text: 'Timbre', style: 'tableHeader' },
                    { text: 'Diferencia', style: 'tableHeader' },
                  ],                  
                  ...obj3.horarios.map(obj4 => {
                    let item_color = (obj4.hora_diferencia.includes('-')) ? 'red':'black';
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: obj4.observacion },
                      { style: 'itemsTableCentrado', text: obj4.accion },
                      { style: 'itemsTableCentrado', text: obj4.hora_horario },
                      { style: 'itemsTableCentrado', text: obj4.hora_timbre },
                      { style: 'itemsTableCentrado', text: obj4.hora_diferencia, color: item_color},
                    ]
                  }),
                  [
                    { colSpan: 3, text: 'TOTAL', style: 'tableTotal' },
                    '', '',
                    { text: obj3.total_horario, bold: true, alignment: 'center' },
                    { text: obj3.total_timbres, bold: true, alignment: 'center' },
                    { text: obj3.total_diferencia, bold: true, alignment: 'center', color: item_color_total},
                  ]
                ]
              },
              layout: {
                fillColor: function (rowIndex) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });

          })

        });

      });

    });
    
    return n
  }
  
  SumarRegistros(array: any []) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor
  }

  segundosAMinutosConDecimales(segundos) {
    return Number((segundos / 60).toFixed(2));
  }

  minutosAHorasMinutosSegundos(minutos) {
    let seconds = minutos * 60;
    let hour: string | number = Math.floor(seconds / 3600);
    hour = (hour < 10)? '0' + hour : hour;
    let minute: string | number = Math.floor((seconds / 60) % 60);
    minute = (minute < 10)? '0' + minute : minute;
    let second: string | number = Number((seconds % 60).toFixed(0));
    second = (second < 10)? '0' + second : second;
    return `${hour}:${minute}:${second}`;
  }

 /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
   exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Atrasos');
        xlsx.writeFile(wb_regimen_cargo, 'Atrasos.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Atrasos');
        xlsx.writeFile(wb, 'Atrasos.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteHorasTrabaja) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            const minutos = this.segundosAMinutosConDecimales(obj4.diferencia);
            const tiempo = this.minutosAHorasMinutosSegundos(minutos);
            let ele;
            if (this.tolerancia === 'considerar') {
              ele = { 
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Régimen': obj3.regimen[0].name_regimen,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Horario': obj4.fec_hora_horario, 'Hora Horario': obj4.fec_hora_horario.split(' ')[1],
                'Fecha Timbre': obj4.fec_hora_timbre, 'Hora Timbre': obj4.fec_hora_timbre.split(' ')[1],
                'Tolerancia': obj4.tolerancia,
                'Atraso HH:MM:SS': tiempo, 'Atraso Minutos': minutos,
              }
            } else {
              ele = { 
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Régimen': obj3.regimen[0].name_regimen,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Fecha Horario': new Date(obj4.fec_hora_horario), 'Hora Horario': obj4.fec_hora_horario.split(' ')[1],
                'Fecha Timbre': new Date(obj4.fec_hora_timbre), 'Hora Timbre': obj4.fec_hora_timbre.split(' ')[1],
                'Atraso HH:MM:SS': tiempo, 'Atraso Minutos': minutos,
              }
            }
            nuevo.push(ele);
          })
        })
      })
    })
    return nuevo;
  }

  MapingDataPdfRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          const minutos = this.segundosAMinutosConDecimales(obj3.diferencia);
          const tiempo = this.minutosAHorasMinutosSegundos(minutos);
          let ele;
          if (this.tolerancia === 'considerar') {
            ele = {
              'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
              'Departamento': obj2.departamento,
              'Régimen': obj2.regimen[0].name_regimen,
              'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
              'Fecha Horario': new Date(obj3.fec_hora_horario), 'Hora Horario': obj3.fec_hora_horario.split(' ')[1],
              'Fecha Timbre': new Date(obj3.fec_hora_timbre), 'Hora Timbre': obj3.fec_hora_timbre.split(' ')[1],
              'Tolerancia': obj3.tolerancia,
              'Atraso HH:MM:SS': tiempo, 'Atraso Minutos': minutos,
            }
          } else {
            ele = {
              'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
              'Departamento': obj2.departamento,
              'Régimen': obj2.regimen[0].name_regimen,
              'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
              'Fecha Horario': new Date(obj3.fec_hora_horario), 'Hora Horario': obj3.fec_hora_horario.split(' ')[1],
              'Fecha Timbre': new Date(obj3.fec_hora_timbre), 'Hora Timbre': obj3.fec_hora_timbre.split(' ')[1],
              'Atraso HH:MM:SS': tiempo, 'Atraso Minutos': minutos,
            }
          }
          nuevo.push(ele);
        })
      })
    })
    return nuevo;
  }


    //METODOS PARA EXTRAER LOS TIMBRES EN UNA LISTA Y VISUALIZARLOS
    extraerTimbres() {
      this.timbres = [];
      let n = 0;
      this.data_pdf.forEach((obj1: IReporteHorasTrabaja) => {
        obj1.departamentos.forEach(obj2 => {
          obj2.empleado.forEach((obj3: any) => {
            obj3.timbres.forEach((obj4: any) => {
              const minutos = this.segundosAMinutosConDecimales(obj4.diferencia);
              const tiempo = this.minutosAHorasMinutosSegundos(minutos);
              n = n + 1;
              let ele = {
                n: n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep, regimen: obj3.regimen[0].name_regimen,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo, tolerancia: obj4.tolerancia,
                fechaHorario: obj4.fec_hora_horario.split(' ')[0], horaHorario: obj4.fec_hora_horario.split(' ')[1],
                fechaTimbre: obj4.fec_hora_timbre.split(' ')[0], horaTimbre: obj4.fec_hora_timbre.split(' ')[1],
                atrasoM: minutos, atrasoT: tiempo,
              }
              this.timbres.push(ele);
            })
          })
        })
      })
    }
  
    extraerTimbresRegimenCargo() {
      this.timbres = [];
      let n = 0;
      this.data_pdf.forEach((obj1: any) => {
        obj1.empleados.forEach((obj2: any) => {
          obj2.timbres.forEach((obj3: any) => {
            const minutos = this.segundosAMinutosConDecimales(obj3.diferencia);
            const tiempo = this.minutosAHorasMinutosSegundos(minutos);
            n = n + 1;
            let ele = {
              n: n,
              ciudad: obj2.ciudad, sucursal: obj2.sucursal,
              departamento: obj2.departamento, regimen: obj2.regimen[0].name_regimen,
              empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo, tolerancia: obj3.tolerancia,
              fechaHorario: obj3.fec_hora_horario.split(' ')[0], horaHorario: obj3.fec_hora_horario.split(' ')[1],
              fechaTimbre: obj3.fec_hora_timbre.split(' ')[0], horaTimbre: obj3.fec_hora_timbre.split(' ')[1],
              atrasoM: minutos, atrasoT: tiempo,
            }
            this.timbres.push(ele);
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

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  verDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg) {
      this.extraerTimbresRegimenCargo();
    } else {
      this.extraerTimbres();
    }
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
  }
}
