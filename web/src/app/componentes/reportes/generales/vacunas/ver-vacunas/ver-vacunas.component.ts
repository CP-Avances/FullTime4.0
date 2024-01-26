// IMPORTAR LIBRERIAS
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';


// IMPORTAR SERVICIOS
import { VacunaMultipleComponent } from '../vacuna-multiple/vacuna-multiple.component';
import { ReporteVacunas, vacuna, } from 'src/app/model/reportes.model';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-ver-vacunas',
  templateUrl: './ver-vacunas.component.html',
  styleUrls: ['./ver-vacunas.component.css'],
})

export class VerVacunasComponent implements OnInit {

  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL

  @Input() data: any;
  @Input() tipo: string;
  @Input() verDetalle: boolean;
  @Input() opcionBusqueda: number;
  @Output() regresar = new EventEmitter<boolean>();

  bool_suc: boolean = false;
  bool_reg: boolean = false;
  bool_car: boolean = false;
  bool_dep: boolean = false;
  bool_emp: boolean = false;

  arr_suc: any = [];
  arr_reg: any = [];
  arr_car: any = [];
  arr_dep: any = [];
  arr_emp: any = [];
  arr_vac: any = [];
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
    private validacionService: ValidacionesService,
    private vacuna: VacunaMultipleComponent,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.ValidarTipo(this.tipo);
    this.BuscarParametro();
    this.BuscarHora();
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
    this.arr_vac = [];
    let n = 0;
    this.data.forEach((obj1: any) => {
      obj1.departamentos.forEach((obj2: any) => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.vacunas.forEach((obj4: any) => {
            const fecha = this.validacionService.FormatearFecha(
              obj4.fecha.split('T')[0],
              this.formato_fecha,
              this.validacionService.dia_abreviado);

            n = n + 1;
            let ele = {
              n: n,
              id_empleado: obj4.id_empleado,
              codigo: obj3.codigo,
              empleado: obj3.name_empleado,
              cedula: obj3.cedula,
              genero: obj3.genero,
              ciudad: obj1.ciudad,
              sucursal: obj1.name_suc,
              regimen: obj3.regimen,
              departamento: obj2.name_dep,
              cargo: obj3.cargo,
              correo: obj3.correo,
              carnet: obj4.carnet,
              vacuna: obj4.tipo_vacuna,
              fecha,
              descripcion: obj4.descripcion,
            };
            this.arr_vac.push(ele);
          });
        });
      });
    });
  }

  ExtraerDatosCargosRegimen() {
    this.arr_vac = [];
    let n = 0;
    this.data.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.vacunas.forEach((obj3: any) => {
          const fecha = this.validacionService.FormatearFecha(
            obj3.fecha.split('T')[0],
            this.formato_fecha,
            this.validacionService.dia_abreviado);

          n = n + 1;
          let ele = {
            n: n,
            id_empleado: obj3.id_empleado,
            codigo: obj2.codigo,
            empleado: obj2.name_empleado,
            cedula: obj2.cedula,
            genero: obj2.genero,
            ciudad: obj2.ciudad,
            sucursal: obj2.sucursal,
            regimen: obj2.regimen,
            departamento: obj2.departamento,
            cargo: obj2.cargo,
            correo: obj2.correo,
            carnet: obj3.carnet,
            vacuna: obj3.tipo_vacuna,
            fecha,
            descripcion: obj3.descripcion,
          };
          this.arr_vac.push(ele);
        });
      });
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
    let doc_name = `Vacunas_usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.pdf`;
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
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 40],
      watermark: {
        text: this.frase,
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text: 'Impreso por:  ' + localStorage.getItem('fullname_print'),
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: 'right',
      },

      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
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
                  alignment: 'right',
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        {
          text: localStorage.getItem('name_empresa')?.toUpperCase(),
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, -30, 0, 5],
        },
        {
          text: `REGISTRO DE VACUNACIÓN - ${this.opcionBusqueda==1 ? 'ACTIVOS': 'INACTIVOS'}`,
          bold: true,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        ...this.EstructurarDatosPDF(this.data).map((obj) => {
          return obj;
        }),
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
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      },
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = [];

    if (this.bool_car === true || this.bool_reg === true) {
      data.forEach((obj1: any) => {
        if (this.bool_car === true) {
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
                    border: [true, true, false, true],
                    bold: true,
                    text: 'RÉGIMEN: ' + obj1.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, true],
                    text: 'N° Registros: ' + obj1.empleados.length,
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
                    text: this.bool_reg ? 'CARGO: ' + obj2.cargo : '',
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
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['*', '*', '*', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'VACUNA', style: 'tableHeader' },
                  { text: 'FECHA', style: 'tableHeader' },
                  { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                ],
                ...obj2.vacunas.map((obj3: any) => {
                  const fecha = this.validacionService.FormatearFecha(
                    obj3.fecha.split('T')[0],
                    this.formato_fecha,
                    this.validacionService.dia_abreviado);
                  return [
                    {
                      style: 'itemsTableCentrado',
                      text: obj2.vacunas.indexOf(obj3) + 1,
                    },
                    { style: 'itemsTableCentrado', text: obj3.tipo_vacuna },
                    { style: 'itemsTableCentrado', text: fecha },
                    { style: 'itemsTable', text: obj3.descripcion },
                  ];
                }),
              ],
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return rowIndex % 2 === 0 ? '#E5E7E9' : null;
              },
            },
          });
        });
      });
    } else {
      data.forEach((obj: ReporteVacunas) => {
        if (this.bool_suc === true) {
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
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, true],
                    text: 'SUCURSAL: ' + obj.name_suc,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }

        obj.departamentos.forEach((obj1) => {
          // LA CABECERA CUANDO SE GENERA EL PDF POR DEPARTAMENTOS
          if (this.bool_dep === true) {
            let arr_reg = obj1.empleado.map((o: any) => {
              return o.vacunas.length;
            });
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
                      style: 'itemsTableInfo',
                    },
                    {
                      border: [false, true, true, true],
                      text: 'N° REGISTROS: ' + reg,
                      style: 'itemsTableInfo',
                    },
                  ],
                ],
              },
            });
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
                      text: this.bool_suc || this.bool_emp?'DEPARTAMENTO: ' + obj2.departamento:'',
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
                ],
              },
            });
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['*', '*', '*', '*'],
                headerRows: 1,
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'VACUNA', style: 'tableHeader' },
                    { text: 'FECHA', style: 'tableHeader' },
                    { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                  ],
                  ...obj2.vacunas.map((obj3: any) => {
                    const fecha = this.validacionService.FormatearFecha(
                      obj3.fecha.split('T')[0],
                      this.formato_fecha,
                      this.validacionService.dia_abreviado);
                    return [
                      {
                        style: 'itemsTableCentrado',
                        text: obj2.vacunas.indexOf(obj3) + 1,
                      },
                      { style: 'itemsTableCentrado', text: obj3.tipo_vacuna },
                      { style: 'itemsTableCentrado', text: fecha },
                      { style: 'itemsTable', text: obj3.descripcion },
                    ];
                  }),
                ],
              },
              layout: {
                fillColor: function (rowIndex: any) {
                  return rowIndex % 2 === 0 ? '#E5E7E9' : null;
                },
              },
            });
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

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.EstructurarDatosExcel(this.data)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, `Vacunas_usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    let regimen = '';
    array.forEach((obj1: ReporteVacunas) => {
      obj1.departamentos.forEach((obj2) => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.regimen.forEach((r: any) => regimen = r.name_regimen);
          obj3.vacunas.forEach((obj4: vacuna) => {
            c = c + 1;
            let ele = {
              'N°': c,
              'Código Empleado': obj3.codigo,
              'Nombre Empleado': obj3.name_empleado,
              Cédula: obj3.cedula,
              Género: obj3.genero == 1 ? 'M' : 'F',
              Sucursal: obj1.name_suc,
              Ciudad: obj1.ciudad,
              Régimen: regimen,
              Departamento: obj2.name_dep,
              Cargo: obj3.cargo,
              Correo: obj3.correo,
              Carnet: obj4.carnet?.length ? 'Si' : 'No',
              Vacuna: obj4.tipo_vacuna,
              Fecha: obj4.fecha.split('T')[0],
              Descripción: obj4.descripcion,
            };
            nuevo.push(ele);
          });
        });
      });
    });
    return nuevo;
  }

  ExportarExcelCargoRegimen(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.EstructurarDatosExcelRegimenCargo(this.data)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, `Vacunas_usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    array.forEach((obj) => {
      obj.empleados.forEach((obj2: any) => {
        obj2.vacunas.forEach((obj3: any) => {
          c = c + 1;
          let ele = {
            'N°': c,
            'Código Empleado': obj2.codigo,
            'Nombre Empleado': obj2.name_empleado,
            Cédula: obj2.cedula,
            Género: obj2.genero == 1 ? 'M' : 'F',
            Sucursal: obj2.sucursal,
            Ciudad: obj2.ciudad,
            Régimen: this.bool_car ? obj2.regimen : obj2.regimen[0].name_regimen,
            Departamento: obj2.departamento,
            Cargo: obj2.cargo,
            Correo: obj2.correo,
            Carnet: obj3.carnet?.length ? 'Si' : 'No',
            Vacuna: obj3.tipo_vacuna,
            Fecha: obj3.fecha.split('T')[0],
            Descripción: obj3.descripcion,
          };
          nuevo.push(ele);
        });
      });
    });
    return nuevo;
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.vacuna.verDetalle = false;
    this.regresar.emit(true);
  }
}
