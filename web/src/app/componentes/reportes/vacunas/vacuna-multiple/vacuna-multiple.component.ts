// IMPORTAR LIBRERIAS
import { ITableEmpleados, ReporteVacunas, vacuna } from 'src/app/model/reportes.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { VacunasService } from 'src/app/servicios/reportes/vacunas/vacunas.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';

@Component({
  selector: 'app-vacuna-multiple',
  templateUrl: './vacuna-multiple.component.html',
  styleUrls: ['./vacuna-multiple.component.css'],
})
export class VacunaMultipleComponent implements OnInit, OnDestroy {
  // METODO QUE INDICA OPCIONES DE BUSQUEDA SELECCIONADOS
  get bool() {
    return this.reporteService.criteriosBusqueda;
  }

  // VARIABLE QUE INDICA NÚMERO DE OPCIONES DE BUSQUEDA
  get opcion() {
    return this.reporteService.opcion;
  }

  // VARIABLES DE ALMACENAMIENTO DE RESULTADOS
  departamentos: any = [];
  sucursales: any = [];
  cargos: any = [];
  empleados: any = [];
  respuesta: any[];

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE PDF
  data_pdf: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  numero_pagina_suc: number = 1;
  tamanio_pagina_suc: number = 5;
  pageSizeOptions_suc = [5, 10, 20, 50];

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

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS SUCURSAL
  get filtroNombreSuc() {
    return this.reporteService.filtroNombreSuc;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS CARGOS
  get filtroNombreCar() {
    return this.reporteService.filtroNombreCarg;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS DEPARTAMENTO
  get filtroNombreDep() {
    return this.reporteService.filtroNombreDep;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS EMPLEADO
  get filtroCodigo() {
    return this.reporteService.filtroCodigo;
  }
  get filtroCedula() {
    return this.reporteService.filtroCedula;
  }
  get filtroNombreEmp() {
    return this.reporteService.filtroNombreEmp;
  }

  constructor(
    private R_asistencias: ReportesAsistenciasService, // SERVICIO BUSQUEDA DE DATOS DE DEPARTAMENTOS
    private validacionService: ValidacionesService, // VARIABLE DE VALIDACIONES DE INGRESO DE LETRAS O NÚMEROS
    private reporteService: ReportesService, // SERVICIO DATOS DE BUSQUEDA GENERALES DE REPORTE
    private restEmpre: EmpresaService, // SERVICIO DATOS GENERALES DE EMPRESA
    private R_vacuna: VacunasService, // SERVICIO DATOS PARA REPORTE DE VACUNAS
    private toastr: ToastrService // VARIABLE DE MANEJO DE NOTIFICACIONES
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_vacunas_multiples');
    // BUSQUEDA DE DEPARTAMENTOS
    this.R_asistencias.DatosGeneralesUsuarios().subscribe(
      (res: any[]) => {
        sessionStorage.setItem(
          'reporte_vacunas_multiples',
          JSON.stringify(res)
        );

        // BUSQUEDA DE SUCURSALES
        this.sucursales = res.map((obj) => {
          return {
            id: obj.id_suc,
            nombre: obj.name_suc,
          };
        });

        // BUSQUEDA DE DEPARTAMENTOS
        res.forEach((obj) => {
          obj.departamentos.forEach((ele) => {
            this.departamentos.push({
              id: ele.id_depa,
              nombre: ele.name_dep,
            });
          });
        });

        // BUSQUEDA DE DEPARTAMENTO - EMPLEADOS
        res.forEach((obj) => {
          obj.departamentos.forEach((ele) => {
            ele.empleado.forEach((r) => {
              let elemento = {
                id: r.id,
                nombre: r.name_empleado,
                codigo: r.codigo,
                cedula: r.cedula,
              };
              this.empleados.push(elemento);
            });
          });
        });
        this.BuscarCargos();
        console.log('CARGOS', this.cargos);
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  ngOnDestroy() {
    this.respuesta = [];
    this.sucursales = [];
    this.cargos = [];
    this.departamentos = [];
    this.empleados = [];
  }

  // METODO PARA FILTRAR POR CARGOS
  empleados_cargos: any = [];
  origen_cargo: any = [];
  BuscarCargos() {
    this.R_asistencias.ObtenerInformacionCargo(1).subscribe(
      (res: any[]) => {
        this.origen_cargo = JSON.stringify(res);

        console.log('ver res cargo ', res);
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
              cargo: r.cargo,
              id_contrato: r.id_contrato,
              hora_trabaja: r.hora_trabaja,
              sucursal: r.sucursal,
              departamento: r.departamento,
            });
          });
        });
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // VALIDACIONES DE REPORTES
  validacionReporte(action) {
    if (
      this.bool.bool_suc === false &&
      this.bool.bool_cargo === false &&
      this.bool.bool_dep === false &&
      this.bool.bool_emp === false
    )
      return this.toastr.error('Seleccione un criterio de búsqueda.');
    console.log('opcion', this.opcion);
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione sucursal.'
          );
        this.ModelarSucursal(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno',
            'Seleccione Cargo'
          );
        this.ModelarCargo(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione departamentos.'
          );
        this.ModelarDepartamento(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione empleados.'
          );
        this.ModelarEmpleados(action);
        break;
      default:
        this.toastr.error(
          'UPS! Al parecer algo falló.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
  }

  // MODELAMIENTO DE DATOS DE ACUERDO A LAS SUCURSALES
  ModelarSucursal(accion) {
    let respuesta = JSON.parse(
      sessionStorage.getItem('reporte_vacunas_multiples') as any
    );
    let suc = respuesta.filter((o) => {
      var bool = this.selectionSuc.selected.find((obj1) => {
        return obj1.id === o.id_suc;
      });
      return bool != undefined;
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(suc).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcel('default');
            break;
          default:
            this.generarPdf(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // MODELAMIENTO DE DATOS DE ACUERDO AL CARGO
  ModelarCargo(accion) {
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    console.log('CARGO', car);
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiplesCargo(car).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcelCargo();
            break;
          default:
            this.generarPdf(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // MODELAMIENTO DE DATOS DE ACUERDO A LOS DEPARTAMENTOS
  ModelarDepartamento(accion) {
    let respuesta = JSON.parse(
      sessionStorage.getItem('reporte_vacunas_multiples') as any
    );
    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((o) => {
        var bool = this.selectionDep.selected.find((obj1) => {
          return obj1.id === o.id_depa;
        });
        return bool != undefined;
      });
    });
    let dep = respuesta.filter((obj) => {
      return obj.departamentos.length > 0;
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(dep).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcel('default');
            break;
          default:
            this.generarPdf(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // MODELAMIENTO DE DATOS DE ACUERDO A LOS EMPLEADOS
  ModelarEmpleados(accion) {
    let respuesta = JSON.parse(
      sessionStorage.getItem('reporte_vacunas_multiples') as any
    );
    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((element) => {
        element.empleado = element.empleado.filter((o) => {
          var bool = this.selectionEmp.selected.find((obj1) => {
            return obj1.id === o.id;
          });
          return bool != undefined;
        });
      });
    });
    respuesta.forEach((obj) => {
      obj.departamentos = obj.departamentos.filter((e) => {
        return e.empleado.length > 0;
      });
    });
    let emp = respuesta.filter((obj) => {
      return obj.departamentos.length > 0;
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(emp).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcel('default');
            break;
          default:
            this.generarPdf(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  // OBTENER LOGO PARA EL REPORTE
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre
      .LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string)
      .subscribe((res) => {
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
      });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
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

  /* **************************************************************************** *
   *                                   PDF                                        *
   * **************************************************************************** */

  generarPdf(action) {
    let documentDefinition;

    if (
      this.bool.bool_emp === true ||
      this.bool.bool_suc === true ||
      this.bool.bool_dep === true ||
      this.bool.bool_cargo === true
    ) {
      documentDefinition = this.getDocumentDefinicion();
    }

    var f = new Date();
    let doc_name = 'Reporte Vacunas' + f.toLocaleString() + '.pdf';
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

  getDocumentDefinicion() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
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
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        var time = h.toJSON().split('T')[1].split('.')[0];

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
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
          text: (
            localStorage.getItem('name_empresa') as string
          ).toLocaleUpperCase(),
          bold: true,
          fontSize: 21,
          alignment: 'center',
          margin: [0, -30, 0, 10],
        },
        {
          text: 'Reporte - Registro de Vacunación',
          bold: true,
          fontSize: 16,
          alignment: 'center',
          margin: [0, -10, 0, 5],
        },
        ...this.impresionDatosPDF(this.data_pdf).map((obj) => {
          return obj;
        }),
      ],
      styles: {
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: {
          fontSize: 10,
          margin: [0, 3, 0, 3],
          fillColor: this.s_color,
        },
        itemsTableInfoBlanco: {
          fontSize: 10,
          margin: [0, 3, 0, 3],
          fillColor: '#E3E3E3',
        },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 20] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 },
      },
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    let c = 0;

    if (this.bool.bool_cargo === true) {
      data.forEach((obj1)=>{

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
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['*', '*', '*', '*'],
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'Vacuna', style: 'tableHeader' },
                  { text: 'Fecha', style: 'tableHeader' },
                  { text: 'Descripción', style: 'tableHeader' },
                ],
                ...obj2.vacunas.map((obj3) => {
                  c = c + 1;
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTable', text: obj3.tipo_vacuna },
                    { style: 'itemsTable', text: obj3.fecha.split('T')[0] },
                    { style: 'itemsTable', text: obj3.descripcion },
                  ];
                }),
              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex % 2 === 0 ? '#E5E7E9' : null;
              },
            },
          });
        });



      });

    } else {
      data.forEach((obj: ReporteVacunas) => {
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
          if (this.bool.bool_dep === true) {
            let arr_reg = obj1.empleado.map((o: any) => {
              return o.vacunas.length;
            });
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
                      style: 'itemsTableInfo',
                    },
                    {
                      border: [true, true, true, true],
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
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [
                    { text: 'N°', style: 'tableHeader' },
                    { text: 'Vacuna', style: 'tableHeader' },
                    { text: 'Fecha', style: 'tableHeader' },
                    { text: 'Descripción', style: 'tableHeader' },
                  ],
                  ...obj2.vacunas.map((obj3) => {
                    c = c + 1;
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: obj3.tipo_vacuna },
                      { style: 'itemsTable', text: obj3.fecha.split('T')[0] },
                      { style: 'itemsTable', text: obj3.descripcion },
                    ];
                  }),
                ],
              },
              layout: {
                fillColor: function (rowIndex) {
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

  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor;
  }

  /** ************************************************************************************************** *
   ** *                                     METODO PARA EXPORTAR A EXCEL                                 *
   ** ************************************************************************************************** */
  exportToExcel(tipo: string): void {
    switch (tipo) {
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
          this.MapingDataPdfDefault(this.data_pdf)
        );
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
        xlsx.writeFile(wb, 'Vacunas ' + new Date().getTime() + '.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: ReporteVacunas) => {
      obj1.departamentos.forEach((obj2) => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.vacunas.forEach((obj4: vacuna) => {
            let ele = {
              'Id Sucursal': obj1.id_suc,
              Ciudad: obj1.ciudad,
              Sucursal: obj1.name_suc,
              'Id Departamento': obj2.id_depa,
              Departamento: obj2.name_dep,
              'Id Empleado': obj3.id,
              'Nombre Empleado': obj3.name_empleado,
              Cédula: obj3.cedula,
              Código: obj3.codigo,
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

  exportToExcelCargo(): void {
    console.log('dats p', this.data_pdf);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.MapingDataPdfDefaultCargo(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, 'Vacunas ' + new Date().getTime() + '.xlsx');
  }

  MapingDataPdfDefaultCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj) => {
      console.log('obj',obj);
      obj.empleados.forEach((obj2) => {
        obj2.vacunas.forEach((obj3)=>{
          let ele = {
            'Id Sucursal': obj2.id_suc,
            Ciudad: obj2.ciudad,
            Sucursal: obj2.sucursal,
            'Id Departamento': obj2.id_depa,
            Departamento: obj2.departamento,
            'Id Empleado': obj2.id,
            'Nombre Empleado': obj2.name_empleado,
            Cédula: obj2.cedula,
            Código: obj2.codigo,
            Carnet: obj3.carnet,
            'Nombre carnet': obj3.nom_carnet,
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

  // 'Ciudad': obj2.ciudad,
  //           'Sucursal': obj2.sucursal,
  //           'Departamento': obj2.departamento,
  //           'Id Empleado': obj2.id, 'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
  //           'Género': obj2.genero, 'Cargo': obj2.cargo,

  /** ************************************************************************************* *
   ** *            VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO                         *
   ** ************************************************************************************* */

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc()
      ? this.selectionSuc.clear()
      : this.sucursales.forEach((row) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCar() {
    const numSelected = this.selectionCar.selected.length;
    return numSelected === this.cargos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar()
      ? this.selectionCar.clear()
      : this.cargos.forEach((row) => this.selectionCar.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCar(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCar() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep()
      ? this.selectionDep.clear()
      : this.departamentos.forEach((row) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp()
      ? this.selectionEmp.clear()
      : this.empleados.forEach((row) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
    }`;
  }

  // METODO DE CONTROL DE PAGINACIÓN
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA INGRESAR DATOS DE LETRAS O NÚMEROS
  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  MostrarLista() {
    if (this.opcion === 's') {
      /* this.nombre_suc.reset();
      this.Filtrar('', 1)*/
    } else if (this.opcion === 'd') {
      /*this.nombre_dep.reset();
      this.Filtrar('', 2)*/
    } else if (this.opcion === 'e') {
      /* this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }
}


