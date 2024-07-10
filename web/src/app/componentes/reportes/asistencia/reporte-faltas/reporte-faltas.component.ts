// IMPORTAR LIBRERIAS
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IReporteFaltas, ITableEmpleados } from 'src/app/model/reportes.model';
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
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { FaltasService } from 'src/app/servicios/reportes/faltas/faltas.service';

@Component({
  selector: 'app-reporte-faltas',
  templateUrl: './reporte-faltas.component.html',
  styleUrls: ['./reporte-faltas.component.css']
})

export class ReporteFaltasComponent implements OnInit, OnDestroy {

  // CRITERIOS DE BUSQUEDA POR FECHAS
  get rangoFechas() { return this.reporteService.rangoFechas };

  // SELECCIÓN DE BUSQUEDA DE DATOS SEGÚN OPCIÓN
  get opcion() { return this.reporteService.opcion };

  // CRITERIOS DE BUSQUEDA SEGÚN OPCIÓN SELECCIONADA
  get bool() { return this.reporteService.criteriosBusqueda };

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  data_pdf: any = [];
  regimen: any = [];
  timbres: any = [];
  cargos: any = [];
  origen: any = [];

  //VARIABLES PARA ALMACENAR TIEMPOS DE SALIDAS ANTICIPADAS
  faltasDepartamentos: any = [];
  faltasSucursales: any = [];
  faltasRegimen: any = [];
  faltasCargos: any = [];

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
    private reporteService: ReportesService,
    private informacion: DatosGeneralesService,
    private restFaltas: FaltasService,
    private parametro: ParametrosService,
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
    this.BuscarParametro();
    this.BuscarHora();
  }

  ngOnDestroy(): void {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.timbres = [];
    this.cargos = [];
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

    //console.log('empleado ', empleado)
    this.restUsuario.BuscarUsuarioSucursal(empleado).subscribe((data: any) => {
      const codigos = data.map((obj: any) => `'${obj.id_sucursal}'`).join(', ');
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
    informacion.forEach((suc: any) => {
      // LISTA SUCURSALES
      this.sucursales.push({
        id: suc.id_suc,
        sucursal: suc.name_suc,
        ciudad: suc.ciudad
      })
      // LISTA REGIMENES
      suc.regimenes.forEach((reg: any) => {
        this.regimen.push({
          id: reg.id_regimen,
          nombre: reg.name_regimen,
          sucursal: reg.name_suc,
          id_suc: suc.id_suc
        })
        // LISTA DEPARTAMENTOS
        reg.departamentos.forEach((dep: any) => {
          this.departamentos.push({
            id: dep.id_depa,
            departamento: dep.name_dep,
            sucursal: dep.name_suc,
            id_suc: suc.id_suc,
            id_regimen: dep.id_regimen,
          })
          // LISTA CARGOS
          dep.cargos.forEach((car: any) => {
            this.cargos.push({
              id: car.id_cargo_,
              nombre: car.name_cargo,
              sucursal: car.name_suc,
              id_suc: suc.id_suc
            })
            // LISTA EMPLEADOS
            car.empleado.forEach((empl: any) => {
              let elemento = {
                id: empl.id,
                nombre: empl.nombre,
                apellido: empl.apellido,
                codigo: empl.codigo,
                cedula: empl.cedula,
                correo: empl.correo,
                id_cargo: empl.id_cargo,
                id_contrato: empl.id_contrato,
                sucursal: empl.name_suc,
                id_suc: empl.id_suc,
                id_regimen: empl.id_regimen,
                id_depa: empl.id_depa,
                id_cargo_: empl.id_cargo_, // TIPO DE CARGO
                ciudad: empl.ciudad,
                regimen: empl.name_regimen,
                departamento: empl.name_dep,
                cargo: empl.name_cargo,
                hora_trabaja: empl.hora_trabaja
              }
              this.empleados.push(elemento)
            })
          })
        })
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

  // VALIDACIONES DE OPCIONES DE REPORTE
  ValidarReporte(action: any) {
    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de búsqueda.');
    if (this.bool.bool_suc === false && this.bool.bool_reg === false && this.bool.bool_cargo === false && this.bool.bool_dep === false && this.bool.bool_emp === false
      && this.bool.bool_tab === false && this.bool.bool_inc === false) return this.toastr.error('Seleccione un criterio de búsqueda.');
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione sucursal.')
        this.ModelarSucursal(action);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione régimen.')
        this.ModelarRegimen(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione departamentos.')
        this.ModelarDepartamento(action);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione cargos.')
        this.ModelarCargo(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error('No a seleccionado ninguno.', 'Seleccione empleados.')
        this.ModelarEmpleados(action);
        break;
      default:
        this.toastr.error('Ups!!! algo salio mal.', 'Seleccione criterio de búsqueda.')
        this.reporteService.DefaultFormCriterios()
        break;
    }
  }

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);
    let suc = respuesta.filter((empl: any) => {
      var bool = this.selectionSuc.selected.find(selec => {
        return empl.id_suc === selec.id
      })
      return bool != undefined;
    });
    this.data_pdf = []
    this.restFaltas.BuscarFaltas(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
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
    this.restFaltas.BuscarFaltasRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(accion: any) {
    this.tipo = 'default';
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
    this.data_pdf = []
    this.restFaltas.BuscarFaltasRegimenCargo(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.tipo = 'RegimenCargo';
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
    this.restFaltas.BuscarFaltasRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('RegimenCargo'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados(accion: any) {
    this.tipo = 'default';
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
    this.data_pdf = []
    this.restFaltas.BuscarFaltas(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'excel': this.ExportarExcel('default'); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
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
    let documentDefinition: any;

    if (this.bool.bool_emp === true || this.bool.bool_suc === true || this.bool.bool_dep === true || this.bool.bool_cargo === true || this.bool.bool_reg === true) {
      documentDefinition = this.GetDocumentDefinicion();
    };

    let doc_name = `Faltas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
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
        { text: (localStorage.getItem('name_empresa') as string).toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `FALTAS - USUARIOS ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.rangoFechas.fec_inico + " AL " + this.rangoFechas.fec_final, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 1, 0, 1] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    let totalFaltasEmpleado: number = 0;
    let totalFaltasSucursal: number = 0;
    let totalFaltasCargo = 0;
    let totalFaltasRegimen = 0;
    let totalFaltasDepartamento = 0;
    this.faltasDepartamentos = [];
    this.faltasSucursales = [];
    this.faltasRegimen = [];
    this.faltasCargos = [];

    if (this.bool.bool_cargo === true || this.bool.bool_reg === true || this.bool.bool_dep === true) {
      data.forEach((selec: any) => {
        if (this.bool.bool_cargo === true) {
          totalFaltasCargo = 0;
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
                    text: 'CARGO: ' + selec.cargo.nombre,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }
        else if (this.bool.bool_reg === true) {
          totalFaltasRegimen = 0;
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
                    text: 'RÉGIMEN: ' + selec.regimen.nombre,
                    style: 'itemsTableInfo',
                  },
                ],
              ],
            },
          });
        }
        else if (this.bool.bool_dep === true) {
          totalFaltasDepartamento = 0;
          n.push({
            style: 'tableMarginCabecera',
            table: {
              widths: ['*'],
              headerRows: 1,
              body: [
                [
                  {
                    border: [true, true, true, true],
                    text: 'DEPARTAMENTO: ' + selec.depa.nombre,
                    style: 'itemsTableInfo'
                  },
                ]
              ]
            }
          })
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
                ]
              ],
            },
          });
          c = 0;
          totalFaltasEmpleado = 0;
          n.push({
            style: 'tableMargin',
            table: {
              widths: ['*', '*'],
              headerRows: 1,
              body: [
                [
                  { text: 'N°', style: 'tableHeader' },
                  { text: 'FECHA', style: 'tableHeader' },
                ],
                ...empl.timbres.map((usu: any) => {
                  const fecha = this.validacionService.FormatearFecha(
                    usu.fec_horario,
                    this.formato_fecha,
                    this.validacionService.dia_abreviado);

                  totalFaltasDepartamento++;
                  totalFaltasEmpleado++;
                  totalFaltasRegimen++;
                  totalFaltasCargo++;
                  c = c + 1
                  return [
                    { style: 'itemsTableCentrado', text: c },
                    { style: 'itemsTableCentrado', text: fecha },
                  ];
                }),
                [
                  { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                  { style: 'itemsTableCentradoTotal', text: totalFaltasEmpleado },
                ],
              ],
            },
            layout: {
              fillColor: function (rowIndex: any) {
                return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
              }
            }
          });
        });
        if (this.bool.bool_cargo) {
          let cargo = {
            cargo: selec.cargo.nombre,
            faltas: totalFaltasCargo,
          }
          this.faltasCargos.push(cargo);
        };

        if (this.bool.bool_reg) {
          let regimen = {
            regimen: selec.regimen.nombre,
            faltas: totalFaltasRegimen,
          }
          this.faltasRegimen.push(regimen);
        };

        if (this.bool.bool_dep) {
          let departamento = {
            departamento: selec.depa.nombre,
            faltas: totalFaltasDepartamento,
          }
          this.faltasDepartamentos.push(departamento);
        };
      });

      if (this.bool.bool_cargo) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL CARGOS',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'FALTAS', style: 'itemsTableInfoTotal' },
              ],
              ...this.faltasCargos.map((cargo: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: cargo.cargo,
                    style: 'itemsTableCentrado'
                  },
                  { text: cargo.faltas, style: 'itemsTableCentrado' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

      if (this.bool.bool_reg) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL REGIMENES',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'FALTAS', style: 'itemsTableInfoTotal' },
              ],
              ...this.faltasRegimen.map((regimen: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: regimen.regimen,
                    style: 'itemsTableCentrado'
                  },
                  { text: regimen.faltas, style: 'itemsTableCentrado' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

      if (this.bool.bool_dep) {
        n.push({
          style: 'tableMarginCabeceraTotal',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: 'TOTAL DEPARTAMENTOS',
                  style: 'itemsTableInfoTotal'
                },
                { text: 'FALTAS', style: 'itemsTableInfoTotal' },
              ],
              ...this.faltasDepartamentos.map((departamento: any) => {
                return [
                  {
                    border: [true, true, false, true],
                    bold: true,
                    text: departamento.departamento,
                    style: 'itemsTableCentrado'
                  },
                  { text: departamento.faltas, style: 'itemsTableCentrado' },
                ]
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      };

    } else {
      data.forEach((suc: any) => {
        totalFaltasSucursal = 0;
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
                  style: 'itemsTableInfo'
                },
                {
                  border: [false, true, true, true],
                  text: 'SUCURSAL: ' + suc.name_suc,
                  style: 'itemsTableInfo'
                }
              ]
            ]
          }
        })

        suc.regimenes.forEach((reg: any) => {
          reg.departamentos.forEach((dep: any) => {
            dep.cargos.forEach((car: any) => {
              car.empleado.forEach((empl: any) => {
                n.push({
                  style: 'tableMarginCabeceraEmpleado',
                  table: {
                    widths: ['*', 'auto', 'auto',],
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
                    ]
                  }
                });
                c = 0;
                totalFaltasEmpleado = 0;
                n.push({
                  style: 'tableMargin',
                  table: {
                    widths: ['*', '*'],
                    headerRows: 1,
                    body: [
                      [
                        { text: 'N°', style: 'tableHeader' },
                        { text: 'FECHA', style: 'tableHeader' },
                      ],
                      ...empl.timbres.map((usu: any) => {
                        const fecha = this.validacionService.FormatearFecha(
                          usu.fec_horario,
                          this.formato_fecha,
                          this.validacionService.dia_abreviado);

                        totalFaltasEmpleado++;
                        totalFaltasSucursal++;
                        c = c + 1
                        return [
                          { style: 'itemsTableCentrado', text: c },
                          { style: 'itemsTableCentrado', text: fecha },
                        ];
                      }),
                      [
                        { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                        { style: 'itemsTableCentradoTotal', text: totalFaltasEmpleado },
                      ],
                    ],
                  },
                  layout: {
                    fillColor: function (rowIndex: any) {
                      return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                    }
                  }
                });
              });
            });
          })
        })
        if (this.bool.bool_suc) {
          let sucursal = {
            sucursal: suc.name_suc,
            faltas: totalFaltasSucursal,
          }
          this.faltasSucursales.push(sucursal);
        };
      });
    }

    if (this.bool.bool_suc) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: 'TOTAL SUCURSALES',
                style: 'itemsTableInfoTotal'
              },
              { text: 'FALTAS', style: 'itemsTableInfoTotal' },
            ],
            ...this.faltasSucursales.map((sucursal: any) => {
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: sucursal.sucursal,
                  style: 'itemsTableCentrado'
                },
                { text: sucursal.faltas, style: 'itemsTableCentrado' },
              ]
            })
          ]
        },
        layout: {
          fillColor: function (rowIndex: any) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    };
    return n;
  }

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(tipo: string): void {
    switch (tipo) {
      case 'RegimenCargo':
        const wsr_regimen_cargo: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcelRegimenCargo(this.data_pdf));
        const wb_regimen_cargo: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb_regimen_cargo, wsr_regimen_cargo, 'Faltas');
        xlsx.writeFile(wb_regimen_cargo, `Faltas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
      default:
        const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.data_pdf));
        const wb: xlsx.WorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, wsr, 'Faltas');
        xlsx.writeFile(wb, `Faltas_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.xlsx`);
        break;
    }
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    array.forEach((suc: any) => {
      suc.regimenes.forEach((reg: any) => {
        reg.departamentos.forEach((dep: any) => {
          dep.cargos.forEach((car: any) => {
            car.empleado.forEach((empl: any) => {
              empl.timbres.forEach((usu: any) => {
                n++;
                const fecha = this.validacionService.FormatearFecha(
                  usu.fec_horario,
                  this.formato_fecha,
                  this.validacionService.dia_abreviado);
                let ele = {
                  'N°': n,
                  'Cédula': empl.cedula,
                  'Nombre Empleado': empl.apellido + ' ' + empl.nombre,
                  'Código': empl.codigo,
                  'Ciudad': empl.ciudad,
                  'Sucursal': empl.name_suc,
                  'Régimen': empl.name_regimen,
                  'Departamento': empl.name_dep,
                  'Cargo': empl.name_cargo,
                  'Fecha': fecha,
                }
                nuevo.push(ele);
              })
            })
          })
        })
      })
    })
    return nuevo;
  }

  EstructurarDatosExcelRegimenCargo(array: Array<any>) {
    let nuevo: Array<any> = [];
    let n = 0;
    console.log(array);
    array.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.timbres.forEach((obj3: any) => {
          n++;
          const fecha = this.validacionService.FormatearFecha(
            obj3.fec_horario,
            this.formato_fecha,
            this.validacionService.dia_abreviado);
          let ele = {
            'N°': n,
            'Cédula': empl.cedula,
            'Nombre Empleado': empl.apellido + ' ' + empl.nombre,
            'Código': empl.codigo,
            'Sucursal': empl.sucursal,
            'Ciudad': empl.ciudad,
            'Régimen': empl.name_regimen,
            'Departamento': empl.name_dep,
            'Cargo': empl.name_cargo,
            'Fecha': fecha,
          }
          nuevo.push(ele);
        })
      })
    })
    return nuevo;
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerTimbres() {
    this.timbres = [];
    let n = 0;
    console.log(this.data_pdf)
    this.data_pdf.forEach((suc: any) => {
      suc.regimes.forEach((reg: any) => {
        reg.departamentos.forEach((dep: any) => {
          dep.cargos.forEach((car: any) => {
            car.empleado.forEach((empl: any) => {
              empl.timbres.forEach((usu: any) => {
                const fecha = this.validacionService.FormatearFecha(
                  usu.fec_horario,
                  this.formato_fecha,
                  this.validacionService.dia_abreviado);
                n = n + 1;
                let ele = {
                  n: n,
                  ciudad: empl.ciudad,
                  sucursal: empl.name_suc,
                  departamento: empl.name_dep,
                  cargo: empl.name_cargo,
                  cedula: empl.cedula,
                  empleado: empl.apellido + ' ' + empl.nombre,
                  codigo: empl.codigo,
                  fecha
                }
                this.timbres.push(ele);
              })
            })
          })
        })
      })
    })
  }

  ExtraerTimbresRegimenCargo() {
    this.timbres = [];
    let n = 0;
    this.data_pdf.forEach((suc: any) => {
      suc.empleados.forEach((empl: any) => {
        empl.timbres.forEach((usu: any) => {
          const fecha = this.validacionService.FormatearFecha(
            usu.fec_horario,
            this.formato_fecha,
            this.validacionService.dia_abreviado);
          n = n + 1;
          let ele = {
            n: n,
            ciudad: empl.ciudad,
            sucursal: empl.sucursal,
            departamento: empl.name_dep,
            cargo: empl.name_cargo,
            cedula: empl.cedula,
            empleado: empl.apellido + ' ' + empl.nombre,
            codigo: empl.codigo,
            fecha
          }
          this.timbres.push(ele);
        })
      })
    })
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

  IngresarSoloLetras(e: any) {
    return this.validacionService.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt: any) {
    return this.validacionService.IngresarSoloNumeros(evt)
  }

  // MOSTRAR DETALLES
  VerDatos() {
    this.verDetalle = true;
    if (this.bool.bool_cargo || this.bool.bool_reg || this.bool.bool_dep) {
      console.log('ingresa ',)
      this.ExtraerTimbresRegimenCargo();
    } else {
      this.ExtraerTimbres();
    }
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }
}
