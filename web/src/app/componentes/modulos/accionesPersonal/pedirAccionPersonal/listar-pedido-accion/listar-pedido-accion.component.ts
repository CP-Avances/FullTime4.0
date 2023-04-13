// IMPORTAR LIBRERIAS
import { Validators, FormControl } from "@angular/forms";
import { PageEvent } from "@angular/material/paginator";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// LIBRERÍA PARA FORMATO DE FECHAS
import * as moment from "moment";
moment.locale("es");

// LLAMADO DE SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { EmpleadoProcesosService } from "src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service";
import { EmplCargosService } from "src/app/servicios/empleado/empleadoCargo/empl-cargos.service";
import { AccionPersonalService } from "src/app/servicios/accionPersonal/accion-personal.service";
import { EmpresaService } from "src/app/servicios/catalogos/catEmpresa/empresa.service";
import { MainNavService } from "src/app/componentes/administracionGeneral/main-nav/main-nav.service";
import { ValidacionesService } from "src/app/servicios/validaciones/validaciones.service";
import { ParametrosService } from "src/app/servicios/parametrosGenerales/parametros.service";
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { text } from 'express';
import { Console } from "console";

@Component({
  selector: "app-listar-pedido-accion",
  templateUrl: "./listar-pedido-accion.component.html",
  styleUrls: ["./listar-pedido-accion.component.css"],
})
export class ListarPedidoAccionComponent implements OnInit {
  // ITEMS DE PAGINACIÓN DE LA TABLA
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
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS DEL EMPLEADO
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public restAccion: AccionPersonalService, // SERVICIO DATOS ACCIONES DE PERSONAL
    public restCargo: EmplCargosService, // SERVICIO DATOS DE CARGO
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private funciones: MainNavService,
    private validar: ValidacionesService,
    public parametro: ParametrosService
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }

  // EVENTO PARA MANEJAR LA PÁGINACIÓN
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

  FormatearDatos(lista: any, formato_fecha: string, formato_hora: string) {
    lista.forEach((data) => {
      data.fecCreacion_ = this.validar.FormatearFecha(
        data.fec_creacion,
        formato_fecha,
        this.validar.dia_abreviado
      );
      data.fecDesde_ = this.validar.FormatearFecha(
        data.fec_rige_desde,
        formato_fecha,
        this.validar.dia_abreviado
      );
      data.fecHasta_ =
        data.fec_rige_hasta !== null
          ? this.validar.FormatearFecha(
              data.fec_rige_hasta,
              formato_fecha,
              this.validar.dia_abreviado
            )
          : "";
      data.fechaActa_ =
        data.fec_act_final_concurso !== null
          ? this.validar.FormatearFecha(
              data.fec_act_final_concurso,
              formato_fecha,
              this.validar.dia_abreviado
            )
          : "";
      data.fechaReemp_ =
        data.primera_fecha_reemp !== null
          ? this.validar.FormatearFecha(
              data.primera_fecha_reemp,
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
  MostrarInformacion(id: number) {
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
      this.BuscarPedidoEmpleado(this.datosPedido);
      this.ObtenerDecreto();
      this.ObtenerTipoAccion();
    });
  }

  /** METODO PARA MOSTRAR DATOS DE LOS EMPLEADOS SELECCIONADOS EN EL PEDIDO */
  BuscarPedidoEmpleado(pedido: any) {
    this.restAccion
      .BuscarDatosPedidoEmpleados(pedido[0].id_empleado)
      .subscribe((datos1) => {
        this.empleado_1 = datos1;
        this.ListarProcesosEmpleado(pedido);
      });
  }

  /** METODO PARA MOSTRAR LA INFORMACIÓN DE LOS PROCESOS DEL EMPLEADO */
  ListarProcesosEmpleado(pedido: any) {
    this.restCargo.BuscarIDCargo(pedido[0].id_empleado).subscribe((datos) => {
      this.idCargo = datos;
      var contar = 0;
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        contar = contar + 1;
        this.BuscarProcesosCargo(this.idCargo, i, contar);
      }
    });
  }

  /** METODO PARA BUSCAR PROCESOS QUE TIENE EL EMPLEADO DE ACUERDO AL CARGO */
  BuscarProcesosCargo(id_cargo: any, valor: any, contar: any) {
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
                this.BusquedaInformacion();
              });
          }
        },
        (error) => {
          if (contar === this.idCargo.length) {
            if (this.empleadoProcesos.length === 0) {
              this.EscribirProcesosActuales_Vacios();
              this.BusquedaInformacion();
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

  /** METODO PARA BUSCAR INFORMACIÓN DE LOS EMPLEADOS RESPONSABLES / FIRMAS */
  BusquedaInformacion() {
    this.restAccion
      .BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].firma_empl_uno))
      .subscribe((data2) => {
        this.empleado_2 = data2;
        this.restAccion
          .BuscarDatosPedidoEmpleados(
            parseInt(this.datosPedido[0].firma_empl_dos)
          )
          .subscribe((data3) => {
            this.empleado_3 = data3;
            this.restAccion.BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].id_empl_responsable))
            .subscribe((data4)=>{
              this.empleado_4 = data4;
              this.VerificarDatos();
            });
          });
      });
  }

  /** METODO PARA VERIFICAR DATOS INGRESADO Y NO INGRESADO */
  VerificarDatos() {
    if (
      this.datosPedido[0].proceso_propuesto === null &&
      this.datosPedido[0].cargo_propuesto === null
    ) {
      this.DefinirColor(this.datosPedido, "");
      this.generarPdf("download");
    } else if (
      this.datosPedido[0].proceso_propuesto != null &&
      this.datosPedido[0].cargo_propuesto != null
    ) {
      this.restAccion
        .Buscarprocesos(this.datosPedido[0].proceso_propuesto)
        .subscribe((proc1) => {
          this.procesoPropuesto = proc1;
          this.EscribirProcesosPropuestos(this.procesoPropuesto);
          this.restAccion
            .ConsultarUnCargoPropuesto(this.datosPedido[0].cargo_propuesto)
            .subscribe((carg) => {
              this.DefinirColor(
                this.datosPedido,
                carg[0].descripcion.toUpperCase()
              );
              this.generarPdf("download");
            });
        });
    } else if (
      this.datosPedido[0].proceso_propuesto != null &&
      this.datosPedido[0].cargo_propuesto === null
    ) {
      this.restAccion
        .Buscarprocesos(this.datosPedido[0].proceso_propuesto)
        .subscribe((proc) => {
          this.procesoPropuesto = proc;
          this.EscribirProcesosPropuestos(this.procesoPropuesto);
          this.DefinirColor(this.datosPedido, "");
          this.generarPdf("download");
        });
    } else if (
      this.datosPedido[0].proceso_propuesto === null &&
      this.datosPedido[0].cargo_propuesto != null
    ) {
      this.restAccion
        .ConsultarUnCargoPropuesto(this.datosPedido[0].cargo_propuesto)
        .subscribe((carg) => {
          this.DefinirColor(
            this.datosPedido,
            carg[0].descripcion.toUpperCase()
          );
          this.generarPdf("download");
        });
    }
  }

  /** METODO PARA DEFINIR COLORES DE TEXTO / IMPRIMIR ESPACIOS */
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

  /** METODO PARA REALIZAR BUSQUEDA DE PROCESOS QUE TIENEN REGISTRADOS EL EMPLEADO */
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

  /** M+ETODO PARA IMPRIMIR ESPACIOS CUANDO EL EMPLEADO NO REGISTRA PROCESOS */
  texto_color_proceso_actual: string = "";
  EscribirProcesosActuales_Vacios() {
    this.proceso_padre_a = "";
    this.proceso_padre_a = "-------------";
    this.texto_color_proceso_actual = "white";
  }

  /** METODO PARA IMPRIMIR PROCESOS PROPUESTOS */
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

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF INDIVIDUAL
   * ****************************************************************************************************/

  generarPdf(action = "open") {
    const documentDefinition = this.getDocumentDefinicion();
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        this.generarExcel();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download();
        this.generarExcel();
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  getDocumentDefinicion() {
    return {
      // ENCABEZADO DE LA PÁGINA
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
      },
    };
  }

  //METODO PARA MOSTRAR EL TIPO DE DECRETO-ACUERDO-RESOLUCION
  ObtenerDecreto() {
    this.decreto = ["", "", "", ""];
    let decretoTexto: string = "";
    if (this.datosPedido[0].decre_acue_resol!==null) {
      try {
        this.restAccion
          .ConsultarUnDecreto(this.datosPedido[0].decre_acue_resol)
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
                break;
            }
          });
      } catch (error) {
        console.log(error);
      }
    }
  }

  //METODO PARA OBTENER MOSTRAR EL TIPO DE ACCION
  ObtenerTipoAccion(){
    let tipoAccion: string = this.datosPedido[0].tipo.toUpperCase();
    let cadena = this.RemoveAccents(tipoAccion);
    this.tipoAccion = ['','','','','','','','','','','','','','','','','','','','','','',''];
    let acciones: string[] = ['INGRESO','NOMBRAMIENTO','ASCENSO','SUBROGACION','ENCARGO:',
    'VACACIONES','TRASLADO','TRASPASO','CAMBIO ADMINISTRATIVO','INTERCAMBIO',
    'COMISION DE SERVICIOS','LICENCIA','REVALORIZACION','RECLASIFICACION','UBICACION',
    'REINTEGRO','REINSTITUCIONAL','RENUNCIA','SUPRESION','DESTITUCION','REMOCION','JUBILACION'];
    let indice = acciones.indexOf(cadena);
    if (indice!==-1) {
      this.tipoAccion[indice]='X';
    } else {
      this.tipoAccion[22]=tipoAccion;
    }
    console.log("Obtener tipo de accion")
    console.log(tipoAccion);
    console.log(cadena);
  }

  //Metodo para quitar las tildes
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
    console.log(this.decreto);
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
                    // {
                      // text: [
                        { text: "DECRETO: ", style: "itemsTable_c",
                          margin: [5,5,0,0]},
                        {
                          border: [true,true,true,true],
                          
                          table:{
                            widths: [9],
                            heights: [9],
                            body: [
                              [ {text: `${this.decreto[0]}`,style: "itemsTable_c",alignment: 'center',},]
                            ]
                          },
                          layout: {
                            defaultBorder: true,
                          },
                        },
                        {
                          text: "---------------------------",
                          color: "white",
                          style: "itemsTable",
                        },
                        { text: "ACUERDO: ", style: "itemsTable_c",
                          margin: [5,5,0,0]},
                        {
                          border: [true,true,true,true],
                          table:{
                            widths: [9],
                            heights: [9],
                            body: [
                              [ {text: `${this.decreto[1]}`,style: "itemsTable_c",alignment: 'center',},]
                            ]
                          },
                          layout: {
                            defaultBorder: true,
                          },
                        },
                        {
                          text: "---------------------------",
                          color: "white",
                          style: "itemsTable",
                        },
                        { text: "RESOLUCIÓN: ", style: "itemsTable_c",margin: [5,5,0,0]},
                        {
                          border: [true,true,true,true],
                          table:{
                            widths: [9],
                            heights: [9],
                            body: [
                              [ {text: `${this.decreto[2]}`,style: "itemsTable_c",alignment: 'center',},]
                            ]
                          },
                          layout: {
                            defaultBorder: true
                          },
                        },
                        {
                          text: "---------------------------",
                          color: "white",
                          style: "itemsTable",
                        },
                        { text: "OTRO: ", style: "itemsTable_c"},
                        {
                          border: [false,false,false,true],
                          table:{
                            heights: [9],
                            body: [
                              [{text: `${this.decreto[3]}`},],
                              // [{text: "---------------------", color: "white"}]
                            ]
                          },
                          layout: "lightHorizontalLines",
                        },
                      // ],
                      // margin: [10, 6, 0, 0],
                    // },
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
        widths: ["auto", "*", "auto", "*"],
        heights: [10],
        body: [
          [
            {
              border: [true, false, false, true],
              margin: [90, 4, 0, 0],
              text: [{ text: "No.", style: "itemsTable_c" }],
            },
            {
              border: [false, false, false, true],
              margin: [0, 0, 0, 0],
              table: {
                body: [
                  [{ text: "-------------------------------", color: "white" }],
                  [{ text: "-------------------------------", color: "white" }],
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              border: [false, false, false, true],
              margin: [0, 4, 0, 0],
              text: [{ text: "FECHA:", style: "itemsTable_c" }],
            },
            {
              border: [false, false, true, true],
              margin: [0, 0, 0, 0],
              table: {
                body: [
                  [{ text: "------------------------------", color: "white" }],
                  [{ text: "------------------------------", color: "white" }],
                ],
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
                body: [
                  [
                    {
                      text: this.empleado_1[0].apellido.toUpperCase(),
                      style: "itemsTable_c",
                      margin: [0, 6, 0, 0],
                      // alignment: 'center',
                    },
                  ],
                  [
                    {
                      text: "APELLIDO",
                      style: "itemsTable_c",
                      margin: [110, 0, 0, 0],
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
                      text: this.empleado_1[0].nombre.toUpperCase(),
                      style: "itemsTable_c",
                      margin: [0, 6, 0, 0],
                      // alignment: 'center',
                    },
                  ],
                  [
                    {
                      text: "NOMBRE",
                      style: "itemsTable_c",
                      margin: [110, 0, 0, 0],
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
                body: [
                  [
                    {
                      text: [
                        {
                          text: "No. de Cédula de Ciudadanía",
                          style: "itemsTable_c",
                        },
                        { text: "-----", color: "white", style: "itemsTable" },
                      ],
                      margin: [40, 0, 0, 0],
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
                      text: [
                        {
                          text: "No. de Afilicación IESS",
                          style: "itemsTable_c",
                        },
                        {
                          text: "--------",
                          color: "white",
                          style: "itemsTable",
                        },
                      ],
                      margin: [40, 0, 0, 0],
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
                      text: "Rige a partir de:",
                      style: "itemsTable_c",
                      margin: [40, 0, 0, 0],
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
                body: [
                  [
                    {
                      text: [
                        {
                          text: this.empleado_1[0].cedula,
                          style: "itemsTable_c",
                        },
                      ],
                      margin: [130, 0, 0, 0],
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
                body: [
                  [
                    {
                      text: moment(this.datosPedido[0].fec_rige_desde).format(
                        "dddd DD MMMM YYYY"
                      ),
                      style: "itemsTable_c",
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
        heights: [40],

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
        widths: ["*", "*", "*", "*"],
        heights: [10],

        body: [
          [
            {
              border: [true, false, false, true],
              table: {
                body: [
                  [
                    {
                      text: [{ text: "INGRESO: ", style: "itemsTable" }, {text:this.tipoAccion[0]}],
                      margin: [15, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "NOMBRAMIENTO: ", style: "itemsTable" }, {text:this.tipoAccion[1]}],
                      margin: [15, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "ASCENSO: ", style: "itemsTable" }, {text:this.tipoAccion[2]}],
                      margin: [15, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "SUBROGACIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[3]}],
                      margin: [15, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "ENCARGO: ", style: "itemsTable" }, {text:this.tipoAccion[4]}],
                      margin: [15, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "VACACIONES: ", style: "itemsTable" }, {text:this.tipoAccion[5]}],
                      margin: [15, 0, 0, 0],
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
                      text: [{ text: "TRASLADO: ", style: "itemsTable" }, {text:this.tipoAccion[6]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "TRASPASO: ", style: "itemsTable" }, {text:this.tipoAccion[7]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [
                        { text: "CAMBIO ADMINISTRATIVO: ", style: "itemsTable" }, {text:this.tipoAccion[8]},
                      ],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "INTERCAMBIO: ", style: "itemsTable" }, {text:this.tipoAccion[9]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [
                        { text: "COMISIÓN DE SERVICIOS: ", style: "itemsTable" }, {text:this.tipoAccion[10]},
                      ],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "LICENCIA: ", style: "itemsTable" }, {text:this.tipoAccion[11]}],
                      margin: [5, 0, 0, 0],
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
                      text: [{ text: "REVALORIZACIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[12]}],
                      margin: [10, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "RECLASIFICACIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[13]}],
                      margin: [10, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "UBICACIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[14]}],
                      margin: [10, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "REINTEGRO: ", style: "itemsTable" }, {text:this.tipoAccion[15]}],
                      margin: [10, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "REINSTITUCIONAL: ", style: "itemsTable" }, {text:this.tipoAccion[16]}],
                      margin: [10, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "RENUNCIA: ", style: "itemsTable" }, {text:this.tipoAccion[17]}],
                      margin: [10, 0, 0, 0],
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
                      text: [{ text: "SUPRESIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[18]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "DESTITUCIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[19]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "REMOCIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[20]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "JUBILACIÓN: ", style: "itemsTable" }, {text:this.tipoAccion[21]}],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                  [
                    {
                      text: [{ text: "OTRO: ", style: "itemsTable" }, {text:this.tipoAccion[22]}],
                      margin: [5, 0, 0, 0],
                      // table: {
                      //   widths: ["auto", "*"],
                      //   body: [
                      //     [
                      //       {
                      //         border: [false, false, false, false],
                      //         table: {
                      //           body: [
                      //             [
                      //               {
                      //                 text: [
                      //                   { text: "OTRO: ", style: "itemsTable" },
                      //                 ],
                      //               },
                      //             ],
                      //           ],
                      //         },
                      //         layout: "noBorders",
                      //       },
                      //       {
                      //         border: [false, false, false, false],
                      //         table: {
                      //           margin: [10, -20, 0, 0],
                      //           body: [
                      //             [
                      //               {
                      //                 text: this.tipoAccion[22],
                      //                 color: "black",
                      //                 style: "itemsTable",
                      //               },
                      //             ],
                      //             [
                      //               {
                      //                 text: "---------------------",
                      //                 color: "white",
                      //                 style: "itemsTable",
                      //               },
                      //             ],
                      //           ],
                      //         },
                      //         layout: "lightHorizontalLines",
                      //       },
                      //     ],
                      //   ],
                      // },
                      // layout: {
                      //   defaultBorder: false,
                      // },
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
                body: [
                  [
                    {
                      text: [
                        { text: "SITUACIÓN ACTUAL", style: "itemsTable_c" },
                      ],
                      margin: [110, 0, 0, 0],
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
                                      text: "\n" + this.nombre_procesos_a,
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
                            // "  " +
                            // this.datosPedido[0].tipo.toUpperCase() +
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
                body: [
                  [
                    {
                      text: [
                        { text: "SITUACIÓN PROPUESTA", style: "itemsTable_c" },
                      ],
                      margin: [110, 0, 0, 0],
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
                      margin: [15, -5, 0, 0],
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
                              text: this.empleado_4[0].apellido.toUpperCase() + 
                                    this.empleado_4[0].nombre.toUpperCase() +
                                    "\n RESPONSABLE DEL REGISTRO" , 
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

  //241.6
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
                      text:this.datosPedido[0].puesto_reemp.toUpperCase(),
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

  //392.6
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
                      text: this.empleado_1[0].apellido.toUpperCase() + this.empleado_1[0].nombre.toUpperCase(),
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
              margin: [35, 30, 0, 0],
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

    /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS XLSX INDIVIDUAL
   * ****************************************************************************************************/

  generarExcel(){
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([]);

    //ESTABLECER TAMAÑO DE LAS COLUMNAS
    const columnas = [
      { width: 5 },
      { width: 3 },
      { width: 16 },
      { width: 3 },
      { width: 3 },
      { width: 24 },
      { width: 3 },
      { width: 3 },
      { width: 16 },
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
      { s: xlsx.utils.decode_range(mergeRange18).s, e: xlsx.utils.decode_range(mergeRange18).e }
    ];

    worksheet['!merges'] = merges;


    //VARIABLES AUXILIARES PARA LOS DATOS
    let fecha1 = moment(this.datosPedido[0].fec_creacion).format(
      "DD MMMM YYYY");
    let fecha2 = moment(this.datosPedido[0].fec_rige_desde).format(
      "dddd DD MMMM YYYY");
    let nombreEmpleado = this.empleado_1[0].nombre.toUpperCase();
    let apellidoEmpleado = this.empleado_1[0].apellido.toUpperCase();

    //AGREGA LOS DATOS A LAS CELDAS CORRESPONDIENTES
    xlsx.utils.sheet_add_aoa(worksheet, [['ACCIÓN DE PERSONAL']], {origin: 'K2'});
    xlsx.utils.sheet_add_aoa(worksheet, [['N°']], {origin: 'L3'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].identi_accion_p]], {origin: 'N3'});
    xlsx.utils.sheet_add_aoa(worksheet, [['FECHA:']], {origin: 'L4'});
    xlsx.utils.sheet_add_aoa(worksheet, [[fecha1]], {origin: 'N4'});
    xlsx.utils.sheet_add_aoa(worksheet, [['DECRETO:']], {origin: 'C5'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[0]]], {origin: 'D5'});
    xlsx.utils.sheet_add_aoa(worksheet, [['ACUERDO:']], {origin: 'F5'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[1]]], {origin: 'G5'});
    xlsx.utils.sheet_add_aoa(worksheet, [['RESOLUCIÓN:']], {origin: 'I5'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[2]]], {origin: 'J5'});
    xlsx.utils.sheet_add_aoa(worksheet, [['OTRO:']], {origin: 'L5'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.decreto[3]]], {origin: 'O5'});
    xlsx.utils.sheet_add_aoa(worksheet, [['N°']], {origin: 'E7'});
    xlsx.utils.sheet_add_aoa(worksheet, [['FECHA:']], {origin: 'I7'});
    xlsx.utils.sheet_add_aoa(worksheet, [[apellidoEmpleado]], {origin: 'C9'});
    xlsx.utils.sheet_add_aoa(worksheet, [['APELLIDO']], {origin: 'C10'});
    xlsx.utils.sheet_add_aoa(worksheet, [[nombreEmpleado]], {origin: 'I9'});
    xlsx.utils.sheet_add_aoa(worksheet, [['NOMBRE']], {origin: 'I10'});
    xlsx.utils.sheet_add_aoa(worksheet, [['N°. de cédula de ciudadanía']], {origin: 'C11'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.empleado_1[0].cedula]], {origin: 'C11'});
    xlsx.utils.sheet_add_aoa(worksheet, [['N°. de afiliación IESS']], {origin: 'G11'});
    xlsx.utils.sheet_add_aoa(worksheet, [['Rige a partir de:']], {origin: 'L11'});
    xlsx.utils.sheet_add_aoa(worksheet, [[fecha2]], {origin: 'L11'});
    xlsx.utils.sheet_add_aoa(worksheet, [['EXPLICACIÓN:']], {origin: 'C13'});
    xlsx.utils.sheet_add_aoa(worksheet, [['BASE LEGAL:']], {origin: 'C14'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].base_legal]], {origin: 'D14'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.datosPedido[0].adicion_legal]], {origin: 'C15'});
    xlsx.utils.sheet_add_aoa(worksheet, [['INGRESO:']], {origin: 'C18'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[0]]], {origin: 'D18'});
    xlsx.utils.sheet_add_aoa(worksheet, [['NOMBRAMIENTO:']], {origin: 'C20'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[1]]], {origin: 'D20'});
    xlsx.utils.sheet_add_aoa(worksheet, [['ASCENSO:']], {origin: 'C22'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[2]]], {origin: 'D22'});
    xlsx.utils.sheet_add_aoa(worksheet, [['SUBROGACIÓN:']], {origin: 'C24'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[3]]], {origin: 'D24'});
    xlsx.utils.sheet_add_aoa(worksheet, [['ENCARGO:']], {origin: 'C26'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[4]]], {origin: 'D26'});
    xlsx.utils.sheet_add_aoa(worksheet, [['VACACIONES:']], {origin: 'C28'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[5]]], {origin: 'D28'});
    xlsx.utils.sheet_add_aoa(worksheet, [['TRASLADO:']], {origin: 'F18'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[6]]], {origin: 'G18'});
    xlsx.utils.sheet_add_aoa(worksheet, [['TRASPASO:']], {origin: 'F20'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[7]]], {origin: 'G20'});
    xlsx.utils.sheet_add_aoa(worksheet, [['CAMBIO ADMINISTRATIVO:']], {origin: 'F22'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[8]]], {origin: 'G22'});
    xlsx.utils.sheet_add_aoa(worksheet, [['INTERCAMBIO:']], {origin: 'F24'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[9]]], {origin: 'G24'});
    xlsx.utils.sheet_add_aoa(worksheet, [['COMISIÓN DE SERVICIOS:']], {origin: 'F26'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[10]]], {origin: 'G26'});
    xlsx.utils.sheet_add_aoa(worksheet, [['LICENCIA:']], {origin: 'F28'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[11]]], {origin: 'G28'});
    xlsx.utils.sheet_add_aoa(worksheet, [['REVALORIZACIÓN:']], {origin: 'I18'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[12]]], {origin: 'J18'});
    xlsx.utils.sheet_add_aoa(worksheet, [['RECLASIFICACIÓN:']], {origin: 'I20'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[13]]], {origin: 'J20'});
    xlsx.utils.sheet_add_aoa(worksheet, [['UBICACIÓN:']], {origin: 'I22'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[14]]], {origin: 'J22'});
    xlsx.utils.sheet_add_aoa(worksheet, [['REINTREGO:']], {origin: 'I24'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[15]]], {origin: 'J24'});
    xlsx.utils.sheet_add_aoa(worksheet, [['REINSTITUCIONAL:']], {origin: 'I26'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[16]]], {origin: 'J26'});
    xlsx.utils.sheet_add_aoa(worksheet, [['RENUNCIA:']], {origin: 'I28'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[17]]], {origin: 'J28'});
    xlsx.utils.sheet_add_aoa(worksheet, [['SUPRESION:']], {origin: 'L18'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[18]]], {origin: 'M18'});
    xlsx.utils.sheet_add_aoa(worksheet, [['DESTITUCION:']], {origin: 'L20'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[19]]], {origin: 'M20'});
    xlsx.utils.sheet_add_aoa(worksheet, [['REMOCION:']], {origin: 'L22'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[20]]], {origin: 'M22'});
    xlsx.utils.sheet_add_aoa(worksheet, [['JUBILACION:']], {origin: 'L24'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[21]]], {origin: 'M24'});
    xlsx.utils.sheet_add_aoa(worksheet, [['OTRO:']], {origin: 'L26'});
    xlsx.utils.sheet_add_aoa(worksheet, [[this.tipoAccion[22]]], {origin: 'O26'});
    
    // Agrega la hoja de trabajo al libro y descarga el archivo
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Hoja 1');
    xlsx.writeFile(workbook, 'ejemplo.xlsx');

  }
  

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras =
      " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false;
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info("No se admite datos numéricos", "Usar solo letras", {
        timeOut: 6000,
      });
      return false;
    }
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    } else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if (
      (keynum > 47 && keynum < 58) ||
      keynum == 8 ||
      keynum == 13 ||
      keynum == 6
    ) {
      return true;
    } else {
      this.toastr.info(
        "No se admite el ingreso de letras",
        "Usar solo números",
        {
          timeOut: 6000,
        }
      );
      return false;
    }
  }

  /** ************************************************************************************************* **
   ** **        MÉTODOS PARA GENERAR REPORTES DE LA LISTA DE PEDIDOS DE ACCIONES DE PERSONAL         ** **
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
      // ENCABEZADO DE LA PÁGINA
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
      // PIE DE PÁGINA
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
                  { text: obj.fecCreacion_, style: "itemsTable" },
                  { text: obj.fecDesde_, style: "itemsTable" },
                  { text: obj.fecHasta_, style: "itemsTable" },
                  { text: obj.num_partida, style: "itemsTable" },
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
