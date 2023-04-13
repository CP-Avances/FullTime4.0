// IMPORTAR LIBRERIAS
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

// SERVICIOS FILTROS DE BUSQUEDA
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { LoginService } from 'src/app/servicios/login/login.service';

// IMPORTAR COMPONENTES
import { FraseSeguridadComponent } from '../../administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { CrearTimbreComponent } from '../crear-timbre/crear-timbre.component';
import { SeguridadComponent } from 'src/app/componentes/administracionGeneral/frase-seguridad/seguridad/seguridad.component';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-timbre-multiple',
  templateUrl: './timbre-multiple.component.html',
  styleUrls: ['./timbre-multiple.component.css']
})

export class TimbreMultipleComponent implements OnInit {

  buscador !: FormGroup;

  idEmpleadoLogueado: any;

  // CONTROL DE CRITERIOS DE BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);

  // FILTROS DE BUESQUEDA
  filtroNombreSuc_: string = '';
  filtroNombreDep_: string = '';
  filtroCodigo_: number;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';

  habilitado: any;

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];

  // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  origen: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;

  get filtroNombreSuc() { return this.restR.filtroNombreSuc }
  get filtroNombreDep() { return this.restR.filtroNombreDep }
  get filtroNombreEmp() { return this.restR.filtroNombreEmp };
  get filtroCodigo() { return this.restR.filtroCodigo };
  get filtroCedula() { return this.restR.filtroCedula };

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  constructor(
    public loginService: LoginService,
    public informacion: DatosGeneralesService,
    private restTimbres: TimbresService,
    private restEmpresa: EmpresaService,
    private restUsuario: UsuarioService,
    private validar: ValidacionesService,
    private ventana: MatDialog,
    private toastr: ToastrService,
    private router: Router,
    private restR: ReportesService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.check = this.restR.checkOptions(3);
    this.BuscarInformacion();
  }

  ngOnDestroy() {
    this.restR.GuardarCheckOpcion(0);
    this.restR.DefaultFormCriterios();
    this.restR.DefaultValoresFiltros();
    this.origen = [];
  }

  // METODO DE BUSQUEDA DE DATOS
  BuscarInformacion() {
    this.origen = [];
    this.informacion.ObtenerInformacion().subscribe((res: any[]) => {
      this.origen = JSON.stringify(res);

      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            nombre: ele.name_dep
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            let elemento = {
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula,
              correo: r.correo,
              id_cargo: r.id_cargo,
              id_contrato: r.id_contrato,
            }
            this.empleados.push(elemento)
          })
        })
      })
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA ACTIVAR SELECCION MULTIPLE
  plan_multiple: boolean = false;
  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  // METODO PARA MOSTRAR DATOS DE BUSQUEDA
  opcion: number;
  activar_boton: boolean = false;
  activar_seleccion: boolean = true;
  BuscarPorTipo(e: MatRadioChange) {
    this.opcion = e.value;
    this.activar_boton = true;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.auto_individual = true;
        this.plan_multiple = false;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.auto_individual = true;
        this.plan_multiple = false;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        this.activar_seleccion = true;
        this.auto_individual = true;
        this.plan_multiple = false;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this.activar_seleccion = true;
        this.auto_individual = true;
        this.plan_multiple = false;
        break;
    }
    this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.restR.GuardarCheckOpcion(this.opcion)

  }

  // METODO PARA FILTRAR DATOS DE BUSQUEDA
  Filtrar(e: any, orden: number) {
    switch (orden) {
      case 1: this.restR.setFiltroNombreSuc(e); break;
      case 2: this.restR.setFiltroNombreDep(e); break;
      case 3: this.restR.setFiltroCodigo(e); break;
      case 4: this.restR.setFiltroCedula(e); break;
      case 5: this.restR.setFiltroNombreEmp(e); break;
      default:
        break;
    }
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

  // SELECCIONA TODAS LAS FILAS SI NO ESTN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
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

  // METODO PARA MANEJAR PAGINACION DE LOS DATOS
  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // CONSULTA DE LOS DATOS ESTABLECIMIENTOS
  ModelarSucursal(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen)
    if (id === 0) {
      respuesta.forEach((obj: any) => {
        this.selectionSuc.selected.find(obj1 => {
          if (obj.id_suc === obj1.id) {
            obj.departamentos.forEach((obj2: any) => {
              obj2.empleado.forEach((obj3: any) => {
                usuarios.push(obj3)
              })
            })
          }
        })
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        if (obj.id_suc === id) {
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          })
        }
      })
    }

    this.RegistrarMultiple(usuarios);
  }

  // CONSULTA DE DATOS DE DEPARTAMENTOS
  ModelarDepartamentos(id: number) {
    let usuarios: any = [];
    let respuesta = JSON.parse(this.origen)

    if (id === 0) {
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
      })
    }
    else {
      respuesta.forEach((obj: any) => {
        obj.departamentos.forEach((obj1: any) => {
          if (obj1.id_depa === id) {
            obj1.empleado.forEach((obj3: any) => {
              usuarios.push(obj3)
            })
          }
        })
      })
    }

    this.RegistrarMultiple(usuarios);
  }

  // CONSULTA DE DATOS DE EMPLEADOS
  ModelarEmpleados() {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.RegistrarMultiple(respuesta);
  }

  /** ************************************************************************************** **
   ** **                         METODOS DE REGISTRO DE TIMBRES                           ** ** 
   ** ************************************************************************************** **/

  // FUNCION PARA CONFIRMAR CREACION DE TIMBRE 
  ConfirmarTimbre(empleado: any) {
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string))
      .subscribe(datos => {
        if (datos[0].seg_frase === true) {
          this.restUsuario.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
            if (data[0].frase === null || data[0].frase === '') {
              this.toastr.info(
                'Debe registrar su frase de seguridad.',
                'Configuración doble seguridad', { timeOut: 10000 })
                .onTap.subscribe(obj => {
                  this.RegistrarFrase()
                })
            }
            else {
              this.AbrirVentana(empleado);
            }
          });
        }
        else if (datos[0].seg_contrasena === true) {
          this.AbrirVentana(empleado);
        }
        else if (datos[0].seg_ninguna === true) {
          this.RegistrarTimbre(empleado);
        }
      });

  }

  // METODO PARA ABRIR VENTANA DE SEGURIDAD
  AbrirVentana(datos: any) {
    this.ventana.open(SeguridadComponent, { width: '350px' }).afterClosed()
      .subscribe((confirmado: string) => {
        if (confirmado === 'true') {
          this.RegistrarTimbre(datos);
        } else if (confirmado === 'false') {
          this.router.navigate(['/timbres-multiples']);
        } else if (confirmado === 'olvidar') {
          this.router.navigate(['/frase-olvidar']);
        }
      });
  }

  // METODO PARA INGRESAR TIMBRE DE UN USUARIO
  RegistrarTimbre(empleado: any) {
    this.ventana.open(CrearTimbreComponent, { width: '400px', data: empleado })
      .afterClosed().subscribe(dataT => {
        if (dataT) {
          if (!dataT.close) {
            this.restTimbres.RegistrarTimbreAdmin(dataT).subscribe(res => {
              this.toastr.success(res.message)
              // METODO PARA AUDITORIA DE TIMBRES
              this.validar.Auditar('app-web', 'timbres', '', dataT, 'INSERT');
            }, err => {
              this.toastr.error(err)
            })
          }
        }
        this.auto_individual = true;
        this.LimpiarFormulario();
      })
  }

  // METODO DE VALIDACION DE SELECCION MULTIPLE
  RegistrarMultiple(data: any) {
    if (data.length > 0) {
      this.VerificarSeguridad(data);
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA VERIFICAR TIPO DE SEGURIDAD EN EL SISTEMA
  VerificarSeguridad(seleccionados: any) {
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string))
      .subscribe(datos => {
        if (datos[0].seg_frase === true) {
          this.restUsuario.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
            if (data[0].frase === null || data[0].frase === '') {
              this.toastr.info(
                'Debe registrar su frase de seguridad.',
                'Configuración doble seguridad', { timeOut: 10000 })
                .onTap.subscribe(obj => {
                  this.RegistrarFrase()
                })
            }
            else {
              this.AbrirSeguridad(seleccionados);
            }
          });
        }
        else if (datos[0].seg_contrasena === true) {
          this.AbrirSeguridad(seleccionados);
        }
        else if (datos[0].seg_ninguna === true) {
          this.TimbrarVarios(seleccionados);
        }
      });
  }

  // METODO PARA REGISTRAR VARIOS TIMBRES
  TimbrarVarios(seleccionados: any) {
    this.ventana.open(CrearTimbreComponent, { width: '400px', data: seleccionados })
      .afterClosed().subscribe(dataT => {
        this.auto_individual = true;
        this.LimpiarFormulario();
      })
  }

  // METODO PARA ABRIR PAGINA DE CONFIGURACION DE SEGURIDAD
  AbrirSeguridad(seleccionados: any) {
    this.ventana.open(SeguridadComponent, { width: '350px' }).afterClosed()
      .subscribe((confirmado: string) => {
        if (confirmado === 'true') {
          this.TimbrarVarios(seleccionados);
        } else if (confirmado === 'false') {
          this.router.navigate(['/timbres-multiples']);
        } else if (confirmado === 'olvidar') {
          this.router.navigate(['/frase-olvidar']);
        }
      });
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent,
      { width: '350px', data: this.idEmpleadoLogueado }).disableClose = true;
  }

  // METODO PARA TOMAR DATOS SELECCIONADOS
  GuardarRegistros(id: number) {
    if (this.opcion === 1) {
      this.ModelarSucursal(id);
    }
    else if (this.opcion === 2) {
      this.ModelarDepartamentos(id);
    }
    else {
      this.ModelarEmpleados();
    }
  }

  // METODO PARA LIMPIAR FORMULARIOS
  LimpiarFormulario() {
    if (this._booleanOptions.bool_emp === true) {

      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();

      this._booleanOptions.bool_emp = false;

      this.selectionEmp.clear();
    }

    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
      this.selectionDep.clear();
    }

    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
      this.selectionSuc.clear();
    }

    this.seleccion.reset();
    this.activar_boton = false;
  }

  // METODO PARA MOSTRAR LISTA DE DATOS
  MostrarLista() {
    if (this.opcion === 1) {
      this.nombre_suc.reset();
      this.Filtrar('', 1)
    }
    else if (this.opcion === 2) {
      this.nombre_dep.reset();
      this.Filtrar('', 2)
    }
    else if (this.opcion === 3) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)
    }
  }

  // VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
