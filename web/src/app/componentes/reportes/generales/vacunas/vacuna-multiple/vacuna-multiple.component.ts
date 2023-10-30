// IMPORTAR LIBRERIAS
import { ITableEmpleados, ReporteVacunas, vacuna, } from 'src/app/model/reportes.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../../servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { VacunasService } from 'src/app/servicios/reportes/vacunas/vacunas.service';

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
  regimen: any = [];
  cargos: any = [];
  empleados: any = [];
  respuesta: any[];
  origen: any = [];

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE PDF
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

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS SUCURSAL
  get filtroNombreSuc() {
    return this.reporteService.filtroNombreSuc;
  }

  // METODOS PARA BUSQUEDA DE DATOS POR FILTROS REGIMEN
  get filtroNombreReg() {
    return this.reporteService.filtroNombreReg;
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
    private validacionService: ValidacionesService, // VARIABLE DE VALIDACIONES DE INGRESO DE LETRAS O NÚMEROS
    private reporteService: ReportesService, // SERVICIO DATOS DE BUSQUEDA GENERALES DE REPORTE
    private informacion: DatosGeneralesService,
    private restEmpre: EmpresaService, // SERVICIO DATOS GENERALES DE EMPRESA
    private R_vacuna: VacunasService, // SERVICIO DATOS PARA REPORTE DE VACUNAS
    private toastr: ToastrService // VARIABLE DE MANEJO DE NOTIFICACIONES
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.BuscarInformacion();
    this.BuscarCargos();
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.origen_cargo = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.origen = [];
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
      });
  }

  // VALIDACIONES DE SELECCION DE BUSQUEDA
  validacionReporte(action: any) {
    if (
      this.bool.bool_suc === false &&
      this.bool.bool_reg === false &&
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
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione régimen.'
          );
        this.ModelarRegimen(action);
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
          'Ups !!! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
  }

  // MODELAMIENTO DE DATOS DE ACUERDO A LAS SUCURSALES
  ModelarSucursal(accion: any) {
    let respuesta = JSON.parse(this.origen);
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
            this.exportToExcel();
            break;
          case 'ver':
            this.verDatos('suc');
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

  // MODELAMIENTO DE DATOS DE ACUERDO AL REGIMEN
  ModelarRegimen(accion: any) {
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
    this.R_vacuna.ReporteVacunasMultiplesCargoRegimen(reg).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcelCargoRegimen();
            break;
          case 'ver':
            this.verDatos('reg');
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
  ModelarCargo(accion: any) {
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiplesCargoRegimen(car).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.exportToExcelCargoRegimen();
            break;
          case 'ver':
            this.verDatos('car');
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
  ModelarDepartamento(accion: any) {
    let respuesta = JSON.parse(this.origen);
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
            this.exportToExcel();
            break;
          case 'ver':
            this.verDatos('dep');
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
  ModelarEmpleados(accion: any) {
    let respuesta = JSON.parse(this.origen);
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
            this.exportToExcel();
            break;
          case 'ver':
            this.verDatos('emp');
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

  /** *************************************************************************************** **
   ** **                        COLORES Y LOGO PARA EL REPORTE                             ** **
   ** *************************************************************************************** **/

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

  /** ************************************************************************************ **
   ** **                               GENERACION DE PDF                                ** **
   ** ************************************************************************************ **/

  generarPdf(action: any) {
    let documentDefinition: any;

    if (
      this.bool.bool_emp === true ||
      this.bool.bool_suc === true ||
      this.bool.bool_reg === true ||
      this.bool.bool_dep === true ||
      this.bool.bool_cargo === true
    ) {
      documentDefinition = this.getDocumentDefinicion();
    }

    let doc_name = 'Reporte_vacunas.pdf';
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
          text: 'REPORTE - REGISTRO DE VACUNACIÓN',
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
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 },
      },
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = [];

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1) => {
        let arr_reg = obj1.empleados.map((o: any) => { return o.vacunas.length })
        let reg = this.SumarRegistros(arr_reg);
        if (this.bool.bool_cargo === true) {
          n.push({
            style: 'tableMarginCabecera',
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
            style: 'tableMarginCabecera',
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
                  return [
                    {
                      style: 'itemsTableCentrado',
                      text: obj2.vacunas.indexOf(obj3) + 1,
                    },
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
                    return [
                      {
                        style: 'itemsTableCentrado',
                        text: obj2.vacunas.indexOf(obj3) + 1,
                      },
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

  // METODO PARA SUMAR REGISTROS
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

  exportToExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.MapingDataPdfDefault(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, 'Vacunas.xlsx');
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    let regimen = '';
    array.forEach((obj1: ReporteVacunas) => {
      obj1.departamentos.forEach((obj2) => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.regimen.forEach((r) => (regimen = r.name_regimen));
          obj3.vacunas.forEach((obj4: vacuna) => {
            c = c + 1;
            let ele = {
              'N°': c,
              'Código Empleado': obj3.codigo,
              'Nombre Empleado': obj3.name_empleado,
              Cédula: obj3.cedula,
              Género: obj3.genero,
              Ciudad: obj1.ciudad,
              Sucursal: obj1.name_suc,
              Régimen: regimen,
              Departamento: obj2.name_dep,
              Cargo: obj3.cargo,
              Correo: obj3.correo,
              Carnet: obj4.carnet,
              'Nombre carnet': obj4.carnet,
              Vacuna: obj4.tipo_vacuna,
              Fecha: new Date(obj4.fecha),
              Descripción: obj4.descripcion,
            };
            nuevo.push(ele);
          });
        });
      });
    });
    return nuevo;
  }

  exportToExcelCargoRegimen(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.MapingDataPdfDefaultCargoRegimen(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, 'Vacunas.xlsx');
  }

  MapingDataPdfDefaultCargoRegimen(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    array.forEach((obj) => {
      obj.empleados.forEach((obj2) => {
        obj2.vacunas.forEach((obj3) => {
          c = c + 1;
          let ele = {
            'N°': c,
            'Código Empleado': obj2.codigo,
            'Nombre Empleado': obj2.name_empleado,
            Cédula: obj2.cedula,
            Género: obj2.genero,
            Ciudad: obj2.ciudad,
            Sucursal: obj2.sucursal,
            Régimen: this.bool.bool_cargo ? obj2.regimen : obj2.regimen[0].name_regimen,
            Departamento: obj2.departamento,
            Cargo: obj2.cargo,
            Correo: obj2.correo,
            Carnet: obj3.carnet,
            'Nombre carnet': obj3.carnet,
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
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
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
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
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
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
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
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // METODO DE CONTROL DE PAGINACIÓN
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this.bool.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
    else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA INGRESAR DATOS DE LETRAS O NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  //ENVIAR DATOS A LA VENTANA DE DETALLE
  verDatos(tipo: string) {
    this.verDetalle = true;
    this.tipo = tipo;
  }
}
