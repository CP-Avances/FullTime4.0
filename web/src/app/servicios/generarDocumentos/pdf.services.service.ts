import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { EmpresaService } from '../configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from '../usuarios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../generales/validaciones/validaciones.service';
import { AccionPersonalService } from '../modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ParametrosService } from '../configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { table } from 'console';

@Injectable({
  providedIn: 'root'
})
export class PdfServicesService {

  datosPedido: any;
  decreto: string[];
  tipoAccion: string[];
  textoFijo: string = '';
  texto_color: string = "black"

  constructor(
    private validar: ValidacionesService,
    public restAccion: AccionPersonalService, // SERVICIO DATOS ACCIONES DE PERSONAL
    public parametro: ParametrosService,
  ) {
    this.ObtenerTiposAccion()
    this.ObtenerLogo()
  }

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro(datosPedidoSelected: any) {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.CargarInformacion(this.formato_fecha, datosPedidoSelected)
      },
      vacio => {
        this.CargarInformacion(this.formato_fecha, datosPedidoSelected)
      });
  }

  // METODO DE BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe((datos) => {
      this.tipos_accion = datos;
    });
  }

  CargarInformacion(formato_fecha: string, datosPedidoSelected) {

    console.log('datos tipo accion personal: ', this.tipos_accion);

    this.tipos_accion.forEach((item: any) => {
      if (item.descripcion == datosPedidoSelected[0].descripcion) {
        this.textoFijo = item.base_legal + ' ';
      }
    });

    datosPedidoSelected.forEach((valor: any) => {
      valor.fecha_elaboracion = this.validar.FormatearFecha(valor.fecha_elaboracion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      valor.fecha_rige_desde = this.validar.FormatearFecha(valor.fecha_rige_desde, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      valor.fecha_rige_hasta = this.validar.FormatearFecha(valor.fecha_rige_hasta, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      valor.fecha_posesion = valor.fecha_posesion ? this.validar.FormatearFecha(valor.fecha_posesion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
      valor.fecha_acta_final = valor.fecha_acta_final ? this.validar.FormatearFecha(valor.fecha_acta_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
      valor.fecha_testigo = valor.fecha_testigo ? this.validar.FormatearFecha(valor.fecha_testigo, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
      valor.fecha_comunicacion = valor.fecha_comunicacion ? this.validar.FormatearFecha(valor.fecha_comunicacion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
      valor.hora_comunicacion = valor.hora_comunicacion ? this.validar.FormatearHora(valor.hora_comunicacion, this.formato_hora) : "";
    })

    this.datosPedido = datosPedidoSelected[0];
    this.crearArchivo('open')

  }

  // OBTENER LOGO DEL MINISTERIO DE TRABAJO
  logo: any = String;
  ObtenerLogo() {
    this.restAccion.LogoImagenBase64().subscribe((res) => {
      this.logo = "data:image/jpeg;base64," + res.imagen;
    });
  }

  async GenerarPdf(action = 'open', datosPedidoSelected: any) {
    this.BuscarParametro(datosPedidoSelected)
  }

  async crearArchivo(action = 'open') {
    console.log('datos del pedido selecionado: ', this.datosPedido);
    this.ObtenerDecreto()
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Empleados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageMargins: [20, 20, 20, 20],
      content: [
        this.PresentarHoja1_Parte_1(),
        this.PresentarHoja1_Parte_2(),
        // this.PresentarHoja1_Parte_3(),
        // this.PresentarHoja1_Parte_4(),
        // this.PresentarHoja1_Parte_5(),
        // this.PresentarHoja1_Parte_6(),
        // this.PresentarHoja1_Parte_7(),
        // this.PresentarHoja1_Parte_8(),
        // this.PresentarHoja1_Parte_8_1(),
        // this.PresentarHoja1_Parte_9(),
        // this.PresentarHoja1_Parte_10(),
        // this.PresentarHoja1_Parte_11_1(),
        // this.PresentarHoja1_Parte_11_2(),
        // this.PresentarHoja1_Parte_12(),
        // this.PresentarHoja1_Parte_13_1(),
        // this.PresentarHoja1_Parte_13_2(),
        { text: "", pageBreak: "before", style: "subheader" },
        // this.PresentarHoja2_Parte_1(),
        // this.PresentarHoja2_Parte_2(),
        // this.PresentarHoja2_Parte_3_1(),
        // this.PresentarHoja2_Parte_3_2(),
        // this.PresentarHoja2_Parte_3_3(),
        // this.PresentarHoja2_Parte_3_4(),
        // this.PresentarHoja2_Parte_3_5(),
        // this.PresentarHoja2_Parte_4_1(),
        // this.PresentarHoja2_Parte_4_2(),
        // this.PresentarHoja2_Parte_4_3(),
        // this.PresentarHoja2_Parte_4_4(),
        // this.PresentarHoja2_Parte_4_5(),
        // this.PresentarHoja2_Parte_4_6(),
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
    if (this.datosPedido.accion_personal !== null) {
      decretoTexto = '';
      let texto: string = decretoTexto.toUpperCase();
      this.decreto[3] = texto;
      this.decreto[4] = "X";
      this.decreto[5] = "black";
    }
  }

  // METODO PARA OBTENER MOSTRAR EL TIPO DE ACCION
  ObtenerTipoAccion() {
    let tipoAccion: string = this.datosPedido.accion_personal.toUpperCase();
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

  getCheckBoxCell(accion: string, valor: string) {
    return {
      table: {
        widths: [8], // ancho del cuadrito
        heights: [8], // alto del cuadrito
        body: [[{
          text: valor.toLocaleLowerCase() == accion.toLocaleLowerCase() ? 'X' : '',
          alignment: 'center',
          fontSize: 6,
        }]]
      },
      layout: {
        hLineWidth: () => 0.5, // grosor del borde
        vLineWidth: () => 0.5,
        hLineColor: () => '#999999', // color gris
        vLineColor: () => '#999999',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  getCheckBoxCellDeclaracio(tipo: any, valor: boolean) {
    console.log('valor: ',valor, ' tipo: ',tipo)
    return {
      table: {
        widths: [8], // ancho del cuadrito
        heights: [8], // alto del cuadrito
        body: [[{
          text: (valor == true && tipo == 'Si' ? 'x' : (valor == false && tipo == 'No' ? 'x':'')),
          alignment: 'center',
          fontSize: 6,
        }]]
      },
      layout: {
        hLineWidth: () => 0.5, // grosor del borde
        vLineWidth: () => 0.5,
        hLineColor: () => '#999999', // color gris
        vLineColor: () => '#999999',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  getCellText(valor: string) {
    return {
      table: {
        widths: ['*'], // ancho del cuadrito
        body: [[{
          text: valor,
          alignment: 'left',
          fontSize: 7,
        }]]
      },
      layout: {
        hLineWidth: function (i, node) {
          // i = índice de línea horizontal (0 = arriba, node.table.body.length = última)
          return (i === node.table.body.length) ? 0.5 : 0; // solo la última línea
        },
        vLineWidth: () => 0,
        hLineColor: () => '#999999', // color gris
        paddingLeft: () => 0,
        paddingRight: () => 3,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  PresentarHoja1_Parte_1() {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              table: {
                widths: [325, '*'],
                body: [
                  [
                    {
                      border: [false, false, true, false],
                      margin: [60, 10, 0, 0],
                      image: this.logo,
                      width: 100,
                    },
                    {
                      stack: [
                        {
                          table: {
                            widths: ['*'],
                            body: [
                              [
                                {
                                  text: 'ACCIÓN DE PERSONAL',
                                  alignment: 'center',
                                  bold: true,
                                  fontSize: 13,
                                  fillColor: '#f2f2f2',
                                  margin: [0, 10, 0, 10],
                                  border: [false, false, false, true],
                                }
                              ],
                            ]
                          },
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        },
                        {
                          table: {
                            widths: [91, '*'],
                            body: [
                              [
                                {
                                  text: 'Nro.',
                                  alignment: 'center',
                                  bold: true,
                                  fontSize: 8,
                                  fillColor: '#f2f2f2',
                                  margin: [0, 2, 0, 2],
                                  border: [false, false, true, true],
                                },
                                {
                                  text: this.datosPedido.numero_accion_personal,
                                  alignment: 'center',
                                  fontSize: 8,
                                  margin: [0, 2, 0, 2],
                                  border: [false, false, false, true],
                                }
                              ]
                            ]
                          },
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        },
                        {
                          table: {
                            widths: ['*'],
                            body: [
                              [
                                {
                                  text: 'FECHA DE ELABORACIÓN',
                                  alignment: 'center',
                                  bold: true,
                                  fontSize: 8,
                                  fillColor: '#f2f2f2',
                                  margin: [0, 2, 0, 2],
                                  border: [false, false, false, true],
                                },
                              ]
                            ]
                          },
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        },
                        {
                          table: {
                            widths: ['*'],
                            body: [
                              [
                                {
                                  text: this.datosPedido.fecha_elaboracion,
                                  alignment: 'center',
                                  fontSize: 8,
                                  margin: [0, 1, 0, 1],
                                }
                              ]
                            ]
                          },
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }
                      ],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    }
                  ]
                ]
              },
              border: [true, true, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              stack: [
                {
                  table: {
                    widths: ['*', '*'],
                    body: [
                      [
                        {
                          text: 'APELLIDOS',
                          alignment: 'center',
                          bold: true,
                          fontSize: 9,
                          fillColor: '#f2f2f2',
                          margin: [0, 2, 0, 2],
                          border: [false, false, true, false]
                        },
                        {
                          text: 'NOMBRES',
                          alignment: 'center',
                          bold: true,
                          fontSize: 9,
                          fillColor: '#f2f2f2',
                          margin: [0, 2, 0, 2],
                          border: [false, false, false, false]
                        },

                      ]
                    ]
                  },
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }
              ],
              border: [true, true, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: this.datosPedido.nombres.split(' ')[2].toUpperCase() + ' ' + this.datosPedido.nombres.split(' ')[3].toUpperCase(),
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 5, 0, 5],
                      border: [false, false, true, false]
                    },
                    {
                      text: this.datosPedido.nombres.split(' ')[0].toUpperCase() + ' ' + this.datosPedido.nombres.split(' ')[1].toUpperCase(),
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 5, 0, 5],
                      border: [false, false, false, false]
                    },
                  ]
                ]
              },
              border: [true, true, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }

          ],
          [
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      table: {
                        widths: ['*', '*'],
                        body: [
                          [
                            {
                              text: 'DOCUMENTO DE IDENTIFICACIÓN',
                              alignment: 'center',
                              bold: true,
                              fontSize: 7,
                              fillColor: '#f2f2f2',
                              margin: [0, 7, 0, 7],
                              border: [false, false, true, true]
                            },
                            {
                              text: 'NRO. DE IDENTIFICACIÓN',
                              alignment: 'center',
                              bold: true,
                              fontSize: 7,
                              fillColor: '#f2f2f2',
                              margin: [0, 7, 0, 7],
                              border: [false, false, false, true]
                            }
                          ]
                        ]
                      },
                      border: [false, false, true, false],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            {
                              text: 'RIGE:',
                              alignment: 'center',
                              bold: true,
                              fontSize: 8,
                              fillColor: '#f2f2f2',
                              margin: [0, 0, 0, 0],
                              border: [false, false, false, true]
                            }
                          ],
                          [
                            {
                              table: {
                                widths: ['*', '*'],
                                body: [
                                  [
                                    {
                                      text: 'DESDE (dd-mm-aaaa)',
                                      alignment: 'center',
                                      bold: true,
                                      fontSize: 7,
                                      fillColor: '#f2f2f2',
                                      margin: [0, 1, 0, 1],
                                      border: [false, false, true, true]
                                    },
                                    {
                                      text: 'HASTA (dd-mm-aaaa) (cuando aplica)',
                                      alignment: 'center',
                                      bold: true,
                                      fontSize: 7,
                                      fillColor: '#f2f2f2',
                                      margin: [0, 1, 0, 1],
                                      border: [false, false, false, true]
                                    }
                                  ],
                                ]
                              },
                              border: [false, false, false, false],
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }

                            }
                          ],
                        ]
                      },
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    }
                  ],

                ]
              },
              border: [true, true, true, false],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [
                    {
                      text: "CÉDULA",
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 4, 0, 3],
                      border: [false, false, true, false],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0

                      }
                    },
                    {
                      text: this.datosPedido.cedula_empleado,
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 4, 0, 3],
                      border: [false, false, true, false],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0

                      }
                    },
                    {
                      text: this.datosPedido.fecha_rige_desde,
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 4, 0, 3],
                      border: [false, false, true, false],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0

                      }
                    },
                    {
                      text: this.datosPedido.fecha_rige_hasta,
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 4, 0, 3],
                      border: [false, false, false, false],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0

                      }
                    }
                  ],

                ]
              },
              border: [true, false, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ]

        ],
      },
      layout: {
        defaultBorder: false, // desactiva cualquier borde por defecto
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      },
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9, fillColor: '#d9d9d9', bold: true, },
        itemsTable_d: { fontSize: 9, alignment: "right" },
        itemsTable_e: { fontSize: 7 },
      }
    };
  }

  PresentarHoja1_Parte_2() {
    return {
      table: {
        widths: ["*"],
        body: [
          [
            {
              text: ' Escoja una opción (según lo estipulado en el artículo 21 del Reglamento General a la Ley Orgánica del Servicio Público)',
              bold: true,
              fontSize: 7,
              fillColor: '#f2f2f2',
              margin: [5, 2, 0, 2],
              border: [true, false, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 10,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [
                    {
                      table: {
                        widths: [85, 15],
                        body: [
                          [{ text: 'INGRESO', fontSize: 7 }, this.getCheckBoxCell('INGRESO', this.datosPedido.accion_personal)],
                          [{ text: 'REINGRESO', fontSize: 7 }, this.getCheckBoxCell('REINGRESO', this.datosPedido.accion_personal)],
                          [{ text: 'RESTITUCIÓN', fontSize: 7 }, this.getCheckBoxCell('RESTITUCIÓN', this.datosPedido.accion_personal)],
                          [{ text: 'REINTEGRO', fontSize: 7 }, this.getCheckBoxCell('REINTEGRO', this.datosPedido.accion_personal)],
                          [{ text: 'ASCENSO', fontSize: 7 }, this.getCheckBoxCell('ASCENSO', this.datosPedido.accion_personal)],
                          [{ text: 'TRASLADO', fontSize: 7 }, this.getCheckBoxCell('TRASLADO', this.datosPedido.accion_personal)]
                        ]
                      },
                      layout: 'noBorders'
                    },
                    {
                      table: {
                        widths: [105, 15],
                        body: [
                          [{ text: 'TRASPASO', fontSize: 7 }, this.getCheckBoxCell('TRASPASO', this.datosPedido.accion_personal)],
                          [{ text: 'CAMBIO ADMINISTRATIVO', fontSize: 7 }, this.getCheckBoxCell('CAMBIO ADMINISTRATIVO', this.datosPedido.accion_personal)],
                          [{ text: 'INTERCAMBIO VOLUNTARIO', fontSize: 7 }, this.getCheckBoxCell('INTERCAMBIO VOLUNTARIO', this.datosPedido.accion_personal)],
                          [{ text: 'LICENCIA', fontSize: 7 }, this.getCheckBoxCell('LICENCIA', this.datosPedido.accion_personal)],
                          [{ text: 'COMISIÓN DE SERVICIOS', fontSize: 7 }, this.getCheckBoxCell('COMISIÓN DE SERVICIOS', this.datosPedido.accion_personal)],
                          [{ text: 'SANCIONES', fontSize: 7 }, this.getCheckBoxCell('SANCIONES', this.datosPedido.accion_personal)]
                        ]
                      },
                      layout: 'noBorders'
                    },
                    {
                      table: {
                        widths: [100, 15],
                        body: [
                          [{ text: 'INCREMENTO RMU', fontSize: 7 }, this.getCheckBoxCell('INCREMENTO RMU', this.datosPedido.accion_personal)],
                          [{ text: 'SUBROGACIÓN', fontSize: 7 }, this.getCheckBoxCell('SUBROGACIÓN', this.datosPedido.accion_personal)],
                          [{ text: 'ENCARGO', fontSize: 7 }, this.getCheckBoxCell('ENCARGO', this.datosPedido.accion_personal)],
                          [{ text: 'CESACIÓN DE FUNCIONES', fontSize: 7 }, this.getCheckBoxCell('CESACIÓN DE FUNCIONES', this.datosPedido.accion_personal)],
                          [{ text: 'DESTITUCIÓN', fontSize: 7 }, this.getCheckBoxCell('DESTITUCIÓN', this.datosPedido.accion_personal)],
                          [{ text: 'VACACIONES', fontSize: 7 }, this.getCheckBoxCell('VACACIONES', this.datosPedido.accion_personal)]
                        ]
                      },
                      layout: 'noBorders'
                    },
                    {
                      table: {
                        widths: [90, 15],
                        body: [
                          [{ text: 'REVISIÓN CLASI. PUESTO', fontSize: 7 }, this.getCheckBoxCell('REVISIÓN CLASI. PUESTO', this.datosPedido.accion_personal)],
                          [{ text: 'OTRO (DETALLAR)', fontSize: 7 }, this.getCheckBoxCell('OTRO (DETALLAR)', this.datosPedido.accion_personal)],
                          [this.getCellText(this.datosPedido.detalle_otro), '']
                        ]
                      },
                      layout: 'noBorders'
                    }
                  ]
                ]
              },
              border: [true, false, true, false],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 5,
                paddingRight: () => 0,
                paddingTop: () => 5,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: 'EN CASO DE REQUERIR ESPECIFICACIÓN DE LO SELECCIONADO:',
                      fontSize: 8,
                      alignment: 'center',
                      margin: [1, 1, 0, 1],
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    this.getCellText(this.datosPedido.especificacion)
                    ,
                  ],
                  [                   
                    {
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            {
                              text: '* PRESENTÓ LA DECLARACIÓN JURADA (número 2 del art. 3 RLOSEP)',
                              fontSize: 8,
                              alignment: 'center',
                              fillColor: '#f2f2f2',
                              margin: [2, 0, 0, 0],
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }
                            }
                          ]
                        ]
                      },
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 5,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 5
                      }
                    },
                    {
                      table: {
                        widths: [40, 10, 40, 10,'*'],
                        body: [
                          [
                            {
                              text: 'SI',
                              fontSize: 7,
                              alignment: 'center',
                              fillColor: '#f2f2f2',
                              margin: [1, 1, 0, 1],
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }
                            },
                            this.getCheckBoxCellDeclaracio('SI', this.datosPedido.declaracion_jurada),
                            {text: 'NO',
                              fontSize: 7,
                              alignment: 'center',
                              fillColor: '#f2f2f2',
                              margin: [1, 1, 0, 1],
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }
                            },
                            this.getCheckBoxCellDeclaracio('No', this.datosPedido.declaracion_jurada),
                            {}
                          ]
                        ]
                      },
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 2
                      }
                    },
                  ]
                ]
              },
              border: [true, false, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 2,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 5
              }
            }
          ],
          [
            {
              text: ' MOTIVACIÓN: (adjuntar anexo si lo posee)',
              bold: true,
              fontSize: 8,
              fillColor: '#f2f2f2',
              margin: [5, 2, 0, 2],
              border: [true, false, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 10,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [
            {
              
              text: this.datosPedido.adicion_base_legal,
              bold: true,
              fontSize: 7,
              margin: [5, 2, 0, 2],
              border: [true, false, true, true],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 10,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
        ],
      },
      layout: {
        defaultBorder: false, // desactiva cualquier borde por defecto
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      },
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9, fillColor: '#d9d9d9', bold: true, },
        itemsTable_d: { fontSize: 9, alignment: "right" },
        itemsTable_e: { fontSize: 7 },
      }
    };
  }


  /*
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
                        text: this.datosPedido.empleado_elaboracion.toUpperCase(),
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
                        text: this.datosPedido.nombres.toUpperCase(),
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
                        text: "No. de identificación",
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
                            text: this.datosPedido.cedula_empleado,
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
                        text: this.datosPedido.fecha_rige_desde,
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
                            text: this.datosPedido.base_legal,
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
                            text: this.datosPedido.base_legal,
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
                            [{ text: `${this.datosPedido.accion_personal}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[0].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[2].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[3].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[4].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[5].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                        text: this.tipos_accion[1], style: "itemsTable",
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                            [{ text: `${this.tipos_accion[1].nombre}`, style: "itemsTable_e", alignment: 'center' },]
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
                                        text: this.datosPedido.proceso_actual,
                                        style: "itemsTable",
                                        color: this.texto_color,
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
                                        text: this.datosPedido.proceso_actual,
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
                                        text: this.datosPedido.cargo_actual.toUpperCase(),
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
                                        text: this.datosPedido.nombres.toUpperCase(),
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
                                        text: this.datosPedido.remuneracion_actual,
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
                              this.datosPedido.numero_acta_final,
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
                                        text: this.datosPedido.proceso_actual,
                                        style: "itemsTable",
                                        color: this.texto_color,
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
                                        text: "\n" +this.datosPedido.proceso_actual,
                                        style: "itemsTable",
                                        margin: [0, -30, 0, 0],
                                        color: this.texto_color,
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
                                        text: this.datosPedido.cargo_actual,
                                        style: "itemsTable",
                                        color: this.texto_color,
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
                                        text: this.datosPedido.nombres.toUpperCase(),
                                        style: "itemsTable",
                                        color: this.texto_color,
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
                                        text: this.datosPedido.remuneracion_propuesta,
                                        style: "itemsTable",
                                        color: this.texto_color,
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
                              this.datosPedido.partida_individual_propuesta,
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
                                text: this.datosPedido.numero_acta_final,
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
                                text: this.datosPedido.fecha_acta_final,
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
                                  this.datosPedido.abreviatura_elaboracion.toUpperCase() +
                                  " " +
                                  this.datosPedido.empleado_elaboracion.toUpperCase() +
                                  "\n" +
                                  this.datosPedido.tipo_cargo_elaboracion.toUpperCase(),
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
                                                  this.datosPedido.abreviatura_elaboracion.toUpperCase() +
                                                  " " +
                                                  this.datosPedido.empleado_elaboracion.toUpperCase() +
                                                  "\n" +
                                                  this.datosPedido.tipo_cargo_elaboracion.toUpperCase(),
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
                                text: this.datosPedido.cedula_empleado,
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
                                text: this.datosPedido.fecha_elaboracion,
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
                                text: `${this.datosPedido.empleado_elaboracion.toUpperCase()}
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
                        text: this.datosPedido.empleado_elaboracion.toUpperCase(),
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
                        text: this.datosPedido.empleado_control.toUpperCase(),
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
                        text: this.datosPedido.numero_accion_personal,
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
                        text: this.datosPedido.fecha_acta_final,
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
                        text: `${this.datosPedido.empleado_elaboracion.toUpperCase()}`,
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
                  { text: "CON IDENTIFICACIÓN DE CIUDADANÍA No.", style: "itemsTable" },
                ],
              },
              {
                border: [false, false, true, false],
                margin: [8, 25, 0, 0],
                table: {
                  body: [
                    [
                      {
                        text: this.datosPedido.empleado_elaboracion.toUpperCase(),
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
      */




}


