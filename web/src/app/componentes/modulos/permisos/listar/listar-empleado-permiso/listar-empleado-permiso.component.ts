// IMPORTACION DE LIBRERIAS
import { Component, OnInit } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { DateTime } from 'luxon';

import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE SERVICIOS
import { AutorizaDepartamentoService } from "src/app/servicios/autorizaDepartamento/autoriza-departamento.service";
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from "src/app/servicios/validaciones/validaciones.service";
import { ParametrosService } from "src/app/servicios/parametrosGenerales/parametros.service";
import { PermisosService } from "src/app/servicios/permisos/permisos.service";
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { MainNavService } from "src/app/componentes/generales/main-nav/main-nav.service";
import { UsuarioService } from "src/app/servicios/usuarios/usuario.service";
import { ToastrService } from 'ngx-toastr';

import { EmplUsuarioPipe } from 'src/app/filtros/empleado/filtroEmpUsuario/empl-usuario.pipe';
import { EmplEstadoPipe } from 'src/app/filtros/empleado/filtroEmpEstado/empl-estado.pipe';
import { EmplDepaPipe } from 'src/app/filtros/empleado/nombreDepartamento/empl-depa.pipe';

import { EditarPermisoEmpleadoComponent } from '../../gestionar-permisos/editar-permiso-empleado/editar-permiso-empleado.component';

export interface PermisosElemento {
  apellido: string;
  cedula: string;
  descripcion: string;
  docu_nombre: string;
  documento: string;
  estado: number;
  fec_creacion: string;
  fec_final: string;
  fec_inicio: string;
  id: number;
  id_contrato: number;
  codigo: any;
  id_emple_solicita: number;
  nom_permiso: string;
  nombre: string;
  id_empl_cargo: number;
  id_depa?: number;
  depa_nombre?: any;
  correo?: any
}

@Component({
  selector: "app-listar-empleado-permiso",
  templateUrl: "./listar-empleado-permiso.component.html",
  styleUrls: ["./listar-empleado-permiso.component.css"],
})
export class ListarEmpleadoPermisoComponent implements OnInit {
  public permisos: any = [];

  selectionUno = new SelectionModel<PermisosElemento>(true, []);

  // VISIBILIZAR LISTA DE PERMISOS AUTORIZADOS
  lista_autorizados: boolean = false;
  lista_permisos: boolean = false;

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA AUTORIZADOS
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;
  pageSizeOptions_autorizado = [5, 10, 20, 50];

  // VARIABLES USADAS EN BUSQUEDA DE FILTRO DE DATOS
  Depata: any = new FormControl('');
  Usuario: any = new FormControl('');
  Estado: any = new FormControl('');

  //VARIABLES DE FILTRO DE LA TABLA DE AUTORIZADOS O NEGADOS
  AutoriDepata: any = new FormControl('');
  AutoriUsuario: any = new FormControl('');
  AutoriEstado: any = new FormControl('');

  idEmpleado: number;
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  get habilitarPermiso(): boolean { return this.funciones.permisos; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantilla.color_Secundary; }
  get p_color(): string { return this.plantilla.color_Primary; }
  get logoE(): string { return this.plantilla.logoBase64; }
  get frase(): string { return this.plantilla.marca_Agua; }

  autorizacion: boolean = false;
  preautorizacion: boolean = false;
  id_departa: any = [];

  multiple: boolean = false;
  datos: any = [];

  UsuariosNombres: any = [];

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private validar: ValidacionesService,
    private ventana: MatDialog,
    private restP: PermisosService,
    private funciones: MainNavService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService,
    public restAutoriza: AutorizaDepartamentoService,
    public usuarioDepa: UsuarioService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos. \n`,
        message: "¿Te gustaría activarlo? Comunícate con nosotros.",
        url: "www.casapazmino.com.ec",
      };
      return this.validar.RedireccionarHomeAdmin(mensaje);
    } else {
      this.BuscarParametro();
      this.ObtenerEmpleados(this.idEmpleado);
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = "DD/MM/YYYY";
  formato_hora: string = "HH:mm:ss";
  ArrayAutorizacionTipos: any = []
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
        this.obtenerPermisos(this.formato_fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(this.formato_fecha, this.formato_hora);
      }, vacio => {
        this.obtenerPermisos(this.formato_fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(this.formato_fecha, this.formato_hora);
      });
    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );
  }

  listaPermisosFiltradas: any = [];
  listaPermisosDeparta: any = [];
  permilista: any = [];
  gerencia: boolean;
  obtenerPermisos(fecha: string, hora: string) {
    this.restP.obtenerAllPermisos().subscribe(
      (res) => {
        this.permisos = res;

        //Filtra la lista de Permisos para descartar las solicitudes del mismo usuario y almacena en una nueva lista
        this.permisos.filter((o) => {
          if (this.idEmpleado !== o.id_emple_solicita) {
            return this.listaPermisosFiltradas.push(o);
          }
        });

        this.listaPermisosFiltradas.forEach((p) => {
          // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
          p.fec_creacion_ = this.validar.FormatearFecha(
            p.fec_creacion,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );
          p.fec_inicio_ = this.validar.FormatearFecha(
            p.fec_inicio,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );
          p.fec_final_ = this.validar.FormatearFecha(
            p.fec_final,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );

          if (p.estado === 1) {
            p.estado = "Pendiente";
          } else if (p.estado === 2) {
            p.estado = "Pre-autorizado";
          }

        });

        let i = 0;
        this.listaPermisosFiltradas.filter(item => {
          this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_contrato).subscribe(
            (usuaDep) => {
              i = i + 1;
              this.ArrayAutorizacionTipos.filter(x => {
                if ((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)) {
                  this.gerencia = true;

                  if (item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)) {
                    this.permilista.push(item);
                  } else if (item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)) {
                    this.permilista.push(item);
                  }
                } else if ((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)) {
                  if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true) {
                    this.permilista.push(item);
                  } else if ((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true) {
                    this.permilista.push(item);
                  }
                }

              })

              //Filtra la lista de autorizacion para almacenar en un array
              if (this.listaPermisosFiltradas.length === i) {

                //Listado para eliminar el usuario duplicado
                var ListaSinDuplicadosPendie: any = [];
                var cont = 0;
                this.permilista.forEach(function (elemento, indice, array) {
                  cont = cont + 1;
                  if (ListaSinDuplicadosPendie.find(p => p.id == elemento.id) == undefined) {
                    ListaSinDuplicadosPendie.push(elemento);
                  }
                });

                if (this.permilista.length == cont) {
                  this.listaPermisosDeparta = [];
                  ListaSinDuplicadosPendie.sort((a, b) => b.id - a.id);
                  this.listaPermisosDeparta = ListaSinDuplicadosPendie;

                  console.log('listaPermisosDeparta: ', this.listaPermisosDeparta)

                  if (Object.keys(this.listaPermisosDeparta).length == 0) {
                    this.validarMensaje1 = true;
                  }

                  if (this.listaPermisosDeparta.length != 0) {
                    this.lista_permisos = true;
                  }


                }
              }

            }
          );

        });
      },
      (err) => {
        console.log("permisos ALL ", err.error);
        this.validarMensaje1 = true;
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );

  }

  permisosTotales: any;
  EditarPermiso(id, id_empl) {
    console.log('id: ', id, ' - id_empl: ', id_empl)
    // METODO PARA IMPRIMIR DATOS DEL PERMISO
    this.permisosTotales = [];
    this.restP.ObtenerUnPermisoEditar(id).subscribe(
      (datos) => {
        this.permisosTotales = datos;
        this.ventana
          .open(EditarPermisoEmpleadoComponent, {
            width: "450px",
            data: {
              dataPermiso: this.permisosTotales[0],
              id_empleado: parseInt(id_empl),
            },
          })
          .afterClosed()
          .subscribe((items) => {
            this.BuscarParametro();
          });
      },
      (err) => {
        console.log("permisos uno ", err.error);
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    return numSelected === this.listaPermisosDeparta.length;
  }

  listafiltro: any = [];
  reserva: any;
  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.listafiltro = [];
    this.listafiltro = this.listaPermisosDeparta;

    if (this.Depata.value != undefined && this.Depata.value != null && this.Depata.value != '') {
      this.listafiltro = new EmplDepaPipe().transform(this.listafiltro, this.Depata.value);
    }
    if (this.Usuario.value != undefined && this.Usuario.value != null && this.Usuario.value != '') {
      this.listafiltro = new EmplUsuarioPipe().transform(this.listafiltro, this.Usuario.value);
    }
    if (this.Estado.value != undefined && this.Estado.value != null && this.Estado.value != '') {
      this.listafiltro = new EmplEstadoPipe().transform(this.listafiltro, this.Estado.value);
    }

    this.isAllSelected()
      ? this.selectionUno.clear()
      : this.filtrar(this.listafiltro);
  }

  filtrar(listafiltro: any) {
    this.listaPermisosDeparta = listafiltro;
    this.listaPermisosDeparta.forEach((row: any) => this.selectionUno.select(row));
  }

  limpiarFiltro() {
    this.Depata.reset();
    this.Usuario.reset()
    this.Estado.reset();
    this.obtenerPermisos(this.formato_fecha, this.formato_hora);
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabel(row?: PermisosElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selectionUno.isSelected(row) ? "deselect" : "select"} row ${row.id + 1
      }`;
  }

  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  AutorizarPermisosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected.map((obj) => {
      return {
        id: obj.id,
        empleado: obj.nombre + " " + obj.apellido,
        correo: obj.correo,
        id_contrato: obj.id_contrato,
        id_emple_solicita: obj.id_emple_solicita,
        id_cargo: obj.id_empl_cargo,
        id_depa: obj.id_depa,
        nombre_depa: obj.depa_nombre,
        estado: obj.estado,
        fecha_inicio: this.validar.DarFormatoFecha(obj.fec_inicio, 'yyyy-MM-dd'),
        fecha_final: this.validar.DarFormatoFecha(obj.fec_final, 'yyyy-MM-dd'),
        codigo: obj.codigo,
        observacion: '',
        aprobar: '',
      };
    });
    this.AbrirAutorizaciones(EmpleadosSeleccionados, "multiple");
  }

  lis: any = [];
  // AUTORIZACIÓN DE PERMISOS
  AbrirAutorizaciones(datos_permiso: any, forma: string) {
    if (datos_permiso.length != 0) {
      this.multiple = true;
      this.lista_permisos = false;
      this.lista_autorizados = false;
      this.auto_individual = true;
      this.btnCheckHabilitar = false;
      var datosPermiso = { datosPermiso: datos_permiso, carga: forma }
      this.datos = datosPermiso;
      this.selectionUno.clear();
    } else {
      this.toastr.error("No ha seleccionado solicitudes para aprobar");
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // LISTA DE PERMISOS QUE HAN SIDO AUTORIZADOS O NEGADOS
  ManejarPaginaAutorizados(e: PageEvent) {
    this.tamanio_pagina_autorizado = e.pageSize;
    this.numero_pagina_autorizado = e.pageIndex + 1;
  }

  permisosAutorizados: any = [];
  public listaPermisosAutorizadosFiltrados: any = [];
  ObtenerPermisosAutorizados(fecha: string, hora: string) {
    this.permisosAutorizados = [];
    this.listaPermisosAutorizadosFiltrados = [];
    this.restP.BuscarPermisosAutorizados().subscribe(
      (res) => {
        this.permisosAutorizados = res;

        //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
        this.permisosAutorizados.filter((o) => {
          if (this.idEmpleado !== o.id_emple_solicita) {
            return this.listaPermisosAutorizadosFiltrados.push(o);
          }
        });

        this.listaPermisosAutorizadosFiltrados.forEach((p) => {
          // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
          p.fec_creacion_ = this.validar.FormatearFecha(
            p.fec_creacion,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );
          p.fec_inicio_ = this.validar.FormatearFecha(
            p.fec_inicio,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );
          p.fec_final_ = this.validar.FormatearFecha(
            p.fec_final,
            fecha,
            this.validar.dia_abreviado, this.idioma_fechas
          );

          if (p.estado === 3) {
            p.estado = "Autorizado";
          } else if (p.estado === 4) {
            p.estado = "Negado";
          }
        });

        if (Object.keys(this.listaPermisosAutorizadosFiltrados).length == 0) {
          this.validarMensaje2 = true;
        }
        this.listaPermisosAutorizadosFiltrados.sort((a, b) => b.id - a.id);

        if (this.listaPermisosAutorizadosFiltrados.length != 0) {
          this.lista_autorizados = true;
        }
      },
      (err) => {
        this.validarMensaje2 = true;
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );
  }

  limpiarFiltroAutorizados() {
    this.AutoriDepata.reset();
    this.AutoriUsuario.reset();
    this.AutoriEstado.reset();
    this.ObtenerPermisosAutorizados(this.formato_fecha, this.formato_hora);
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  generarPdf(action = "open", opcion: string) {
    const documentDefinition = this.DefinirInformacionPDF(opcion);

    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download();
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  DefinirInformacionPDF(opcion: string) {
    if (opcion == "Permisos solicitados") {
      sessionStorage.setItem(
        "PermisosSolicitados",
        this.listaPermisosDeparta
      );
    } else if (opcion == "Permisos autorizados") {
      sessionStorage.setItem(
        "PermisosAutorizados",
        this.listaPermisosAutorizadosFiltrados
      );
    }

    return {
      // ENCABEZADO DE LA PAGINA
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por: " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE LA PAGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: "Fecha: " + fecha + " Hora: " + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: "© Pag " + currentPage.toString() + " of " + pageCount,
                  alignment: "right",
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        {
          text: opcion,
          bold: true,
          fontSize: 16,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFPermisos(opcion),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10, alignment: "center" },
      },
    };
  }

  // ESTRUCTURA DEL ARCHIVO PDF
  PresentarDataPDFPermisos(opcion: string) {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Permiso", style: "tableHeader" },
                { text: "Departamento", style: "tableHeader" },
                { text: "Empleado", style: "tableHeader" },
                { text: "Estado", style: "tableHeader" },
                { text: "Tipo permiso", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha Final", style: "tableHeader" },
              ],
              ...this.mostrarDatosPermisos(opcion),
            ],
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return i % 2 === 0 ? "#CCD1D1" : null;
            },
          },
        },
        { width: "*", text: "" },
      ],
    };
  }

  // MEtodo seleccionar que lista de permisos mostrar (solicitados o autorizados)
  mostrarDatosPermisos(opcion: string) {
    return (opcion == "Permisos solicitados" ? this.listaPermisosDeparta : this.listaPermisosAutorizadosFiltrados).map((obj) => {
      return [
        { text: obj.id, style: "itemsTable" },
        { text: obj.depa_nombre, style: "itemsTable" },
        { text: obj.nombre + ' ' + obj.apellido, style: "itemsTable" },
        { text: obj.estado, style: "itemsTable" },
        { text: obj.nom_permiso, style: "itemsTable" },
        { text: obj.fec_inicio_, style: "itemsTable" },
        { text: obj.fec_final_, style: "itemsTable" },
      ];
    });
  }

  /** ************************************************************************************************* **
  ** **                             PARA LA EXPORTACION DE ARCHIVOS EXCEL                           ** **
  ** ************************************************************************************************* **/

  exportToExcel(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Permisos solicitados" ? this.listaPermisosDeparta : this.listaPermisosAutorizadosFiltrados).map((obj: any) => {
      return {
        Permiso: obj.id,
        Departamento: obj.depa_nombre,
        Nombre: obj.nombre + ' ' + obj.apellido,
        Estado: obj.estado,
        Tipo_Permiso: obj.nom_permiso,
        Fecha_Inicial: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,

      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaPermisosDeparta[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA PERMISOS');
    xlsx.writeFile(wb, `${opcion}EXCEL` + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** ** 
  ** **                                     METODO PARA EXPORTAR A CSV                               ** **
  ** ************************************************************************************************** **/

  exportToCVS(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Permisos solicitados" ? this.listaPermisosDeparta : this.listaPermisosAutorizadosFiltrados).map((obj: any) => {
      return {
        Permiso: obj.id,
        Departamento: obj.depa_nombre,
        Nombre: obj.nombre + ' ' + obj.apellido,
        Estado: obj.estado,
        Tipo_Permiso: obj.nom_permiso,
        Fecha_Inicial: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,

      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, `${opcion}CSV` + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML(opcion: String) {
    var objeto: any;
    var arregloPermisos: any = [];
    (opcion == "Permisos solicitados" ? this.listaPermisosDeparta : this.listaPermisosAutorizadosFiltrados).forEach((obj: any) => {
      objeto = {
        "lista_permisos": {
          "@id": obj.id,
          "Departamento": obj.depa_nombre,
          "nombre": obj.nombre + ' ' + obj.apellido,
          "estado": obj.estado,
          "tipo_permiso": obj.nom_permiso,
          "fecha_inicial": obj.fec_inicio_,
          "fecha_final": obj.fec_final_,
        }
      }
      arregloPermisos.push(objeto)
    });
    this.restP.CrearXML(arregloPermisos).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/empleadoPermiso/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }
}
