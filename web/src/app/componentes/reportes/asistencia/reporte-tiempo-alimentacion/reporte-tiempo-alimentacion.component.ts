import { IReporteFaltas, ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { AlimentacionService } from 'src/app/servicios/reportes/alimentacion/alimentacion.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';


@Component({
  selector: 'app-reporte-tiempo-alimentacion',
  templateUrl: './reporte-tiempo-alimentacion.component.html',
  styleUrls: ['./reporte-tiempo-alimentacion.component.css']
})
export class ReporteTiempoAlimentacionComponent implements OnInit, OnDestroy {


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

  //VARIABLES PARA ALMACENAR TIEMPOS DE SALIDAS ANTICIPADAS
  excesoDepartamentos: any = [];
  excesoSucursales: any = [];
  excesoRegimen: any = [];
  excesoCargos: any = [];

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

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  
  constructor(
    private validacionService: ValidacionesService,
    private informacion: DatosGeneralesService,
    private reporteService: ReportesService,
    private restAlimentacion: AlimentacionService,
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
    this.restAlimentacion.BuscarTimbresAlimentacion(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
    this.restAlimentacion.BuscarTimbresAlimentacionRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
    this.restAlimentacion.BuscarTimbresAlimentacion(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
    this.restAlimentacion.BuscarTimbresAlimentacionRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
    this.restAlimentacion.BuscarTimbresAlimentacion(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
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
   *                          PDF                       *
   *                                                    *
   ******************************************************/

  generarPdf(action) {
    let documentDefinition;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.getDocumentDefinicion();
    };

    let doc_name = "Tiempo_alimentacion.pdf";
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
        { text: 'TIEMPO DE ALIMENTACIÓN', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 5] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 2, 0, 2] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0],fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 8, alignment: 'center',fillColor: '#EE4444' },
        itemsTableCentradoExceso: { fontSize: 8, alignment: 'center',fillColor: '#55EE44' },
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
    let accionT: string = '';
    let totalExcesoEmpleado: number = 0;
    let totalExcesoSucursal: number = 0;
    let totalExcesoCargo = 0;
    let totalExcesoRegimen = 0;
    let totalExcesoDepartamento = 0;
    this.excesoDepartamentos = [];
    this.excesoSucursales = [];
    this.excesoRegimen = [];
    this.excesoCargos = [];

    n.push({
      style: 'tableMarginColores',
      table: {
        widths: ['*','auto',50,'auto',50],
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
              text: 'EXCESO DE ALIMENTACIÓN',
              style: 'itemsTableCentradoColores'
            },
            {
              text: ' ',
              style: 'itemsTableCentradoExceso'
            },
          ]
        ]
      }
    });

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      data.forEach((obj1) => {
        if (this.bool.bool_cargo === true) {
          totalExcesoCargo = 0;
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
          totalExcesoRegimen = 0;
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
          totalExcesoEmpleado = 0;
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'centrado' },
                  { text: 'FECHA', style: 'centrado' },
                  { text: 'INICIO ALIMENTACIÓN', style: 'centrado' },
                  { text: 'FIN ALIMENTACIÓN', style: 'centrado' },
                  { text: 'M. ALIMENTACIÓN', style: 'centrado' },
                  { text: 'M. TOMADOS', style: 'centrado' },
                  { text: 'M. EXCESO', style: 'centrado' },
                ],
                ...obj2.timbres.map(obj3 => {
                  const inicioAlimentacion = obj3.inicioAlimentacion.fec_hora_timbre != null 
                    ? obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
                    : 'FT';
                  const finAlimentacion = obj3.finAlimentacion.fec_hora_timbre != null
                    ? obj3.finAlimentacion.fec_hora_timbre.split(' ')[1]
                    : 'FT';
                  const minAlimentacion = obj3.inicioAlimentacion.min_alimentacion;
                  const minutosTomados = this.calcularDiferenciaFechas(obj3.inicioAlimentacion.fec_hora_timbre,obj3.finAlimentacion.fec_hora_timbre);
                  const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
                  totalExcesoEmpleado += exceso;
                  totalExcesoRegimen += exceso; 
                  totalExcesoCargo += exceso; 
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: obj3.inicioAlimentacion.fec_horario },
                    { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                    { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                    { style: 'itemsTableCentrado', text: minAlimentacion },
                    { style: 'itemsTableCentrado', text: minutosTomados !==null ? minutosTomados : minAlimentacion },
                    { style: exceso > 0 ? 'itemsTableCentradoExceso' :'itemsTableCentrado', text: exceso },
                  ];
                }),
                [
                  {},{},{},{},{},
                  {style: 'itemsTableCentradoTotal', text: 'TOTAL'},
                  {style: 'itemsTableCentradoTotal', text: totalExcesoEmpleado},
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
          let cargo = {
            cargo: obj1.name_cargo,
            exceso: totalExcesoCargo,
          }
          this.excesoCargos.push(cargo);
        };

        if (this.bool.bool_reg) {
          let regimen = {
            regimen: obj1.regimen.nombre,
            exceso: totalExcesoRegimen,
          }
          this.excesoRegimen.push(regimen);
        };
      });

      if (this.bool.bool_cargo) {    
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL CARGOS',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
              ],
              ...this.excesoCargos.map((cargo: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: cargo.cargo,
                    style: 'itemsTableCentrado'
                  },
                  { text: cargo.exceso, style: 'itemsTableCentrado'},
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
            widths: ['*', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL REGIMENES',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
              ],
              ...this.excesoRegimen.map((regimen: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: regimen.regimen,
                    style: 'itemsTableCentrado'
                  },
                  { text: regimen.exceso, style: 'itemsTableCentrado'},
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
      data.forEach((obj: IReporteFaltas) => {
        if (this.bool.bool_suc === true || this.bool.bool_dep === true) {
          totalExcesoSucursal = 0;
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
          totalExcesoDepartamento = 0;
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
            totalExcesoEmpleado = 0;
            n.push({
              style: 'tableMargin',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
                headerRows: 1,
                body: [
                  [
                    { text: 'N°', style: 'centrado' },
                    { text: 'FECHA', style: 'centrado' },
                    { text: 'INICIO ALIMENTACIÓN', style: 'centrado' },
                    { text: 'FIN ALIMENTACIÓN', style: 'centrado' },
                    { text: 'M. ALIMENTACIÓN', style: 'centrado' },
                    { text: 'M. TOMADOS', style: 'centrado' },
                    { text: 'M. EXCESO', style: 'centrado' },
                  ],
                  ...obj2.timbres.map(obj3 => {
                    const inicioAlimentacion = obj3.inicioAlimentacion.fec_hora_timbre != null 
                      ? obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
                      : 'FT';
                    const finAlimentacion = obj3.finAlimentacion.fec_hora_timbre != null
                      ? obj3.finAlimentacion.fec_hora_timbre.split(' ')[1]
                      : 'FT';
                    const minAlimentacion = obj3.inicioAlimentacion.min_alimentacion;
                    const minutosTomados = this.calcularDiferenciaFechas(obj3.inicioAlimentacion.fec_hora_timbre,obj3.finAlimentacion.fec_hora_timbre);
                    const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
                    totalExcesoEmpleado += exceso;
                    totalExcesoSucursal += exceso; 
                    totalExcesoDepartamento += exceso; 
                    c = c + 1
                    return [
                      { style: 'itemsTableCentrado', text: c },
                      { style: 'itemsTableCentrado', text: obj3.inicioAlimentacion.fec_horario },
                      { style: inicioAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: inicioAlimentacion },
                      { style: finAlimentacion == 'FT' ? 'itemsTableCentradoFT' : 'itemsTableCentrado', text: finAlimentacion },
                      { style: 'itemsTableCentrado', text: minAlimentacion },
                      { style: 'itemsTableCentrado', text: minutosTomados !==null ? minutosTomados : minAlimentacion },
                      { style: exceso > 0 ? 'itemsTableCentradoExceso' :'itemsTableCentrado', text: exceso },
                    ];
                  }),
                  [
                    {},{},{},{},{},
                    {style: 'itemsTableCentradoTotal', text: 'TOTAL'},
                    {style: 'itemsTableCentradoTotal', text: totalExcesoEmpleado},
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
            let departamento = {
              departamento: obj1.name_dep,
              exceso: totalExcesoDepartamento,
            }
            this.excesoDepartamentos.push(departamento);
          };
        });

        if (this.bool.bool_suc) {
          let sucursal = {
            sucursal: obj.name_suc,
            exceso: totalExcesoSucursal,
          }
          this.excesoSucursales.push(sucursal);
        };
      });
    }

    if (this.bool.bool_dep) {    
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL DEPARTAMENTOS',
                style: 'itemsTableInfoTotal'
              },
              { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
            ],
            ...this.excesoDepartamentos.map((departamento: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: departamento.departamento,
                  style: 'itemsTableCentrado'
                },
                { text: departamento.exceso, style: 'itemsTableCentrado'},
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
          widths: ['*', 'auto'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL SUCURSALES',
                style: 'itemsTableInfoTotal'
              },
              { text: 'M. EXCESO', style: 'itemsTableInfoTotal' },
            ],
            ...this.excesoSucursales.map((sucursal: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: sucursal.sucursal,
                  style: 'itemsTableCentrado'
                },
                { text: sucursal.exceso, style: 'itemsTableCentrado'},
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

  calcularDiferenciaFechas(inicioAlimentacion: string, finAlimentacion: string) {
    if (inicioAlimentacion!=null && finAlimentacion!=null) {
      const fechaInicio = new Date(inicioAlimentacion);
      const fechaFin = new Date(finAlimentacion);
      const diferenciaEnMinutos = Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
      console.log('diferencia de fechas', fechaInicio, fechaFin, diferenciaEnMinutos);
      return Number(diferenciaEnMinutos.toFixed(2));
    } else {
      return null;
    }  
   }

   calcularExcesoTiempo(minutosAsignados: string, minutosTomados: any): number {
    if (!minutosAsignados || !minutosTomados) return 0;
   
    const asignados = Number(minutosAsignados);
    const tomados = Number(minutosTomados);
   
    return Number((Math.max(tomados - asignados, 0)).toFixed(2));
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
   exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Alimentacion');
        xlsx.writeFile(wb_regimen_cargo, 'Tiempo_alimentacion.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Alimentacion');
        xlsx.writeFile(wb, 'Tiempo_alimentacion.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReporteFaltas) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            const inicioAlimentacion = obj4.inicioAlimentacion.fec_hora_timbre != null 
              ? obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
            const finAlimentacion = obj4.finAlimentacion.fec_hora_timbre != null
              ? obj4.finAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
              const minAlimentacion = obj4.inicioAlimentacion.min_alimentacion;
              const minutosTomados = this.calcularDiferenciaFechas(obj4.inicioAlimentacion.fec_hora_timbre,obj4.finAlimentacion.fec_hora_timbre);
              const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
            let ele = { 
              'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
              'Departamento': obj2.name_dep,
              'Régimen': obj3.regimen[0].name_regimen,
              'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Fecha': new Date(obj4.inicioAlimentacion.fec_horario), 'Inicio Alimentación': inicioAlimentacion,
              'Fin Alimentación': finAlimentacion, 'M. Alimentación': minAlimentacion, 'M. Tomados': minutosTomados !==null ? minutosTomados : minAlimentacion,
              'M. Exceso': exceso
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
          const inicioAlimentacion = obj3.inicioAlimentacion.fec_hora_timbre != null 
              ? obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
            const finAlimentacion = obj3.finAlimentacion.fec_hora_timbre != null
              ? obj3.finAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
              const minAlimentacion = obj3.inicioAlimentacion.min_alimentacion;
              const minutosTomados = this.calcularDiferenciaFechas(obj3.inicioAlimentacion.fec_hora_timbre,obj3.finAlimentacion.fec_hora_timbre);
              const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
          let ele = {
            'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
            'Departamento': obj2.departamento,
            'Régimen': obj2.regimen[0].name_regimen,
            'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
            'Fecha': new Date(obj3.inicioAlimentacion.fec_horario), 'Inicio Alimentación': inicioAlimentacion,
            'Fin Alimentación': finAlimentacion, 'M. Alimentación': minAlimentacion, 'M. Tomados': minutosTomados !==null ? minutosTomados : minAlimentacion,
            'M. Exceso': exceso
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
      this.data_pdf.forEach((obj1: IReporteFaltas) => {
        obj1.departamentos.forEach(obj2 => {
          obj2.empleado.forEach((obj3: any) => {
            obj3.timbres.forEach((obj4: any) => {
              const inicioAlimentacion = obj4.inicioAlimentacion.fec_hora_timbre != null 
              ? obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
            const finAlimentacion = obj4.finAlimentacion.fec_hora_timbre != null
              ? obj4.finAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
              const minAlimentacion = obj4.inicioAlimentacion.min_alimentacion;
              const minutosTomados = this.calcularDiferenciaFechas(obj4.inicioAlimentacion.fec_hora_timbre,obj4.finAlimentacion.fec_hora_timbre);
              const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
              n = n + 1;
              let ele = {
                n: n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep, regimen: obj3.regimen[0].name_regimen,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
                fecha: obj4.inicioAlimentacion.fec_horario, inicio: inicioAlimentacion, fin: finAlimentacion, 
                alimentacion: minAlimentacion, tomados: minutosTomados !==null ? minutosTomados : minAlimentacion, exceso: exceso
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
            const inicioAlimentacion = obj3.inicioAlimentacion.fec_hora_timbre != null 
              ? obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
            const finAlimentacion = obj3.finAlimentacion.fec_hora_timbre != null
              ? obj3.finAlimentacion.fec_hora_timbre.split(' ')[1]
              : 'FT';
              const minAlimentacion = obj3.inicioAlimentacion.min_alimentacion;
              const minutosTomados = this.calcularDiferenciaFechas(obj3.inicioAlimentacion.fec_hora_timbre,obj3.finAlimentacion.fec_hora_timbre);
              const exceso = this.calcularExcesoTiempo(minAlimentacion, minutosTomados);
            n = n + 1;
            let ele = {
              n: n,
              ciudad: obj2.ciudad, sucursal: obj2.sucursal,
              departamento: obj2.departamento, regimen: obj2.regimen[0].name_regimen,
              empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
              fecha: obj3.inicioAlimentacion.fec_horario, inicio: inicioAlimentacion, fin: finAlimentacion, 
              alimentacion: minAlimentacion, tomados: minutosTomados !==null ? minutosTomados : minAlimentacion, exceso: exceso
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

  //METDODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  obtenerClaseCeldas(valor: any) {
    if (valor > 0) {
        return 'verde';
    } else if (valor == 'FT') {
        return 'rojo';
    }
  }

}
