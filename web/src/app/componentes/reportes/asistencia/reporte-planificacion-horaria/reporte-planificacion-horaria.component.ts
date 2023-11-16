import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { ITableEmpleados } from 'src/app/model/reportes.model';

import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-reporte-planificacion-horaria',
  templateUrl: './reporte-planificacion-horaria.component.html',
  styleUrls: ['./reporte-planificacion-horaria.component.css']
})
export class ReportePlanificacionHorariaComponent implements OnInit, OnDestroy{
  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCIÓN DE BUSQUEDA DE DATOS SEGÚN OPCIÓN 
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGÚN OPCIÓN SELECCIONADA
  get bool() { return this.reporteService.criteriosBusqueda };

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };
  get filtroNombreDep() { return this.reporteService.filtroNombreDep };
  get filtroNombreReg() { return this.reporteService.filtroNombreReg };
  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();
  
  // VARIABLES DE ALMACENAMIENTO DE DATOS
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
  regimen: any = [];
  horarios: any = [];
  cargos: any = [];
  origen: any = [];
 
  resultados: any = [];
  codigos: string = '';
  accion: any;

  // VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES PARA ADMINISTRAR TOLERANCIA
  tolerancia: string = 'no_considerar';
  tipoTolerancia: string = '';

  // METODO PARA OBTENER DETALLE DE PLANIFICACION
  ver_detalle: boolean = false;
  ver_acciones: boolean = false;
  paginar: boolean = false;
  detalles: any = [];
  detalle_acciones: any = [];

  // ACCIONES DE HORARIOS
  entrada: '';
  salida: '';
  inicio_comida = '';
  fin_comida = '';

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

  // ITEMS DE PAGINACION DE LA TABLA RESULTADOS
  pageSizeOptions_res = [5, 10, 20, 50];
  tamanio_pagina_res: number = 5;
  numero_pagina_res: number = 1;

  // ARREGLO DE DATOS DE HORARIOS
  nomenclatura = [
    { nombre: 'L', descripcion: 'LIBRE' },
    { nombre: 'FD', descripcion: 'FERIADO' },
    { nombre: 'REC', descripcion: 'RECUPERACIÓN' },
    { nombre: 'P', descripcion: 'PERMISO' },
    { nombre: 'V', descripcion: 'VACACION' },
    { nombre: '-', descripcion: 'SIN PLANIFICACIÓN' }
  ]

  constructor(
    private validacionService: ValidacionesService,
    private informacion: DatosGeneralesService,
    private reporteService: ReportesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private plan: PlanGeneralService,
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
    this.horarios = [];
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
    if (this.fechaInicialF.value == null && this.fechaFinalF.value == null) return this.toastr.error('Primero valide fechas de búsqueda.');
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
    this.accion = accion;
    let respuesta = JSON.parse(this.origen);
    let usuarios: any = [];

    respuesta.forEach((obj: any) => {
      this.selectionSuc.selected.find(obj1 => {
        if (obj1.id === obj.id_suc) {
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              usuarios.push(obj3);
            })
          })
        }
      })
    });
    this.VerPlanificacion(usuarios);
  }

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen(accion: any) {
    this.accion = accion;
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen);
    let empleados: any = [];
    let objeto: any;
    respuesta.forEach((obj: any) => {
      this.selectionReg.selected.find((regimen) => {
        objeto = {
          regimen: {
            id: regimen.id,
            nombre: regimen.nombre,
          },
        };
        obj.departamentos.forEach((departamento: any) => {
          departamento.empleado.forEach((empleado: any) => {
            empleado.regimen.forEach((r) => {
              if (regimen.id === r.id_regimen) {
                empleados.push(empleado);
              }
            });
          });
        });
      });
    });

    this.VerPlanificacion(empleados);
  }

  ModelarDepartamento(accion) {
    this.tipo = 'default';
    this.accion = accion;
    let respuesta = JSON.parse(this.origen);
    let usuarios: any = [];

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((obj1: any) => {
        this.selectionDep.selected.find(obj2 => {
          if (obj1.id_depa === obj2.id) {
            obj1.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    });
    this.VerPlanificacion(usuarios);
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.accion = accion;
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen_cargo);
    let usuarios: any = [];
     respuesta.forEach((obj: any) => {
        this.selectionCar.selected.find(obj1 => {
          if (obj.id_cargo === obj1.id) {
            obj.empleados.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })

    this.VerPlanificacion(usuarios);
  }

  ModelarEmpleados(accion) {
    this.tipo = 'default';
    this.accion = accion;
    let emp: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          emp.push(obj)
        }
      })
    })
    this.VerPlanificacion(emp);
  }

  // METODO PARA VER PLANIFICACION
  VerPlanificacion(data: any) {
    this.resultados = data;
    this.codigos = '';
    this.resultados.forEach(obj => {
      if (this.codigos === '') {
        this.codigos = '\'' + obj.codigo + '\''
      }
      else {
        this.codigos = this.codigos + ', \'' + obj.codigo + '\''
      }
    })

    this.ObtenerHorariosEmpleado(this.fechaInicialF.value, this.fechaFinalF.value, this.codigos);

  }


  // METODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any = [];
  mes_inicio: any = '';
  mes_fin: any = '';
  ObtenerHorariosEmpleado(fec_inicio: any, fec_final: any, codigo: any) {
    this.horariosEmpleado = [];
    this.mes_inicio = fec_inicio.format("YYYY-MM-DD");
    this.mes_fin = fec_final.format("YYYY-MM-DD");

    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: codigo
    }

    this.plan.BuscarPlanificacionHoraria(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        const horarios = datos.data;    
        const horariosPorEmpleado = {};

        //AGRUPAMIENTO DE LOS HORIOS POR CODIGO DE EMPLEADO
        horarios.forEach((h:any) => {
          horariosPorEmpleado[h.codigo_e] = horariosPorEmpleado[h.codigo_e] || [];
          horariosPorEmpleado[h.codigo_e].push(h);
        });
        
        this.resultados.forEach((r:any) => {
          r.horarios = horariosPorEmpleado[r.codigo];
        });

        this.horariosEmpleado = this.resultados;
        this.ObtenerDetallesPlanificacion();

      }
      else {
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe planificación.', {
          timeOut: 6000,
        });
      }
    })
  }


  ObtenerDetallesPlanificacion() {
    this.detalles = [];
    // DATOS DE BUSQUEDA DE DETALLES DE PLANIFICACION
    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: this.codigos
    }
    let codigo_horario = '';
    let tipos: any = [];
    let accion = '';
    // VARIABLES AUXILIARES
    let aux_h = '';
    let aux_a = '';
    // BUSQUEDA DE DETALLES DE PLANIFICACIONES
    this.plan.BuscarDetallePlanificacion(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.ver_acciones = true;
        this.detalle_acciones = [];
        this.detalles = datos.data;

        datos.data.forEach(obj => {
          if (aux_h === '') {
            accion = obj.tipo_accion + ': ' + obj.hora;
            this.ValidarAcciones(obj);
          } else if (obj.id_horario === aux_h) {
            if (obj.tipo_accion != aux_a) {
              accion = accion + ' , ' + obj.tipo_accion + ': ' + obj.hora
              codigo_horario = obj.codigo_dia
              this.ValidarAcciones(obj);
            }
          } else {
            // CONCATENAR VALORES ANTERIORES
            tipos = [{
              acciones: accion,
              horario: codigo_horario,
              entrada: this.entrada,
              inicio_comida: this.inicio_comida,
              fin_comida: this.fin_comida,
              salida: this.salida,
            }];
            this.detalle_acciones = this.detalle_acciones.concat(tipos);
            // LIMPIAR VALORES
            accion = obj.tipo_accion + ': ' + obj.hora;
            codigo_horario = obj.codigo_dia;
            this.entrada = '';
            this.salida = '';
            this.inicio_comida = '';
            this.fin_comida = '';
            this.ValidarAcciones(obj);
          }
          // ASIGNAR VALORES A VARIABLES AUXILIARES
          aux_h = obj.id_horario;
          aux_a = obj.tipo_accion;
        })
        // AL FINALIZAR EL CICLO CONCATENAR VALORES
        tipos = [{
          acciones: accion,
          horario: codigo_horario,
          entrada: this.entrada,
          inicio_comida: this.inicio_comida,
          fin_comida: this.fin_comida,
          salida: this.salida,
        }]
        this.detalle_acciones = this.detalle_acciones.concat(tipos);

        // FORMATEAR HORAS
        this.detalle_acciones.forEach(detalle => {
          detalle.entrada_ = this.validacionService.FormatearHora(detalle.entrada, this.formato_hora);
          if (detalle.inicio_comida != '') {
            detalle.inicio_comida = this.validacionService.FormatearHora(detalle.inicio_comida, this.formato_hora);
          }
          if (detalle.fin_comida != '') {
            detalle.fin_comida = this.validacionService.FormatearHora(detalle.fin_comida, this.formato_hora);
          }
          detalle.salida_ = this.validacionService.FormatearHora(detalle.salida, this.formato_hora);
        })

        // METODO PARA VER PAGINACION
        if (this.detalle_acciones.length > 8) {
          this.paginar = true;
        } else {
          this.paginar = false;
        }
        this.ejecutarAccion();
      } else {
        this.ejecutarAccion();
        this.toastr.info('Ups no se han encontrado registros!!!', 'No existe detalle de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  // CONDICIONES DE ACCIONES EN HORARIO ASIGNADO
  ValidarAcciones(obj: any) {
    if (obj.tipo_accion === 'E') {
      return this.entrada = obj.hora;
    }
    if (obj.tipo_accion === 'S') {
      return this.salida = obj.hora;
    }
    if (obj.tipo_accion === 'I/A') {
      return this.inicio_comida = obj.hora;
    }
    if (obj.tipo_accion === 'F/A') {
      return this.fin_comida = obj.hora;
    }
  }

  ejecutarAccion(){
    switch (this.accion) {
      case 'excel': this.exportToExcel(); break;
      case 'ver': this.verDatos(); break;
      default: this.generarPdf(this.accion); break;
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
   *                                                    *
   *                         PDF                        *
   *                                                    *
   ******************************************************/

  generarPdf(action) {
    let documentDefinition;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.getDocumentDefinicion();
    };

    let doc_name = "Planificacion_horaria.pdf";
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
        { text: 'PLANIFICACIÓN HORARIA', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 5] },
        { text: 'PERIODO DEL: ' + this.mes_inicio + " AL " + this.mes_fin, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF().map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 6, alignment: 'center', margin: [1, 3, 1, 3] },
        tableMargin: { margin: [0, 0, 0, 10] },
        tableMarginHorarios: { margin: [10, 0, 10, 0]},
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 15, 0, 15] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }


  impresionDatosPDF(): Array<any> {
    let n: any = []
    if (this.ver_acciones) {
      n.push({
        style: 'tableMargin',
        table: {
          widths: ['*', 'auto', '*'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: '',
              },
              {
                border: [false, false, false, false],
                table: {
                  widths: ['auto', 'auto'],
                  body: [
                    [
                      {
                        style: 'tableMarginHorarios',
                        border: [false, false, false, false],
                        table: {
                          widths: ['auto', 'auto', 'auto', 'auto', 'auto',],
                          headerRows: 2,
                          body: [
                            [
                              { colSpan:5, text: 'DETALLE DE HORARIOS', style: 'tableHeader' },
                              {},{},{},{}
                            ],
                            [
                              { text: 'HORARIO', style: 'tableHeader' },
                              { text: 'ENTRADA (E)', style: 'tableHeader' },
                              { text: 'INICIO ALIMENTACIÓN (I/A)', style: 'tableHeader' },
                              { text: 'FIN ALIMENTACIÓN (F/A)', style: 'tableHeader' },
                              { text: 'SALIDA (S)', style: 'tableHeader' }
                            ],
                            ...this.detalle_acciones.map(d => {
                              return [
                                { style: 'itemsTableCentrado', text: d.horario },
                                { style: 'itemsTableCentrado', text: d.entrada_ },
                                { style: 'itemsTableCentrado', text: d.inicio_comida },
                                { style: 'itemsTableCentrado', text: d.fin_comida },
                                { style: 'itemsTableCentrado', text: d.salida_ },
                              ]
                            })
                          ]
                        },
                        layout: {
                          fillColor: function (rowIndex) {
                            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                          }
                        }
                      },
                      {
                        style: 'tableMarginHorarios',
                        border: [false, false, false, false],
                        table: {
                          widths: ['auto', 'auto',],
                          headerRows: 2,
                          body: [
                            [
                              { colSpan:2, text: 'DEFINICIONES', style: 'tableHeader' },
                              {},
                            ],
                            [
                              { text: 'NOMENCLATURA', style: 'tableHeader' },
                              { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                            ],
                            ...this.nomenclatura.map(n => {
                              return [
                                { style: 'itemsTableCentrado', text: n.nombre },
                                { style: 'itemsTableCentrado', text: n.descripcion },
                              ]
                            })
                          ]
                        },
                        layout: {
                          fillColor: function (rowIndex) {
                            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                          }
                        }
                      }
                    ]
                  ]
                },
              },
              {
                border: [false, false, false, false],
                text: '',
              }
            ]
          ]
        },
        
      },
      
      );
    };

    this.horariosEmpleado.forEach((e:any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', 'auto', 'auto',],
          headerRows: 2,
          body: [
            [
              {
                border: [true, true, false, false],
                text: 'EMPLEADO: ' + e.name_empleado,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, true, false, false],
                text: 'C.C.: ' + e.cedula,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, true, true, false],
                text: 'COD: ' + e.codigo,
                style: 'itemsTableInfoEmpleado'
              }
            ],
            [
              {
                border: [true, false, false, false],
                text: 'DEPARTAMENTO: ' + e.departamento,
                style: 'itemsTableInfoEmpleado'
              },
              {
                border: [false, false, false, false],
                text: 'CARGO: ' + e.cargo,
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

      e.horarios.forEach((h)=>{
        n.push({
          style: 'tableMargin',
          table: {
            widths: [
              '*', '*', '*', '*','*','*','*' 
            ],
            headerRows: 0,
            body: [
              [
                { rowSpan: 1, colSpan: 7, text: 'AÑO: ' + h.anio + ' MES: ' + h.mes, style: 'tableHeader' },
                {},{},{},{},{},{}
              ],
              [
                { rowSpan: 1, text: '01', style: 'tableHeader' },
                { rowSpan: 1, text: '02', style: 'tableHeader' },
                { rowSpan: 1, text: '03', style: 'tableHeader' },
                { rowSpan: 1, text: '04', style: 'tableHeader' },
                { rowSpan: 1, text: '05', style: 'tableHeader' },
                { rowSpan: 1, text: '06', style: 'tableHeader' },
                { rowSpan: 1, text: '07', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text:  h.dia1},
                { style: 'itemsTableCentrado', text:  h.dia2},
                { style: 'itemsTableCentrado', text:  h.dia3 },
                { style: 'itemsTableCentrado', text:  h.dia4 },
                { style: 'itemsTableCentrado', text:  h.dia5 }, 
                { style: 'itemsTableCentrado', text:  h.dia6 },
                { style: 'itemsTableCentrado', text:  h.dia7 },
              ],
              [
                { rowSpan: 1, text: '08', style: 'tableHeader' },
                { rowSpan: 1, text: '09', style: 'tableHeader' },
                { rowSpan: 1, text: '10', style: 'tableHeader' },
                { rowSpan: 1, text: '11', style: 'tableHeader' },
                { rowSpan: 1, text: '12', style: 'tableHeader' },
                { rowSpan: 1, text: '13', style: 'tableHeader' },
                { rowSpan: 1, text: '14', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text:  h.dia8 },
                { style: 'itemsTableCentrado', text:  h.dia9 },
                { style: 'itemsTableCentrado', text:  h.dia10 },
                { style: 'itemsTableCentrado', text:  h.dia11 },
                { style: 'itemsTableCentrado', text:  h.dia12 },
                { style: 'itemsTableCentrado', text:  h.dia13 },
                { style: 'itemsTableCentrado', text:  h.dia14 },
              ],
              [
                { rowSpan: 1, text: '15', style: 'tableHeader' },
                { rowSpan: 1, text: '16', style: 'tableHeader' },
                { rowSpan: 1, text: '17', style: 'tableHeader' },
                { rowSpan: 1, text: '18', style: 'tableHeader' },
                { rowSpan: 1, text: '19', style: 'tableHeader' },
                { rowSpan: 1, text: '20', style: 'tableHeader' },
                { rowSpan: 1, text: '21', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text:  h.dia15 },
                { style: 'itemsTableCentrado', text:  h.dia16 },
                { style: 'itemsTableCentrado', text:  h.dia17 },
                { style: 'itemsTableCentrado', text:  h.dia18 },
                { style: 'itemsTableCentrado', text:  h.dia19 },
                { style: 'itemsTableCentrado', text:  h.dia20 },
                { style: 'itemsTableCentrado', text:  h.dia21 }
              ],
              [
                { rowSpan: 1, text: '22', style: 'tableHeader' },
                { rowSpan: 1, text: '23', style: 'tableHeader' },
                { rowSpan: 1, text: '24', style: 'tableHeader' },
                { rowSpan: 1, text: '25', style: 'tableHeader' },
                { rowSpan: 1, text: '26', style: 'tableHeader' },
                { rowSpan: 1, text: '27', style: 'tableHeader' },
                { rowSpan: 1, text: '28', style: 'tableHeader' },
              ],
              [
                { style: 'itemsTableCentrado', text:  h.dia22 },
                { style: 'itemsTableCentrado', text:  h.dia23 },
                { style: 'itemsTableCentrado', text:  h.dia24 },
                { style: 'itemsTableCentrado', text:  h.dia25 },
                { style: 'itemsTableCentrado', text:  h.dia26 },
                { style: 'itemsTableCentrado', text:  h.dia27 },
                { style: 'itemsTableCentrado', text:  h.dia28 },
              ],
              [            
                { rowSpan: 1, text: '29', style: 'tableHeader' },
                { rowSpan: 1, text: '30', style: 'tableHeader' },
                { rowSpan: 1, text: '31', style: 'tableHeader' },
                {},{},{},{}
              ],
              [         
                { style: 'itemsTableCentrado', text:  h.dia29 },
                { style: 'itemsTableCentrado', text:  h.dia30 },
                { style: 'itemsTableCentrado', text:  h.dia31 },
                {},{},{},{}
              ],
            ],
          },
        });
      })
    })

    return n;
  }

  // METODO P
  
  SumarRegistros(array: any []) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor
  }

  calcularDiferenciaFechas(timbre: any) {
    if (timbre.dia === 'L' || timbre.dia === 'FD') {
      return [0,0];
    }

    if (timbre.tipo === 'ES') {
      const { entrada, salida } = timbre;
      let minutosPlanificados = this.calcularMinutosDiferencia(entrada.fec_hora_horario, salida.fec_hora_horario);
      
      if (entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null) {
        const minutosLaborados = this.calcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre);
        return [minutosPlanificados,Number(minutosLaborados.toFixed(2))];
      }

      return [minutosPlanificados,0];
    } else {
      const { entrada, inicioAlimentacion, finAlimentacion, salida } = timbre;
      const min_alimentacion: number = timbre.inicioAlimentacion.min_alimentacion;
      
      const minutosPlanificados = Number((this.calcularMinutosDiferencia(entrada.fec_hora_horario, salida.fec_hora_horario)-min_alimentacion).toFixed(2));
      const minutosLaborados = entrada.fec_hora_timbre !== null && salida.fec_hora_timbre !== null ? this.calcularMinutosDiferencia(entrada.fec_hora_timbre, salida.fec_hora_timbre) : 0;
      const minutosAlimentacion = inicioAlimentacion.fec_hora_timbre !== null && finAlimentacion.fec_hora_timbre !== null ? this.calcularMinutosDiferencia(inicioAlimentacion.fec_hora_timbre, finAlimentacion.fec_hora_timbre) : min_alimentacion;
      return minutosLaborados == 0 ? [minutosPlanificados,minutosLaborados] :[minutosPlanificados,Number((minutosLaborados - minutosAlimentacion).toFixed(2))];
    }
  }
  
  calcularMinutosDiferencia(inicio: any, fin: any): number {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / 1000 / 60;
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
   exportToExcel(): void {
        const sheet1: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.construirTablaHorarioEmpleados());
        const sheet2: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.construirTablaDetalleHorarios());
        const sheet3: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet(this.construirTablaDefiniciones());
        const workbook: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, sheet1, 'Planificacion horaria');
        xlsx.utils.book_append_sheet(workbook, sheet2, 'Detalle Horarios');
        xlsx.utils.book_append_sheet(workbook, sheet3, 'Definiciones');
        xlsx.writeFile(workbook, 'Planificacion_horaria.xlsx');
  }

  construirTablaHorarioEmpleados() {

    const tableData = [
      [
        'CIUDAD', 'SUCURSAL', 'DEPARTAMENTO', 'REGIMEN',
        'NOMBRE EMPLEADO', 'CÉDULA','CÓDIGO', 'AÑO', 'MES',
        '01', '02', '03', '04', '05',
        '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15',
        '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25',
        '26', '27', '28', '29', '30', '31'
      ],
    ];
    
    this.horariosEmpleado.forEach((empleado) => {
      empleado.horarios.forEach((h:any) =>{
        tableData.push([
          empleado.ciudad, empleado.sucursal, empleado.departamento,
          empleado.regimen[0].name_regimen, empleado.name_empleado,
          empleado.cedula, empleado.codigo, h.anio, h.mes,
          h.dia1, h.dia2, h.dia3, h.dia4,
          h.dia5, h.dia6, h.dia7, h.dia8,
          h.dia9, h.dia10, h.dia11, h.dia12,
          h.dia13, h.dia14, h.dia15, h.dia16,
          h.dia17, h.dia18, h.dia19, h.dia20,
          h.dia21, h.dia22, h.dia23, h.dia24,
          h.dia25, h.dia26, h.dia27, h.dia28,
          h.dia29, h.dia30, h.dia31
        ]);
      })

      
    });
    return tableData;
  }

  construirTablaDetalleHorarios() {

    const tableData = [
      [
        'CÓDIGO', 'ENTRADA (E)', 
        'INICIO ALIMENTACIÓN (I/A)', 
        'FIN ALIMENTACIÓN (F/A)', 'SALIDA (S)'
      ],
    ];
    
    this.detalle_acciones.forEach((d) => {
      tableData.push([
        d.horario, d.entrada_, d.inicio_comida,
        d.fin_comida, d.salida_ 
      ]);
    });
    return tableData;
  }

  construirTablaDefiniciones() {

    const tableData = [
      [
        'NOMENCLATURA', 'DESCRIPCIÓN'
      ],
    ];
    
    this.nomenclatura.forEach((n) => {
      tableData.push([
        n.nombre, n.descripcion
      ]);
    });
    return tableData;
  }

  extraerHorarioEmpleados() {
    this.horarios = [];
    this.horariosEmpleado.forEach((empleado:any) => {
      empleado.horarios.forEach((h:any) =>{
        const horario = {
          ciudad:empleado.ciudad, sucursal:empleado.sucursal, departamento:empleado.departamento,
          regimen:empleado.regimen[0].name_regimen, empleado:empleado.name_empleado,
          cedula:empleado.cedula, codigo:empleado.codigo, anio:h.anio, mes:h.mes,
          dia1:h.dia1, dia2:h.dia2, dia3:h.dia3, dia4:h.dia4,
          dia5:h.dia5, dia6:h.dia6, dia7:h.dia7, dia8:h.dia8,
          dia9:h.dia9, dia10:h.dia10, dia11:h.dia11, dia12:h.dia12,
          dia13:h.dia13, dia14:h.dia14, dia15:h.dia15, dia16:h.dia16,
          dia17:h.dia17, dia18:h.dia18, dia19:h.dia19, dia20:h.dia20,
          dia21:h.dia21, dia22:h.dia22, dia23:h.dia23, dia24:h.dia24,
          dia25:h.dia25, dia26:h.dia26, dia27:h.dia27, dia28:h.dia28,
          dia29:h.dia29, dia30:h.dia30, dia31:h.dia31
        }
        this.horarios.push(horario);
      })
    });
    console.log('extraidos',this.horarios)
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

  ManejarPaginaResultados(e: PageEvent) {
    this.numero_pagina_res = e.pageIndex + 1;
    this.tamanio_pagina_res = e.pageSize;
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
    this.extraerHorarioEmpleados();
    this.verDetalle = true;

  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
  }

  // METODO PARA CAMBIAR DE COLORES SEGUN EL MES
  CambiarColores(opcion: any) {
    let color: string;
    switch (opcion) {
      case 'ok':
        return color = '#F6DDCC';
    }
  }

  fecHorario: boolean = true;
  // METODO PARA MOSTRAR FECHA SELECCIONADA
  FormatearFecha(fecha: Moment, datepicker: MatDatepicker<Moment>, opcion: number) {
    const ctrlValue = fecha;
    if (opcion === 1) {
      if (this.fechaFinalF.value) {
        this.ValidarFechas(ctrlValue, this.fechaFinalF.value, this.fechaInicialF, opcion);
      }
      else {
        let inicio = moment(ctrlValue).format('01/MM/YYYY');
        this.fechaInicialF.setValue(moment(inicio, 'DD/MM/YYYY'));
      }
      this.fecHorario = false;
    }
    else {
      this.ValidarFechas(this.fechaInicialF.value, ctrlValue, this.fechaFinalF, opcion);
    }
    datepicker.close();
  }

    // METODO PARA VALIDAR EL INGRESO DE LAS FECHAS
    ValidarFechas(fec_inicio: any, fec_fin: any, formulario: any, opcion: number) {
      // FORMATO DE FECHA PERMITIDO PARA COMPARARLAS
      let inicio = moment(fec_inicio).format('01/MM/YYYY');
      let final = moment(fec_fin).daysInMonth() + moment(fec_fin).format('/MM/YYYY');
      let feci = moment(inicio, 'DD/MM/YYYY').format('YYYY/MM/DD');
      let fecf = moment(final, 'DD/MM/YYYY').format('YYYY/MM/DD');
      // VERIFICAR SI LAS FECHAS ESTAN INGRESDAS DE FORMA CORRECTA
      if (Date.parse(feci) <= Date.parse(fecf)) {
        if (opcion === 1) {
          formulario.setValue(moment(inicio, 'DD/MM/YYYY'));
        }
        else {
          formulario.setValue(moment(final, 'DD/MM/YYYY'));
        }
      }
      else {
        this.toastr.warning('La fecha no se registro. Ups la fecha no es correcta.!!!', 'VERIFICAR', {
          timeOut: 6000,
        });
      }
    }

  
}
