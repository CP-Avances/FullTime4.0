// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR MODELOS
import { ITableEmpleados, IReporteTimbres } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-timbre-abiertos',
  templateUrl: './timbre-abiertos.component.html',
  styleUrls: ['./timbre-abiertos.component.css']
})

export class TimbreAbiertosComponent implements OnInit, OnDestroy {

  get timbreDispositivo() { return this.reporteService.mostrarTimbreDispositivo };

  get rangoFechas() { return this.reporteService.rangoFechas };

  get opcion() { return this.reporteService.opcion };

  get bool() { return this.reporteService.criteriosBusqueda };

  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
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

  // FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  // ESTADO HORA SERVIDOR
  dispositivo: boolean = false;

  constructor(
    private validacionService: ValidacionesService,
    private reporteService: ReportesService,
    private R_asistencias: ReportesAsistenciasService,
    private informacion: DatosGeneralesService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    if (parseInt(localStorage.getItem('rol') as string) === 1) {
      this.dispositivo = true;
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

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
  }

  // VALIDACIONES REPORTES
  validacionReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda.')
    //console.log('opcion:', this.opcion);
    //console.log('ver rol -----------------------***********', localStorage.getItem('rol'))
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione sucursal.')
        this.ModelarSucursal(action);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione régimen.')
        this.ModelarRegimen(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione departamentos.')
        this.ModelarDepartamento(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione cargos.')
        this.ModelarCargo(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno.', 'Seleccione empleados.')
        this.ModelarEmpleados(action);
        break;
      default:
        this.toastr.error('Ups !!! algo salio mal.', 'Seleccione criterio de búsqueda.')
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);

    let suc = respuesta.filter(o => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    // console.log('SUCURSAL', suc);
    this.data_pdf = []
    this.R_asistencias.ReporteTimbreHorarioAbierto(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen(accion: any) {
    this.tipo = 'RegimenCargo';
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
    this.R_asistencias.ReporteTimbreHorarioAbiertoRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    this.data_pdf = [];
    this.R_asistencias.ReporteTimbreHorarioAbiertoRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(accion: any) {
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
    this.R_asistencias.ReporteTimbreHorarioAbierto(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);

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
    this.R_asistencias.ReporteTimbreHorarioAbierto(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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

  /** *************************************************************************************** **
   ** **                        COLORES Y LOGO PARA EL REPORTE                             ** **
   ** *************************************************************************************** **/

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

  /** ************************************************************************************ **
   ** **                               GENERACION DE PDF                                ** **
   ** ************************************************************************************ **/

  generarPdf(action: any) {
    let documentDefinition: any;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.getDocumentDefinicion();
    }

    let doc_name = "Timbres_libres.pdf";
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
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'REPORTE TIMBRES LIBRES', bold: true, fontSize: 16, alignment: 'center', margin: [0, -5, 0, 5] },
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
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0],fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
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
                    text: this.bool.bool_reg ? 'CARGO: ' + obj2.cargo : '',
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, true, false],
                    text: '',
                    style: 'itemsTableInfoEmpleado'
                  }
                ]
              ]
            },
          });
          c = 0;
          if (this.timbreDispositivo === true) {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    {},
                    { colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                  ],
                  [
                    {},
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    {},{},{},{},{}
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
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/P': accionT = 'Inicio permiso'; break;
                      case 'F/P': accionT = 'Fin permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    }

                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: servidor_fecha },
                      { style: 'itemsTable', text: servidor_hora },
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
          } else {
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                    { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                    { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                    { rowSpan: 2, text: 'LATITUD', style: 'centrado' },
                  ],
                  [
                    {},
                    { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                    {},{},{},{},{}
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
                      case 'I/A': accionT = 'Inicio alimentación'; break;
                      case 'F/A': accionT = 'Fin alimentación'; break;
                      case 'I/P': accionT = 'Inicio permiso'; break;
                      case 'F/P': accionT = 'Fin permiso'; break;
                      case 'HA': accionT = 'Timbre libre'; break;
                      default: accionT = 'Desconocido'; break;
                    };
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTable', text: servidor_fecha },
                      { style: 'itemsTable', text: servidor_hora },
                      { style: 'itemsTable', text: obj3.id_reloj },
                      { style: 'itemsTable', text: accionT },
                      { style: 'itemsTable', text: obj3.observacion },
                      { style: 'itemsTable', text: obj3.longitud },
                      { style: 'itemsTable', text: obj3.latitud },
                    ];
                  }),
                ],
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
              headerRows: 1,
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
                headerRows: 1,
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
                      text: this.bool.bool_suc || this.bool.bool_emp?'DEPARTAMENTO: ' + obj2.departamento:'',
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
                ]
              }
            });
            c = 0;
            if (this.timbreDispositivo === true) {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                  headerRows: 2,
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      {},
                      { colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
                      {},
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' }
                    ],
                    [
                      {},
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      {},{},{},{},{}
                    ],
                    ...obj2.timbres.map(obj3 => {
                      let servidor_fecha = '';
                      let servidor_hora = '';
                      if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                        servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                        servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
                      };
                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/P': accionT = 'Inicio permiso'; break;
                        case 'F/P': accionT = 'Fin permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      };

                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
                        { style: 'itemsTable', text: servidor_fecha },
                        { style: 'itemsTable', text: servidor_hora },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                        { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                        { style: 'itemsTable', text: obj3.id_reloj },
                        { style: 'itemsTable', text: accionT },
                        { style: 'itemsTable', text: obj3.observacion },
                        { style: 'itemsTable', text: obj3.longitud },
                        { style: 'itemsTable', text: obj3.latitud },
                      ];
                    }),
                  ],
                },
                layout: {
                  fillColor: function (rowIndex) {
                    return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                  },
                },
              });
            } else {
              n.push({
                style: 'tableMargin',
                table: {
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],
                  headerRows: 2,
                  body: [
                    [
                      { rowSpan: 2, text: 'N°', style: 'centrado' },
                      { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
                      {},
                      { rowSpan: 2, text: 'RELOJ', style: 'centrado' },
                      { rowSpan: 2, text: 'ACCIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'OBSERVACIÓN', style: 'centrado' },
                      { rowSpan: 2, text: 'LONGITUD', style: 'centrado' },
                      { rowSpan: 2, text: 'LATITUD', style: 'centrado' },
                    ],
                    [
                      {},
                      { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                      { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                      {},{},{},{},{}
                    ],
                    ...obj2.timbres.map(obj3 => {
                      let servidor_fecha = '';
                      let servidor_hora = '';
                      if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
                        servidor_fecha = obj3.fec_hora_timbre_servidor.split(' ')[0];
                        servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
                      };
                      switch (obj3.accion) {
                        case 'EoS': accionT = 'Entrada o salida'; break;
                        case 'AES': accionT = 'Inicio o fin alimentación'; break;
                        case 'PES': accionT = 'Inicio o fin permiso'; break;
                        case 'E': accionT = 'Entrada'; break;
                        case 'S': accionT = 'Salida'; break;
                        case 'I/A': accionT = 'Inicio alimentación'; break;
                        case 'F/A': accionT = 'Fin alimentación'; break;
                        case 'I/P': accionT = 'Inicio permiso'; break;
                        case 'F/P': accionT = 'Fin permiso'; break;
                        case 'HA': accionT = 'Timbre libre'; break;
                        default: accionT = 'Desconocido'; break;
                      }
                      c = c + 1
                      return [
                        { style: 'itemsTableCentrado', text: c },
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
            }
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
    return valor
  }


  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Timbres');
        xlsx.writeFile(wb_regimen_cargo, 'Timbres_libres.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Timbres');
        xlsx.writeFile(wb, 'Timbres_libres.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    let accionT = '';
    array.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            let ele: any;
            let servidor_fecha: any = '';
            let servidor_hora = '';
            if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
              servidor_fecha = new Date(obj4.fec_hora_timbre_servidor);
              servidor_hora = obj4.fec_hora_timbre_servidor.split(' ')[1]
            }
            switch (obj4.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/P': accionT = 'Inicio permiso'; break;
              case 'F/P': accionT = 'Fin permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
            if (this.timbreDispositivo) {
              ele = {
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
                'Fecha Timbre Dispositivo': new Date(obj4.fec_hora_timbre), 'Hora Timbre Dispositivo': obj4.fec_hora_timbre.split(' ')[1],
                'Acción': accionT, 'Reloj': obj4.id_reloj,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud, 'Observación': obj4.observacion
              }
            } else {
              ele = {
                'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
                'Departamento': obj2.name_dep,
                'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
                'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
                'Acción': accionT, 'Reloj': obj4.id_reloj,
                'Latitud': obj4.latitud, 'Longitud': obj4.longitud, 'Observación': obj4.observacion
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
    let accionT = '';
    array.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          let ele: any;
          let servidor_fecha: any = '';
          let servidor_hora = '';
          if (obj3.fec_hora_timbre_servidor != '' && obj3.fec_hora_timbre_servidor != null) {
            servidor_fecha = new Date(obj3.fec_hora_timbre_servidor);
            servidor_hora = obj3.fec_hora_timbre_servidor.split(' ')[1]
          }
          switch (obj3.accion) {
            case 'EoS': accionT = 'Entrada o salida'; break;
            case 'AES': accionT = 'Inicio o fin alimentación'; break;
            case 'PES': accionT = 'Inicio o fin permiso'; break;
            case 'E': accionT = 'Entrada'; break;
            case 'S': accionT = 'Salida'; break;
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }
          if (this.timbreDispositivo) {
            ele = {
              'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
              'Departamento': obj2.departamento,
              'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
              'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
              'Fecha Timbre Dispositivo': new Date(obj3.fec_hora_timbre), 'Hora Timbre Dispositivo': obj3.fec_hora_timbre.split(' ')[1],
              'Acción': accionT, 'Reloj': obj3.id_reloj,
              'Latitud': obj3.latitud, 'Longitud': obj3.longitud, 'Observación': obj3.observacion
            }
          } else {
            ele = {
              'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
              'Departamento': obj2.departamento,
              'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
              'Fecha Timbre': servidor_fecha, 'Hora Timbre': servidor_hora,
              'Acción': accionT, 'Reloj': obj3.id_reloj,
              'Latitud': obj3.latitud, 'Longitud': obj3.longitud, 'Observación': obj3.observacion
            }
          }
          nuevo.push(ele);
        })
      })
    })
    return nuevo;
  }

  // METODOS PARA EXTRAER LOS TIMBRES EN UNA LISTA Y VISUALIZARLOS
  extraerTimbres() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            n = n + 1;
            let servidor_fecha = '';
            let servidor_hora = '';
            if (obj4.fec_hora_timbre_servidor != '' && obj4.fec_hora_timbre_servidor != null) {
              servidor_fecha = obj4.fec_hora_timbre_servidor.split(' ')[0];
              servidor_hora = obj4.fec_hora_timbre_servidor.split(' ')[1]
            }
            switch (obj4.accion) {
              case 'EoS': accionT = 'Entrada o salida'; break;
              case 'AES': accionT = 'Inicio o fin alimentación'; break;
              case 'PES': accionT = 'Inicio o fin permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'I/A': accionT = 'Inicio alimentación'; break;
              case 'F/A': accionT = 'Fin alimentación'; break;
              case 'I/P': accionT = 'Inicio permiso'; break;
              case 'F/P': accionT = 'Fin permiso'; break;
              case 'HA': accionT = 'Timbre libre'; break;
              default: accionT = 'Desconocido'; break;
            }
              let ele = {
                n: n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
                fechaTimbre: obj4.fec_hora_timbre.split(' ')[0], horaTimbre: obj4.fec_hora_timbre.split(' ')[1],
                fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
                accion: accionT, reloj: obj4.id_reloj,
                latitud: obj4.latitud, longitud: obj4.longitud, observacion: obj4.observacion
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
    let accionT = '';
    this.data_pdf.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          n = n + 1;
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
            case 'I/A': accionT = 'Inicio alimentación'; break;
            case 'F/A': accionT = 'Fin alimentación'; break;
            case 'I/P': accionT = 'Inicio permiso'; break;
            case 'F/P': accionT = 'Fin permiso'; break;
            case 'HA': accionT = 'Timbre libre'; break;
            default: accionT = 'Desconocido'; break;
          }  
          let ele = {
            n: n,
            ciudad: obj2.ciudad, sucursal: obj2.sucursal,
            departamento: obj2.departamento,
            empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
            fechaTimbre: obj3.fec_hora_timbre.split(' ')[0], horaTimbre: obj3.fec_hora_timbre.split(' ')[1],
            fechaTimbreServidor: servidor_fecha, horaTimbreServidor: servidor_hora,
            accion: accionT, reloj: obj3.id_reloj,
            latitud: obj3.latitud, longitud: obj3.longitud, observacion: obj3.observacion
          }
          this.timbres.push(ele);
        })
      })
    })
  }

  /** ************************************************************************************** **
   ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
   ** ************************************************************************************** **/

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

  // MANEJAR EVENTOS DE PAGINACION
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

  // METODO PARA VER UBICACION DE TIMBRE
  AbrirMapa(latitud: string, longitud: string) {
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }

  // METODOS PARA CONTROLAR INGRESO DE LETRAS

  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }

  //MOSTRAR DETALLES
  verDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg) {
      this.extraerTimbresRegimenCargo();
    } else {
      this.extraerTimbres();
    }
  }

  // METODO PARA REGRESAR A LA PANTALLA ANTERIOR
  Regresar() {
    this.verDetalle = false;
  }

}
