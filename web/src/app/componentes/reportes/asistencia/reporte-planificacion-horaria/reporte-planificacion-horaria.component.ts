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
 
  resultados: any = [];
  codigos: string = '';


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

  // FECHAS DE BUSQUEDA
  fechaInicialF = new FormControl();
  fechaFinalF = new FormControl();

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
    console.log('data',this.origen);
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
    this.data_pdf = []
    // this.reportesTiempoLaborado.ReporteTiempoLaborado(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
    //   this.data_pdf = res;
    //   console.log('DATA PDF', this.data_pdf);
    //   switch (accion) {
    //     case 'excel': this.exportToExcel('default'); break;
    //     case 'ver': this.verDatos(); break;
    //     default: this.generarPdf(accion); break;
    //   }
    // }, err => {
    //   this.toastr.error(err.error.message)
    // })
  }

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen(accion: any) {
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

    this.data_pdf = [];
    this.VerPlanificacion(empleados);
    // this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
    //   this.data_pdf = res
    //   switch (accion) {
    //     case 'excel': this.exportToExcel('RegimenCargo'); break;
    //     case 'ver': this.verDatos(); break;
    //     default: this.generarPdf(accion); break;
    //   }
    // }, err => {
    //   this.toastr.error(err.error.message)
    // })
  }

  ModelarDepartamento(accion) {
    this.tipo = 'default';
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
    console.log('usuarios',usuarios);
    this.data_pdf = [];
    this.VerPlanificacion(usuarios);
    // this.reportesTiempoLaborado.ReporteTiempoLaborado(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
    //   this.data_pdf = res
    //   switch (accion) {
    //     case 'excel': this.exportToExcel('default'); break;
    //     case 'ver': this.verDatos(); break;
    //     default: this.generarPdf(accion); break;
    //   }
    // }, err => {
    //   this.toastr.error(err.error.message)
    // })
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
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

    this.data_pdf = [];
    this.VerPlanificacion(usuarios);
    // this.reportesTiempoLaborado.ReporteTiempoLaboradoRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
    //   this.data_pdf = res;
    //   console.log('data pdf cargo',this.data_pdf);
    //   switch (accion) {
    //     case 'excel': this.exportToExcel('RegimenCargo'); break;
    //     case 'ver': this.verDatos(); break;
    //     default: this.generarPdf(accion); break;
    //   }
    // }, err => {
    //   this.toastr.error(err.error.message)
    // })
  }

  ModelarEmpleados(accion) {
    this.tipo = 'default';
    let emp: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          emp.push(obj)
        }
      })
    })


    this.data_pdf = [];
    this.VerPlanificacion(emp);
    // this.reportesTiempoLaborado.ReporteTiempoLaborado(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
    //   this.data_pdf = res
    //   switch (accion) {
    //     case 'excel': this.exportToExcel('default'); break;
    //     case 'ver': this.verDatos(); break;
    //     default: this.generarPdf(accion); break;
    //   }
    // }, err => {
    //   this.toastr.error(err.error.message)
    // })
  }

  // METODO PARA VER PLANIFICACION
  VerPlanificacion(data: any) {
    this.resultados = data;
    this.codigos = '';
    console.log('resultados .... ', this.resultados)
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
    console.log('codigos',codigo);   
    this.mes_inicio = fec_inicio.format("YYYY-MM-DD");
    this.mes_fin = fec_final.format("YYYY-MM-DD");

    let busqueda = {
      fecha_inicio: this.mes_inicio,
      fecha_final: this.mes_fin,
      codigo: codigo
    }

    this.plan.BuscarPlanificacionHoraria(busqueda).subscribe(datos => {
      if (datos.message === 'OK') {
        this.horariosEmpleado = datos.data;
        let index = 0;
        this.horariosEmpleado.forEach(obj => {
          this.resultados.forEach(r => {
            if (r.codigo === obj.codigo_e) {
              obj.id_empleado = r.id;
              obj.id_cargo = r.id_cargo;
              obj.hora_trabaja = r.hora_trabaja;
              obj.seleccionado = '';
              obj.color = '';
              obj.index = index;
              index = index + 1;
            }
          })
        })
        console.log('ver datos de horario ', this.horariosEmpleado);
        this.ObtenerDetallesPlanificacion();
        this.verDatos();
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
          }
          else if (obj.id_horario === aux_h) {
            if (obj.tipo_accion != aux_a) {
              accion = accion + ' , ' + obj.tipo_accion + ': ' + obj.hora
              codigo_horario = obj.codigo_dia
              this.ValidarAcciones(obj);
            }
          }
          else {
            // CONCATENAR VALORES ANTERIORES
            tipos = [{
              acciones: accion,
              horario: codigo_horario,
              entrada: this.entrada,
              inicio_comida: this.inicio_comida,
              fin_comida: this.fin_comida,
              salida: this.salida,
            }]
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
        }
        else {
          this.paginar = false;
        }
      }
      else {
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

  // ARREGLO DE DATOS DE HORARIOS
  nomenclatura = [
    { nombre: 'L', descripcion: 'LIBRE' },
    { nombre: 'FD', descripcion: 'FERIADO' },
    { nombre: 'REC', descripcion: 'RECUPERACIÓN' },
    { nombre: 'P', descripcion: 'PERMISO' },
    { nombre: 'V', descripcion: 'VACACION' },
    { nombre: '-', descripcion: 'SIN PLANIFICACIÓN' }
  ]


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

    let doc_name = "Tiempo_laborado.pdf";
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
        { text: 'TIEMPO LABORADO', bold: true, fontSize: 16, alignment: 'center', margin: [0, -10, 0, 5] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 15, alignment: 'center', margin: [0, 10, 0, 10] },
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0],fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2],fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableCentradoFT: { fontSize: 8, alignment: 'center',fillColor: '#EE4444' },
        itemsTableCentradoMenor: { fontSize: 8, alignment: 'center',fillColor: '#55EE44' },
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
                    { rowSpan: 1, colSpan: 2, text: 'DISPOSITIVO', style: 'tableHeader' },
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
                      servidor_fecha = this.validacionService.FormatearFecha(
                        obj3.fec_hora_timbre_servidor.split(' ')[0],
                        this.formato_fecha, 
                        this.validacionService.dia_abreviado);
                      servidor_hora = this.validacionService.FormatearHora(
                        obj3.fec_hora_timbre_servidor.split(' ')[1], 
                        this.formato_hora);
                    }

                    const fechaTimbre = this.validacionService.FormatearFecha(
                      obj3.fec_hora_timbre.split(' ')[0],
                      this.formato_fecha, 
                      this.validacionService.dia_abreviado);

                    const horaTimbre = this.validacionService.FormatearHora(
                      obj3.fec_hora_timbre.split(' ')[1], 
                      this.formato_hora);

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
                      { style: 'itemsTable', text: fechaTimbre },
                      { style: 'itemsTable', text: horaTimbre },
                      { style: 'itemsTableCentrado', text: obj3.id_reloj },
                      { style: 'itemsTableCentrado', text: accionT },
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
        });
      });
    } else {
      data.forEach((obj: any) => {

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
                        servidor_fecha = this.validacionService.FormatearFecha(
                          obj3.fec_hora_timbre_servidor.split(' ')[0],
                          this.formato_fecha, 
                          this.validacionService.dia_abreviado);
                        servidor_hora = this.validacionService.FormatearHora(
                          obj3.fec_hora_timbre_servidor.split(' ')[1], 
                          this.formato_hora);
                      }
  
                      const fechaTimbre = this.validacionService.FormatearFecha(
                        obj3.fec_hora_timbre.split(' ')[0],
                        this.formato_fecha, 
                        this.validacionService.dia_abreviado);
  
                      const horaTimbre = this.validacionService.FormatearHora(
                        obj3.fec_hora_timbre.split(' ')[1], 
                        this.formato_hora);

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
                        { style: 'itemsTable', text: fechaTimbre },
                        { style: 'itemsTable', text: horaTimbre },
                        { style: 'itemsTableCentrado', text: obj3.id_reloj },
                        { style: 'itemsTableCentrado', text: accionT },
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
          });
        });
      });
    }
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
   exportToExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Tiempo_laborado');
        xlsx.writeFile(wb_regimen_cargo, 'Tiempo_laborado.xlsx');
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Tiempo_laborado');
        xlsx.writeFile(wb, 'Tiempo_laborado.xlsx');
        break;
    }
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: any) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
             //CAMBIO DE FORMATO EN HORAS (HORARIO Y TIMBRE)
            const entradaHorario = (obj4.dia !== 'L' || obj4.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const salidaHorario = (obj4.dia !== 'L' || obj4.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj4.salida.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const inicioAlimentacionHorario = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const finAlimentacionHorario = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const entrada = obj4.entrada.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
              : (obj4.dia === 'L' || obj4.dia === 'FD' ? '' : 'FT');
            const salida = obj4.salida.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj4.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj4.dia === 'L' || obj4.dia === 'FD' ? '' : 'FT');
            const inicioAlimentacion = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
              ? (obj4.inicioAlimentacion.fec_hora_timbre != null 
                ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : 'FT') 
              : '';
            const finAlimentacion = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD') 
              ? (obj4.finAlimentacion.fec_hora_timbre != null
                ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : 'FT') 
              : '';
            const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj4);
            const minutosPlanificados = diferenciaEnMinutos[0];
            const tiempoPlanificado = this.minutosAHorasMinutosSegundos(minutosPlanificados);
            const minutosLaborados = diferenciaEnMinutos[1];
            const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
            let ele = { 
              'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
              'Departamento': obj2.name_dep,
              'Régimen': obj3.regimen[0].name_regimen,
              'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
              'Fecha': new Date(obj4.entrada.fec_hora_horario), 'Horario Entrada': entradaHorario, 'Timbre Entrada': entrada,
              'Horario Salida': salidaHorario, 'Timbre Salida': salida,
              'Horario Inicio Alimentación': inicioAlimentacionHorario, 'Timbre Inicio Alimentación': inicioAlimentacion, 
              'Horario Fin Alimentación': finAlimentacionHorario, 'Timbre Fin Alimentación': finAlimentacion, 
              'Tiempo Planificado HH:MM:SS': tiempoPlanificado, 'Tiempo Planificado Minutos': minutosPlanificados,
              'Tiempo Laborado HH:MM:SS': tiempoLaborado, 'Tiempo Laborado Minutos': minutosLaborados,
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
          const entradaHorario = (obj3.dia !== 'L' || obj3.dia !== 'FD')
            ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const salidaHorario = (obj3.dia !== 'L' || obj3.dia !== 'FD')
            ? this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const inicioAlimentacionHorario = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
            ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const finAlimentacionHorario = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
            ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
            : '';
          const entrada = obj3.entrada.fec_hora_timbre != null 
            ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
            : (obj3.dia === 'L' || obj3.dia === 'FD' ? '' : 'FT');
          const salida = obj3.salida.fec_hora_timbre != null
            ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
            : (obj3.dia === 'L' || obj3.dia === 'FD' ? '' : 'FT');
          const inicioAlimentacion = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
            ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : 'FT') 
            : '';
          const finAlimentacion = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD') 
            ? (obj3.finAlimentacion.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : 'FT') 
            : '';

          const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
          const minutosPlanificados = diferenciaEnMinutos[0];
          const tiempoPlanificado = this.minutosAHorasMinutosSegundos(minutosPlanificados);
          const minutosLaborados = diferenciaEnMinutos[1];
          const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);

          let ele = { 
            'Ciudad': obj2.ciudad, 'Sucursal': obj2.sucursal,
            'Departamento': obj2.departamento,
            'Régimen': obj2.regimen[0].name_regimen,
            'Nombre Empleado': obj2.name_empleado, 'Cédula': obj2.cedula, 'Código': obj2.codigo,
            'Fecha': new Date(obj3.entrada.fec_hora_horario), 'Horario Entrada': entradaHorario, 'Timbre Entrada': entrada,
            'Horario Salida': salidaHorario, 'Timbre Salida': salida,
            'Horario Inicio Alimentación': inicioAlimentacionHorario, 'Timbre Inicio Alimentación': inicioAlimentacion, 
            'Horario Fin Alimentación': finAlimentacionHorario, 'Timbre Fin Alimentación': finAlimentacion, 
            'Tiempo Planificado HH:MM:SS': tiempoPlanificado, 'Tiempo Planificado Minutos': minutosPlanificados,
            'Tiempo Laborado HH:MM:SS': tiempoLaborado, 'Tiempo Laborado Minutos': minutosLaborados,
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
      this.data_pdf.forEach((obj1: any) => {
        obj1.departamentos.forEach(obj2 => {
          obj2.empleado.forEach((obj3: any) => {
            obj3.timbres.forEach((obj4: any) => {
              //CAMBIO DE FORMATO EN FECHA Y HORAS (HORARIO Y TIMBRE)
              const fecha = this.validacionService.FormatearFecha(
                obj4.entrada.fec_horario,
                this.formato_fecha, 
                this.validacionService.dia_abreviado);

              const entradaHorario = (obj4.dia !== 'L' || obj4.dia !== 'FD')
                ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_horario.split(' ')[1],this.formato_hora)
                : '';
              const salidaHorario = (obj4.dia !== 'L' || obj4.dia !== 'FD')
                ? this.validacionService.FormatearHora(obj4.salida.fec_hora_horario.split(' ')[1],this.formato_hora)
                : '';
              const inicioAlimentacionHorario = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
                ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                : '';
              const finAlimentacionHorario = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
                ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
                : '';

              const entrada = obj4.entrada.fec_hora_timbre != null 
                ? this.validacionService.FormatearHora(obj4.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
                : (obj4.dia === 'L' || obj4.dia === 'FD' ? '' : 'FT');
              const salida = obj4.salida.fec_hora_timbre != null
                ? this.validacionService.FormatearHora(obj4.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : (obj4.dia === 'L' || obj4.dia === 'FD' ? '' : 'FT');
              const inicioAlimentacion = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD')
                ? (obj4.inicioAlimentacion.fec_hora_timbre != null 
                  ? this.validacionService.FormatearHora(obj4.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : 'FT') 
                : '';
              const finAlimentacion = obj4.tipo == 'EAS' && (obj4.dia !== 'L' || obj4.dia !== 'FD') 
                ? (obj4.finAlimentacion.fec_hora_timbre != null
                  ? this.validacionService.FormatearHora(obj4.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                  : 'FT') 
                : '';

              const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj4);
              const minutosPlanificados = diferenciaEnMinutos[0];
              const tiempoPlanificado = this.minutosAHorasMinutosSegundos(minutosPlanificados);
              const minutosLaborados = diferenciaEnMinutos[1];
              const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
              n = n + 1;
              const ele = { 
                n,
                ciudad: obj1.ciudad, sucursal: obj1.name_suc,
                departamento: obj2.name_dep,
                regimen: obj3.regimen[0].name_regimen,
                empleado: obj3.name_empleado, cedula: obj3.cedula, codigo: obj3.codigo,
                fecha, entradaHorario, entrada, salidaHorario, salida,
                inicioAlimentacionHorario, inicioAlimentacion, 
                finAlimentacionHorario, finAlimentacion,  
                tiempoPlanificado, minutosPlanificados,
                tiempoLaborado, minutosLaborados,
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
            const entradaHorario = (obj3.dia !== 'L' || obj3.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const salidaHorario = (obj3.dia !== 'L' || obj3.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj3.salida.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const inicioAlimentacionHorario = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const finAlimentacionHorario = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
              ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_horario.split(' ')[1],this.formato_hora)
              : '';
            const entrada = obj3.entrada.fec_hora_timbre != null 
              ? this.validacionService.FormatearHora(obj3.entrada.fec_hora_timbre.split(' ')[1],this.formato_hora)
              : (obj3.dia === 'L' || obj3.dia === 'FD' ? '' : 'FT');
            const salida = obj3.salida.fec_hora_timbre != null
              ? this.validacionService.FormatearHora(obj3.salida.fec_hora_timbre.split(' ')[1], this.formato_hora)
              : (obj3.dia === 'L' || obj3.dia === 'FD' ? '' : 'FT');
            const inicioAlimentacion = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD')
              ? (obj3.inicioAlimentacion.fec_hora_timbre != null 
                ? this.validacionService.FormatearHora(obj3.inicioAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : 'FT') 
              : '';
            const finAlimentacion = obj3.tipo == 'EAS' && (obj3.dia !== 'L' || obj3.dia !== 'FD') 
              ? (obj3.finAlimentacion.fec_hora_timbre != null
                ? this.validacionService.FormatearHora(obj3.finAlimentacion.fec_hora_timbre.split(' ')[1], this.formato_hora)
                : 'FT') 
              : '';

            const diferenciaEnMinutos = this.calcularDiferenciaFechas(obj3);
            const minutosPlanificados = diferenciaEnMinutos[0];
            const tiempoPlanificado = this.minutosAHorasMinutosSegundos(minutosPlanificados);
            const minutosLaborados = diferenciaEnMinutos[1];
            const tiempoLaborado = this.minutosAHorasMinutosSegundos(minutosLaborados);
            n = n + 1;
            const ele = { 
              n,
              ciudad: obj2.ciudad, sucursal: obj2.sucursal,
              departamento: obj2.departamento,
              regimen: obj2.regimen[0].name_regimen,
              empleado: obj2.name_empleado, cedula: obj2.cedula, codigo: obj2.codigo,
              fecha, entradaHorario, entrada, salidaHorario, salida,
              inicioAlimentacionHorario, inicioAlimentacion, 
              finAlimentacionHorario, finAlimentacion,  
              tiempoPlanificado, minutosPlanificados,
              tiempoLaborado, minutosLaborados,
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

  ManejarPaginaResultados(e: PageEvent) {
    this.tamanio_pagina_emp = e.pageSize;
    this.numero_pagina_emp = e.pageIndex + 1;
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
    // if (this.bool.bool_cargo || this.bool.bool_reg) {
    //   this.extraerTimbresRegimenCargo();
    // } else {
    //   this.extraerTimbres();
    // }
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
  }

  //METDODO PARA CAMBIAR EL COLOR DE LAS CELDAS EN LA TABLA DE PREVISUALIZACION
  obtenerClaseTiempo(planificado: any, laborado: any) {
    const tPlanificado = Number(planificado);
    const tLaborado = Number(laborado);
    if (tLaborado < tPlanificado) {
        return 'verde';
    } 
  }
  obtenerClaseTimbre(valor: any) {
    if (valor == 'FT') {
      return 'rojo';
    }
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
