import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { TiempoLaboradoService } from 'src/app/servicios/reportes/tiempoLaborado/tiempo-laborado.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { IReporteHorasTrabaja } from 'src/app/model/reportes.model';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';


@Component({
  selector: 'app-reporte-resumen-asistencia',
  templateUrl: './reporte-resumen-asistencia.component.html',
  styleUrls: ['./reporte-resumen-asistencia.component.css']
})
export class ReporteResumenAsistenciaComponent implements OnInit, OnDestroy  {
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
  tolerancia: string = '1';

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
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
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
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
  ) { 
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.BuscarInformacion();
    this.buscarTolerancia();
    this.BuscarParametro();
    this.BuscarCargos();
    this.BuscarHora();
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

  /********************************************************************************************
  ****                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                            **** 
  ********************************************************************************************/
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

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  buscarTolerancia() {
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.tolerancia = res[0].descripcion;
      });
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

  // VALIDACIONES DE OPCIONES DE REPORTE
  validacionReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda.');
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


  ModelarSucursal(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)

    let suc = respuesta.filter(o => {
      let bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      });
      return bool != undefined
    });

    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      console.log('DATA PDF', this.data_pdf);
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
    this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.exportToExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)

    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter(o => {
        let bool = this.selectionDep.selected.find(obj1 => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });
    this.data_pdf = []
    this.reportesTiempoLaborado.ReporteTiempoLaborado(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.exportToExcel('default'); break;
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
    this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      console.log('data pdf cargo',this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel('RegimenCargo'); break;
        case 'ver': this.verDatos(); break;
        default: this.generarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarEmpleados(accion) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)

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
    this.reportesTiempoLaborado.ReporteTiempoLaborado(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
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
   *                                                    *
   *                         PDF                        *
   *                                                    *
   ******************************************************/

  generarPdf(action) {
    let documentDefinition;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.getDocumentDefinicion();
    };

    let doc_name = "Resumen_asistencia.pdf";
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
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        let f = moment();
        fecha = f.format('YYYY-MM-DD');
        let time = f.format('HH:mm:ss');
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
        { text: 'RESUMEN DE ASISTENCIA', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 5] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
        itemsTable: { fontSize: 7 },
        itemsTableInfo: { fontSize: 9, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0],fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 7, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 7, alignment: 'center',fillColor: '#EE4444' },
        itemsTableCentradoAtraso: { fontSize: 7, alignment: 'center',fillColor: '#EEE344' },
        itemsTableCentradoSalidas: { fontSize: 7, alignment: 'center',fillColor: '#4499EE' },
        itemsTableCentradoAlimentacion: { fontSize: 7, alignment: 'center',fillColor: '#55EE44' },
        itemsTableCentradoVacaciones: { fontSize: 7, alignment: 'center',fillColor: '#E68A2E' },
        itemsTableCentradoColores: { fontSize: 9, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color  },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginColores: { margin: [0, 5, 0, 15] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 15, 0, 15] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    let totalTiempoLaboradoEmpleado: number = 0;
    let totalTiempoLaboradoSucursal: number = 0;
    let totalTiempoLaboradoCargo = 0;
    let totalTiempoLaboradoRegimen = 0;
    let totalTiempoLaboradoDepartamento = 0;

    let totalTiempoAtrasosEmpleado: number = 0;
    let totalTiempoAtrasosSucursal: number = 0;
    let totalTiempoAtrasosCargo = 0;
    let totalTiempoAtrasosRegimen = 0;
    let totalTiempoAtrasosDepartamento = 0;

    let totalTiempoSalidasEmpleado: number = 0;
    let totalTiempoSalidasSucursal: number = 0;
    let totalTiempoSalidasCargo = 0;
    let totalTiempoSalidasRegimen = 0;
    let totalTiempoSalidasDepartamento = 0;

    let totalTiempoAlimentacionAEmpleado: number = 0;
    let totalTiempoAlimentacionASucursal: number = 0;
    let totalTiempoAlimentacionACargo = 0;
    let totalTiempoAlimentacionARegimen = 0;
    let totalTiempoAlimentacionADepartamento = 0;
    
    let totalTiempoAlimentacionTEmpleado: number = 0;
    let totalTiempoAlimentacionTSucursal: number = 0;
    let totalTiempoAlimentacionTCargo = 0;
    let totalTiempoAlimentacionTRegimen = 0;
    let totalTiempoAlimentacionTDepartamento = 0;

    this.tiempoDepartamentos = [];
    this.tiempoSucursales = [];
    this.tiempoRegimen = [];
    this.tiempoCargos = [];

    n.push({
      style: 'tableMarginColores',
      table: {
        widths: ['*','auto',50,'auto',50,'auto',50,'auto',50,'auto',50],
        headerRows: 1,
        body: [
          [
            {
              text: 'CÓDIGO DE COLOR',
              style: 'itemsTableCentradoColores'
            },
            {
              text: 'FALTA TIMBRE',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoFT'
            },
            {
              text: 'ATRASO',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoAtraso'
            },
            {
              text: 'SALIDA ANTICIPADA',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoSalidas'
            },
            {
              text: 'EXCESO DE ALIMENTACIÓN',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoAlimentacion'
            },
            {
              text: 'VACACIONES',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoVacaciones'
            },
          ]
        ]
      }
    });

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1) => {
        if (this.bool.bool_cargo === true) {
          totalTiempoLaboradoCargo = 0;
          totalTiempoAtrasosCargo = 0;
          totalTiempoSalidasCargo = 0;
          totalTiempoAlimentacionACargo = 0;
          totalTiempoAlimentacionTCargo = 0;

          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'CARGO: ' + obj1.name_cargo,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        } else {
          totalTiempoLaboradoRegimen = 0;
          totalTiempoAtrasosRegimen = 0;
          totalTiempoSalidasRegimen = 0;
          totalTiempoAlimentacionARegimen = 0;
          totalTiempoAlimentacionTRegimen = 0;

          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    bold: true,
                    text: 'RÉGIMEN: ' + obj1.regimen.nombre,
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
              ],
            },
          });
          c = 0;
          totalTiempoLaboradoEmpleado = 0;
          totalTiempoAtrasosEmpleado = 0;
          totalTiempoSalidasEmpleado = 0;
          totalTiempoAlimentacionAEmpleado = 0;
          totalTiempoAlimentacionTEmpleado = 0;

          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto', '*'],
              headerRows: 2,
              body: [
                [
                  { rowSpan: 2, text: 'N°', style: 'centrado' },
                  { rowSpan: 2, text: 'FECHA', style: 'centrado' },
                  { colSpan: 2, rowSpan: 1, text: 'ENTRADA', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                  {},
                  { colSpan: 2, rowSpan: 1, text: 'SALIDA', style: 'tableHeader' },
                  {},
                  { rowSpan: 2, text: 'ATRASO', style: 'centrado' },
                  { rowSpan: 2, text: 'SALIDA ANTICIPADA', style: 'centrado' },
                  { colSpan: 2, rowSpan: 1, text: 'T. ALIMENTACIÓN', style: 'tableHeader' },
                  {},
                  { rowSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                  { rowSpan: 2, text: 'OBSERVACIONES', style: 'centrado' },
                ],
                [
                  {},{},
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                  { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                  {},{},
                  { rowSpan: 1, text: 'ASIGNADO', style: 'tableHeader' },
                  { rowSpan: 1, text: 'TOMADO', style: 'tableHeader' },
                  {},{}
                ],
                ...obj2.timbres.map(obj3 => {
                  c = c + 1;

                  //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                  const fecha = this.validacionService.FormatearFecha(
                    obj3.entrada.fec_horario,
                    this.formato_fecha, 
                    this.validacionService.dia_abreviado);

                  const entradaHorario = this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
                  const salidaHorario = this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
                  const inicioAlimentacionHorario = obj3.tipo == 'EAS' 
                    ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                    : '';
                  const finAlimentacionHorario = obj3.tipo == 'EAS' 
                    ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                    : '';
                  const entrada = obj3.entrada.fec_hora_timbre != null 
                    ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
                    : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
                  const salida = obj3.salida.fec_hora_timbre != null
                    ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                    : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
                  const inicioAlimentacion = obj3.tipo == 'EAS' 
                    ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
                      ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                      : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
                    : '';
                  const finAlimentacion = obj3.tipo == 'EAS' 
                    ? (obj3.finAlimentacion.fec_hora_timbre != null
                      ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                      : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
                    : '';
                
                  const alimentacion_asignada = obj3.tipo == 'EAS' ? obj3.inicioAlimentacion.min_alimentacion : 0;
                  const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
                  const minutosAlimentacion = diferenciaEnMinutos[0];
                  const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
                  const minutosLaborados = diferenciaEnMinutos[1];
                  const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
                  const minutosAtraso = diferenciaEnMinutos[2];
                  const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
                  const minutosSalidaAnticipada = diferenciaEnMinutos[3];
                  const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);
                  
                  totalTiempoLaboradoEmpleado += minutosLaborados;
                  totalTiempoLaboradoRegimen += minutosLaborados; 
                  totalTiempoLaboradoCargo += minutosLaborados;

                  totalTiempoAtrasosEmpleado += minutosAtraso;
                  totalTiempoAtrasosRegimen += minutosAtraso; 
                  totalTiempoAtrasosCargo += minutosAtraso;

                  totalTiempoSalidasEmpleado += minutosSalidaAnticipada;
                  totalTiempoSalidasRegimen += minutosSalidaAnticipada;
                  totalTiempoSalidasCargo += minutosSalidaAnticipada;

                  totalTiempoAlimentacionAEmpleado += alimentacion_asignada;
                  totalTiempoAlimentacionARegimen += alimentacion_asignada;
                  totalTiempoAlimentacionACargo += alimentacion_asignada;

                  totalTiempoAlimentacionTEmpleado += minutosAlimentacion;
                  totalTiempoAlimentacionTRegimen += minutosAlimentacion;
                  totalTiempoAlimentacionTCargo += minutosAlimentacion;

                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: fecha },
                    { style: 'itemsTableCentrado', text: entradaHorario },
                    { style: entrada == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: entrada },
                    { style: 'itemsTableCentrado', text: inicioAlimentacionHorario },
                    { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                    { style: 'itemsTableCentrado', text: finAlimentacionHorario },
                    { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                    { style: 'itemsTableCentrado', text: salidaHorario },
                    { style: salida == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: salida },
                    { style: minutosAtraso > 0 ? 'itemsTableCentradoAtraso' : 'itemsTableCentrado', text: tiempoAtraso},
                    { style: minutosSalidaAnticipada > 0 ? 'itemsTableCentradoSalidas' : 'itemsTableCentrado', text: tiempoSalidaAnticipada},
                    { style: 'itemsTableCentrado', text: alimentacion_asignada},
                    { style: minutosAlimentacion > alimentacion_asignada ? 'itemsTableCentradoAlimentacion' : 'itemsTableCentrado', text: tiempoAlimentacion},
                    { style: 'itemsTableCentrado', text: tiempoLaborado},
                    { },
                  ];
                }),
                [
                  {
                    border: [true, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {
                    border: [false, true, false, true],
                    text: '',
                    style: 'itemsTableCentradoTotal'
                  },
                  {style: 'itemsTableCentradoTotal', text: 'TOTAL'},
                  {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosEmpleado.toFixed(2))},
                  {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoSalidasEmpleado.toFixed(2))},
                  {style: 'itemsTableCentradoTotal', text: totalTiempoAlimentacionAEmpleado.toFixed(2)},
                  {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTEmpleado.toFixed(2))},
                  {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoEmpleado.toFixed(2))},
                  {}
                ],
              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        });
        if (this.bool.bool_cargo) {
          totalTiempoLaboradoCargo = Number(totalTiempoLaboradoCargo.toFixed(2));
          totalTiempoAtrasosCargo = Number(totalTiempoAtrasosCargo.toFixed(2));
          totalTiempoSalidasCargo = Number(totalTiempoSalidasCargo.toFixed(2));
          totalTiempoAlimentacionACargo = Number(totalTiempoAlimentacionACargo.toFixed(2));
          totalTiempoAlimentacionTCargo = Number(totalTiempoAlimentacionTCargo.toFixed(2));

          let cargo = {
            cargo: obj1.name_cargo,
            tiempoLaborado: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoCargo),
            tiempoAtrasos: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosCargo),
            tiempoSalida: this.minutosAHorasMinutosSegundos(totalTiempoSalidasCargo),
            tiempoAlimentacionA: totalTiempoAlimentacionACargo,
            tiempoAlimentacionT: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTCargo),
          }
          this.tiempoCargos.push(cargo);
        };

        if (this.bool.bool_reg) {
          totalTiempoLaboradoRegimen = Number(totalTiempoLaboradoRegimen.toFixed(2));
          totalTiempoAtrasosRegimen = Number(totalTiempoAtrasosRegimen.toFixed(2));
          totalTiempoSalidasRegimen = Number(totalTiempoSalidasRegimen.toFixed(2));
          totalTiempoAlimentacionARegimen = Number(totalTiempoAlimentacionARegimen.toFixed(2));
          totalTiempoAlimentacionTRegimen = Number(totalTiempoAlimentacionTRegimen.toFixed(2));

          let regimen = {
            regimen: obj1.regimen.nombre,
            tiempoLaborado: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoRegimen),
            tiempoAtrasos: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosRegimen),
            tiempoSalida: this.minutosAHorasMinutosSegundos(totalTiempoSalidasRegimen),
            tiempoAlimentacionA: totalTiempoAlimentacionARegimen,
            tiempoAlimentacionT: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTRegimen),
          }
          this.tiempoRegimen.push(regimen);
        };
      });

      if (this.bool.bool_cargo) {    
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                {
                  colSpan: 1, rowSpan:2,
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL CARGOS',
                  style: 'itemsTableInfoTotal'
                },
                { colSpan: 1, rowSpan:2, text: 'ATRASOS', style: 'itemsTableInfoTotal' },
                { colSpan: 1, rowSpan:2, text: 'SALIDAS ANTICIPADAS', style: 'itemsTableInfoTotal' },
                { colSpan: 2, rowSpan:1, text: 'T. ALIMENTACIÓN', style: 'itemsTableInfoTotal' },
                {},
                { colSpan: 1, rowSpan:2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
              ],
              [
                {},{},{},
                { colSpan: 1, rowSpan:1, text: 'ASIGNADO', style: 'itemsTableInfoTotal' },
                { colSpan: 1, rowSpan:1, text: 'TOMADO', style: 'itemsTableInfoTotal' },
                {}        
              ],
              ...this.tiempoCargos.map((cargo: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: cargo.cargo,
                    style: 'itemsTableCentrado'
                  },
                  { text: cargo.tiempoAtrasos, style: 'itemsTableCentrado'},
                  { text: cargo.tiempoSalida, style: 'itemsTableCentrado'},
                  { text: cargo.tiempoAlimentacionA, style: 'itemsTableCentrado'},
                  { text: cargo.tiempoAlimentacionT, style: 'itemsTableCentrado'},
                  { text: cargo.tiempoLaborado, style: 'itemsTableCentrado'},
                ]
              })    
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };
  
      if (this.bool.bool_reg) {    
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                {
                  colSpan: 1, rowSpan:2,
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL REGIMENES',
                  style: 'itemsTableInfoTotal'
                },
                { colSpan: 1, rowSpan:2, text: 'ATRASOS', style: 'itemsTableInfoTotal' },
                { colSpan: 1, rowSpan:2, text: 'SALIDAS ANTICIPADAS', style: 'itemsTableInfoTotal' },
                { colSpan: 2, rowSpan:1, text: 'T. ALIMENTACIÓN', style: 'itemsTableInfoTotal' },
                {},
                { colSpan: 1, rowSpan:2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
              ],
              [
                {},{},{},
                { colSpan: 1, rowSpan:1, text: 'ASIGNADO', style: 'itemsTableInfoTotal' },
                { colSpan: 1, rowSpan:1, text: 'TOMADO', style: 'itemsTableInfoTotal' },
                {}        
              ],
              ...this.tiempoRegimen.map((regimen: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: regimen.regimen,
                    style: 'itemsTableCentrado'
                  },
                  { text: regimen.tiempoAtrasos, style: 'itemsTableCentrado'},
                  { text: regimen.tiempoSalida, style: 'itemsTableCentrado'},
                  { text: regimen.tiempoAlimentacionA, style: 'itemsTableCentrado'},
                  { text: regimen.tiempoAlimentacionT, style: 'itemsTableCentrado'},
                  { text: regimen.tiempoLaborado, style: 'itemsTableCentrado'},
                ]
              })    
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };
    } else {
      data.forEach((obj: IReporteHorasTrabaja) => {

        if (this.bool.bool_suc === true || this.bool.bool_dep === true) {
          totalTiempoLaboradoSucursal = 0;
          totalTiempoAtrasosSucursal = 0;
          totalTiempoSalidasSucursal = 0;
          totalTiempoAlimentacionASucursal = 0;
          totalTiempoAlimentacionTSucursal = 0;
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
          totalTiempoLaboradoDepartamento = 0;
          totalTiempoAtrasosDepartamento = 0;
          totalTiempoSalidasDepartamento = 0;
          totalTiempoAlimentacionADepartamento = 0;
          totalTiempoAlimentacionTDepartamento = 0;
          // LA CABECERA CUANDO SE GENERA EL PDF POR DEPARTAMENTOS
          if (this.bool.bool_dep === true) {
            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*'],
                headerRows: 1,
                body: [
                  [
                    {
                      border: [true, true, true, true],
                      text: 'DEPARTAMENTO: ' + obj1.name_dep,
                      style: 'itemsTableInfoBlanco'
                    },
                  ]
                ]
              }
            })
          }

          obj1.empleado.forEach((obj2: any) => {

            n.push({
              style: 'tableMarginCabecera',
              table: {
                widths: ['*', 'auto', 'auto',],
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
            totalTiempoLaboradoEmpleado = 0;
            totalTiempoAtrasosEmpleado = 0;
            totalTiempoSalidasEmpleado = 0;
            totalTiempoAlimentacionAEmpleado = 0;
            totalTiempoAlimentacionTEmpleado = 0;
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto', '*'],
                headerRows: 2,
                body: [
                  [
                    { rowSpan: 2, text: 'N°', style: 'centrado' },
                    { rowSpan: 2, text: 'FECHA', style: 'centrado' },
                    { colSpan: 2, rowSpan: 1, text: 'ENTRADA', style: 'tableHeader' },
                    {},
                    { colSpan: 2, rowSpan: 1, text: 'INICIO ALIMENTACIÓN', style: 'tableHeader' },
                    {},
                    { colSpan: 2, rowSpan: 1, text: 'FIN ALIMENTACIÓN', style: 'tableHeader' },
                    {},
                    { colSpan: 2, rowSpan: 1, text: 'SALIDA', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'ATRASO', style: 'centrado' },
                    { rowSpan: 2, text: 'SALIDA ANTICIPADA', style: 'centrado' },
                    { colSpan: 2, rowSpan: 1, text: 'T. ALIMENTACIÓN', style: 'tableHeader' },
                    {},
                    { rowSpan: 2, text: 'TIEMPO LABORADO', style: 'centrado' },
                    { rowSpan: 2, text: 'OBSERVACIONES', style: 'centrado' },
                  ],
                  [
                    {},{},
                    { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                    { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                    { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                    { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                    { rowSpan: 1, text: 'HORARIO', style: 'tableHeader' },
                    { rowSpan: 1, text: 'TIMBRE', style: 'tableHeader' },
                    {},{},
                    { rowSpan: 1, text: 'ASIGNADO', style: 'tableHeader' },
                    { rowSpan: 1, text: 'TOMADO', style: 'tableHeader' },
                    {},{}
                  ],
                  ...obj2.timbres.map(obj3 => {
                    c = c + 1;
  
                    //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
                    const fecha = this.validacionService.FormatearFecha(
                      obj3.entrada.fec_horario,
                      this.formato_fecha, 
                      this.validacionService.dia_abreviado);
  
                    const entradaHorario = this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
                    const salidaHorario = this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
                    const inicioAlimentacionHorario = obj3.tipo == 'EAS' 
                      ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                      : '';
                    const finAlimentacionHorario = obj3.tipo == 'EAS' 
                      ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                      : '';
                    const entrada = obj3.entrada.fec_hora_timbre != null 
                      ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
                      : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
                    const salida = obj3.salida.fec_hora_timbre != null
                      ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                      : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
                    const inicioAlimentacion = obj3.tipo == 'EAS' 
                      ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
                        ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                        : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
                      : '';
                    const finAlimentacion = obj3.tipo == 'EAS' 
                      ? (obj3.finAlimentacion.fec_hora_timbre != null
                        ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                        : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
                      : '';
                  
                    const alimentacion_asignada = obj3.tipo == 'EAS' ? obj3.inicioAlimentacion.min_alimentacion : 0;
                    const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
                    const minutosAlimentacion = diferenciaEnMinutos[0];
                    const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
                    const minutosLaborados = diferenciaEnMinutos[1];
                    const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
                    const minutosAtraso = diferenciaEnMinutos[2];
                    const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
                    const minutosSalidaAnticipada = diferenciaEnMinutos[3];
                    const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);
                    
                    totalTiempoLaboradoEmpleado += minutosLaborados;
                    totalTiempoLaboradoSucursal += minutosLaborados; 
                    totalTiempoLaboradoDepartamento += minutosLaborados;
  
                    totalTiempoAtrasosEmpleado += minutosAtraso;
                    totalTiempoAtrasosSucursal += minutosAtraso; 
                    totalTiempoAtrasosDepartamento += minutosAtraso;
  
                    totalTiempoSalidasEmpleado += minutosSalidaAnticipada;
                    totalTiempoSalidasSucursal += minutosSalidaAnticipada;
                    totalTiempoSalidasDepartamento += minutosSalidaAnticipada;
  
                    totalTiempoAlimentacionAEmpleado += alimentacion_asignada;
                    totalTiempoAlimentacionASucursal += alimentacion_asignada;
                    totalTiempoAlimentacionADepartamento += alimentacion_asignada;
  
                    totalTiempoAlimentacionTEmpleado += minutosAlimentacion;
                    totalTiempoAlimentacionTSucursal += minutosAlimentacion;
                    totalTiempoAlimentacionTDepartamento += minutosAlimentacion;
  
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTableCentrado', text: fecha },
                      { style: 'itemsTableCentrado', text: entradaHorario },
                      { style: entrada == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: entrada },
                      { style: 'itemsTableCentrado', text: inicioAlimentacionHorario },
                      { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                      { style: 'itemsTableCentrado', text: finAlimentacionHorario },
                      { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                      { style: 'itemsTableCentrado', text: salidaHorario },
                      { style: salida == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: salida },
                      { style: minutosAtraso > 0 ? 'itemsTableCentradoAtraso' : 'itemsTableCentrado', text: tiempoAtraso},
                      { style: minutosSalidaAnticipada > 0 ? 'itemsTableCentradoSalidas' : 'itemsTableCentrado', text: tiempoSalidaAnticipada},
                      { style: 'itemsTableCentrado', text: alimentacion_asignada},
                      { style: minutosAlimentacion > alimentacion_asignada ? 'itemsTableCentradoAlimentacion' : 'itemsTableCentrado', text: tiempoAlimentacion},
                      { style: 'itemsTableCentrado', text: tiempoLaborado},
                      { },
                    ];
                  }),
                  [
                    {
                      border: [true, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {
                      border: [false, true, false, true],
                      text: '',
                      style: 'itemsTableCentradoTotal'
                    },
                    {style: 'itemsTableCentradoTotal', text: 'TOTAL'},
                    {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosEmpleado.toFixed(2))},
                    {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoSalidasEmpleado.toFixed(2))},
                    {style: 'itemsTableCentradoTotal', text: totalTiempoAlimentacionAEmpleado.toFixed(2)},
                    {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTEmpleado.toFixed(2))},
                    {style: 'itemsTableCentradoTotal', text: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoEmpleado.toFixed(2))},
                    {}
                  ],
                ],
              },
              layout: {
                fillColor: function (rowIndex) {
                  return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                }
              }
            });
          });
          if (this.bool.bool_dep) {
            totalTiempoLaboradoDepartamento = Number(totalTiempoLaboradoDepartamento.toFixed(2));
            totalTiempoAtrasosDepartamento = Number(totalTiempoAtrasosDepartamento.toFixed(2));
            totalTiempoSalidasRegimen = Number(totalTiempoSalidasRegimen.toFixed(2));
            totalTiempoAlimentacionADepartamento = Number(totalTiempoAlimentacionADepartamento.toFixed(2));
            totalTiempoAlimentacionTDepartamento = Number(totalTiempoAlimentacionTDepartamento.toFixed(2));
            let departamento = {
              departamento: obj1.name_dep,
              tiempoLaborado: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoDepartamento),
              tiempoAtrasos: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosDepartamento),
              tiempoSalida: this.minutosAHorasMinutosSegundos(totalTiempoSalidasDepartamento),
              tiempoAlimentacionA: totalTiempoAlimentacionADepartamento,
              tiempoAlimentacionT: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTDepartamento),
            }
            this.tiempoDepartamentos.push(departamento);
          };
        });

        if (this.bool.bool_suc) {
          totalTiempoLaboradoSucursal = Number(totalTiempoLaboradoSucursal.toFixed(2));
          totalTiempoAtrasosSucursal = Number(totalTiempoAtrasosSucursal.toFixed(2));
          totalTiempoSalidasSucursal = Number(totalTiempoSalidasSucursal.toFixed(2));
          totalTiempoAlimentacionASucursal = Number(totalTiempoAlimentacionASucursal.toFixed(2));
          totalTiempoAlimentacionTSucursal = Number(totalTiempoAlimentacionTSucursal.toFixed(2));
          let sucursal = {
            sucursal: obj.name_suc,
            tiempoLaborado: this.minutosAHorasMinutosSegundos(totalTiempoLaboradoSucursal),
            tiempoAtrasos: this.minutosAHorasMinutosSegundos(totalTiempoAtrasosSucursal),
            tiempoSalida: this.minutosAHorasMinutosSegundos(totalTiempoSalidasSucursal),
            tiempoAlimentacionA: totalTiempoAlimentacionASucursal,
            tiempoAlimentacionT: this.minutosAHorasMinutosSegundos(totalTiempoAlimentacionTSucursal)
          }
          this.tiempoSucursales.push(sucursal);
        };
      });
    }

    if (this.bool.bool_dep) {    
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 2,
          body: [
            [
              {
                colSpan: 1, rowSpan:2,
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL DEPARTAMENTOS',
                style: 'itemsTableInfoTotal'
              },
              { colSpan: 1, rowSpan:2, text: 'ATRASOS', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan:2, text: 'SALIDAS ANTICIPADAS', style: 'itemsTableInfoTotal' },
              { colSpan: 2, rowSpan:1, text: 'T. ALIMENTACIÓN', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 1, rowSpan:2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
            ],
            [
              {},{},{},
              { colSpan: 1, rowSpan:1, text: 'ASIGNADO', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan:1, text: 'TOMADO', style: 'itemsTableInfoTotal' },
              {}        
            ],
            ...this.tiempoDepartamentos.map((departamento: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: departamento.departamento,
                  style: 'itemsTableCentrado'
                },
                { text: departamento.tiempoAtrasos, style: 'itemsTableCentrado'},
                { text: departamento.tiempoSalida, style: 'itemsTableCentrado'},
                { text: departamento.tiempoAlimentacionA, style: 'itemsTableCentrado'},
                { text: departamento.tiempoAlimentacionT, style: 'itemsTableCentrado'},
                { text: departamento.tiempoLaborado, style: 'itemsTableCentrado'},
              ]
            })    
          ]
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    };

    if (this.bool.bool_suc) {    
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 2,
          body: [
            [
              {
                colSpan: 1, rowSpan:2,
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL SUCURSALES',
                style: 'itemsTableInfoTotal'
              },
              { colSpan: 1, rowSpan:2, text: 'ATRASOS', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan:2, text: 'SALIDAS ANTICIPADAS', style: 'itemsTableInfoTotal' },
              { colSpan: 2, rowSpan:1, text: 'T. ALIMENTACIÓN', style: 'itemsTableInfoTotal' },
              {},
              { colSpan: 1, rowSpan:2, text: 'TIEMPO LABORADO', style: 'itemsTableInfoTotal' },
            ],
            [
              {},{},{},
              { colSpan: 1, rowSpan:1, text: 'ASIGNADO', style: 'itemsTableInfoTotal' },
              { colSpan: 1, rowSpan:1, text: 'TOMADO', style: 'itemsTableInfoTotal' },
              {}        
            ],
            ...this.tiempoSucursales.map((sucursal: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: sucursal.sucursal,
                  style: 'itemsTableCentrado'
                },
                { text: sucursal.tiempoAtrasos, style: 'itemsTableCentrado'},
                { text: sucursal.tiempoSalida, style: 'itemsTableCentrado'},
                { text: sucursal.tiempoAlimentacionA, style: 'itemsTableCentrado'},
                { text: sucursal.tiempoAlimentacionT, style: 'itemsTableCentrado'},
                { text: sucursal.tiempoLaborado, style: 'itemsTableCentrado'},
              ]
            })    
          ]
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    };

    return n;
  }
  
  SumarRegistros(array: any []) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor
  }

  calcularDiferenciaFechas(timbre: any) {
    //VALORES DE RETORNO [minutosAlimentacion,minutosLaborados,minutosAtrasos,minutosSalidasAnticipadas]
    let minutosAlimentacion = 0;
    let minutosLaborados = 0;
    let minutosAtrasos = 0;
    let minutosSalidasAnticipadas = 0;
    
    if (timbre.origen === 'L' || timbre.origen === 'FD'){
      return [0,0,0,0];
    }

    if (timbre.tipo === 'ES') {
      const { entrada, salida } = timbre;      
      if (entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null) {
        minutosLaborados = Number(this.calcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre).toFixed(2));
        minutosAtrasos = Number(this.calcularMinutosAtraso(entrada.fec_hora_horario, entrada.fec_hora_timbre, entrada.tolerancia));
        minutosSalidasAnticipadas = Number(this.calcularMinutosSalidaAnticipada(salida.fec_hora_horario, salida.fec_hora_timbre).toFixed(2));
      }
    } else {
      const { entrada, inicioAlimentacion, finAlimentacion, salida } = timbre;
      const min_alimentacion: number = timbre.inicioAlimentacion.min_alimentacion;
      if (entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null) {
        minutosLaborados = Number(this.calcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre).toFixed(2));
        minutosAtrasos = Number(this.calcularMinutosAtraso(entrada.fec_hora_horario, entrada.fec_hora_timbre, entrada.tolerancia));
      }     
      if (minutosLaborados >0) {
        minutosAlimentacion = inicioAlimentacion.fec_hora_timbre !== null && finAlimentacion.fec_hora_timbre !== null ? Number(this.calcularMinutosDiferencia(inicioAlimentacion.fec_hora_timbre, finAlimentacion.fec_hora_timbre).toFixed(2)) : min_alimentacion;
        minutosLaborados = Number((minutosLaborados - minutosAlimentacion).toFixed(2))
      }
    }
    return [minutosAlimentacion,minutosLaborados,minutosAtrasos,minutosSalidasAnticipadas];
  }
  
  calcularMinutosDiferencia(inicio: any, fin: any): number {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
  }

  calcularMinutosAtraso(horario: any, timbre: any, tolerancia: number): number {
    const diferencia = (new Date(timbre)).getTime() - (new Date(horario)).getTime();
    const atraso = diferencia / (1000 * 60);

    return this.tolerancia !== '1'
        ? atraso > tolerancia
            ? this.tolerancia === '2-1' ? atraso : atraso - tolerancia
            : 0
        : atraso;
}


  calcularMinutosSalidaAnticipada(horario: any, timbre: any): number {
    const fechaHorario = new Date(horario);
    const fechaTimbre = new Date(timbre);

    return fechaTimbre < fechaHorario ? (fechaHorario.getTime() - fechaTimbre.getTime()) / 1000 / 60 : 0;
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
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Resumen_asistencia');
        xlsx.writeFile(wb_regimen_cargo, 'Resumen_asistencia.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Resumen_asistencia');
        xlsx.writeFile(wb, 'Resumen_asistencia.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteHorasTrabaja) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
            const entradaHorario =  this.validacionService.FormatearHora(obj4.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
            const salidaHorario = this.validacionService.FormatearHora(obj4.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
            const inicioAlimentacionHorario = obj4.tipo == 'EAS'
              ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const finAlimentacionHorario = obj4.tipo == 'EAS'
              ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const entrada = obj4.entrada.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
              : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT');
            const salida = obj4.salida.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj4.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT');
            const inicioAlimentacion = obj4.tipo == 'EAS'
              ? (obj4.inicioAlimentacion.fec_hora_timbre != null 
                ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT')) 
              : '';
            const finAlimentacion = obj4.tipo == 'EAS'
              ? (obj4.finAlimentacion.fec_hora_timbre != null
                ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT')) 
              : '';

            const alimentacion_asignada = obj4.tipo == 'EAS' ? obj4.inicioAlimentacion.min_alimentacion : 0;
            
            const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj4);
            const minutosAlimentacion = diferenciaEnMinutos[0];
            const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
            const minutosLaborados = diferenciaEnMinutos[1];
            const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
            const minutosAtraso = diferenciaEnMinutos[2];
            const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
            const minutosSalidaAnticipada = diferenciaEnMinutos[3];
            const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);
            let ele = { 
              'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
              'Departamento': obj2.name_dep,
              'Régimen': obj3.regimen[0].name_regimen,
              'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Fecha': new Date(obj4.entrada.fec_hora_horario), 'Horario Entrada': entradaHorario, 'Timbre Entrada': entrada,
              'Horario Salida': salidaHorario, 'Timbre Salida': salida,
              'Horario Inicio Alimentación': inicioAlimentacionHorario, 'Timbre Inicio Alimentación': inicioAlimentacion, 
              'Horario Fin Alimentación': finAlimentacionHorario, 'Timbre Fin Alimentación': finAlimentacion, 
              'Atraso': tiempoAtraso, 'Salida Anticipada':tiempoSalidaAnticipada,
              'Tiempo Alimentación Asignado': alimentacion_asignada,
              'Tiempo Alimentación HH:MM:SS': tiempoAlimentacion,
              'Tiempo Laborado HH:MM:SS': tiempoLaborado,
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
          //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
          const entradaHorario = this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
          const salidaHorario = this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
          const inicioAlimentacionHorario = obj3.tipo == 'EAS' 
            ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const finAlimentacionHorario = obj3.tipo == 'EAS' 
            ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const entrada = obj3.entrada.fec_hora_timbre != null 
            ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const salida = obj3.salida.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const inicioAlimentacion = obj3.tipo == 'EAS' 
            ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
            : '';
          const finAlimentacion = obj3.tipo == 'EAS' 
            ? (obj3.finAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
            : '';

          const alimentacion_asignada = obj3.tipo == 'EAS' ? obj3.inicioAlimentacion.min_alimentacion : 0;

          const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
          const minutosAlimentacion = diferenciaEnMinutos[0];
          const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
          const minutosAtraso = diferenciaEnMinutos[2];
          const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
          const minutosSalidaAnticipada = diferenciaEnMinutos[3];
          const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);

          let ele = { 
            'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
            'Departamento': obj2.departamento,
            'Régimen': obj2.regimen[0].name_regimen,
            'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
            'Fecha': new Date(obj3.entrada.fec_hora_horario), 'Horario Entrada': entradaHorario, 'Timbre Entrada': entrada,
            'Horario Inicio Alimentación': inicioAlimentacionHorario, 'Timbre Inicio Alimentación': inicioAlimentacion, 
            'Horario Fin Alimentación': finAlimentacionHorario, 'Timbre Fin Alimentación': finAlimentacion, 
            'Horario Salida': salidaHorario, 'Timbre Salida': salida,
            'Atraso': tiempoAtraso, 'Salida Anticipada':tiempoSalidaAnticipada,
            'Tiempo Alimentación Asignado': alimentacion_asignada,
            'Tiempo Alimentación HH:MM:SS': tiempoAlimentacion,
            'Tiempo Laborado HH:MM:SS': tiempoLaborado,
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
            //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
            const fecha = this.validacionService.FormatearFecha(
              obj4.entrada.fec_horario,
              this.formato_fecha, 
              this.validacionService.dia_abreviado);
              
            const entradaHorario =  this.validacionService.FormatearHora(obj4.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
            const salidaHorario = this.validacionService.FormatearHora(obj4.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
            const inicioAlimentacionHorario = obj4.tipo == 'EAS'
              ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const finAlimentacionHorario = obj4.tipo == 'EAS'
              ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const entrada = obj4.entrada.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
              : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT');
            const salida = obj4.salida.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj4.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT');
            const inicioAlimentacion = obj4.tipo == 'EAS'
              ? (obj4.inicioAlimentacion.fec_hora_timbre != null 
                ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT')) 
              : '';
            const finAlimentacion = obj4.tipo == 'EAS'
              ? (obj4.finAlimentacion.fec_hora_timbre != null
                ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : (obj4.origen === 'L' || obj4.origen === 'FD' ? obj4.origen : 'FT')) 
              : '';

            const alimentacion_asignada = obj4.tipo == 'EAS' ? obj4.inicioAlimentacion.min_alimentacion : 0;
            
            const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj4);
            const minutosAlimentacion = diferenciaEnMinutos[0];
            const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
            const minutosLaborados = diferenciaEnMinutos[1];
            const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
            const minutosAtraso = diferenciaEnMinutos[2];
            const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
            const minutosSalidaAnticipada = diferenciaEnMinutos[3];
            const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);
            n = n + 1;
            const ele = { 
              n,
              ciudad: obj1.ciudad, sucursal: obj1.name_suc,
              departamento: obj2.name_dep,
              regimen: obj3.regimen[0].name_regimen,
              empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
              fecha, entradaHorario, entrada, salidaHorario, salida, alimentacion_asignada,
              inicioAlimentacionHorario, inicioAlimentacion, 
              finAlimentacionHorario, finAlimentacion,  
              tiempoAlimentacion, minutosAlimentacion,
              tiempoLaborado, minutosLaborados,
              tiempoAtraso, minutosAtraso,
              tiempoSalidaAnticipada, minutosSalidaAnticipada,
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
          //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
          const fecha = this.validacionService.FormatearFecha(
            obj3.entrada.fec_horario,
            this.formato_fecha, 
            this.validacionService.dia_abreviado);

          const entradaHorario = this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora);
          const salidaHorario = this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora);
          const inicioAlimentacionHorario = obj3.tipo == 'EAS' 
            ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const finAlimentacionHorario = obj3.tipo == 'EAS' 
            ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const entrada = obj3.entrada.fec_hora_timbre != null 
            ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const salida = obj3.salida.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT');
          const inicioAlimentacion = obj3.tipo == 'EAS' 
            ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
            : '';
          const finAlimentacion = obj3.tipo == 'EAS' 
            ? (obj3.finAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.origen === 'L' || obj3.origen === 'FD' ? obj3.origen : 'FT')) 
            : '';

          const alimentacion_asignada = obj3.tipo == 'EAS' ? obj3.inicioAlimentacion.min_alimentacion : 0;

          const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
          const minutosAlimentacion = diferenciaEnMinutos[0];
          const tiempoAlimentacion = this.minutosAHorasMinutosSegundos(minutosAlimentacion);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
          const minutosAtraso = diferenciaEnMinutos[2];
          const tiempoAtraso = this.minutosAHorasMinutosSegundos(minutosAtraso);
          const minutosSalidaAnticipada = diferenciaEnMinutos[3];
          const tiempoSalidaAnticipada = this.minutosAHorasMinutosSegundos(minutosSalidaAnticipada);

          n = n + 1;
          const ele = { 
            n,
            ciudad: obj2.ciudad, sucursal: obj2.sucursal,
            departamento: obj2.departamento,
            regimen: obj2.regimen[0].name_regimen,
            empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
            fecha, entradaHorario, entrada, salidaHorario, salida, alimentacion_asignada,
            inicioAlimentacionHorario, inicioAlimentacion, 
            finAlimentacionHorario, finAlimentacion,  
            tiempoAlimentacion, minutosAlimentacion,
            tiempoLaborado, minutosLaborados,
            tiempoAtraso, minutosAtraso,
            tiempoSalidaAnticipada, minutosSalidaAnticipada,
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
    this.paginatorDetalle.firstPage();
  }

  //METDODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  obtenerClaseAlimentacion(asignado: any, tomado: any) {
    const tAsignado = Number(asignado);
    const tTomado = Number(tomado);
    if (tTomado > tAsignado) {
        return 'verde';
    } 
  }

  obtenerClaseTimbre(valor: any) {
    if (valor == 'FT') {
      return 'rojo';
    }
  }

  obtenerClaseAtrasoSalida(valor: any, tipo:string){
  const numero = Number(valor);
    if (numero > 0) {
      return tipo === 'A' ? 'amarillo' : 'azul';
    }
  }
}
