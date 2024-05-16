// IMPORTAR LIBRERIAS
import { Validators, FormControl } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { PageEvent } from "@angular/material/paginator";

import * as FileSaver from "file-saver";
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as moment from "moment";
import * as xlsx from "xlsx";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
moment.locale("es");

// LLAMADO DE SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { EmpleadoProcesosService } from "src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service";
import { AccionPersonalService } from "src/app/servicios/accionPersonal/accion-personal.service";
import { ValidacionesService } from "src/app/servicios/validaciones/validaciones.service";
import { EmplCargosService } from "src/app/servicios/empleado/empleadoCargo/empl-cargos.service";
import { ParametrosService } from "src/app/servicios/parametrosGenerales/parametros.service";
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { EmpresaService } from "src/app/servicios/catalogos/catEmpresa/empresa.service";
import { MainNavService } from "src/app/componentes/administracionGeneral/main-nav/main-nav.service";

@Component({
  selector: "app-listar-pedido-accion",
  templateUrl: "./listar-pedido-accion.component.html",
  styleUrls: ["./listar-pedido-accion.component.css"],
})

export class ListarPedidoAccionComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // DATOS FILTROS DE BUSQUEDA
  filtroCodigo: number;
  filtroCedula: "";
  filtroNombre: "";
  filtroApellido: "";

  // DATOS DEL FORMULARIO DE BUSQUEDA
  codigo = new FormControl("");
  cedula = new FormControl("", [Validators.minLength(2)]);
  nombre = new FormControl("", [Validators.minLength(2)]);
  apellido = new FormControl("", [Validators.minLength(2)]);

  // ALMACENAMIENTO DE DATOS CONSULTADOS
  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION
  decreto: string[];
  tipoAccion: string[];

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string {
    return this.plantillaPDF.color_Secundary;
  }
  get p_color(): string {
    return this.plantillaPDF.color_Primary;
  }
  get frase(): string {
    return this.plantillaPDF.marca_Agua;
  }
  get logo1(): string {
    return this.plantillaPDF.logoBase64;
  }

  get habilitarAccion(): boolean {
    return this.funciones.accionesPersonal;
  }

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS DEL EMPLEADO
    public restAccion: AccionPersonalService, // SERVICIO DATOS ACCIONES DE PERSONAL
    public restCargo: EmplCargosService, // SERVICIO DATOS DE CARGO
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public parametro: ParametrosService,
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private validar: ValidacionesService,
    private funciones: MainNavService,
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado") as string);
  }

  ngOnInit(): void {
    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: "¿Te gustaría activarlo? Comunícate con nosotros.",
        url: "www.casapazmino.com.ec",
      };
      return this.validar.RedireccionarHomeAdmin(mensaje);
    } else {
      this.ObtenerLogo();
      this.ObtenerEmpresa();
      this.VerDatosAcciones();
      this.ObtenerEmpleados(this.idEmpleado);
    }
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = "DD/MM/YYYY";
  formato_hora: string = "HH:mm:ss";

  FormatearFecha(fecha: string, formato: string, dia: string) {
    if (dia === "ddd") {
      let valor =
        moment(fecha).format(dia).charAt(0).toUpperCase() +
        moment(fecha).format(dia).slice(1) +
        " " +
        moment(fecha).format(formato);
      return valor;
    } else {
      let valor =
        moment(fecha).format(dia).charAt(0).toUpperCase() +
        moment(fecha).format(dia).slice(1) +
        ", " +
        moment(fecha).format(formato);
      return valor;
    }
  }

  // METODO PARA VER DATOS DE PEDIDOS
  ver_lista: boolean = true;
  ver_datos: boolean = false;
  VerDatosPedidos(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.pedido_id = id;
  }

  // METODO PARA ABRIR EDITAR
  ver_editar: boolean = false;
  pagina: string = '';
  pedido_id: number;
  AbrirEditar(id: number) {
    this.ver_editar = true;
    this.ver_lista = false;
    this.pagina = 'listar-pedido';
    this.pedido_id = id;
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  // EVENTO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // OBTENER LOGO DEL MINISTERIO DE TRABAJO
  logo: any = String;
  ObtenerLogo() {
    this.restAccion.LogoImagenBase64().subscribe((res) => {
      this.logo = "data:image/jpeg;base64," + res.imagen;
    });
  }

  //DATOS ACCIONES
  listaPedidos: any = [];
  VerDatosAcciones() {
    this.listaPedidos = [];
    this.restAccion.BuscarDatosPedido().subscribe((data) => {
      this.listaPedidos = data;
      this.FormatearDatos(
        this.listaPedidos,
        this.formato_fecha,
        this.formato_hora
      );
    });
  }

  // METODO PARA FORMATEAR DATOS DE FECHA
  FormatearDatos(lista: any, formato_fecha: string, formato_hora: string) {
    lista.forEach((data) => {
      data.fecCreacion_ = this.validar.FormatearFecha(
        data.fecha_creacion,
        formato_fecha,
        this.validar.dia_abreviado
      );
      data.fecDesde_ = this.validar.FormatearFecha(
        data.fecha_rige_desde,
        formato_fecha,
        this.validar.dia_abreviado
      );
      data.fecHasta_ =
        data.fecha_rige_hasta !== null
          ? this.validar.FormatearFecha(
            data.fecha_rige_hasta,
            formato_fecha,
            this.validar.dia_abreviado
          )
          : "";
      data.fechaActa_ =
        data.fecha_acta_final_concurso !== null
          ? this.validar.FormatearFecha(
            data.fecha_acta_final_concurso,
            formato_fecha,
            this.validar.dia_abreviado
          )
          : "";
      data.fechaReemp_ =
        data.primera_fecha_reemplazo !== null
          ? this.validar.FormatearFecha(
            data.primera_fecha_reemplazo,
            formato_fecha,
            this.validar.dia_abreviado
          )
          : "";
    });
  }

  // METODO PARA OBTENER DATOS DE COLORES DE LA EMPRESA
  empresa: any = [];
  ObtenerEmpresa() {
    this.empresa = [];
    this.restEmpre
      .ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string))
      .subscribe((res) => {
        this.empresa = res;
      });
  }

  texto_color_cargo: string = "";
  texto_color_numero: string = "";
  texto_color_proceso: string = "";
  texto_color_salario: string = "";
  texto_color_empresa: string = "";
  datosPedido: any = [];
  procesoPropuesto: any = [];
  procesoActual: any = [];
  empleado_1: any = [];
  empleado_2: any = [];
  empleado_3: any = [];
  empleado_4: any = [];

  buscarProcesos: any = [];
  empleadoProcesos: any = [];
  idCargo: any = [];
  contador: number = 0;
  MostrarInformacion(id: number, tipo: string) {
    this.texto_color_cargo = "white";
    this.texto_color_numero = "white";
    this.texto_color_proceso = "white";
    this.texto_color_salario = "white";
    this.texto_color_empresa = "white";
    this.texto_color_proceso_actual = "black";
    this.datosPedido = [];
    this.empleado_1 = [];
    this.empleado_2 = [];
    this.empleado_3 = [];
    this.empleado_4 = [];
    this.procesoPropuesto = [];
    this.procesoActual = [];
    this.buscarProcesos = [];
    this.empleadoProcesos = [];
    this.idCargo = [];
    this.contador = 0;
    this.restAccion.BuscarDatosPedidoId(id).subscribe((data) => {
      this.datosPedido = data;
      console.log("data pedido", this.datosPedido);
      this.BuscarPedidoEmpleado(this.datosPedido, tipo);
      this.ObtenerDecreto();
      this.ObtenerTipoAccion();
    });
  }

  // METODO PARA MOSTRAR DATOS DE LOS EMPLEADOS SELECCIONADOS EN EL PEDIDO 
  BuscarPedidoEmpleado(pedido: any, tipo: string) {
    this.restAccion
      .BuscarDatosPedidoEmpleados(pedido[0].id_empleado)
      .subscribe((datos1) => {
        this.empleado_1 = datos1;
        this.ListarProcesosEmpleado(pedido, tipo);
      });
  }

  // METODO PARA MOSTRAR LA INFORMACIÓN DE LOS PROCESOS DEL EMPLEADO
  ListarProcesosEmpleado(pedido: any, tipo: string) {
    this.restCargo.BuscarIDCargo(pedido[0].id_empleado).subscribe((datos) => {
      this.idCargo = datos;
      var contar = 0;
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        contar = contar + 1;
        this.BuscarProcesosCargo(this.idCargo, i, contar, tipo);
      }
    });
  }

  // METODO PARA BUSCAR PROCESOS QUE TIENE EL EMPLEADO DE ACUERDO AL CARGO 
  BuscarProcesosCargo(id_cargo: any, valor: any, contar: any, tipo: string) {
    // revisar
    this.restEmpleadoProcesos
      .ObtenerProcesoUsuario(id_cargo[valor]["id"])
      .subscribe(
        (datos) => {
          this.buscarProcesos = datos;
          if (this.buscarProcesos.length != 0) {
            if (this.contador === 0) {
              this.empleadoProcesos = datos;
              this.contador++;
            } else {
              this.empleadoProcesos = this.empleadoProcesos.concat(datos);
            }
          }
          if (contar === this.idCargo.length) {
            this.restAccion
              .Buscarprocesos(
                this.empleadoProcesos[this.empleadoProcesos.length - 1].id
              )
              .subscribe((proc_a) => {
                this.procesoActual = proc_a;
                this.EscribirProcesosActuales(this.procesoActual);
                this.BusquedaInformacion(tipo);
              });
          }
        },
        (error) => {
          if (contar === this.idCargo.length) {
            if (this.empleadoProcesos.length === 0) {
              this.EscribirProcesosActuales_Vacios();
              this.BusquedaInformacion(tipo);
              this.toastr.info(
                "El reporte no refleja informácion de procesos actuales del colaborador seleccionado.",
                "Cargar la información respectiva.",
                {
                  timeOut: 6000,
                }
              );
            }
          }
        }
      );
  }

  // METODO PARA BUSCAR INFORMACIÓN DE LOS EMPLEADOS RESPONSABLES / FIRMAS 
  BusquedaInformacion(tipo: string) {
    this.restAccion
      .BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].firma_empleado_uno))
      .subscribe((data2) => {
        this.empleado_2 = data2;
        this.restAccion
          .BuscarDatosPedidoEmpleados(
            parseInt(this.datosPedido[0].titulo_empleado_dos)
          )
          .subscribe((data3) => {
            this.empleado_3 = data3;
            this.restAccion.BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].id_empleado_responsable))
              .subscribe((data4) => {
                this.empleado_4 = data4;
                this.VerificarDatos(tipo);
              });
          });
      });
  }

  // METODO PARA VERIFICAR DATOS INGRESADO Y NO INGRESADO
  VerificarDatos(tipo: string) {
    if (
      this.datosPedido[0].id_proceso_propuesto === null &&
      this.datosPedido[0].id_cargo_propuesto === null
    ) {
      this.DefinirColor(this.datosPedido, "");
      tipo === "pdf" ? this.generarPdf("download") : this.generarExcel();
    } else if (
      this.datosPedido[0].id_proceso_propuesto != null &&
      this.datosPedido[0].id_cargo_propuesto != null
    ) {
      this.restAccion
        .Buscarprocesos(this.datosPedido[0].id_proceso_propuesto)
        .subscribe((proc1) => {
          this.procesoPropuesto = proc1;
          this.EscribirProcesosPropuestos(this.procesoPropuesto);
          this.restAccion
            .ConsultarUnCargoPropuesto(this.datosPedido[0].id_cargo_propuesto)
            .subscribe((carg) => {
              this.DefinirColor(
                this.datosPedido,
                carg[0].descripcion.toUpperCase()
              );
              tipo === "pdf" ? this.generarPdf("download") : this.generarExcel();
            });
        });
    } else if (
      this.datosPedido[0].id_proceso_propuesto != null &&
      this.datosPedido[0].id_cargo_propuesto === null
    ) {
      this.restAccion
        .Buscarprocesos(this.datosPedido[0].id_proceso_propuesto)
        .subscribe((proc) => {
          this.procesoPropuesto = proc;
          this.EscribirProcesosPropuestos(this.procesoPropuesto);
          this.DefinirColor(this.datosPedido, "");
          tipo === "pdf" ? this.generarPdf("download") : this.generarExcel();
        });
    } else if (
      this.datosPedido[0].id_proceso_propuesto === null &&
      this.datosPedido[0].id_cargo_propuesto != null
    ) {
      this.restAccion
        .ConsultarUnCargoPropuesto(this.datosPedido[0].id_cargo_propuesto)
        .subscribe((carg) => {
          this.DefinirColor(
            this.datosPedido,
            carg[0].descripcion.toUpperCase()
          );
          tipo === "pdf" ? this.generarPdf("download") : this.generarExcel();
        });
    }
  }

  // METODO PARA DEFINIR COLORES DE TEXTO / IMPRIMIR ESPACIOS
  cargo_propuesto: string = "";
  proceso_propuesto: string = "";
  salario_propuesto: string = "";
  num_partida: string = "";
  DefinirColor(array: any, nombre_cargo: any) {
    this.cargo_propuesto = "";
    this.proceso_propuesto = "";
    this.salario_propuesto = "";
    this.num_partida = "";
    if (array[0].cargo_propuesto != "" && array[0].cargo_propuesto != null) {
      this.texto_color_cargo = "black";
      this.cargo_propuesto = nombre_cargo;
    } else {
      this.cargo_propuesto = "----------";
    }
    if (
      array[0].proceso_propuesto != "" &&
      array[0].proceso_propuesto != null
    ) {
      this.texto_color_empresa = "black";
      this.texto_color_proceso = "black";
    } else {
      this.proceso_padre_p = "----------";
      this.nombre_procesos_p = "----------";
    }
    if (
      array[0].salario_propuesto != "" &&
      array[0].salario_propuesto != null
    ) {
      this.texto_color_salario = "black";
    } else {
      this.salario_propuesto = "----------";
    }
  }

  // METODO PARA REALIZAR BUSQUEDA DE PROCESOS QUE TIENEN REGISTRADOS EL EMPLEADO 
  nombre_procesos_a: string = "";
  proceso_padre_a: string = "";
  EscribirProcesosActuales(array) {
    this.nombre_procesos_a = "";
    this.proceso_padre_a = "";
    array.map((obj) => {
      if (this.proceso_padre_a != "") {
        this.nombre_procesos_a = this.nombre_procesos_a + "\n" + obj.nombre;
      } else {
        this.proceso_padre_a = obj.nombre;
      }
    });
  }

  // METODO PARA IMPRIMIR ESPACIOS CUANDO EL EMPLEADO NO REGISTRA PROCESOS
  texto_color_proceso_actual: string = "";
  EscribirProcesosActuales_Vacios() {
    this.proceso_padre_a = "";
    this.proceso_padre_a = "-------------";
    this.texto_color_proceso_actual = "white";
  }

  // METODO PARA IMPRIMIR PROCESOS PROPUESTOS
  nombre_procesos_p: string = "";
  proceso_padre_p: string = "";
  EscribirProcesosPropuestos(array) {
    this.nombre_procesos_p = "";
    this.proceso_padre_p = "";
    array.map((obj) => {
      if (this.proceso_padre_p != "") {
        this.nombre_procesos_p = this.nombre_procesos_p + "\n" + obj.nombre;
      } else {
        this.proceso_padre_p = obj.nombre;
      }
    });
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS PDF INDIVIDUAL                   ** **
   ** ************************************************************************************************* **/

  generarPdf(action = "open") {
    const documentDefinition = this.getDocumentDefinicion();
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

  getDocumentDefinicion() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageMargins: [10, 40, 10, 40],
      content: [
        this.PresentarHoja1_Parte_1(),
        this.PresentarHoja1_Parte_2(),
        this.PresentarHoja1_Parte_3(),
        this.PresentarHoja1_Parte_4(),
        this.PresentarHoja1_Parte_5(),
        this.PresentarHoja1_Parte_6(),
        this.PresentarHoja1_Parte_7(),
        this.PresentarHoja1_Parte_8(),
        this.PresentarHoja1_Parte_8_1(),
        this.PresentarHoja1_Parte_9(),
        this.PresentarHoja1_Parte_10(),
        this.PresentarHoja1_Parte_11_1(),
        this.PresentarHoja1_Parte_11_2(),
        this.PresentarHoja1_Parte_12(),
        this.PresentarHoja1_Parte_13_1(),
        this.PresentarHoja1_Parte_13_2(),
        { text: "", pageBreak: "before", style: "subheader" },
        this.PresentarHoja2_Parte_1(),
        this.PresentarHoja2_Parte_2(),
        this.PresentarHoja2_Parte_3_1(),
        this.PresentarHoja2_Parte_3_2(),
        this.PresentarHoja2_Parte_3_3(),
        this.PresentarHoja2_Parte_3_4(),
        this.PresentarHoja2_Parte_3_5(),
        this.PresentarHoja2_Parte_4_1(),
        this.PresentarHoja2_Parte_4_2(),
        this.PresentarHoja2_Parte_4_3(),
        this.PresentarHoja2_Parte_4_4(),
        this.PresentarHoja2_Parte_4_5(),
        this.PresentarHoja2_Parte_4_6(),
      ],
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9 },
        itemsTable_d: { fontSize: 9, alignment: "right" },
        itemsTable_e: { fontSize: 7 },
      },
    };
  }

  // METODO PARA MOSTRAR EL TIPO DE DECRETO-ACUERDO-RESOLUCION
  ObtenerDecreto() {
    this.decreto = ["", "", "", "_______________", "", "white"];
    let decretoTexto: string = "";
    if (this.datosPedido[0].id_contexto_legal !== null) {
      try {
        this.restAccion
          .ConsultarUnDecreto(this.datosPedido[0].id_contexto_legal)
          .subscribe((data8) => {
            decretoTexto = data8[0].descripcion;
            let texto: string = decretoTexto.toUpperCase();
            switch (texto) {
              case "DECRETO":
                this.decreto[0] = "X";
                break;
              case "ACUERDO":
                this.decreto[1] = "X";
                break;
              case "RESOLUCIÓN" || "RESOLUCION":
                this.decreto[2] = "X";
                break;
              default:
                this.decreto[3] = texto;
                this.decreto[4] = "X";
                this.decreto[5] = "black";
                break;
            }
          });
      } catch (error) {
        console.log(error);
      }
    }
  }

  // METODO PARA OBTENER MOSTRAR EL TIPO DE ACCION
  ObtenerTipoAccion() {
    let tipoAccion: string = this.datosPedido[0].tipo.toUpperCase();
    let cadena = this.RemoveAccents(tipoAccion);
    this.tipoAccion = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    let acciones: string[] = ['INGRESO', 'NOMBRAMIENTO', 'ASCENSO', 'SUBROGACION', 'ENCARGO:',
      'VACACIONES', 'TRASLADO', 'TRASPASO', 'CAMBIO ADMINISTRATIVO', 'INTERCAMBIO',
      'COMISION DE SERVICIOS', 'LICENCIA', 'REVALORIZACION', 'RECLASIFICACION', 'UBICACION',
      'REINTEGRO', 'REINSTITUCIONAL', 'RENUNCIA', 'SUPRESION', 'DESTITUCION', 'REMOCION', 'JUBILACION'];
    let indice = acciones.indexOf(cadena);
    if (indice !== -1) {
      this.tipoAccion[indice] = 'X';
    } else {
      this.tipoAccion[22] = tipoAccion;
      this.tipoAccion[24] = 'X';
    }
    console.log("Obtener tipo de accion")
    console.log(tipoAccion);
    console.log(cadena);
  }

  // METODO PARA QUITAR LAS TILDES
  RemoveAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  PresentarHoja1_Parte_1() {
    return {
      table: {
        widths: [280, "auto", "*"],
        heights: [40],

        body: [
          [
            {
              border: [true, true, true, false],
              margin: [70, 10, 0, 0],
              image: this.logo,
              width: 100,
            },
            {
              border: [false, true, true, false],
              text: [
                {
                  text: "---------------",
                  style: "itemsTable",
                  color: "white",
                },
              ],
            },
            {
              border: [false, true, true, false],
              table: {
                body: [
                  [
                    {
                      text: "ACCIÓN DE PERSONAL",
                      style: "itemsTable_c",
                      margin: [65, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [
                        { text: "N° ", style: "itemsTable_c" },
                        {
                          text: "------------",
                          color: "white",
                          style: "itemsTable",
                        },
                        {
                          text: this.datosPedido[0].identi_accion_p,
                          style: "itemsTable_c",
                        },
                      ],
                      margin: [40, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [
                        { text: "Fecha: ", style: "itemsTable_c" },
                        {
                          text: "---------",
                          color: "white",
                          style: "itemsTable",
                        },
                        {
                          text: moment(this.datosPedido[0].fec_creacion).format(
                            "DD MMMM YYYY"
                          ),
                          style: "itemsTable_c",
                        },
                      ],
                      margin: [32, 0, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_2() {
    return {
      table: {
        widths: ["*"],
        heights: [20],
        body: [
          [
            {
              border: [true, true, true, false],
              table: {
                body: [
                  [
                    {
                      text: "DECRETO: ", style: "itemsTable_c",
                      margin: [5, 5, 0, 0]
                    },
                    {
                      border: [true, true, true, true],
                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.decreto[0]}`, style: "itemsTable_e", alignment: 'center', },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                      },
                    },
                    {
                      text: "ACUERDO: ", style: "itemsTable_c",
                      margin: [50, 5, 0, 0]
                    },
                    {
                      border: [true, true, true, true],
                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.decreto[1]}`, style: "itemsTable_e", alignment: 'center', },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                      },
                    },
                    { text: "RESOLUCIÓN: ", style: "itemsTable_c", margin: [50, 5, 0, 0] },
                    {
                      border: [true, true, true, true],
                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.decreto[2]}`, style: "itemsTable_e", alignment: 'center', },]
                        ]
                      },
                      layout: {
                        defaultBorder: true
                      },
                    },
                    { text: "OTRO: ", style: "itemsTable_c", margin: [50, 5, 0, 0] },
                    {
                      border: [false, false, false, false],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.decreto[4]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                    {
                      border: [false, false, false, true],
                      table: {
                        heights: [9],
                        body: [
                          [{ text: `${this.decreto[3]}`, style: "itemsTable_c", color: this.decreto[5] },],
                        ]
                      },
                      layout: {
                        hLineWidth: function (i, node) {
                          if (i === node.table.body.length) {
                            return 1; // GROSOR DEL BORDE INFERIOR
                          } else {
                            return 0; // SIN BORDES EN LAS DEMAS LINEAS
                          }
                        },
                        vLineWidth: function (i) {
                          return 0; // SIN BORDES VERTICALES
                        },
                      },
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_3() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*", "auto"],
        heights: [5],
        body: [
          [
            {
              border: [true, false, false, true],
              margin: [90, 4, 0, 0],
              text: [{ text: "No.", style: "itemsTable_c" }],
            },
            {
              border: [false, false, false, true],
              margin: [0, 0, 0, 5],
              table: {
                body: [
                  [{ text: "-------------------------------", color: "white" }],
                ],
              },
              layout: {
                hLineWidth: function (i, node) {
                  if (i === node.table.body.length) {
                    return 1; // GROSOR DEL BORDE INFERIOR
                  } else {
                    return 0; // SIN BORDES EN LAS DEMAS LINEAS
                  }
                },
                vLineWidth: function (i) {
                  return 0; // SIN BORDES VERTICALES
                },
              },
            },
            {
              border: [false, false, false, true],
              margin: [0, 4, 0, 0],
              text: [{ text: "FECHA:", style: "itemsTable_c" }],
            },
            {
              border: [false, false, false, true],
              margin: [0, 0, 0, 0],
              table: {
                body: [
                  [{ text: "-------------------------------", color: "white" }],
                ],
              },
              layout: {
                hLineWidth: function (i, node) {
                  if (i === node.table.body.length) {
                    return 1; // GROSOR DEL BORDE INFERIOR
                  } else {
                    return 0; // SIN BORDES EN LAS DEMAS LINEAS
                  }
                },
                vLineWidth: function (i) {
                  return 0; // SIN BORDES VERTICALES
                },
              },
            },
            {
              border: [false, false, true, true],
              table: {
                heights: [9],
                body: [
                  [{ text: `` },],
                ]
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_4() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [30],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: this.empleado_1[0].apellido.toUpperCase(),
                      style: "itemsTable_c",
                      margin: [0, 6, 0, 0],
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      text: "APELLIDO",
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: this.empleado_1[0].nombre.toUpperCase(),
                      style: "itemsTable_c",
                      margin: [0, 6, 0, 0],
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      text: "NOMBRE",
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_5() {
    return {
      table: {
        widths: ["*", "*", "*"],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: "No. de Cédula de Ciudadanía",
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: "No. de Afilicación IESS",
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: "Rige a partir de:",
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_6() {
    return {
      table: {
        widths: ["*", "*", "*"],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: [
                        {
                          text: this.empleado_1[0].cedula,
                          style: "itemsTable_c",
                          alignment: 'center',
                        },
                      ],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [
                    {
                      text: [{ text: "", style: "itemsTable_c" }],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: moment(this.datosPedido[0].fec_rige_desde).format(
                        "dddd DD MMMM YYYY"
                      ),
                      style: "itemsTable_c",
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_7() {
    return {
      table: {
        widths: ["*"],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [
                    {
                      text: [
                        {
                          text: "EXPLICACIÓN: (Opcional: adjuntar Anexo)",
                          style: "itemsTable_c",
                        },
                      ],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_8() {
    return {
      table: {
        widths: ["*"],
        heights: [30],

        body: [
          [
            {
              border: [true, false, true, false],
              table: {
                body: [
                  [
                    {
                      text: [
                        { text: "BASE LEGAL: ", style: "itemsTable_c" },
                        {
                          text: this.datosPedido[0].base_legal,
                          style: "itemsTable",
                        },
                      ],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_8_1() {
    return {
      table: {
        widths: ["*"],
        heights: [20],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [
                    {
                      text: [
                        {
                          text: this.datosPedido[0].adicion_legal,
                          style: "itemsTable",
                        },
                      ],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_9() {
    return {
      table: {
        widths: [110, 10, 120, 10, 100, 10, 100, 10, "*"],
        heights: [9],

        body: [
          [
            {
              border: [true, false, false, true],
              table: {
                body: [
                  [
                    {
                      text: "INGRESO: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    }
                  ],
                  [
                    {
                      text: "NOMBRAMIENTO: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "ASCENSO: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "SUBROGACIÓN: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "ENCARGO: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "VACACIONES: ", style: "itemsTable",
                      margin: [25, 5, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            // CASILLAS DE VERIFICACION 1
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[0]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[1]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[2]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[3]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[4]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[5]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],

                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      text: "TRASLADO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "TRASPASO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "CAMBIO ADMINISTRATIVO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "INTERCAMBIO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "COMISIÓN DE SERVICIOS: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "LICENCIA: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            // CASILLAS DE VERIFICACION 2
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[6]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[7]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[8]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[9]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[10]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[11]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],

                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      text: "REVALORIZACIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "RECLASIFICACIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "UBICACIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "REINTEGRO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "REINSTITUCIONAL: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "RENUNCIA: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            // CASILLAS DE VERIFICACION 3
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[12]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[13]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[14]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[15]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[16]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [7],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[17]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],

                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      text: "SUPRESIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "DESTITUCIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "REMOCIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "JUBILACIÓN: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: "OTRO: ", style: "itemsTable",
                      margin: [20, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: this.tipoAccion[22], style: "itemsTable",
                      margin: [20, 0, 0, 0],
                    },
                  ]
                ],
              },
              layout: "noBorders",
            },
            //Casillas de verificacion 4
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[18]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[19]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[20]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [true, true, true, true],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[21]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],

                      table: {
                        widths: [6],
                        heights: [9],
                        body: [
                          [{ text: `${this.tipoAccion[24]}`, style: "itemsTable_e", alignment: 'center' },]
                        ]
                      },
                      layout: {
                        defaultBorder: true,
                        cellPadding: [0, 0, 0, 0],
                      },
                    },
                  ],


                ],
              },
              layout: "noBorders",
            },
            {
              border: [false, false, true, true],
              table: {
                body: [[]],
              },
              layout: "noBorders",
            }
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_10() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: [
                        { text: "SITUACIÓN ACTUAL", style: "itemsTable_c" },
                      ],
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "PROCESO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, 0, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [15, 0, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.proceso_padre_a,
                                      style: "itemsTable",
                                      color: this.texto_color_proceso_actual,
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "-----------",
                                          color: "white",
                                          style: "itemsTable",
                                        },
                                      ],
                                    },
                                  ],
                                  [
                                    {
                                      text: [
                                        {
                                          text: "SUBPROCESO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -25, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],

                              table: {
                                body: [
                                  [
                                    {
                                      text: this.nombre_procesos_a,
                                      style: "itemsTable",
                                      margin: [0, -30, 0, 0],
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "PUESTO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [19, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.empleado_1[0].cargo.toUpperCase(),
                                      style: "itemsTable",
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "LUGAR DE TRABAJO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [0, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.empresa[0].nombre.toUpperCase(),
                                      style: "itemsTable",
                                    },
                                  ],
                                  [
                                    {
                                      text: "--------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "REMUNERACIÓN MENSUAL:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [0, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.empleado_1[0].sueldo,
                                      style: "itemsTable",
                                    },
                                  ],
                                  [
                                    {
                                      text: "---------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      text: [
                        {
                          text:
                            "PARTIDA PRESUPUESTARIA: " +
                            "\n" +
                            this.datosPedido[0].num_partida,
                          style: "itemsTable",
                        },
                      ],
                      margin: [20, -12, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [true, false, true, true],
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      text: [
                        { text: "SITUACIÓN PROPUESTA", style: "itemsTable_c" },
                      ],
                      alignment: 'center',
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "PROCESO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, 0, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [15, 0, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.proceso_padre_p,
                                      style: "itemsTable",
                                      color: this.texto_color_proceso,
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "-----------",
                                          color: "white",
                                          style: "itemsTable",
                                        },
                                      ],
                                    },
                                  ],
                                  [
                                    {
                                      text: [
                                        {
                                          text: "SUBPROCESO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -25, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],

                              table: {
                                body: [
                                  [
                                    {
                                      text: "\n" + this.nombre_procesos_p,
                                      style: "itemsTable",
                                      margin: [0, -30, 0, 0],
                                      color: this.texto_color_proceso,
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "PUESTO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [19, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.cargo_propuesto,
                                      style: "itemsTable",
                                      color: this.texto_color_cargo,
                                    },
                                  ],
                                  [
                                    {
                                      text: "-------------------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "LUGAR DE TRABAJO:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [0, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.empresa[0].nombre.toUpperCase(),
                                      style: "itemsTable",
                                      color: this.texto_color_empresa,
                                    },
                                  ],
                                  [
                                    {
                                      text: "--------------------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      table: {
                        widths: ["auto", "*"],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: "REMUNERACIÓN MENSUAL:",
                                          style: "itemsTable",
                                        },
                                      ],
                                      margin: [15, -18, 0, 0],
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                            {
                              border: [false, false, false, false],
                              margin: [0, -18, 0, 0],
                              table: {
                                body: [
                                  [
                                    {
                                      text: this.datosPedido[0].salario_propuesto,
                                      style: "itemsTable",
                                      color: this.texto_color_salario,
                                    },
                                  ],
                                  [
                                    {
                                      text: "---------------------------------------------------------------",
                                      color: "white",
                                      style: "itemsTable",
                                    },
                                  ],
                                ],
                              },
                              layout: "lightHorizontalLines",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                  [
                    {
                      text: [
                        {
                          text:
                            "PARTIDA PRESUPUESTARIA: " +
                            "\n" +
                            this.datosPedido[0].num_partida_propuesta,
                          style: "itemsTable",
                        },
                      ],
                      margin: [20, -12, 0, 0],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_11_1() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: "ACTA FINAL DEL CONCURSO", style: "itemsTable_c" },
              ],
            },
            {
              border: [false, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: "PROCESO DE RECURSOS HUMANOS", style: "itemsTable_c" },
              ],
            },
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_11_2() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [15],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["auto", "*", "auto", "*"],
                heights: [20],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [{ text: "No.", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: this.datosPedido[0].act_final_concurso,
                              color: "black",
                              style: "itemsTable",
                            },
                          ],
                          [
                            {
                              text: "-------------------------------",
                              color: "white",
                              style: "itemsTable",
                            },
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, 0, 0, 0],
                      text: [{ text: "FECHA:", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, true, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: moment(this.datosPedido[0].fec_act_final_concurso).format(
                                "DD MMMM YYYY"
                              ),
                              color: "black",
                              style: "itemsTable",
                            },
                          ],
                          [
                            {
                              text: "------------------------------",
                              color: "white",
                              style: "itemsTable",
                            },
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [true, false, true, true],
              table: {
                widths: ["auto", "*"],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [{ text: "f.", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -8, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: "------------------------------------------------------------------------",
                              color: "white",
                            },
                          ],
                          [
                            {
                              text:
                                this.datosPedido[0].abrev_empl_uno.toUpperCase() +
                                " " +
                                this.empleado_2[0].nombre.toUpperCase() +
                                " " +
                                this.empleado_2[0].apellido.toUpperCase() +
                                "\n" +
                                this.empleado_2[0].cargo.toUpperCase() +
                                "\n" +
                                this.empleado_2[0].departamento.toUpperCase(),
                              style: "itemsTable",
                              alignment: "center",
                            },
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_12() {
    return {
      table: {
        widths: ["*"],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [
                    {
                      text: [
                        {
                          text: "DIOS, PATRIA Y LIBERTAD",
                          style: "itemsTable_c",
                        },
                      ],
                      margin: [235, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      table: {
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              table: {
                                widths: ["auto", "*"],
                                body: [
                                  [
                                    {
                                      border: [false, false, false, false],
                                      margin: [150, -5, 0, 0],
                                      text: [
                                        { text: "f.", style: "itemsTable" },
                                      ],
                                    },
                                    {
                                      border: [false, false, false, false],
                                      margin: [0, -10, 0, 0],
                                      table: {
                                        body: [
                                          [
                                            {
                                              text: "------------------------------------------------------------------------",
                                              color: "white",
                                            },
                                          ],
                                          [
                                            {
                                              text:
                                                this.datosPedido[0].abrev_empl_dos.toUpperCase() +
                                                " " +
                                                this.empleado_3[0].nombre.toUpperCase() +
                                                " " +
                                                this.empleado_3[0].apellido.toUpperCase() +
                                                "\n" +
                                                this.empleado_3[0].cargo.toUpperCase() +
                                                "\n" +
                                                this.empleado_3[0].departamento.toUpperCase(),
                                              style: "itemsTable",
                                              alignment: "center",
                                            },
                                          ],
                                        ],
                                      },
                                      layout: "lightHorizontalLines",
                                    },
                                  ],
                                ],
                              },
                              layout: "noBorders",
                            },
                          ],
                        ],
                      },
                      layout: {
                        defaultBorder: false,
                      },
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja1_Parte_13_1() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [90, 0, 0, 0],
              text: [{ text: "RECURSOS HUMANOS", style: "itemsTable_c" }],
            },
            {
              border: [false, false, true, false],
              margin: [90, 0, 0, 0],
              text: [{ text: "REGISTRO Y CONTROL", style: "itemsTable_c" }],
            },
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_13_2() {
    return {
      table: {
        widths: ["*", "*"],
        heights: [15],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ["auto", "*", "auto", "*"],
                heights: [20],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [{ text: "No.", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: this.datosPedido[0].identi_accion_p,
                              style: "itemsTable",
                            },
                          ],
                          [
                            {
                              text: "-------------------------------",
                              color: "white",
                              style: "itemsTable",
                            },
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, 0, 0, 0],
                      text: [{ text: "FECHA:", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, true, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: moment(
                                this.datosPedido[0].fec_creacion
                              ).format("DD MMMM YYYY"),
                              style: "itemsTable",
                            },
                          ],
                          [
                            {
                              text: "------------------------------",
                              color: "white",
                              style: "itemsTable",
                            },
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
            {
              border: [true, false, true, true],
              table: {
                widths: ["auto", "*"],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [45, -5, 0, 0],
                      text: [{ text: "f.", style: "itemsTable" }],
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -8, 0, 0],
                      table: {
                        body: [
                          [
                            {
                              text: "---------------------------------------------------------------------------------------",
                              color: "white",
                              style: "itemsTable",
                            },
                          ],
                          [
                            {
                              text: `${this.empleado_4[0].apellido.toUpperCase()} ${this.empleado_4[0].nombre.toUpperCase()}
                                    RESPONSABLE DEL REGISTRO`,
                              style: "itemsTable",
                              alignment: "center",
                            }
                          ],
                        ],
                      },
                      layout: "lightHorizontalLines",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_1() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [75.5],
        body: [
          [
            {
              border: [true, true, false, true],
              margin: [19, 20, 0, 0],
              text: [
                { text: "CAUCIÓN REGISTRADA CON No.", style: "itemsTable" },
              ],
            },
            {
              border: [false, true, false, true],
              margin: [12, 15, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, true, false, true],
              margin: [19, 20, 0, 0],
              text: [{ text: "FECHA:", style: "itemsTable" }],
            },
            {
              border: [false, true, true, true],
              margin: [12, 15, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_2() {
    return {
      table: {
        widths: [565.28],
        heights: [45.3],
        body: [
          [
            {
              border: [true, false, true, true],
              text: "",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_3_1() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, 30, 0, 0],
              text: [{ text: "LA PERSONA REEMPLAZA A:", style: "itemsTable" }],
            },
            {
              border: [false, false, false, false],
              margin: [8, 25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: this.datosPedido[0].nombre_reemp.toUpperCase(),
                      color: "black",
                      style: "itemsTable"
                    },
                  ],
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, false],
              margin: [0, 30, 0, 0],
              text: [{ text: "EN EL PUESTO DE:", style: "itemsTable" }],
            },
            {
              border: [false, false, true, false],
              margin: [8, 25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: this.datosPedido[0].puesto_reemp.toUpperCase(),
                      color: "black",
                      style: "itemsTable"
                    },
                  ],
                  [
                    {
                      text: "--------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_3_2() {
    return {
      table: {
        widths: ["auto", "*"],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -15, 0, 0],
              text: [
                { text: "QUIEN CESO EN FUNCIONES POR:", style: "itemsTable" },
              ],
            },
            {
              border: [false, false, true, false],
              margin: [0, -21, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "-----------------------------------------------------------------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "-----------------------------------------------------------------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_3_3() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -35, 0, 0],
              text: [
                {
                  text: "ACCIÓN DE PERSONAL REGISTRADA CON No.",
                  style: "itemsTable",
                },
              ],
            },
            {
              border: [false, false, false, false],
              margin: [0, -40, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: this.datosPedido[0].num_accion_reemp,
                      color: "black",
                      style: "itemsTable"
                    },
                  ],
                  [
                    {
                      text: "----------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, false],
              margin: [0, -35, 0, 0],
              text: [{ text: "FECHA:", style: "itemsTable" }],
            },
            {
              border: [false, false, true, false],
              margin: [0, -40, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: moment(
                        this.datosPedido[0].primera_fecha_reemp
                      ).format("DD MMMM YYYY"),
                      color: "black",
                      style: "itemsTable"
                    },
                  ],
                  [
                    {
                      text: "-------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_3_4() {
    return {
      table: {
        widths: ["auto", "*"],
        heights: [60.8],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -15, 0, 0],
              text: [
                {
                  text: "AFILIACIÓN AL COLEGIO DE PROFESIONALES DE:",
                  style: "itemsTable",
                },
              ],
            },
            {
              border: [false, false, true, false],
              margin: [0, -21, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "-------------------------------------------------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "-------------------------------------------------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_3_5() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [50.8],
        body: [
          [
            {
              border: [true, false, false, true],
              margin: [19, -5, 0, 0],
              text: [{ text: "No.", style: "itemsTable" }],
            },
            {
              border: [false, false, false, true],
              margin: [12, -12, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, true],
              margin: [19, -5, 0, 0],
              text: [{ text: "FECHA:", style: "itemsTable" }],
            },
            {
              border: [false, false, true, true],
              margin: [12, -12, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_1() {
    return {
      table: {
        widths: ["*"],
        heights: [40],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [19, 30, 0, 0],
              text: [{ text: "POSESIÓN DEL CARGO", style: "itemsTable" }],
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_2() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, 30, 0, 0],
              text: [{ text: "YO", style: "itemsTable" }],
            },
            {
              border: [false, false, false, false],
              margin: [8, 25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: `${this.empleado_1[0].apellido.toUpperCase()} ${this.empleado_1[0].nombre.toUpperCase()}`,
                      color: "black",
                      style: "itemsTable",
                    },
                  ],
                  [
                    {
                      text: "------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, false],
              margin: [0, 30, 0, 0],
              text: [
                { text: "CON CÉDULA DE CIUDADANÍA No.", style: "itemsTable" },
              ],
            },
            {
              border: [false, false, true, false],
              margin: [8, 25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: this.empleado_1[0].cedula.toUpperCase(),
                      color: "black",
                      style: "itemsTable",
                    },
                  ],
                  [
                    {
                      text: "------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  PresentarHoja2_Parte_4_3() {
    return {
      table: {
        widths: ["*"],
        heights: [40],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [19, -12, 0, 0],
              text: [
                {
                  text: "JURO LEALTAD AL ESTADO ECUATORIANO.",
                  style: "itemsTable",
                },
              ],
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_4() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [40],
        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -20, 0, 0],
              text: [{ text: "LUGAR.", style: "itemsTable" }],
            },
            {
              border: [false, false, false, false],
              margin: [12, -25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, false],
              margin: [19, -20, 0, 0],
              text: [{ text: "-----", style: "itemsTable", color: "white" }],
            },
            {
              border: [false, false, true, false],
              margin: [12, -25, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_5() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [40],
        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -30, 0, 0],
              text: [{ text: "FECHA.", style: "itemsTable" }],
            },
            {
              border: [false, false, false, false],
              margin: [12, -36, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "-----------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, false],
              margin: [19, -30, 0, 0],
              text: [{ text: "-----", style: "itemsTable", color: "white" }],
            },
            {
              border: [false, false, true, false],
              margin: [12, -36, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "------------------------------------------------------------",
                      color: "white",
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_6() {
    return {
      table: {
        widths: ["auto", "*", "auto", "*"],
        heights: [86.3],

        body: [
          [
            {
              border: [true, false, false, true],
              margin: [70, 30, 0, 0],
              text: [{ text: "f.", style: "itemsTable" }],
            },
            {
              border: [false, false, false, true],
              margin: [0, 18, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "Funcionario",
                      style: "itemsTable",
                      alignment: "center",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, true],
              margin: [0, 30, 0, 0],
              text: [{ text: "f.", style: "itemsTable" }],
            },
            {
              border: [false, false, true, true],
              margin: [0, 18, 0, 0],
              table: {
                body: [
                  [
                    {
                      text: "------------------------------------------------",
                      color: "white",
                    },
                  ],
                  [
                    {
                      text: "Responsable de Recursos Humanos",
                      style: "itemsTable",
                      alignment: "center",
                    },
                  ],
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      },
    };
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS XLSX INDIVIDUAL                   ** **
   ** ************************************************************************************************** **/

  generarExcel() {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([]);

    const drawing = {
      image: {
        base64: this.logo,
      },
      type: 'picture',
      position: {
        col: 2, // Columna C
        row: 1, // Fila 2
      },
    };


    //ESTABLECER TAMAÑO DE LAS COLUMNAS
    const columnas = [
      { width: 5 },
      { width: 3 },
      { width: 17 },
      { width: 3 },
      { width: 3 },
      { width: 24 },
      { width: 3 },
      { width: 3 },
      { width: 17 },
      { width: 3 },
      { width: 3 },
      { width: 12 },
      { width: 3 },
      { width: 3 },
      { width: 18 },
      { width: 3 },
    ];
    worksheet['!cols'] = columnas;

    // DEFINE LOS RANGOS DE LAS CELDAS A UNIR
    const mergeRange1 = 'C2:I4';
    const mergeRange2 = 'K2:P2';
    const mergeRange3 = 'N3:O3';
    const mergeRange4 = 'N4:O4';
    const mergeRange5 = 'J7:L7';
    const mergeRange6 = 'C9:H9';
    const mergeRange7 = 'C10:H10';
    const mergeRange8 = 'I9:O9';
    const mergeRange9 = 'I10:O10';
    const mergeRange10 = 'C11:F11';
    const mergeRange11 = 'C12:F12';
    const mergeRange12 = 'G11:K11';
    const mergeRange13 = 'G12:K12';
    const mergeRange14 = 'L11:O11';
    const mergeRange15 = 'L12:O12';
    const mergeRange16 = 'C13:O13';
    const mergeRange17 = 'D14:O14';
    const mergeRange18 = 'C15:O15';
    const mergeRange19 = 'C30:H30';
    const mergeRange20 = 'I30:O30';
    const mergeRange21 = 'C32:E32';
    const mergeRange22 = 'F32:G32';
    const mergeRange23 = 'C34:E34';
    const mergeRange24 = 'F34:G34';
    const mergeRange25 = 'C36:E36';
    const mergeRange26 = 'F36:G36';
    const mergeRange27 = 'C38:E38';
    const mergeRange28 = 'F38:G38';
    const mergeRange29 = 'C40:E40';
    const mergeRange30 = 'F40:G40';
    const mergeRange31 = 'C42:E42';
    const mergeRange32 = 'F42:G42';
    const mergeRange33 = 'I32:K32';
    const mergeRange34 = 'L32:O32';
    const mergeRange35 = 'I34:K34';
    const mergeRange36 = 'L34:O34';
    const mergeRange37 = 'I36:K36';
    const mergeRange38 = 'L36:O36';
    const mergeRange39 = 'I38:K38';
    const mergeRange40 = 'L38:O38';
    const mergeRange41 = 'I40:K40';
    const mergeRange42 = 'L40:O40';
    const mergeRange43 = 'I42:K42';
    const mergeRange44 = 'L42:O42';
    const mergeRange45 = 'C44:H49';
    const mergeRange46 = 'I44:O49';
    const mergeRange47 = 'C50:O56';
    const mergeRange48 = 'C57:H62';
    const mergeRange49 = 'I57:O62';
    const mergeRange50 = 'C63:O66';
    const mergeRange51 = 'C67:O69';
    const mergeRange52 = 'C70:O89';
    const mergeRange53 = 'C90:O106';
    const mergeRange54 = 'C107:H112';
    const mergeRange55 = 'I107:O112';

    // UNE LAS CELDAS
    const merges = [
      { s: xlsx.utils.decode_range(mergeRange1).s, e: xlsx.utils.decode_range(mergeRange1).e },
      { s: xlsx.utils.decode_range(mergeRange2).s, e: xlsx.utils.decode_range(mergeRange2).e },
      { s: xlsx.utils.decode_range(mergeRange3).s, e: xlsx.utils.decode_range(mergeRange3).e },
      { s: xlsx.utils.decode_range(mergeRange4).s, e: xlsx.utils.decode_range(mergeRange4).e },
      { s: xlsx.utils.decode_range(mergeRange5).s, e: xlsx.utils.decode_range(mergeRange5).e },
      { s: xlsx.utils.decode_range(mergeRange6).s, e: xlsx.utils.decode_range(mergeRange6).e },
      { s: xlsx.utils.decode_range(mergeRange7).s, e: xlsx.utils.decode_range(mergeRange7).e },
      { s: xlsx.utils.decode_range(mergeRange8).s, e: xlsx.utils.decode_range(mergeRange8).e },
      { s: xlsx.utils.decode_range(mergeRange9).s, e: xlsx.utils.decode_range(mergeRange9).e },
      { s: xlsx.utils.decode_range(mergeRange10).s, e: xlsx.utils.decode_range(mergeRange10).e },
      { s: xlsx.utils.decode_range(mergeRange11).s, e: xlsx.utils.decode_range(mergeRange11).e },
      { s: xlsx.utils.decode_range(mergeRange12).s, e: xlsx.utils.decode_range(mergeRange12).e },
      { s: xlsx.utils.decode_range(mergeRange13).s, e: xlsx.utils.decode_range(mergeRange13).e },
      { s: xlsx.utils.decode_range(mergeRange14).s, e: xlsx.utils.decode_range(mergeRange14).e },
      { s: xlsx.utils.decode_range(mergeRange15).s, e: xlsx.utils.decode_range(mergeRange15).e },
      { s: xlsx.utils.decode_range(mergeRange16).s, e: xlsx.utils.decode_range(mergeRange16).e },
      { s: xlsx.utils.decode_range(mergeRange17).s, e: xlsx.utils.decode_range(mergeRange17).e },
      { s: xlsx.utils.decode_range(mergeRange18).s, e: xlsx.utils.decode_range(mergeRange18).e },
      { s: xlsx.utils.decode_range(mergeRange19).s, e: xlsx.utils.decode_range(mergeRange19).e },
      { s: xlsx.utils.decode_range(mergeRange20).s, e: xlsx.utils.decode_range(mergeRange20).e },
      { s: xlsx.utils.decode_range(mergeRange21).s, e: xlsx.utils.decode_range(mergeRange21).e },
      { s: xlsx.utils.decode_range(mergeRange22).s, e: xlsx.utils.decode_range(mergeRange22).e },
      { s: xlsx.utils.decode_range(mergeRange23).s, e: xlsx.utils.decode_range(mergeRange23).e },
      { s: xlsx.utils.decode_range(mergeRange24).s, e: xlsx.utils.decode_range(mergeRange24).e },
      { s: xlsx.utils.decode_range(mergeRange25).s, e: xlsx.utils.decode_range(mergeRange25).e },
      { s: xlsx.utils.decode_range(mergeRange26).s, e: xlsx.utils.decode_range(mergeRange26).e },
      { s: xlsx.utils.decode_range(mergeRange27).s, e: xlsx.utils.decode_range(mergeRange27).e },
      { s: xlsx.utils.decode_range(mergeRange28).s, e: xlsx.utils.decode_range(mergeRange28).e },
      { s: xlsx.utils.decode_range(mergeRange29).s, e: xlsx.utils.decode_range(mergeRange29).e },
      { s: xlsx.utils.decode_range(mergeRange30).s, e: xlsx.utils.decode_range(mergeRange30).e },
      { s: xlsx.utils.decode_range(mergeRange31).s, e: xlsx.utils.decode_range(mergeRange31).e },
      { s: xlsx.utils.decode_range(mergeRange32).s, e: xlsx.utils.decode_range(mergeRange32).e },
      { s: xlsx.utils.decode_range(mergeRange33).s, e: xlsx.utils.decode_range(mergeRange33).e },
      { s: xlsx.utils.decode_range(mergeRange34).s, e: xlsx.utils.decode_range(mergeRange34).e },
      { s: xlsx.utils.decode_range(mergeRange35).s, e: xlsx.utils.decode_range(mergeRange35).e },
      { s: xlsx.utils.decode_range(mergeRange36).s, e: xlsx.utils.decode_range(mergeRange36).e },
      { s: xlsx.utils.decode_range(mergeRange37).s, e: xlsx.utils.decode_range(mergeRange37).e },
      { s: xlsx.utils.decode_range(mergeRange38).s, e: xlsx.utils.decode_range(mergeRange38).e },
      { s: xlsx.utils.decode_range(mergeRange39).s, e: xlsx.utils.decode_range(mergeRange39).e },
      { s: xlsx.utils.decode_range(mergeRange40).s, e: xlsx.utils.decode_range(mergeRange40).e },
      { s: xlsx.utils.decode_range(mergeRange41).s, e: xlsx.utils.decode_range(mergeRange41).e },
      { s: xlsx.utils.decode_range(mergeRange42).s, e: xlsx.utils.decode_range(mergeRange42).e },
      { s: xlsx.utils.decode_range(mergeRange43).s, e: xlsx.utils.decode_range(mergeRange43).e },
      { s: xlsx.utils.decode_range(mergeRange44).s, e: xlsx.utils.decode_range(mergeRange44).e },
      { s: xlsx.utils.decode_range(mergeRange45).s, e: xlsx.utils.decode_range(mergeRange45).e },
      { s: xlsx.utils.decode_range(mergeRange46).s, e: xlsx.utils.decode_range(mergeRange46).e },
      { s: xlsx.utils.decode_range(mergeRange47).s, e: xlsx.utils.decode_range(mergeRange47).e },
      { s: xlsx.utils.decode_range(mergeRange48).s, e: xlsx.utils.decode_range(mergeRange48).e },
      { s: xlsx.utils.decode_range(mergeRange49).s, e: xlsx.utils.decode_range(mergeRange49).e },
      { s: xlsx.utils.decode_range(mergeRange50).s, e: xlsx.utils.decode_range(mergeRange50).e },
      { s: xlsx.utils.decode_range(mergeRange51).s, e: xlsx.utils.decode_range(mergeRange51).e },
      { s: xlsx.utils.decode_range(mergeRange52).s, e: xlsx.utils.decode_range(mergeRange52).e },
      { s: xlsx.utils.decode_range(mergeRange53).s, e: xlsx.utils.decode_range(mergeRange53).e },
      { s: xlsx.utils.decode_range(mergeRange54).s, e: xlsx.utils.decode_range(mergeRange54).e },
      { s: xlsx.utils.decode_range(mergeRange55).s, e: xlsx.utils.decode_range(mergeRange55).e },
    ];

    worksheet['!merges'] = merges;


    // VARIABLES AUXILIARES PARA LOS DATOS
    let fecha1 = moment(this.datosPedido[0].fec_creacion).format(
      "DD MMMM YYYY");
    let fecha2 = moment(this.datosPedido[0].fec_rige_desde).format(
      "dddd DD MMMM YYYY");
    let fecha3 = moment(this.datosPedido[0].fec_act_final_concurso).format("DD MMMM YYYY");
    let fecha4 = moment(this.datosPedido[0].fec_creacion).format("DD MMMM YYYY");
    let fecha5 = moment(this.datosPedido[0].primera_fecha_reemp).format("DD MMMM YYYY");
    let nombreEmpleado = this.empleado_1[0].nombre.toUpperCase();
    let apellidoEmpleado = this.empleado_1[0].apellido.toUpperCase();

    // AGREGA LOS DATOS A LAS CELDAS CORRESPONDIENTES
    worksheet['!drawing'] = [drawing];
    xlsx.utils.sheet_add_aoa(worksheet, [['ACCIÓN DE PERSONAL']], { origin: 'K2' });
    xlsx.utils.sheet_add_aoa(worksheet, [['N°']], { origin: 'L3' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].identi_accion_p]], { origin: 'N3' });
    xlsx.utils.sheet_add_aoa(worksheet, [['FECHA:']], { origin: 'L4' });
    xlsx.utils.sheet_add_aoa(worksheet, [[fecha1]], { origin: 'N4' });
    xlsx.utils.sheet_add_aoa(worksheet, [['DECRETO:']], { origin: 'C5' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[0]]], { origin: 'D5' });
    xlsx.utils.sheet_add_aoa(worksheet, [['ACUERDO:']], { origin: 'F5' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[1]]], { origin: 'G5' });
    xlsx.utils.sheet_add_aoa(worksheet, [['RESOLUCIÓN:']], { origin: 'I5' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[2]]], { origin: 'J5' });
    xlsx.utils.sheet_add_aoa(worksheet, [['OTRO:']], { origin: 'L5' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[3]]], { origin: 'O5' });
    xlsx.utils.sheet_add_aoa(worksheet, [['N°']], { origin: 'E7' });
    xlsx.utils.sheet_add_aoa(worksheet, [['FECHA:']], { origin: 'I7' });
    xlsx.utils.sheet_add_aoa(worksheet, [[apellidoEmpleado]], { origin: 'C9' });
    xlsx.utils.sheet_add_aoa(worksheet, [['APELLIDO']], { origin: 'C10' });
    xlsx.utils.sheet_add_aoa(worksheet, [[nombreEmpleado]], { origin: 'I9' });
    xlsx.utils.sheet_add_aoa(worksheet, [['NOMBRE']], { origin: 'I10' });
    xlsx.utils.sheet_add_aoa(worksheet, [['N°. de cédula de ciudadanía']], { origin: 'C11' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empleado_1[0].cedula]], { origin: 'C12' });
    xlsx.utils.sheet_add_aoa(worksheet, [['N°. de afiliación IESS']], { origin: 'G11' });
    xlsx.utils.sheet_add_aoa(worksheet, [['Rige a partir de:']], { origin: 'L11' });
    xlsx.utils.sheet_add_aoa(worksheet, [[fecha2]], { origin: 'L12' });
    xlsx.utils.sheet_add_aoa(worksheet, [['EXPLICACIÓN:']], { origin: 'C13' });
    xlsx.utils.sheet_add_aoa(worksheet, [['BASE LEGAL:']], { origin: 'C14' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].base_legal]], { origin: 'D14' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].adicion_legal]], { origin: 'C15' });
    xlsx.utils.sheet_add_aoa(worksheet, [['INGRESO:']], { origin: 'C18' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[0]]], { origin: 'D18' });
    xlsx.utils.sheet_add_aoa(worksheet, [['NOMBRAMIENTO:']], { origin: 'C20' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[1]]], { origin: 'D20' });
    xlsx.utils.sheet_add_aoa(worksheet, [['ASCENSO:']], { origin: 'C22' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[2]]], { origin: 'D22' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SUBROGACIÓN:']], { origin: 'C24' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[3]]], { origin: 'D24' });
    xlsx.utils.sheet_add_aoa(worksheet, [['ENCARGO:']], { origin: 'C26' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[4]]], { origin: 'D26' });
    xlsx.utils.sheet_add_aoa(worksheet, [['VACACIONES:']], { origin: 'C28' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[5]]], { origin: 'D28' });
    xlsx.utils.sheet_add_aoa(worksheet, [['TRASLADO:']], { origin: 'F18' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[6]]], { origin: 'G18' });
    xlsx.utils.sheet_add_aoa(worksheet, [['TRASPASO:']], { origin: 'F20' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[7]]], { origin: 'G20' });
    xlsx.utils.sheet_add_aoa(worksheet, [['CAMBIO ADMINISTRATIVO:']], { origin: 'F22' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[8]]], { origin: 'G22' });
    xlsx.utils.sheet_add_aoa(worksheet, [['INTERCAMBIO:']], { origin: 'F24' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[9]]], { origin: 'G24' });
    xlsx.utils.sheet_add_aoa(worksheet, [['COMISIÓN DE SERVICIOS:']], { origin: 'F26' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[10]]], { origin: 'G26' });
    xlsx.utils.sheet_add_aoa(worksheet, [['LICENCIA:']], { origin: 'F28' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[11]]], { origin: 'G28' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REVALORIZACIÓN:']], { origin: 'I18' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[12]]], { origin: 'J18' });
    xlsx.utils.sheet_add_aoa(worksheet, [['RECLASIFICACIÓN:']], { origin: 'I20' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[13]]], { origin: 'J20' });
    xlsx.utils.sheet_add_aoa(worksheet, [['UBICACIÓN:']], { origin: 'I22' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[14]]], { origin: 'J22' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REINTREGO:']], { origin: 'I24' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[15]]], { origin: 'J24' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REINSTITUCIONAL:']], { origin: 'I26' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[16]]], { origin: 'J26' });
    xlsx.utils.sheet_add_aoa(worksheet, [['RENUNCIA:']], { origin: 'I28' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[17]]], { origin: 'J28' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SUPRESION:']], { origin: 'L18' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[18]]], { origin: 'M18' });
    xlsx.utils.sheet_add_aoa(worksheet, [['DESTITUCION:']], { origin: 'L20' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[19]]], { origin: 'M20' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REMOCION:']], { origin: 'L22' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[20]]], { origin: 'M22' });
    xlsx.utils.sheet_add_aoa(worksheet, [['JUBILACION:']], { origin: 'L24' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[21]]], { origin: 'M24' });
    xlsx.utils.sheet_add_aoa(worksheet, [['OTRO:']], { origin: 'L26' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[22]]], { origin: 'O26' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SITUACIÓN ACTUAL']], { origin: 'C30' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SITUACIÓN PROPUESTA']], { origin: 'I30' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PROCESO:']], { origin: 'C32' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.proceso_padre_a]], { origin: 'F32' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SUBPROCESO:']], { origin: 'C34' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.nombre_procesos_a]], { origin: 'F34' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PUESTO:']], { origin: 'C36' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empleado_1[0].cargo.toUpperCase()]], { origin: 'F36' });
    xlsx.utils.sheet_add_aoa(worksheet, [['LUGAR DE TRABAJO:']], { origin: 'C38' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empresa[0].nombre.toUpperCase()]], { origin: 'F38' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REMUNERACIÓN MENSUAL:']], { origin: 'C40' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empleado_1[0].sueldo]], { origin: 'F40' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PARTIDA PRESUPUESTARIA:']], { origin: 'C42' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].num_partida]], { origin: 'F42' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PROCESO:']], { origin: 'I32' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.proceso_padre_p]], { origin: 'L32' });
    xlsx.utils.sheet_add_aoa(worksheet, [['SUBPROCESO:']], { origin: 'I34' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.nombre_procesos_p]], { origin: 'L34' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PUESTO:']], { origin: 'I36' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.cargo_propuesto.toUpperCase()]], { origin: 'L36' });
    xlsx.utils.sheet_add_aoa(worksheet, [['LUGAR DE TRABAJO:']], { origin: 'I38' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empresa[0].nombre.toUpperCase()]], { origin: 'L38' });
    xlsx.utils.sheet_add_aoa(worksheet, [['REMUNERACIÓN MENSUAL:']], { origin: 'I40' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].salario_propuesto]], { origin: 'L40' });
    xlsx.utils.sheet_add_aoa(worksheet, [['PARTIDA PRESUPUESTARIA:']], { origin: 'I42' });
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].num_partida_propuesta]], { origin: 'L42' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `ACTA FINAL DEL CONCURSO\n\n
        No. ${this.datosPedido[0].act_final_concurso}   Fecha: ${fecha3}\n\n\n
        `
      ]], { origin: 'C44' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `PROCESOS DE RECURSOS HUMANOS\n\n
        f. __________________________________________________\n
        ${this.datosPedido[0].abrev_empl_uno.toUpperCase()} ${this.empleado_2[0].nombre.toUpperCase()} ${this.empleado_2[0].apellido.toUpperCase()}\n
        ${this.empleado_2[0].cargo.toUpperCase()}\n
        ${this.empleado_2[0].departamento.toUpperCase()}
        `
      ]], { origin: 'I44' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `DIOS, PATRIA Y LIBERTAD\n\n
        f. _____________________________________________________\n
        ${this.datosPedido[0].abrev_empl_dos.toUpperCase()} ${this.empleado_3[0].nombre.toUpperCase()} ${this.empleado_3[0].apellido.toUpperCase()}\n
        ${this.empleado_3[0].cargo.toUpperCase()}\n
        ${this.empleado_3[0].departamento.toUpperCase()}
        `
      ]], { origin: 'C50' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `RECURSOS HUMANOS\n\n
        No. ${this.datosPedido[0].identi_accion_p}  Fecha: ${fecha4}\n\n\n
        `
      ]], { origin: 'C57' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `REGISTRO Y CONTROL\n\n
        f. __________________________________________________\n
        ${this.empleado_4[0].apellido.toUpperCase()} ${this.empleado_4[0].nombre.toUpperCase()}\n
        RESPONSABLE DEL REGISTRO
        `
      ]], { origin: 'I57' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `CAUCIÓN REGISTRADA CON No. __________________________________         FECHA:  ____________________________\n\n
        `
      ]], { origin: 'C63' });

    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `\n\n
        LA PERSONA REEMPLAZA A:  ${this.datosPedido[0].nombre_reemp.toUpperCase()}       EN EL PUESTO DE:  ${this.datosPedido[0].puesto_reemp.toUpperCase()}\n
        QUIEN CESE EN FUNCIONES POR:   ___________________________________________________________________________\n
        ACCIÓN DE PERSONAL REGISTRADA CON No.   ${this.datosPedido[0].num_accion_reemp}   FECHA:
        ${fecha5}\n\n\n\n\n
        FILIACIÓN AL COLEGIO DE PROFESIONALES DE:   _______________________________________________________________\n\n\n\n\n
        No. ____________________________________________                   FECHA:   _________________________________________\n\n\n\n
        `
      ]], { origin: 'C70' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `POSESIÓN DEL CARGO\n\n
        YO ${this.empleado_1[0].apellido.toUpperCase()} ${this.empleado_1[0].nombre.toUpperCase()}     CON CÉDULA DE CIUDADANÍA No. 
        ${this.empleado_1[0].cedula.toUpperCase()}\n
        JURO LEALTAD AL ESTADO ECUATORIANO.\n\n\n
        LUGAR:  ___________________________________\n\n
        FECHA:  ___________________________________\n\n\n\n\n\n
        `
      ]], { origin: 'C90' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `f. ______________________________________\n
        Funcionario\n\n 
        `
      ]], { origin: 'C107' });
    xlsx.utils.sheet_add_aoa(worksheet,
      [[
        `f. ______________________________________\n
        Responsable de Recursos Humanos\n\n
        `
      ]], { origin: 'I107' });
    // AGREGA LA HOJA DE TRABAJO AL LIBRO Y DESCARGA EL ARCHIVO
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Hoja 1');
    xlsx.writeFile(workbook, 'accionDePersonal.xlsx');

  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  /** ************************************************************************************************* **
   ** **        METODOS PARA GENERAR REPORTES DE LA LISTA DE PEDIDOS DE ACCIONES DE PERSONAL         ** **
   ** ************************************************************************************************* **/

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS PDF                               ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = "open") {
    const documentDefinition = this.GetDocumentDefinicion();
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

  GetDocumentDefinicion() {
    sessionStorage.setItem("Pedidos", this.listaPedidos);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: "landscape",
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
      // PIE DE PAGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        var f = moment();
        fecha = f.format("YYYY-MM-DD");
        hora = f.format("HH:mm:ss");
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
        { image: this.logo1, width: 150, margin: [10, -25, 0, 5] },
        {
          text: "Lista de pedidos de acciones de personal",
          bold: true,
          fontSize: 20,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFPedidos(),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10, alignment: "center" },
        itemsTableD: { fontSize: 10 },
      },
    };
  }

  PresentarDataPDFPedidos() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Código", style: "tableHeader" },
                { text: "Cédula", style: "tableHeader" },
                { text: "Empleado", style: "tableHeader" },
                { text: "Fecha de creación", style: "tableHeader" },
                { text: "Rige desde", style: "tableHeader" },
                { text: "Rige hasta", style: "tableHeader" },
                { text: "Número de partida", style: "tableHeader" },
              ],
              ...this.listaPedidos.map((obj) => {
                return [
                  { text: obj.id, style: "itemsTable" },
                  { text: obj.cedula, style: "itemsTable" },
                  {
                    text: obj.apellido + " " + obj.nombre,
                    style: "itemsTable",
                  },
                  { text: obj.fecha_creacion, style: "itemsTable" },
                  { text: obj.fecha_rige_desde, style: "itemsTable" },
                  { text: obj.fecha_rige_hasta, style: "itemsTable" },
                  { text: obj.numero_partida_empresa, style: "itemsTable" },
                ];
              }),
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

  /** ************************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                              ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.listaPedidos.map((obj) => {
        return {
          Codigo: obj.id,
          Cedula: obj.cedula,
          Empleado: obj.apellido + " " + obj.nombre,
          Fecha_creacion: obj.fecCreacion_,
          Rige_desde: obj.fecDesde_,
          Rige_hasta: obj.fecHasta_,
          Numero_partida: obj.num_partida,
        };
      })
    );
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaPedidos[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {
      // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 });
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, "ACCIONES DE PERSONAL");
    xlsx.writeFile(
      wb,
      "PedidosAccionesPersonalEXCEL" + new Date().getTime() + ".xlsx"
    );
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto;
    var arregloPedidos: any = [];
    this.listaPedidos.forEach((obj) => {
      objeto = {
        Pedidos: {
          "@id": obj.id,
          cedula: obj.cedula,
          empleado: obj.apellido + " " + obj.nombre,
          fecha_creacion: obj.fecCreacion_,
          rige_desde: obj.fecDesde_,
          rige_hasta: obj.fecHasta_,
          numero_partida: obj.num_partida,
        },
      };
      arregloPedidos.push(objeto);
    });

    this.restAccion.CrearXML(arregloPedidos).subscribe((res) => {
      this.data = res;
      this.urlxml =
        `${environment.url}/accionPersonal/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  /** ************************************************************************************************** **
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(
      this.listaPedidos.map((obj) => {
        return {
          Codigo: obj.id,
          Cedula: obj.cedula,
          Empleado: obj.apellido + " " + obj.nombre,
          Fecha_creacion: obj.fecCreacion_,
          Rige_desde: obj.fecDesde_,
          Rige_hasta: obj.fecHasta_,
          Numero_partida: obj.num_partida,
        };
      })
    );
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], {
      type: "text/csv;charset=utf-8;",
    });
    FileSaver.saveAs(
      data,
      "PedidosAccionesPersonalCSV" + new Date().getTime() + ".csv"
    );
  }
}
