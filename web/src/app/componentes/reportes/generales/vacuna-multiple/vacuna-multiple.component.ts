// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ITableEmpleados, vacuna, } from 'src/app/model/reportes.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { VacunasService } from 'src/app/servicios/reportes/vacunas/vacunas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { environment } from 'src/environments/environment';

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
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  arr_vac: any = [];
  regimen: any = [];
  cargos: any = [];
  origen: any = [];

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE PDF
  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  hipervinculo: string = environment.url;

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
    private parametro: ParametrosService,
    private restEmpre: EmpresaService, // SERVICIO DATOS GENERALES DE EMPRESA
    private R_vacuna: VacunasService, // SERVICIO DATOS PARA REPORTE DE VACUNAS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    public restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();
    this.BuscarHora();
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.origen = [];
    this.arr_vac = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE HORA
  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

// METODO DE BUSQUEDA DE DATOS GENERALES DEL EMPLEADO
  BuscarInformacionGeneral(opcion: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionGeneral(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.origen = JSON.stringify(informacion);

    informacion.forEach((obj: any) => {
      //console.log('ver obj ', obj)
      this.sucursales.push({
        id: obj.id_suc,
        sucursal: obj.name_suc
      })

      this.regimen.push({
        id: obj.id_regimen,
        nombre: obj.name_regimen,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })

      this.departamentos.push({
        id: obj.id_depa,
        departamento: obj.name_dep,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
      })

      this.cargos.push({
        id: obj.id_cargo_,
        nombre: obj.name_cargo,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })

      this.empleados.push({
        id: obj.id,
        nombre: obj.nombre,
        apellido: obj.apellido,
        codigo: obj.codigo,
        cedula: obj.cedula,
        correo: obj.correo,
        id_cargo: obj.id_cargo,
        id_contrato: obj.id_contrato,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        id_depa: obj.id_depa,
        id_cargo_: obj.id_cargo_, // TIPO DE CARGO
        ciudad: obj.ciudad,
        regimen: obj.name_regimen,
        departamento: obj.name_dep,
        cargo: obj.name_cargo,
        hora_trabaja: obj.hora_trabaja
      })
    })

    // RETIRAR DATOS DUPLICADOS
    this.OmitirDuplicados();

    console.log('ver sucursales ', this.sucursales)
    console.log('ver regimenes ', this.regimen)
    console.log('ver departamentos ', this.departamentos)
    console.log('ver cargos ', this.cargos)
    console.log('ver empleados ', this.empleados)
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicados() {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION SUCURSALES
    let verificados_suc = this.sucursales.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
            if (valor[i].id === objeto.id) {
                return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
            }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.sucursales = verificados_suc;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION REGIMEN
    let verificados_reg = this.regimen.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
            if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
                return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
            }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.regimen = verificados_reg;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = this.departamentos.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
            if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
                return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
            }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.departamentos = verificados_dep;

    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = this.cargos.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
            if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
                return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
            }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    this.cargos = verificados_car;
}


  ObtenerTipoUsuario($event: string) {
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.BuscarInformacionGeneral(this.opcionBusqueda);
  }

  // VALIDACIONES DE SELECCION DE BUSQUEDA
  ValidarReporte(action: any) {
    if (
      this.bool.bool_suc === false &&
      this.bool.bool_reg === false &&
      this.bool.bool_cargo === false &&
      this.bool.bool_dep === false &&
      this.bool.bool_emp === false
    )
      return this.toastr.error('Seleccione un criterio de búsqueda.');
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
          'Ups!!! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
  }

  // MODELAMIENTO DE DATOS DE ACUERDO A LAS SUCURSALES
  ModelarSucursal(accion: any) {
    let respuesta = JSON.parse(this.origen);
    let suc = respuesta.filter((empl: any) => {
      var bool = this.selectionSuc.selected.find(selec => {
        return empl.id_suc === selec.id
      })
      return bool != undefined;
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(suc).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.ExportarExcel();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
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
    respuesta.forEach((res: any) => {
      this.selectionReg.selected.find((selec: any) => {
        objeto = {
          regimen: {
            id: selec.id,
            nombre: selec.nombre,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_regimen && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
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
            this.ExportarExcelCargoRegimen();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
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
    let respuesta = JSON.parse(this.origen);
    let empleados: any = [];
    let car: any = [];
    let objeto: any;
    respuesta.forEach((res: any) => {
      this.selectionCar.selected.find((selec: any) => {
        objeto = {
          cargo: {
            id: selec.id,
            nombre: selec.nombre,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_cargo_ && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
            });
          });
        });
        objeto.empleados = empleados;
        car.push(objeto);
      });
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiplesCargoRegimen(car).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.ExportarExcelCargoRegimen();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
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
    let empleados: any = [];
    let dep: any = [];
    let objeto: any;
    respuesta.forEach((res: any) => {
      this.selectionDep.selected.find((selec: any) => {
        objeto = {
          depa: {
            id: selec.id,
            nombre: selec.departamento,
          },
        };
        empleados = [];
        res.regimenes.forEach((regimen: any) => {
          regimen.departamentos.forEach((departamento: any) => {
            departamento.cargos.forEach((cargo: any) => {
              cargo.empleado.forEach((empl: any) => {
                if (selec.id === empl.id_depa && selec.id_suc === empl.id_suc) {
                  empleados.push(empl);
                }
              });
            });
          });
        });
        objeto.empleados = empleados;
        dep.push(objeto);
      });
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiplesCargoRegimen(dep).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.ExportarExcelCargoRegimen();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
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
    let respuesta = JSON.parse(this.origen)
    respuesta.forEach((obj: any) => {
      obj.regimenes.forEach((regimen: any) => {
        regimen.departamentos.forEach((departamento: any) => {
          departamento.cargos.forEach((cargo: any) => {
            cargo.empleado = cargo.empleado.filter((o: any) => {
              var bool = this.selectionEmp.selected.find(selec => {
                return (selec.id === o.id && selec.id_suc === o.id_suc)
              })
              return bool != undefined
            })
          })
        });
      })
    })
    respuesta.forEach((obj: any) => {
      obj.regimenes.forEach((regimen: any) => {
        regimen.departamentos.forEach((departamento: any) => {
          departamento.cargos = departamento.cargos.filter((e: any) => {
            return e.empleado.length > 0
          })
        });
      });
    });
    let emp = respuesta.filter((obj: any) => {
      return obj.regimenes.length > 0
    });
    this.data_pdf = [];
    this.R_vacuna.ReporteVacunasMultiples(emp).subscribe(
      (res) => {
        this.data_pdf = res;
        switch (accion) {
          case 'excel':
            this.ExportarExcel();
            break;
          case 'ver':
            this.VerDatos();
            break;
          default:
            this.GenerarPDF(accion);
            break;
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

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
        this.p_color = res[0].color_principal;
        this.s_color = res[0].color_secundario;
        this.frase = res[0].marca_agua;
      });
  }

  /** ****************************************************************************************** **
   **                                              PDF                                           **
   ** ****************************************************************************************** **/

  GenerarPDF(action: any) {
    let documentDefinition: any;

    if (
      this.bool.bool_emp === true ||
      this.bool.bool_suc === true ||
      this.bool.bool_reg === true ||
      this.bool.bool_dep === true ||
      this.bool.bool_cargo === true
    ) {
      documentDefinition = this.GetDocumentDefinicion();
    }

    let doc_name = `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
          text: (
            localStorage.getItem('name_empresa') as string
          ).toLocaleUpperCase(),
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, -30, 0, 5],
        },
        {
          text: `REGISTRO DE VACUNACIÓN - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`,
          bold: true,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj) => {
          return obj;
        }),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
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

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true || this.bool.bool_dep === true) {
      data.forEach((selec: any) => {
        let arr_reg = selec.empleados.map((o: any) => { return o.vacunas.length })
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
                    text: 'CARGO: ' + selec.cargo.nombre,
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
        else if (this.bool.bool_reg === true) {
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
                    text: 'RÉGIMEN: ' + selec.regimen.nombre,
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

        else {
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*', '*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, false, true],
                    text: 'DEPARTAMENTO: ' + selec.depa.nombre,
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

        selec.empleados.forEach((empl: any) => {
          n.push({
            style: 'tableMarginCabeceraEmpleado',
            table: {
              widths: ['*', 'auto', 'auto'],
              headerRows: 2,
              body: [
                [
                  {
                    border: [false, true, false, false],
                    text: 'C.C.: ' + empl.cedula,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [true, true, false, false],
                    text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                    style: 'itemsTableInfoEmpleado',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'COD: ' + empl.codigo,
                    style: 'itemsTableInfoEmpleado',
                  },
                ],
                [
                  {
                    border: [true, false, false, false],
                    text: 'DEPARTAMENTO: ' + empl.name_dep,
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, false, false],
                    text: this.bool.bool_reg || this.bool.bool_dep ? 'CARGO: ' + empl.name_cargo : '',
                    style: 'itemsTableInfoEmpleado'
                  },
                  {
                    border: [false, false, true, false],
                    text: '',
                    style: 'itemsTableInfoEmpleado'
                  }
                ],
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
                ...empl.vacunas.map((vac: any) => {
                  const fecha = this.validacionService.FormatearFecha(
                    vac.fecha.split('T')[0],
                    this.formato_fecha,
                    this.validacionService.dia_abreviado);

                  return [
                    {
                      style: 'itemsTableCentrado',
                      text: empl.vacunas.indexOf(vac) + 1,
                    },
                    { style: 'itemsTableCentrado', text: vac.tipo_vacuna },
                    { style: 'itemsTableCentrado', text: fecha },
                    { style: 'itemsTable', text: vac.descripcion },
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
      data.forEach((suc: any) => {
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
                  text: 'CIUDAD: ' + suc.ciudad,
                  style: 'itemsTableInfo',
                },
                {
                  border: [false, true, true, true],
                  text: 'SUCURSAL: ' + suc.name_suc,
                  style: 'itemsTableInfo',
                },
              ],
            ],
          },
        });

        suc.regimenes.forEach((reg: any) => {
          reg.departamentos.forEach((dep: any) => {
            dep.cargos.forEach((car: any) => {
              car.empleado.forEach((empl: any) => {
                n.push({
                  style: 'tableMarginCabeceraEmpleado',
                  table: {
                    widths: ['*', 'auto', 'auto'],
                    headerRows: 2,
                    body: [
                      [
                        {
                          border: [false, true, false, false],
                          text: 'C.C.: ' + empl.cedula,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [true, true, false, false],
                          text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                          style: 'itemsTableInfoEmpleado'
                        },

                        {
                          border: [false, true, true, false],
                          text: 'COD: ' + empl.codigo,
                          style: 'itemsTableInfoEmpleado'
                        }
                      ],
                      [
                        {
                          border: [true, false, false, false],
                          text: 'DEPARTAMENTO: ' + empl.name_dep,
                          style: 'itemsTableInfoEmpleado'
                        },
                        {
                          border: [false, false, false, false],
                          text: 'CARGO: ' + empl.name_cargo,
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
                      ...empl.vacunas.map((vac: any) => {
                        const fecha = this.validacionService.FormatearFecha(
                          vac.fecha.split('T')[0],
                          this.formato_fecha,
                          this.validacionService.dia_abreviado);

                        return [
                          {
                            style: 'itemsTableCentrado',
                            text: empl.vacunas.indexOf(vac) + 1,
                          },
                          { style: 'itemsTableCentrado', text: vac.tipo_vacuna },
                          { style: 'itemsTableCentrado', text: fecha },
                          { style: 'itemsTable', text: vac.descripcion },
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
            })
          });
        })
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

  ValidarExcel() {
    if (this.bool.bool_cargo || this.bool.bool_reg || this.bool.bool_dep) {
      this.ExportarExcelCargoRegimen();
    } else {
      this.ExportarExcel();
    }
  }

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.EstructurarDatosExcel(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    array.forEach((suc: any) => {
      suc.regimenes.forEach((reg: any) => {
        reg.departamentos.forEach((dep: any) => {
          dep.cargos.forEach((car: any) => {
            car.empleado.forEach((empl: any) => {
              empl.vacunas.forEach((vac: vacuna) => {
                c = c + 1;
                let ele = {
                  'N°': c,
                  Cédula: empl.cedula,
                  Nombre: empl.apellido + ' ' + empl.nombre,
                  Código: empl.codigo,
                  Género: empl.genero == 1 ? 'M' : 'F',
                  Ciudad: empl.ciudad,
                  Sucursal: empl.name_suc,
                  Régimen: empl.name_regimen,
                  Departamento: empl.name_dep,
                  Cargo: empl.name_cargo,
                  Correo: empl.correo,
                  Carnet: vac.carnet?.length ? 'Si' : 'No',
                  Vacuna: vac.tipo_vacuna,
                  Fecha: new Date(vac.fecha),
                  Descripción: vac.descripcion,
                };
                nuevo.push(ele);
              });
            });
          })

        });
      })

    });
    return nuevo;
  }

  ExportarExcelCargoRegimen(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.EstructurarDatosExcelRegimenCargo(this.data_pdf)
    );
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Vacunas');
    xlsx.writeFile(wb, `Vacunas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let c = 0;
    array.forEach((selec) => {
      selec.empleados.forEach((empl: any) => {
        empl.vacunas.forEach((vac: any) => {
          c = c + 1;
          let ele = {
            'N°': c,
            Cédula: empl.cedula,
            Empleado: empl.apellido + ' ' + empl.nombre,
            Código: empl.codigo,
            Género: empl.genero == 1 ? 'M' : 'F',
            Ciudad: empl.ciudad,
            Sucursal: empl.sucursal,
            Régimen: empl.name_regimen,
            Departamento: empl.name_dep,
            Cargo: empl.name_cargo,
            Correo: empl.correo,
            Carnet: vac.carnet?.length ? 'Si' : 'No',
            Vacuna: vac.tipo_vacuna,
            Fecha: vac.fecha.split('T')[0],
            Descripción: vac.descripcion,
          };
          nuevo.push(ele);
        });
      });
    });

    return nuevo;
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/
  ExtraerDatos() {
    this.arr_vac = [];
    let n = 0;
    this.data_pdf.forEach((suc: any) => {
      suc.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((empl: any) => {
            empl.empleado.forEach((vac: any) => {
              vac.vacunas.forEach((usu: any) => {
                const fecha = this.validacionService.FormatearFecha(
                  usu.fecha.split('T')[0],
                  this.formato_fecha,
                  this.validacionService.dia_abreviado);
                n = n + 1;
                let ele = {
                  n: n,
                  id_empleado: usu.id_empleado,
                  codigo: vac.codigo,
                  empleado: vac.apellido + ' ' + vac.nombre,
                  cedula: vac.cedula,
                  genero: vac.genero,
                  ciudad: vac.ciudad,
                  sucursal: vac.name_suc,
                  regimen: vac.name_regimen,
                  departamento: vac.name_dep,
                  cargo: vac.name_cargo,
                  correo: vac.correo,
                  carnet: usu.carnet,
                  vacuna: usu.tipo_vacuna,
                  fecha,
                  descripcion: usu.descripcion,
                };
                this.arr_vac.push(ele);
              });
            });
          })
        });
      })
    });
  }

  ExtraerDatosRegimenCargo() {
    this.arr_vac = [];
    let n = 0;
    this.data_pdf.forEach((empl: any) => {
      empl.empleados.forEach((vac: any) => {
        vac.vacunas.forEach((usu: any) => {
          const fecha = this.validacionService.FormatearFecha(
            usu.fecha.split('T')[0],
            this.formato_fecha,
            this.validacionService.dia_abreviado);

          n = n + 1;
          let ele = {
            n: n,
            id_empleado: vac.id,
            codigo: vac.codigo,
            empleado: vac.apellido + ' ' + vac.nombre,
            cedula: vac.cedula,
            genero: vac.genero,
            ciudad: vac.ciudad,
            sucursal: vac.name_suc,
            regimen: vac.name_regimen,
            departamento: vac.name_dep,
            cargo: vac.name_cargo,
            correo: vac.correo,
            carnet: usu.carnet,
            vacuna: usu.tipo_vacuna,
            fecha,
            descripcion: usu.descripcion,
          };
          this.arr_vac.push(ele);
        });
      });
    });
  }

  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc()
      ? this.selectionSuc.clear()
      : this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
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
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
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
      : this.cargos.forEach((row: any) => this.selectionCar.select(row));
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
      : this.departamentos.forEach((row: any) => this.selectionDep.select(row));
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
      : this.empleados.forEach((row: any) => this.selectionEmp.select(row));
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

  // METODO DE CONTROL DE PAGINACION
  ManejarPaginaDetalle(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA INGRESAR DATOS DE LETRAS O NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  //ENVIAR DATOS A LA VENTANA DE DETALLE
  VerDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg || this.bool.bool_dep) {
      this.ExtraerDatosRegimenCargo();
    } else {
      this.ExtraerDatos();
    }
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }
}
