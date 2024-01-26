// IMPORTAR LIBRERIAS
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR MODELOS
import { ITableEmpleados, IReporteTimbres, TimbreMrl } from 'src/app/model/reportes.model';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { MrlService } from 'src/app/servicios/reportes/mrl/mrl.service';


@Component({
  selector: 'app-timbre-mrl',
  templateUrl: './timbre-mrl.component.html',
  styleUrls: ['./timbre-mrl.component.css']
})
export class TimbreMrlComponent implements OnInit, OnDestroy {

  get rangoFechas() { return this.reporteService.rangoFechas };

  get opcion() { return this.reporteService.opcion };

  get bool() { return this.reporteService.criteriosBusqueda };


  // VARIABLES DE ALMACENAMIENTO DE DATOS
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  respuesta: any = [];
  regimen: any = [];
  timbres: TimbreMrl[] = [];
  cargos: any = [];
  origen: any = [];

  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  tipo: string;
  verDetalle: boolean = false;

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  // FORMATO DE FECHA Y HORA
  formato_fecha: string = 'YYYY/MM/DD';
  formato_hora: string = 'HH:mm:ss';

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
    private informacion: DatosGeneralesService,
    private reporteService: ReportesService,
    private restEmpre: EmpresaService,
    private mrlService: MrlService,
    private toastr: ToastrService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario==='activo'? 1 : 2;
    this.BuscarInformacion(this.opcionBusqueda);
    this.BuscarCargos(this.opcionBusqueda);
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

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE DATOS
  BuscarInformacion(opcion: number) {
    this.departamentos = [];
    this.sucursales = [];
    this.respuesta = [];
    this.empleados = [];
    this.regimen = [];
    this.origen = [];
    this.informacion.ObtenerInformacion(opcion).subscribe(
      (res: any[]) => {
        this.origen = JSON.stringify(res);
        res.forEach((obj: any) => {
          this.sucursales.push({
            id: obj.id_suc,
            nombre: obj.name_suc,
          });
        });

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            this.departamentos.push({
              id: departamento.id_depa,
              departamento: departamento.name_dep,
              nombre: departamento.sucursal,
            });
          });
        });

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            departamento.empleado.forEach((r: any) => {
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

        res.forEach((obj: any) => {
          obj.departamentos.forEach((departamento: any) => {
            departamento.empleado.forEach((reg: any) => {
              reg.regimen.forEach((r: any) => {
                this.regimen.push({
                  id: r.id_regimen,
                  nombre: r.name_regimen,
                });
              });
            });
          });
        });

        this.regimen = this.regimen.filter(
          (obj: any, index: any, self: any) => index === self.findIndex((o: any) => o.id === obj.id)
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
  BuscarCargos(opcion: number) {
    this.empleados_cargos = [];
    this.origen_cargo = [];
    this.cargos = [];
    this.informacion.ObtenerInformacionCargo(opcion).subscribe(
      (res: any[]) => {
        this.origen_cargo = JSON.stringify(res);

        res.forEach((obj: any) => {
          this.cargos.push({
            id: obj.id_cargo,
            nombre: obj.name_cargo,
          });
        });

        res.forEach((obj: any) => {
          obj.empleados.forEach((r: any) => {
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

  ObtenerTipoUsuario($event: string){
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario==='activo'? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.BuscarInformacion(this.opcionBusqueda);
    this.BuscarCargos(this.opcionBusqueda);
  }

  // VALIDACIONES DE OPCIONES DE REPORTE
  ValidarReporte(action: any) {
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

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)

    let suc = respuesta.filter((o: any) => {
      var bool = this.selectionSuc.selected.find(obj1 => {
        return obj1.id === o.id_suc
      });
      return bool != undefined
    });

    this.data_pdf = [];
    this.mrlService.ReporteTimbresMrl(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'ver': this.ObtenerDatos(true); break;
        case 'download': this.ObtenerDatos(false); break;
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
      this.selectionReg.selected.find((regimen: any) => {
        objeto = {
          regimen: {
            id: regimen.id,
            nombre: regimen.nombre,
          },
        };
        empleados = [];
        obj.departamentos.forEach((departamento: any) => {
          departamento.empleado.forEach((empleado: any) => {
            empleado.regimen.forEach((r: any) => {
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
    this.mrlService.ReporteTimbresMrlRegimenCargo(reg, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res
      switch (accion) {
        case 'ver': this.ObtenerDatos(true); break;
        case 'download': this.ObtenerDatos(false); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen);

    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((o: any) => {
        var bool = this.selectionDep.selected.find(obj1 => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter((obj: any) => {
      return obj.departamentos.length > 0
    });
    this.data_pdf = [];
    this.mrlService.ReporteTimbresMrl(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'ver': this.ObtenerDatos(true); break;
        case 'download': this.ObtenerDatos(false); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(accion: any) {
    this.tipo = 'RegimenCargo';
    let respuesta = JSON.parse(this.origen_cargo);
    let car = respuesta.filter((o: any) => {
      var bool = this.selectionCar.selected.find((obj1) => {
        return obj1.id === o.id_cargo;
      });
      return bool != undefined;
    });

    this.data_pdf = [];
    this.mrlService.ReporteTimbresMrlRegimenCargo(car, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'ver': this.ObtenerDatos(true); break;
        case 'download': this.ObtenerDatos(false); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados(accion: any) {
    this.tipo = 'default';
    let respuesta = JSON.parse(this.origen)
    console.log('empleados', this.selectionEmp);
    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((departamento:any) => {
        departamento.empleado = departamento.empleado.filter((o: any) => {
          var bool = this.selectionEmp.selected.find(obj1 => {
            return obj1.id === o.id
          })
          return bool != undefined
        })
      });
    })
    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((e: any) => {
        return e.empleado.length > 0
      })
    });

    let emp = respuesta.filter((obj: any) => {
      return obj.departamentos.length > 0
    });

    this.data_pdf = [];
    this.mrlService.ReporteTimbresMrl(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      this.data_pdf = res;
      switch (accion) {
        case 'ver': this.ObtenerDatos(true); break;
        case 'download': this.ObtenerDatos(false); break;
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER TIMBRES PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerTimbres() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: IReporteTimbres) => {
      obj1.departamentos.forEach(obj2 => {
        obj2.empleado.forEach((obj3: any) => {
          obj3.timbres.forEach((obj4: any) => {
            n = n + 1;
            const  servidor_fecha = this.validacionService.FormatearFecha(
                obj4.fec_hora_timbre_servidor.split(' ')[0],
                this.formato_fecha,
                'no');
            const servidor_hora = this.validacionService.FormatearHora(
                obj4.fec_hora_timbre_servidor.split(' ')[1],
                this.formato_hora);

            switch (obj4.accion) {
              case 'EoS': accionT = '1'; break;
              case 'AES': accionT = '2'; break;
              case 'PES': accionT = '3'; break;
              case 'E': accionT = '1'; break;
              case 'S': accionT = '1'; break;
              case 'I/A': accionT = '2'; break;
              case 'F/A': accionT = '2'; break;
              case 'I/P': accionT = '3'; break;
              case 'F/P': accionT = '3'; break;
              default: accionT = '9'; break;
            }
              let ele = {
                cedula: obj3.cedula,
                fecha_hora: `${servidor_fecha} ${servidor_hora}`,
                accion: accionT,
              }

            this.timbres.push(ele);
          })
        })
      })
    });
    if (!this.verDetalle) {
      this.ExportarTimbres();
    }
  }

  ExtraerTimbresRegimenCargo() {
    this.timbres = [];
    let n = 0;
    let accionT = '';
    this.data_pdf.forEach((obj1: any) => {
      obj1.empleados.forEach((obj2: any) => {
        obj2.timbres.forEach((obj3: any) => {
          n = n + 1;
          const servidor_fecha = this.validacionService.FormatearFecha(
              obj3.fec_hora_timbre_servidor.split(' ')[0],
              this.formato_fecha,
              this.validacionService.dia_abreviado);
          const servidor_hora = this.validacionService.FormatearHora(
              obj3.fec_hora_timbre_servidor.split(' ')[1],
              this.formato_hora);

          switch (obj3.accion) {
            case 'EoS': accionT = '1'; break;
            case 'AES': accionT = '2'; break;
            case 'PES': accionT = '3'; break;
            case 'E': accionT = '1'; break;
            case 'S': accionT = '1'; break;
            case 'I/A': accionT = '2'; break;
            case 'F/A': accionT = '2'; break;
            case 'I/P': accionT = '3'; break;
            case 'F/P': accionT = '3'; break;
            default: accionT = '9'; break;
          }
          let ele = {
            cedula: obj2.cedula,
            accion: accionT,
            fecha_hora: `${servidor_fecha} ${servidor_hora}`,
          }
          this.timbres.push(ele);
        })
      })
    });
    if (!this.verDetalle) {
      this.ExportarTimbres();
    }
  }

  /** ****************************************************************************************** **
   **                                              TXT                                           **
   ** ****************************************************************************************** **/

   // EXPORTAR TIMBRES A TXT
   ExportarTimbres() {
    const txt = this.timbres.map((timbre: TimbreMrl) => {
      return [
        timbre.cedula,
        timbre.accion,
        timbre.fecha_hora,
      ].join(";");
    }).join("\n");

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Timbres_mrl_usuarios_${this.opcionBusqueda==1 ? 'activos': 'inactivos'}.txt`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  // OBTENER DATOS
  ObtenerDatos(ver: boolean) {
    this.verDetalle = ver;
    if (this.bool.bool_cargo || this.bool.bool_reg) {
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
