import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { IReporteAtrasos } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-reporte-empleados',
  templateUrl: './reporte-empleados.component.html',
  styleUrls: ['./reporte-empleados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class ReporteEmpleadosComponent implements OnInit {

  buscador !: FormGroup;

  respuesta: any[];
  sucursales: any = [];
  cargos: any = [];
  departamentos: any = [];
  empleados: any = [];
  bool_suc: boolean = false;
  bool_car: boolean = false;
  bool_dep: boolean = false;
  bool_emp: boolean = false;
  data_pdf: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  seleccion = new FormControl('');
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_car = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);

  filtroCodigo: number;
  filtroCedula: '';
  filtroNombreEmp: '';
  filtroNombreDep: '';
  filtroNombreSuc: '';
  filtroNombreCar: '';

  constructor(
    private toastr: ToastrService,
    private R_asistencias: ReportesAsistenciasService,
    private restEmpre: EmpresaService
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_emp_activos');
    this.R_asistencias.DepartamentosByEmplEstado(1).subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_emp_activos', JSON.stringify(res))
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
              cedula: r.cedula,
              correo: r.correo,
              cargo: r.cargo,
              id_contrato: r.id_contrato,
              hora_trabaja: r.hora_trabaja,
              sucursal: r.sucursal,
              departamento: r.departamento,
            })
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);
      this.BuscarCargos();
      console.log('CARGOS', this.cargos);

    }, err => {
      console.log(' sucursales ' + err.error.message);
      this.toastr.error(err.error.message, '', {
        timeOut: 10000,
      })
    })
    
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  BuscarCargos() {
    this.R_asistencias.ObtenerInformacionCargo(1).subscribe((res: any[]) => {
      this.origen_cargo = JSON.stringify(res);

      console.log('ver res cargo ', res)
      res.forEach(obj => {
        this.cargos.push({
          id: obj.id_cargo,
          nombre: obj.name_cargo
        })
      })

      res.forEach(obj => {
        obj.empleados.forEach(r => {
          this.empleados_cargos.push({
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
          })
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  opcion: number;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = parseInt(e.value);
    switch (e.value) {
      case '1':
        this.bool_suc = true; this.bool_car = false; this.bool_dep = false; this.bool_emp = false;
        break;
      case '2':
        this.bool_suc = false; this.bool_car = true; this.bool_dep = false; this.bool_emp = false;
        break;
      case '3':
        this.bool_suc = false; this.bool_car = false; this.bool_dep = true; this.bool_emp = false;
        break;
      case '4':
        this.bool_suc = false; this.bool_car = false; this.bool_dep = false; this.bool_emp = true;
        break;
      default:
        this.bool_suc = false; this.bool_car = false; this.bool_dep = false; this.bool_emp = false;
        break;
    }
  }


  /**
   * VALIDACIONES REPORT
   */
  validacionReporte(action) {

    if (this.bool_suc === false && this.bool_car === false && this.bool_dep === false && this.bool_emp === false) return this.toastr.error('Seleccione un criterio de búsqueda')

    switch (this.opcion) {
      case 1:
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione sucursal')
        this.ModelarSucursal(action);
        break;
      case 2:
        if (this.selectionCar.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione Cargo')
        this.ModelarCargo(action);
        break;
      case 3:
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione departamentos')
        this.ModelarDepartamento(action);
        break;
      case 4:
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione empleados')
        this.ModelarEmpleados(action);
        break;
      default:
        this.bool_suc = false; this.bool_car = false; this.bool_dep = false; this.bool_emp = false;
        break;
    }
  }

  ModelarSucursal(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_emp_activos') as any)

    let suc = respuesta.filter(o => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    console.log('SUCURSAL', suc);
    this.data_pdf = [];
    this.data_pdf = suc;
    switch (accion) {
      case 'excel': this.exportToExcel(); break;
      default: this.generarPdf(accion); break;
    }
  }

  ModelarCargo(accion) {

    let respuesta = JSON.parse(this.origen_cargo);

    let car = respuesta.filter(o => {
      var bool = this.selectionCar.selected.find(obj1 => {
        return obj1.id === o.id_cargo
      })
      return bool != undefined
    })

    console.log('CARGO', car);
    this.data_pdf = [];
    this.data_pdf = car;
    switch (accion) {
      case 'excel': this.exportToExcelCargo(); break;
      default: this.generarPdf(accion); break;
    }
  }

  ModelarDepartamento(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_emp_activos') as any)

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
    console.log('DEPARTAMENTOS', dep);
    this.data_pdf = [];
    this.data_pdf = dep;
    switch (accion) {
      case 'excel': this.exportToExcel(); break;
      default: this.generarPdf(accion); break;
    }
  }

  ModelarEmpleados(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_emp_activos') as any)

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

    console.log('EMPLEADOS', emp);
    this.data_pdf = [];
    this.data_pdf = emp;
    switch (accion) {
      case 'excel': this.exportToExcel(); break;
      default: this.generarPdf(accion); break;
    }

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
    let doc_name = "Reporte empleados activos" + f.toLocaleString() + ".pdf";
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
      pageMargins: [40, 60, 40, 40],
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
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -35, 0, 10] },
        { text: 'Reporte - Empleados Activos', bold: true, fontSize: 13, alignment: 'center' },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 12 },
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

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    let arr_emp: any = [];

    if (this.bool_car === true) {
      data.forEach((obj1) => {
        // let array_car = obj1.empleados.map(o => {return o.empleados.length});
        let arr_emp: any = [];

        
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
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, true, true],
                  text: 'N° Registros: ' + obj1.empleados.length,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        });

        obj1.empleados.forEach(obj2 => {
            arr_emp.push(obj2)
        })

        n.push({
          style: 'tableMarginEmp',
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'EMPLEADO', style: 'tableHeader' },
                { text: 'CÉDULA', style: 'tableHeader' },
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'SUCURSAL', style: 'tableHeader' },
                { text: 'CORREO', style: 'tableHeader' }
              ],
              ...arr_emp.map(obj3 => {
                c = c + 1
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTable', text: obj3.name_empleado },
                  { style: 'itemsTable', text: obj3.cedula },
                  { style: 'itemsTable', text: obj3.codigo },
                  { style: 'itemsTable', text: obj3.sucursal },
                  { style: 'itemsTable', text: obj3.correo},
                ]
              }),
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      })
    }

    data.forEach((obj: IReporteAtrasos) => {

      if (this.bool_suc === true) {
        let arr_suc = obj.departamentos.map(o => { return o.empleado.length });
        let suma_suc = this.SumarRegistros(arr_suc);
        let arr_emp: any = [];
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
                  text: 'N° Registros: ' + suma_suc,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        });

        obj.departamentos.forEach(o => {
          o.empleado.forEach(e => {
            arr_emp.push(e)
          })
        })

        n.push({
          style: 'tableMarginEmp',
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'EMPLEADO', style: 'tableHeader' },
                { text: 'CÉDULA', style: 'tableHeader' },
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'CARGO', style: 'tableHeader' },
                { text: 'CORREO', style: 'tableHeader' }
              ],
              ...arr_emp.map(obj3 => {
                c = c + 1
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTable', text: obj3.name_empleado },
                  { style: 'itemsTable', text: obj3.cedula },
                  { style: 'itemsTable', text: obj3.codigo },
                  { style: 'itemsTable', text: obj3.cargo},
                  { style: 'itemsTable', text: obj3.correo},
                ]
              }),
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }

      if (this.bool_dep === true) {

        n.push({
          style: 'tableMarginSuc',
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

        obj.departamentos.forEach(obj1 => {
          arr_emp = [];
          obj1.empleado.forEach(e => {
            arr_emp.push(e)
          })
          let reg = obj1.empleado.length
          n.push({
            style: 'tableMarginDep',
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    border: [true, true, false, false],
                    text: 'DEPARTAMENTO: ' + obj1.name_dep,
                    style: 'itemsTable'
                  },
                  {
                    border: [true, true, true, false],
                    text: 'N° EMPLEADOS DEPARTAMENTO: ' + reg,
                    style: 'itemsTable'
                  }
                ]
              ]
            }
          })

          n.push({
            style: 'tableMarginEmp',
            table: {
              widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'CARGO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map(obj3 => {
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTable', text: obj3.name_empleado },
                    { style: 'itemsTable', text: obj3.cedula },
                    { style: 'itemsTable', text: obj3.codigo },
                    { style: 'itemsTable', text: obj3.cargo },
                    { style: 'itemsTable', text: obj3.correo },
                  ]
                }),
              ]
            },
            layout: {
              fillColor: function (rowIndex) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });

        });

      }

      if (this.bool_emp === true) {

        obj.departamentos.forEach(o => {
          o.empleado.forEach(e => {
            arr_emp.push(e)
          })
        })
      }

    })

    if (arr_emp.length > 0 && this.bool_emp === true) {
      c = 0
      n.push({
        style: 'tableMarginEmp',
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'N°', style: 'tableHeader' },
              { text: 'EMPLEADO', style: 'tableHeader' },
              { text: 'CÉDULA', style: 'tableHeader' },
              { text: 'CÓDIGO', style: 'tableHeader' },
              { text: 'CARGO', style: 'tableHeader' },
              { text: 'CORREO', style: 'tableHeader' }
            ],
            ...arr_emp.map(obj3 => {
              c = c + 1
              return [
                { style: 'itemsTableCentrado', text: c },
                { style: 'itemsTable', text: obj3.name_empleado },
                { style: 'itemsTable', text: obj3.cedula },
                { style: 'itemsTable', text: obj3.codigo },
                { style: 'itemsTable', text: obj3.cargo },
                { style: 'itemsTable', text: obj3.cargo },
              ]
            }),
          ]
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    }

    return n
  }

  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel(): void {

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Empleados Activos');
    xlsx.writeFile(wb, "Empleados Activos " + new Date().getTime() + '.xlsx');

  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    console.log(array);
    array.forEach((obj1: IReporteAtrasos) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach(obj3 => {
          console.log(obj3);

          let ele = {
            'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
            'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
            'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
            'Género': obj3.genero, 'Cargo': obj3.cargo
          }
          nuevo.push(ele)
        })
      })
    })
    return nuevo
  }

  exportToExcelCargo(): void {

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefaultCargo(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Empleados Activos');
    xlsx.writeFile(wb, "Empleados Activos " + new Date().getTime() + '.xlsx');

  }

  MapingDataPdfDefaultCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1) => {
      obj1.empleados.forEach(obj2 => {
          let ele = {
            'Ciudad': obj2.ciudad,
            'Sucursal': obj2.sucursal,
            'Departamento': obj2.departamento,
            'Id Empleado': obj2.id, 'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
            'Género': obj2.genero, 'Cargo': obj2.cargo
          }
          nuevo.push(ele)
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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  limpiarCampos() {
    if (this.bool_emp) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.bool_emp = false;
    }
    if (this.bool_dep) {
      this.nombre_dep.reset();
      this.bool_dep = false;
    }
    if (this.bool_car) {
      this.nombre_car.reset();
      this.bool_car = false;
    }
    if (this.bool_suc) {
      this.nombre_suc.reset();
      this.bool_suc = false;
    }
    this.seleccion.reset();
  }


  MostrarLista() {
    if (this.opcion === 1) {
      this.nombre_suc.reset();
      //this.Filtrar('', 1)
    }
    if (this.opcion === 2) {
      this.nombre_car.reset();
      //this.Filtrar('', 1)
    }
    else if (this.opcion === 3) {
      this.nombre_dep.reset();
      // this.Filtrar('', 2)
    }
    else if (this.opcion === 4) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      /*this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }
}
