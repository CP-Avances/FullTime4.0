// IMPORTAR LIBRERIAS
import { ReporteEmpleadosComponent } from '../reporte-empleados/reporte-empleados.component';
import { Component, Input, OnInit } from '@angular/core';
import { IReporteAtrasos } from 'src/app/model/reportes.model';
import { PageEvent } from '@angular/material/paginator';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';


@Component({
  selector: 'app-ver-empleados-detalle',
  templateUrl: './ver-empleados-detalle.component.html',
  styleUrls: ['./ver-empleados-detalle.component.css'],
})

export class VerEmpleadosDetalleComponent implements OnInit {

  @Input() data: any;
  @Input() tipo: string;
  @Input() verDetalle: boolean;
  @Input() opcionBusqueda: number;

  bool_suc: boolean = false;
  bool_reg: boolean = false;
  bool_car: boolean = false;
  bool_dep: boolean = false;
  bool_emp: boolean = false;

  arr_emp: any = [];
  c: number;

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  //COLORES Y LOGO
  p_color: any;
  s_color: any;
  frase: any;
  logo: any = String;

  constructor(
    private reporte: ReporteEmpleadosComponent,
    private restEmpre: EmpresaService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.ValidarTipo(this.tipo);
  }

  ValidarTipo(tipo: string) {
    switch (tipo) {
      case 'suc':
        this.bool_suc = true;
        this.bool_reg = false;
        this.bool_car = false;
        this.bool_dep = false;
        this.bool_emp = false;
        this.ExtraerDatos();
        break;
      case 'reg':
        this.bool_suc = false;
        this.bool_reg = true;
        this.bool_car = false;
        this.bool_dep = false;
        this.bool_emp = false;
        this.ExtraerDatosCargosRegimen();
        break;
      case 'car':
        this.bool_suc = false;
        this.bool_reg = false;
        this.bool_car = true;
        this.bool_dep = false;
        this.bool_emp = false;
        this.ExtraerDatosCargosRegimen();
        break;
      case 'dep':
        this.bool_suc = false;
        this.bool_reg = false;
        this.bool_car = false;
        this.bool_dep = true;
        this.bool_emp = false;
        this.ExtraerDatos();
        break;
      case 'emp':
        this.bool_suc = false;
        this.bool_reg = false;
        this.bool_car = false;
        this.bool_dep = false;
        this.bool_emp = true;
        this.ExtraerDatos();
        break;
      default:
        this.bool_suc = false;
        this.bool_reg = false;
        this.bool_car = false;
        this.bool_dep = false;
        this.bool_emp = false;
        break;
    }
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerDatos() {
    this.arr_emp = [];
    let n = 0;
    this.data.forEach((obj: any) => {
      obj.departamentos.forEach((dep: any) => {
        dep.empleado.forEach((e: any) => {
          this.arr_emp.push(e);
        });
      });
    });
    this.arr_emp.sort(function(a: any, b: any){
      return ((a.apellido+a.nombre).toLowerCase().localeCompare((b.apellido+b.nombre).toLowerCase()))
    });
    this.arr_emp.forEach((u: any) => {
      n = n + 1;
      u['n'] = n;
    });
  }

  ExtraerDatosCargosRegimen() {
    this.arr_emp = [];
    let n = 0;
    this.data.forEach((obj: any) => {
      obj.empleados.forEach((e: any) => {
        this.arr_emp.push(e);
      });
    });
    this.arr_emp.sort(function(a: any, b: any){
      return ((a.apellido+a.nombre).toLowerCase().localeCompare((b.apellido+b.nombre).toLowerCase()))
    });
    this.arr_emp.forEach((u: any) => {
      n = n + 1;
      u['n'] = n;
    });
  }

  DescargarReporte(accion: any) {
    if (this.bool_car || this.bool_reg) {
      switch (accion) {
        case 'excel':
          this.ExportarExcelCargoRegimen();
          break;
        default:
          this.GenerarPDF(accion);
          break;
      }
    } else {
      switch (accion) {
        case 'excel':
          this.ExportarExcel();
          break;
        default:
          this.GenerarPDF(accion);
          break;
      }
    }
  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

  ObtenerLogo() {
    this.restEmpre
      .LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string)
      .subscribe((res) => {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
      });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  ObtenerColores() {
    this.restEmpre
      .ConsultarDatosEmpresa(
        parseInt(localStorage.getItem('empresa') as string)
      )
      .subscribe((res) => {
        this.p_color = res[0].color_p;
        this.s_color = res[0].color_s;
        this.frase = res[0].marca_agua;
      });
  }

  /** ****************************************************************************************** **
   **                                              PDF                                           **
   ** ****************************************************************************************** **/

  GenerarPDF(action: any) {
    const documentDefinition = this.GetDocumentDefinicion();
    let doc_name = `Usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.pdf`;
    switch (action) {
      case 'open':
        pdfMake.createPdf(documentDefinition).open();
        break;
      case 'print':
        pdfMake.createPdf(documentDefinition).print();
        break;
      case 'download':
        pdfMake.createPdf(documentDefinition).download(doc_name);
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  GetDocumentDefinicion() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 40],
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
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `USUARIOS - ${this.opcionBusqueda==1 ? 'ACTIVOS': 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0], },
        ...this.EstructurarDatosPDF(this.data).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0],fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginEmp: { margin: [0, 15, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    let arr_emp: any = [];

    if (this.bool_car === true || this.bool_reg === true) {
      data.forEach((obj1: any) => {
        arr_emp = [];
        if (this.bool_car === true) {
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', '*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, false, false],
                    bold: true,
                    text: 'CARGO: ' + obj1.name_cargo,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° Registros: ' + obj1.empleados.length,
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
                    border: [true, true, false, false],
                    bold: true,
                    text: 'RÉGIMEN: ' + obj1.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° Registros: ' + obj1.empleados.length,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }

        obj1.empleados.forEach((obj2: any) => {
          arr_emp.push(obj2)
        });

        arr_emp.sort(function(a: any, b: any){
          return ((a.apellido+a.nombre).toLowerCase().localeCompare((b.apellido+b.nombre).toLowerCase()))
        });

        if (this.bool_car) {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'SUCURSAL', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'RÉGIMEN', style: 'tableHeader' },
                  { text: 'DEPARTAMENTO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((obj3: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(obj3) + 1 },
                    { style: 'itemsTableCentrado', text: obj3.codigo },
                    { style: 'itemsTable', text: obj3.name_empleado },
                    { style: 'itemsTable', text: obj3.cedula },
                    { style: 'itemsTableCentrado', text: obj3.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: obj3.sucursal },
                    { style: 'itemsTable', text: obj3.ciudad },
                    { style: 'itemsTable', text: obj3.regimen },
                    { style: 'itemsTable', text: obj3.departamento },
                    { style: 'itemsTable', text: obj3.correo },
                  ]
                }),
              ]
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        } else {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'SUCURSAL', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'DEPARTAMENTO', style: 'tableHeader' },
                  { text: 'CARGO' , style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((obj3: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(obj3) + 1 },
                    { style: 'itemsTableCentrado', text: obj3.codigo },
                    { style: 'itemsTable', text: obj3.name_empleado },
                    { style: 'itemsTable', text: obj3.cedula },
                    { style: 'itemsTableCentrado', text: obj3.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: obj3.sucursal },
                    { style: 'itemsTable', text: obj3.ciudad },
                    { style: 'itemsTable', text: obj3.departamento },
                    { style: 'itemsTable', text: obj3.cargo },
                    { style: 'itemsTable', text: obj3.correo },
                  ]
                }),
              ]
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        }
      })
    }

    else {
      data.forEach((obj: IReporteAtrasos) => {
        if (this.bool_suc === true) {
          let arr_suc = obj.departamentos.map(o => { return o.empleado.length });
          let suma_suc = this.SumarRegistros(arr_suc);
          arr_emp = [];
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', '*', '*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, false, false],
                    bold: true,
                    text: 'CIUDAD: ' + obj.ciudad,
                    style: 'itemsTableInfo'
                  },
                  {
                    border: [false, true, false, false],
                    text: 'SUCURSAL: ' + obj.name_suc,
                    style: 'itemsTableInfo'
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° Registros: ' + suma_suc,
                    style: 'itemsTableInfo'
                  }
                ]
              ]
            }
          });
        }

        obj.departamentos.forEach((obj1) => {
          if (this.bool_dep === true) {
            let reg = obj1.empleado.length;
            obj1.empleado.sort(function(a: any, b: any){
              return ((a.apellido+a.nombre).toLowerCase().localeCompare((b.apellido+b.nombre).toLowerCase()))
            });
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*', '*'],
                headerRows: 1,
                body: [
                  [
                    {
                      border: [true, true, false, false],
                      text: 'DEPARTAMENTO: ' + obj1.name_dep,
                      style: 'itemsTableInfo',
                    },
                    {
                      border: [false, true, true, false],
                      text: 'N° REGISTROS: ' + reg,
                      style: 'itemsTableInfo',
                    },
                  ],
                ],
              },
            });
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                headerRows: 1,
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'CÓDIGO', style: 'tableHeader' },
                    { text: 'EMPLEADO', style: 'tableHeader' },
                    { text: 'CÉDULA', style: 'tableHeader' },
                    { text: 'GÉNERO', style: 'tableHeader' },
                    { text: 'SUCURSAL', style: 'tableHeader' },
                    { text: 'CIUDAD', style: 'tableHeader' },
                    { text: 'RÉGIMEN', style: 'tableHeader' },
                    { text: 'CARGO', style: 'tableHeader' },
                    { text: 'CORREO', style: 'tableHeader' }
                  ],
                  ...obj1.empleado.map((obj3: any) => {
                    return [
                      { style: 'itemsTableCentrado', text: obj1.empleado.indexOf(obj3) + 1 },
                      { style: 'itemsTableCentrado', text: obj3.codigo },
                      { style: 'itemsTable', text: obj3.name_empleado },
                      { style: 'itemsTable', text: obj3.cedula },
                      { style: 'itemsTableCentrado', text: obj3.genero == 1 ? 'M' : 'F' },
                      { style: 'itemsTable', text: obj3.sucursal },
                      { style: 'itemsTable', text: obj3.ciudad },
                      { style: 'itemsTable', text: obj3.regimen[0].name_regimen },
                      { style: 'itemsTable', text: obj3.cargo },
                      { style: 'itemsTable', text: obj3.correo },
                    ]
                  }),
                ]
              },
              layout: {
                fillColor: function (rowIndex: any) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });
          } else {
              obj1.empleado.forEach(e => {
                arr_emp.push(e)
              });
              arr_emp.sort(function(a: any, b: any){
                return ((a.apellido+a.nombre).toLowerCase().localeCompare((b.apellido+b.nombre).toLowerCase()))
              });
          }
        });
        if (this.bool_suc) {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'RÉGIMEN', style: 'tableHeader' },
                  { text: 'DEPARTAMENTO', style: 'tableHeader' },
                  { text: 'CARGO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((obj3: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(obj3) + 1 },
                    { style: 'itemsTableCentrado', text: obj3.codigo },
                    { style: 'itemsTable', text: obj3.name_empleado },
                    { style: 'itemsTable', text: obj3.cedula },
                    { style: 'itemsTableCentrado', text: obj3.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: obj3.ciudad },
                    { style: 'itemsTable', text: obj3.regimen[0].name_regimen },
                    { style: 'itemsTable', text: obj3.departamento },
                    { style: 'itemsTable', text: obj3.cargo },
                    { style: 'itemsTable', text: obj3.correo },
                  ]
                }),
              ]
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        }

      });

      if (this.bool_emp) {
        n.push({
          style: 'tableMarginEmp',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'EMPLEADO', style: 'tableHeader' },
                { text: 'CÉDULA', style: 'tableHeader' },
                { text: 'GÉNERO', style: 'tableHeader' },
                { text: 'CIUDAD', style: 'tableHeader' },
                { text: 'SUCURSAL', style: 'tableHeader' },
                { text: 'RÉGIMEN', style: 'tableHeader' },
                { text: 'DEPARTAMENTO', style: 'tableHeader' },
                { text: 'CARGO', style: 'tableHeader' },
                { text: 'CORREO', style: 'tableHeader' }
              ],
              ...arr_emp.map((obj3: any) => {
                return [
                  { style: 'itemsTableCentrado', text: arr_emp.indexOf(obj3) + 1 },
                  { style: 'itemsTableCentrado', text: obj3.codigo },
                  { style: 'itemsTable', text: obj3.name_empleado },
                  { style: 'itemsTable', text: obj3.cedula },
                  { style: 'itemsTableCentrado', text: obj3.genero == 1 ? 'M' : 'F' },
                  { style: 'itemsTable', text: obj3.ciudad },
                  { style: 'itemsTable', text: obj3.sucursal },
                  { style: 'itemsTable', text: obj3.regimen[0].name_regimen },
                  { style: 'itemsTable', text: obj3.departamento },
                  { style: 'itemsTable', text: obj3.cargo },
                  { style: 'itemsTable', text: obj3.correo },
                ]
              }),
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }

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

  ExportarExcel(): void {

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Usuarios');
    xlsx.writeFile(wb, `Usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.xlsx`);

  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let usuarios: any[] = [];
    let c = 0;
    let regimen = '';
    array.forEach((obj1: IReporteAtrasos) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.regimen.forEach((r: any) => (regimen = r.name_regimen));
          let ele = {
            'Código Empleado': obj3.codigo, 'Nombre': obj3.nombre, 'Apellido': obj3.apellido,
            'Cédula': obj3.cedula, 'Género': obj3.genero == 1 ? 'M' : 'F',
            'Sucursal': obj1.name_suc, 'Ciudad': obj1.ciudad,
            'Régimen': regimen,
            'Departamento': obj2.name_dep,
            'Cargo': obj3.cargo,
            'Correo': obj3.correo,
          }
          nuevo.push(ele);
        })
      })
    });
    nuevo.sort(function(a: any, b: any){
      return ((a.Apellido+a.Nombre).toLowerCase().localeCompare((b.Apellido+b.Nombre).toLowerCase()))
    });
    nuevo.forEach((u: any)=>{
      c = c + 1;
      const usuarioNuevo = Object.assign({'N°': c}, u);
      usuarios.push(usuarioNuevo);
    });

    return usuarios;
  }

  ExportarExcelCargoRegimen(): void {

    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcelRegimenCargo(this.data));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Usuarios');
    xlsx.writeFile(wb, `Usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.xlsx`);

  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let usuarios: any[] = [];
    let c = 0;
    array.forEach((obj1) => {
      obj1.empleados.forEach((obj2: any) => {
        let ele = {
          'Código Empleado': obj2.codigo, 'Nombre': obj2.nombre, 'Apellido': obj2.apellido,
          'Cédula': obj2.cedula, 'Género': obj2.genero == 1 ? 'M' : 'F',
          'Sucursal': obj2.sucursal, 'Ciudad': obj2.ciudad,
          'Régimen': this.bool_car ? obj2.regimen : obj2.regimen[0].name_regimen,
          'Departamento': obj2.departamento,
          'Cargo': obj2.cargo,
          'Correo': obj2.correo,
        }
        nuevo.push(ele)
      })
    });
    nuevo.sort(function(a: any, b: any){
      return ((a.Apellido+a.Nombre).toLowerCase().localeCompare((b.Apellido+b.Nombre).toLowerCase()))
    });
    nuevo.forEach((u: any)=>{
      c = c + 1;
      const usuarioNuevo = Object.assign({'N°': c}, u);
      usuarios.push(usuarioNuevo);
    });

    return usuarios;
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.reporte.verDetalle = false;
  }

}