// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

import { ITableEmpleados } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-reporte-empleados',
  templateUrl: './reporte-empleados.component.html',
  styleUrls: ['./reporte-empleados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class ReporteEmpleadosComponent implements OnInit, OnDestroy {

  // METODO QUE INDICA OPCIONES DE BUSQUEDA SELECCIONADOS
  get bool() {
    return this.reporteService.criteriosBusqueda;
  }

  // VARIABLE QUE INDICA NUMERO DE OPCIONES DE BUSQUEDA
  get opcion() {
    return this.reporteService.opcion;
  }

  // VARIABLES DE ALMACENAMIENTO DE RESULTADOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  regimen: any = [];
  origen: any = [];
  cargos: any = [];
  arr_emp: any = [];

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE PDF
  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

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
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
    public restUsuario: UsuarioService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.PresentarInformacion(this.opcionBusqueda);
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];;
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.origen = [];
    this.arr_emp = [];
  }

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  PresentarInformacion(opcion: any) {
    let informacion = { id_empleado: this.idEmpleadoLogueado };
    let respuesta: any = [];
    this.informacion.ObtenerInformacionUserRol(informacion).subscribe(res => {
      respuesta = res[0];
      this.AdministrarInformacion(opcion, respuesta, informacion);
    }, vacio => {
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA BUSCAR SUCURSALES QUE ADMINSITRA EL USUARIO
  usua_sucursales: any = [];
  AdministrarInformacion(opcion: any, usuario: any, empleado: any) {
    // LIMPIAR DATOS DE ALMACENAMIENTO
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.cargos = [];
    this.origen = [];

    this.usua_sucursales = [];
    let respuesta: any = [];
    let codigos = '';
    //console.log('empleado ', empleado)
    this.restUsuario.BuscarUsuarioSucursal(empleado).subscribe(data => {
      respuesta = data;
      respuesta.forEach((obj: any) => {
        if (codigos === '') {
          codigos = '\'' + obj.id_sucursal + '\''
        }
        else {
          codigos = codigos + ', \'' + obj.id_sucursal + '\''
        }
      })
      //console.log('ver sucursales ', codigos);

      // VERIFICACION DE BUSQUEDA DE INFORMACION SEGUN PRIVILEGIOS DE USUARIO
      if (usuario.id_rol === 1 && usuario.jefe === false) {
        this.usua_sucursales = { id_sucursal: codigos };
        this.BuscarInformacionAdministrador(opcion, this.usua_sucursales);
      }
      else if (usuario.id_rol === 1 && usuario.jefe === true) {
        this.usua_sucursales = { id_sucursal: codigos, id_departamento: usuario.id_departamento };
        this.BuscarInformacionJefe(opcion, this.usua_sucursales);
      }
      else if (usuario.id_rol === 3) {
        this.BuscarInformacionSuperAdministrador(opcion);
      }
    });
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL SUPERADMINISTRADOR
  BuscarInformacionSuperAdministrador(opcion: any) {
    this.informacion.ObtenerInformacion_SUPERADMIN(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR
  BuscarInformacionAdministrador(opcion: any, buscar: string) {
    this.informacion.ObtenerInformacion_ADMIN(opcion, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO DE BUSQUEDA DE DATOS QUE VISUALIZA EL ADMINISTRADOR - JEFE
  BuscarInformacionJefe(opcion: any, buscar: string) {
    this.informacion.ObtenerInformacion_JEFE(opcion, buscar).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.origen = JSON.stringify(informacion);
    informacion.forEach((obj: any) => {
      this.sucursales.push({
        id: obj.id_suc,
        sucursal: obj.name_suc,
        ciudad: obj.ciudad
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((obj: any) => {
        this.regimen.push({
          id: obj.id_regimen,
          nombre: obj.name_regimen,
          sucursal: obj.name_suc,
          id_suc: reg.id_suc
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((obj: any) => {
          this.departamentos.push({
            id: obj.id_depa,
            departamento: obj.name_dep,
            sucursal: obj.name_suc,
            id_suc: reg.id_suc,
            id_regimen: obj.id_regimen,
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((obj: any) => {
            this.cargos.push({
              id: obj.id_cargo_,
              nombre: obj.name_cargo,
              sucursal: obj.name_suc,
              id_suc: reg.id_suc
            })
          })
        })
      })
    })

    informacion.forEach((reg: any) => {
      reg.regimenes.forEach((dep: any) => {
        dep.departamentos.forEach((car: any) => {
          car.cargos.forEach((empl: any) => {
            empl.empleado.forEach((obj: any) => {
              let elemento = {
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
              }
              this.empleados.push(elemento)
            })
          })
        })
      })
    })

    this.OmitirDuplicados();

    console.log('ver sucursales ', this.sucursales)
    console.log('ver regimenes ', this.regimen)
    console.log('ver departamentos ', this.departamentos)
    console.log('ver cargos ', this.cargos)
    console.log('ver empleados ', this.empleados)
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicados() {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = this.departamentos.filter((objeto, indice, valor) => {
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
    let verificados_car = this.cargos.filter((objeto, indice, valor) => {
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
    this.PresentarInformacion(this.opcionBusqueda);
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
          'Ups !!! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }
  }

  // TRATAMIENTO DE DATOS DE SUCURSALES
  ModelarSucursal(accion: any) {
    let respuesta = JSON.parse(this.origen);
    let suc = respuesta.filter((empl: any) => {
      var bool = this.selectionSuc.selected.find(selec => {
        return empl.id_suc === selec.id
      })
      return bool != undefined
    })
    this.data_pdf = [];
    this.data_pdf = suc;
    switch (accion) {
      case 'excel': this.ExportarExcel(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(accion); break;
    }
  }

  // TRAMIENTO DE DATOS POR REGIMEN
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
    this.data_pdf = reg;
    switch (accion) {
      case 'excel': this.ExportarExcelCargoRegimen(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(accion); break;
    }
  }

  // TRATAMIENTO DE DATOS POR CARGO
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
    this.data_pdf = car;
    console.log('ver cargo ', this.data_pdf)
    switch (accion) {
      case 'excel': this.ExportarExcelCargoRegimen(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(accion); break;
    }
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
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
    this.data_pdf = dep;
    switch (accion) {
      case 'excel': this.ExportarExcelCargoRegimen(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(accion); break;
    }
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
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
    this.data_pdf = emp;
    switch (accion) {
      case 'excel': this.ExportarExcel(); break;
      case 'ver': this.VerDatos(); break;
      default: this.GenerarPDF(accion); break;
    }
  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

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
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  /** ****************************************************************************************** **
   **                                              PDF                                           **
   ** ****************************************************************************************** **/

  GenerarPDF(action: any) {
    const documentDefinition = this.GetDocumentDefinicion();
    let doc_name = `Usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
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
        { text: `USUARIOS - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0], },
        ...this.EstructurarDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
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

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true || this.bool.bool_dep) {
      data.forEach((selec: any) => {
        arr_emp = [];
        if (this.bool.bool_cargo === true) {
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
                    text: 'CARGO: ' + selec.cargo.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° Registros: ' + selec.empleados.length,
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
                    border: [true, true, false, false],
                    bold: true,
                    text: 'RÉGIMEN: ' + selec.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° Registros: ' + selec.empleados.length,
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
                    border: [true, true, false, false],
                    text: 'DEPARTAMENTO: ' + selec.depa.nombre,
                    style: 'itemsTableInfo',
                  },
                  {
                    border: [false, true, true, false],
                    text: 'N° REGISTROS: ' + selec.empleados.length,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }

        selec.empleados.forEach((empl: any) => {
          arr_emp.push(empl)
        });

        arr_emp.sort(function (a: any, b: any) {
          return ((a.apellido + a.nombre).toLowerCase().localeCompare((b.apellido + b.nombre).toLowerCase()))
        });

        if (this.bool.bool_cargo) {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'SUCURSAL', style: 'tableHeader' },
                  { text: 'RÉGIMEN', style: 'tableHeader' },
                  { text: 'DEPARTAMENTO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((usu: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(usu) + 1 },
                    { style: 'itemsTable', text: usu.cedula },
                    { style: 'itemsTable', text: usu.apellido + ' ' + usu.nombre },
                    { style: 'itemsTableCentrado', text: usu.codigo },
                    { style: 'itemsTableCentrado', text: usu.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: usu.ciudad },
                    { style: 'itemsTable', text: usu.name_suc },
                    { style: 'itemsTable', text: usu.name_regimen },
                    { style: 'itemsTable', text: usu.name_dep },
                    { style: 'itemsTable', text: usu.correo },
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
        else if (this.bool.bool_reg) {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'SUCURSAL', style: 'tableHeader' },
                  { text: 'DEPARTAMENTO', style: 'tableHeader' },
                  { text: 'CARGO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((usu: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(usu) + 1 },
                    { style: 'itemsTable', text: usu.cedula },
                    { style: 'itemsTable', text: usu.apellido + ' ' + usu.nombre },
                    { style: 'itemsTableCentrado', text: usu.codigo },
                    { style: 'itemsTableCentrado', text: usu.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: usu.ciudad },
                    { style: 'itemsTable', text: usu.name_suc },
                    { style: 'itemsTable', text: usu.name_dep },
                    { style: 'itemsTable', text: usu.name_cargo },
                    { style: 'itemsTable', text: usu.correo },
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
        else {
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'CÉDULA', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'CÓDIGO', style: 'tableHeader' },
                  { text: 'GÉNERO', style: 'tableHeader' },
                  { text: 'CIUDAD', style: 'tableHeader' },
                  { text: 'SUCURSAL', style: 'tableHeader' },
                  { text: 'RÉGIMEN', style: 'tableHeader' },
                  { text: 'CARGO', style: 'tableHeader' },
                  { text: 'CORREO', style: 'tableHeader' }
                ],
                ...arr_emp.map((usu: any) => {
                  return [
                    { style: 'itemsTableCentrado', text: arr_emp.indexOf(usu) + 1 },
                    { style: 'itemsTable', text: usu.cedula },
                    { style: 'itemsTable', text: usu.apellido + ' ' + usu.nombre },
                    { style: 'itemsTableCentrado', text: usu.codigo },
                    { style: 'itemsTableCentrado', text: usu.genero == 1 ? 'M' : 'F' },
                    { style: 'itemsTable', text: usu.ciudad },
                    { style: 'itemsTable', text: usu.name_suc },
                    { style: 'itemsTable', text: usu.name_regimen },
                    { style: 'itemsTable', text: usu.name_cargo },
                    { style: 'itemsTable', text: usu.correo },
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
      // PRESENTACION SUCURSALES
      data.forEach((selec: any) => {
        let arr_suc: any = 0;
        selec.regimenes.map(regimen => {
          regimen.departamentos.map(departamento => {
            departamento.cargos.map(cargo => {
              arr_suc = arr_suc + cargo.empleado.length;
              return arr_suc;
            })
          })
        })
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
                  text: 'CIUDAD: ' + selec.ciudad,
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, false, false],
                  text: 'SUCURSAL: ' + selec.name_suc,
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, true, false],
                  text: 'N° Registros: ' + arr_suc,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        });

        selec.regimenes.forEach((regimen) => {
          regimen.departamentos.forEach((departamento) => {
            departamento.cargos.forEach((empl) => {
              empl.empleado.forEach(e => {
                arr_emp.push(e)
              });
            });
          });
        });
        arr_emp.sort(function (a: any, b: any) {
          return ((a.apellido + a.nombre).toLowerCase().localeCompare((b.apellido + b.nombre).toLowerCase()))
        });

        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'CÉDULA', style: 'tableHeader' },
                { text: 'EMPLEADO', style: 'tableHeader' },
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'GÉNERO', style: 'tableHeader' },
                { text: 'CIUDAD', style: 'tableHeader' },
                { text: 'RÉGIMEN', style: 'tableHeader' },
                { text: 'DEPARTAMENTO', style: 'tableHeader' },
                { text: 'CARGO', style: 'tableHeader' },
                { text: 'CORREO', style: 'tableHeader' }
              ],
              ...arr_emp.map((usu: any) => {
                return [
                  { style: 'itemsTableCentrado', text: arr_emp.indexOf(usu) + 1 },
                  { style: 'itemsTable', text: usu.cedula },
                  { style: 'itemsTable', text: usu.apellido + ' ' + usu.nombre },
                  { style: 'itemsTableCentrado', text: usu.codigo },
                  { style: 'itemsTableCentrado', text: usu.genero == 1 ? 'M' : 'F' },
                  { style: 'itemsTable', text: usu.ciudad },
                  { style: 'itemsTable', text: usu.name_regimen },
                  { style: 'itemsTable', text: usu.name_dep },
                  { style: 'itemsTable', text: usu.name_cargo },
                  { style: 'itemsTable', text: usu.correo },
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
      });
    }
    return n;
  }


  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ValidarExcel() {
    console.log('ingresa aqui 6633333')
    console.log('ver validador *****', this.bool.bool_dep)
    if (this.bool.bool_cargo || this.bool.bool_reg || this.bool.bool_dep) {
      this.ExportarExcelCargoRegimen();
    } else {
      this.ExportarExcel();
    }
  }

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Usuarios');
    xlsx.writeFile(wb, `Usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    console.log('entra en normal')
    let nuevo: Array<any> = [];
    let usuarios: any[] = [];
    let c = 0;
    array.forEach((suc: any) => {
      suc.regimenes.forEach(depa => {
        depa.departamentos.forEach((car: any) => {
          car.cargos.forEach((empl: any) => {
            empl.empleado.forEach((usu: any) => {
              let ele = {
                'Cédula': usu.cedula,
                'Apellido': usu.apellido,
                'Nombre': usu.nombre,
                'Código': usu.codigo,
                'Género': usu.genero == 1 ? 'M' : 'F',
                'Ciudad': usu.ciudad,
                'Sucursal': usu.name_suc,
                'Régimen': usu.name_regimen,
                'Departamento': usu.name_dep,
                'Cargo': usu.name_cargo,
                'Correo': usu.correo,
              }
              nuevo.push(ele);
            })
          })
        })
      })
    });
    nuevo.sort(function (a: any, b: any) {
      return ((a.Apellido + a.Nombre).toLowerCase().localeCompare((b.Apellido + b.Nombre).toLowerCase()))
    });
    nuevo.forEach((u: any) => {
      c = c + 1;
      const usuarioNuevo = Object.assign({ 'N°': c }, u);
      usuarios.push(usuarioNuevo);
    });

    return usuarios;
  }

  ExportarExcelCargoRegimen(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcelRegimenCargo(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Usuarios');
    xlsx.writeFile(wb, `Usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xls`);
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    console.log('entra en reg')
    let nuevo: Array<any> = [];
    let usuarios: any[] = [];
    let c = 0;
    array.forEach((empl) => {
      empl.empleados.forEach((usu: any) => {
        let ele = {
          'Cédula': usu.cedula,
          'Apellido': usu.apellido,
          'Nombre': usu.nombre,
          'Código': usu.codigo,
          'Género': usu.genero == 1 ? 'M' : 'F',
          'Ciudad': usu.ciudad,
          'Sucursal': usu.name_suc,
          'Régimen': usu.name_regimen,
          'Departamento': usu.name_dep,
          'Cargo': usu.name_cargo,
          'Correo': usu.correo,
        }
        nuevo.push(ele)
      })
    });
    nuevo.sort(function (a: any, b: any) {
      return ((a.Apellido + a.Nombre).toLowerCase().localeCompare((b.Apellido + b.Nombre).toLowerCase()))
    });
    nuevo.forEach((u: any) => {
      c = c + 1;
      const usuarioNuevo = Object.assign({ 'N°': c }, u);
      usuarios.push(usuarioNuevo);
    });

    return usuarios;
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerDatos() {
    this.arr_emp = [];
    let n = 0;
    this.data_pdf.forEach((sucursal: any) => {
      sucursal.regimenes.forEach((regimen: any) => {
        regimen.departamentos.forEach((departamento: any) => {
          departamento.cargos.forEach((cargo: any) => {
            cargo.empleado.forEach((empl: any) => {
              this.arr_emp.push(empl);
            });
          });
        });
      });
    });
    this.arr_emp.sort(function (a: any, b: any) {
      return ((a.apellido + a.nombre).toLowerCase().localeCompare((b.apellido + b.nombre).toLowerCase()))
    });
    this.arr_emp.forEach((u: any) => {
      n = n + 1;
      u['n'] = n;
    });
  }

  ExtraerDatosRegimenCargoDepa() {
    this.arr_emp = [];
    let n = 0;
    this.data_pdf.forEach((selec: any) => {
      selec.empleados.forEach(e => {
        this.arr_emp.push(e);
      })
    });
    this.arr_emp.sort(function (a: any, b: any) {
      return ((a.apellido + a.nombre).toLowerCase().localeCompare((b.apellido + b.nombre).toLowerCase()))
    });
    this.arr_emp.forEach((u: any) => {
      n = n + 1;
      u['n'] = n;
    });
  }

  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
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
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar() ?
      this.selectionCar.clear() :
      this.cargos.forEach((row: any) => this.selectionCar.select(row));
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
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
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
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO DE CONTROL DE PAGINACION
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
  ManejarPaginaDet(e: PageEvent) {
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
      this.ExtraerDatosRegimenCargoDepa();
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
