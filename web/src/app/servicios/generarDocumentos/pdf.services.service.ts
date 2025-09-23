import { Injectable } from '@angular/core';
import { ValidacionesService } from '../generales/validaciones/validaciones.service';
import { AccionPersonalService } from '../modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ParametrosService } from '../configuracion/parametrizacion/parametrosGenerales/parametros.service';

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
        this.textoFijo = item.base_legal.replace(/\n\s*\n/g, ' ');
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
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('pedido_accion_personal_' + this.datosPedido.nombres + '.pdf'); break;
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
        this.PresentarHoja1_Parte_3(),
        this.PresentarHoja1_Parte_4(),
        //{ text: "", pageBreak: "before", style: "subheader" }, --> Se usa para asignar contenido a una nueva hoja
        this.PresentarHoja1_Parte_5(),
        this.PresentarHoja1_Parte_6(),
        this.PresentarHoja1_Parte_7(),

      ],
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9 },
        itemsTable_d: { fontSize: 9, alignment: "right" },
        itemsTable_e: { fontSize: 7 },
      },
    };
  }

  // METODO PARA QUITAR LAS TILDES
  RemoveAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  getCheckBoxCell(accion: string, valor: string) {
    return {
      table: {
        widths: [8], // ancho del cuadrito
        heights: [7], // alto del cuadrito
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

  getCheckBoxCellTalentoHumano(valor: string) {
    return {
      table: {
        widths: [8], // ancho del cuadrito
        heights: [8], // alto del cuadrito
        body: [[{
          text: valor ? 'X' : '',
          alignment: 'center',
          fontSize: 7,
        }]]
      },
      margin: [0, 20, 0, 0], // espacio entre texto y cuadro
      layout: {
        hLineWidth: () => 0.5, // grosor del borde
        vLineWidth: () => 0.5,
        hLineColor: () => '#999999', // color gris
        vLineColor: () => '#999999',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      }
    };
  }

  getCheckBoxCellDeclaracio(tipo: any, valor: boolean) {
    console.log('valor: ', valor, ' tipo: ', tipo)
    return {
      table: {
        widths: [8], // ancho del cuadrito
        heights: [8], // alto del cuadrito
        body: [[{
          text: (valor == true && tipo == 'Si' ? 'x' : (valor == false && tipo == 'No' ? 'x' : '')),
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
          fontSize: 8,
        }]]
      },
      border: [false, false, false, false],
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

  getCellPosecionText(valor: string) {
    return {
      table: {
        widths: ['*'], // ancho del cuadrito
        body: [[{
          text: valor || '',
          alignment: 'left',
          fontSize: 8,
          noWrap: false,
          valign: 'bottom'
        }]]
      },
      margin: [1, 5, 3, 0],
      border: [false, false, false, false],
      layout: {
        hLineWidth: function (i, node) {
          // i = índice de línea horizontal (0 = arriba, node.table.body.length = última)
          return (i === node.table.body.length) ? 0.5 : 0; // solo la última línea
        },
        vLineWidth: () => 0,
        hLineColor: () => '#999999', // color gris
        paddingLeft: () => 0,
        paddingRight: () => 20,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  getCellPosecionPosecionText(valor: string) {
    return {
      table: {
        widths: [100], // ancho del cuadrito
        body: [[{
          text: valor || '',
          alignment: 'center',
          fontSize: 8,
          noWrap: false,
          valign: 'bottom'
        }]]
      },
      margin: [15, 7, 0, 0],
      border: [false, false, false, false],
      layout: {
        hLineWidth: function (i, node) {
          // i = índice de línea horizontal (0 = arriba, node.table.body.length = última)
          return (i === node.table.body.length) ? 0.5 : 0; // solo la última línea
        },
        vLineWidth: () => 0,
        hLineColor: () => '#999999', // color gris
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

  getCellPosecionFirmasText(valor: string) {
    return {
      table: {
        widths: ['*'], // ancho del cuadrito
        body: [[{
          text: valor ? valor : '',
          alignment: 'left',
          fontSize: 7,
          noWrap: false,
          valign: 'bottom'
        }]]
      },
      margin: [1, 2, 0, 0],
      border: [false, false, false, true],
      layout: {
        hLineWidth: function (i, node) {
          // i = índice de línea horizontal (0 = arriba, node.table.body.length = última)
          return (i === node.table.body.length) ? 0 : 0; // solo la última línea
        },
        vLineWidth: () => 0,
        hLineColor: () => '#999999', // color gris
        paddingLeft: () => 0,
        paddingRight: () => 0,
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
                                  fontSize: 9,
                                  fillColor: '#f2f2f2',
                                  margin: [0, 2, 0, 2],
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
                                  fontSize: 7,
                                  fillColor: '#f2f2f2',
                                  margin: [0, 1, 0, 1],
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
                                  fontSize: 7,
                                  margin: [0, 1, 0, 0],
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
                          fontSize: 7,
                          fillColor: '#f2f2f2',
                          margin: [0, 1, 0, 1],
                          border: [false, false, true, false]
                        },
                        {
                          text: 'NOMBRES',
                          alignment: 'center',
                          bold: true,
                          fontSize: 7,
                          fillColor: '#f2f2f2',
                          margin: [0, 1, 0, 1],
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
                      margin: [0, 2, 0, 2],
                      border: [false, false, true, false]
                    },
                    {
                      text: this.datosPedido.nombres.split(' ')[0].toUpperCase() + ' ' + this.datosPedido.nombres.split(' ')[1].toUpperCase(),
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, 2, 0, 2],
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
                              margin: [0, 6, 0, 7],
                              border: [false, false, true, true]
                            },
                            {
                              text: 'NRO. DE IDENTIFICACIÓN',
                              alignment: 'center',
                              bold: true,
                              fontSize: 7,
                              fillColor: '#f2f2f2',
                              margin: [0, 6, 0, 7],
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
                              fontSize: 7,
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
                      margin: [0, 1, 0, 1],
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
                      margin: [0, 1, 0, 1],
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
                      margin: [0, 1, 0, 1],
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
                      margin: [0, 1, 0, 1],
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
                paddingTop: () => 2,
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
                        widths: [40, 10, 40, 10, '*'],
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
                            {
                              text: 'NO',
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
                paddingBottom: () => 2
              }
            }
          ],
          [
            {
              text: ' MOTIVACIÓN: (adjuntar anexo si lo posee)',
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

              text: this.datosPedido.adicion_base_legal != null || this.textoFijo != "" ? (this.textoFijo + '\n' + this.datosPedido.adicion_base_legal) + '\n' + ((this.datosPedido.observacion != null && this.datosPedido.observacion != '') ? 'Observación: ' + this.datosPedido.observacion : '') : "(Explicar el motivo por el cual se está colocando el movimiento escogido en el anterior paso)",
              fontSize: 7,
              margin: [5, 5, 0, 5],
              noWrap: false, // permite salto de línea automático
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

  PresentarHoja1_Parte_3() {
    return {
      table: {
        widths: ["*"],
        body: [
          [
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: 'SITUACION ACTUAL',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [0, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      alignment: 'center', // centra horizontalmente
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'SITUACION PROPUESTA',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [0, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      alignment: 'center', // centra horizontalmente
                      valign: 'middle',     // centra verticalmente
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
              border: [true, false, true, true],
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
            }
          ],

          [
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: 'PROCESO INSTITUCIONAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'PROCESO INSTITUCIONAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 0, 0, 0],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.proceso_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.proceso_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'NIVEL DE GESTIÓN:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'NIVEL DE GESTIÓN:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.nivel_gestion_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.nivel_gestion_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'UNIDAD ADMINISTRATIVA:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'UNIDAD ADMINISTRATIVA:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.unidad_administrativa,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.unidad_administrativa_propuesta,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'LUGAR DE TRABAJO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'LUGAR DE TRABAJO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.lugar_trabajo_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.lugar_trabajo_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'DENOMINACIÓN DEL PUESTO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'DENOMINACIÓN DEL PUESTO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.cargo_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.cargo_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'GRUPO OCUPACIONAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'GRUPO OCUPACIONAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.grupo_ocupacional_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.grupo_ocupacional_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'GRADO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'GRADO:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.grado_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.grado_propuesto,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'REMUNERACIÓN MENSUAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'REMUNERACIÓN MENSUAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.remuneracion_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.remuneracion_propuesta,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: 'PARTIDA INDIVIDUAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: 'PARTIDA INDIVIDUAL:',
                      bold: true,
                      fontSize: 7,
                      fillColor: '#f2f2f2',
                      margin: [5, 2, 0, 2],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
                      text: this.datosPedido.partida_individual_actual,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, true, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
                      layout: {
                        defaultBorder: false, // desactiva cualquier borde por defecto
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                      }
                    },
                    {
                      text: this.datosPedido.partida_individual_propuesta,
                      fontSize: 7,
                      margin: [5, 1, 0, 1],
                      border: [false, false, false, false],
                      noWrap: false,
                      valign: 'middle',     // centra verticalmente
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
              border: [true, false, true, false],
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
            }
          ],
          [
            {
              text: ' POSESIÓN DEL PUESTO',
              bold: true,
              fontSize: 8,
              fillColor: '#f2f2f2',
              margin: [5, 2, 0, 2],
              border: [true, true, true, true],
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
                widths: ['*'],
                body: [
                  [
                    {
                      table: {
                        widths: [250, '*'],
                        body: [
                          [
                            {
                              table: {
                                widths: [40, 180],
                                body: [
                                  [{
                                    text: 'YO, ',
                                    fontSize: 8,
                                    margin: [20, 5, 0, 0],
                                    border: [false, false, false, false],
                                    noWrap: false,
                                    valign: 'middle',// centra verticalmente
                                    layout: {
                                      defaultBorder: false, // desactiva cualquier borde por defecto
                                      paddingLeft: () => 0,
                                      paddingRight: () => 0,
                                      paddingTop: () => 0,
                                      paddingBottom: () => 0
                                    }
                                  }, this.getCellPosecionText(this.datosPedido.nombres)]
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
                            }, {
                              table: {
                                widths: [200, 79],
                                body: [
                                  [{
                                    text: 'CON NRO. DE DOCUMENTO DE IDENTIFICACIÓN:  ',
                                    fontSize: 8,
                                    margin: [20, 5, 1, 0],
                                    border: [false, false, false, false],
                                    noWrap: false,
                                    valign: 'middle',     // centra verticalmente
                                    layout: {
                                      defaultBorder: false, // desactiva cualquier borde por defecto
                                      paddingLeft: () => 0,
                                      paddingRight: () => 0,
                                      paddingTop: () => 0,
                                      paddingBottom: () => 0
                                    }
                                  }, this.getCellPosecionText(this.datosPedido.cedula_empleado)]
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
                          [
                            {
                              text: 'JURO LEALTAD AL ESTADO ECUATORIANO.',
                              fontSize: 8,
                              margin: [20, 0, 0, 0],
                              border: [false, false, false, false],
                              noWrap: false,
                              valign: 'middle',     // centra verticalmente
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }
                            }, {
                              text: '',
                              fontSize: 8,
                              margin: [0, 0, 0, 0],
                              border: [false, false, false, false],
                              noWrap: false,
                              valign: 'middle',     // centra verticalmente
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
                                  [{
                                    table: {
                                      widths: [40, 80],
                                      body: [
                                        [{
                                          text: 'Lugar: ',
                                          fontSize: 8,
                                          bold: true,
                                          margin: [15, 5, 0, 0],
                                          border: [false, false, false, false],
                                          noWrap: false,
                                          valign: 'middle',     // centra verticalmente
                                          layout: {
                                            defaultBorder: false, // desactiva cualquier borde por defecto
                                            paddingLeft: () => 0,
                                            paddingRight: () => 0,
                                            paddingTop: () => 0,
                                            paddingBottom: () => 0
                                          }
                                        }, this.getCellPosecionText(this.datosPedido.descripcion_lugar_posesion)]
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
                                  }, {
                                    table: {
                                      widths: [40, 95],
                                      body: [
                                        [{
                                          text: 'Fecha: ',
                                          fontSize: 8,
                                          bold: true,
                                          margin: [5, 5, 0, 0],
                                          border: [false, false, false, false],
                                          noWrap: false,
                                          valign: 'middle',     // centra verticalmente
                                          layout: {
                                            defaultBorder: false, // desactiva cualquier borde por defecto
                                            paddingLeft: () => 0,
                                            paddingRight: () => 0,
                                            paddingTop: () => 0,
                                            paddingBottom: () => 0
                                          }
                                        }, this.getCellPosecionText(this.datosPedido.fecha_posesion)]
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
                                  ]

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
                            },
                            {

                            }
                          ],
                          [
                            {
                              text: '** (EN CASO DE GANADOR DE CONCURSO DE MÉRITOS Y OPOSICIÓN)',
                              fontSize: 7,
                              margin: [26, 8, 0, 0],
                              bold: true,
                              border: [false, false, false, false],
                              noWrap: false,
                              valign: 'middle',     // centra verticalmente
                              layout: {
                                defaultBorder: false, // desactiva cualquier borde por defecto
                                paddingLeft: () => 0,
                                paddingRight: () => 0,
                                paddingTop: () => 0,
                                paddingBottom: () => 0
                              }
                            }, {

                            }
                          ],
                          [
                            {
                              table: {
                                widths: [120, 120],
                                body: [
                                  [
                                    this.getCellPosecionPosecionText(this.datosPedido.numero_acta_final),
                                    this.getCellPosecionPosecionText(this.datosPedido.fecha_acta_final)
                                  ],
                                  [
                                    {
                                      text: 'N°. Acta final',
                                      fontSize: 7,
                                      bold: true,
                                      margin: [20, 2, 0, 1],
                                      border: [false, false, false, false],
                                      noWrap: false,
                                      alignment: 'center',     // centra verticalmente
                                      layout: {
                                        defaultBorder: false, // desactiva cualquier borde por defecto
                                        paddingLeft: () => 0,
                                        paddingRight: () => 0,
                                        paddingTop: () => 0,
                                        paddingBottom: () => 0
                                      }
                                    },
                                    {
                                      text: 'Fecha',
                                      fontSize: 7,
                                      bold: true,
                                      margin: [10, 2, 0, 1],
                                      border: [false, false, false, false],
                                      noWrap: false,
                                      alignment: 'center',     // centra verticalmente
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
                              border: [false, false, false, false],
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
                                widths: [40, 200],
                                body: [
                                  [
                                    {
                                      text: 'Firma: ',
                                      fontSize: 8,
                                      bold: true,
                                      margin: [10, 7, 0, 0],
                                      border: [false, false, false, false],
                                      noWrap: false,
                                      alignment: 'center',     // centra verticalmente
                                      layout: {
                                        defaultBorder: false, // desactiva cualquier borde por defecto
                                        paddingLeft: () => 0,
                                        paddingRight: () => 0,
                                        paddingTop: () => 0,
                                        paddingBottom: () => 0
                                      }
                                    },
                                    this.getCellPosecionFirmasText('')
                                  ],
                                  [
                                    {},
                                    {
                                      text: 'Servidor público',
                                      fontSize: 7,
                                      bold: true,
                                      margin: [15, 2, 0, 1],
                                      border: [false, false, false, false],
                                      noWrap: false,
                                      alignment: 'center',     // centra verticalmente
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
                              border: [false, false, false, false],
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
          ],

        ],
      }, layout: {
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

  PresentarHoja1_Parte_4() {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'RESPONSABLES DE APROBACIÓN',
              bold: true,
              fontSize: 8,
              fillColor: '#f2f2f2',
              alignment: 'center',// centra verticalmente
              margin: [5, 2, 0, 2],
              border: [true, false, true, true],
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
                  [{
                    text: 'DIRECTOR (A) O RESPONSABLE DE TALENTO HUMANO',
                    bold: true,
                    fontSize: 7,
                    fillColor: '#f2f2f2',
                    alignment: 'center',// centra verticalmente
                    margin: [0, 1, 0, 1],
                    border: [false, false, false, true],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 0,
                      paddingBottom: () => 0
                    }
                  },
                  {
                    text: 'AUTORIDAD NOMINADORA O SU DELEGADO',
                    bold: true,
                    fontSize: 7,
                    fillColor: '#f2f2f2',
                    alignment: 'center',// centra verticalmente
                    margin: [0, 1, 0, 1],
                    border: [true, false, false, true],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 0,
                      paddingBottom: () => 0
                    }
                  }],
                  [{
                    table: {
                      widths: [50, 200],
                      body: [
                        [{
                          text: '',
                          margin: [0, 30, 0, 10]
                        },
                        {
                          text: '',
                          margin: [0, 30, 0, 10]
                        }],
                        [{
                          text: 'FIRMA:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText("")],
                        [{
                          text: 'NOMBRE:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_director + '. ' + this.datosPedido.empleado_director)],
                        [{
                          text: 'PUESTO:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.cargo_director)],
                        [{
                          text: '',
                          margin: [0, 0, 0, 10],
                          border: [false, false, false, false],
                        }, {
                          text: '',
                          margin: [0, 0, 0, 10],
                          border: [false, false, false, false],
                        }]
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
                  },
                  {
                    table: {
                      widths: [50, 200],
                      body: [
                        [{
                          text: '',
                          margin: [0, 30, 0, 10]
                        },
                        {
                          text: '',
                          margin: [0, 30, 0, 10]
                        }],
                        [{
                          text: 'FIRMA:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          valign: 'middle',     // centra verticalmente
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText("")],
                        [{
                          text: 'NOMBRE:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          valign: 'middle',     // centra verticalmente
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_delegado + '. ' + this.datosPedido.empleado_autoridad_delegado)],
                        [{
                          text: 'PUESTO:  ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          border: [false, false, false, false],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          valign: 'middle',     // centra verticalmente
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.cargo_autoridad_delegado)],
                        [{
                          text: '',
                          margin: [0, 0, 0, 5],
                          border: [false, false, false, false],
                        }, {
                          text: '',
                          margin: [0, 0, 0, 5],
                          border: [false, false, false, false],
                        }]
                      ]
                    },
                    border: [true, false, false, false],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 0,
                      paddingBottom: () => 0
                    }
                  }],
                ]
              },
              border: [true, true, true, true],
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
                widths: [200, '*'],
                body: [
                  [{
                    text: 'Elaborado por el Ministerio del Trabajo',
                    fontSize: 5,
                    alignment: 'center',// centra verticalmente
                    margin: [0, 5, 0, 5],
                    border: [false, false, false, false],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 10,
                      paddingBottom: () => 10
                    }
                  }, {
                    text: 'Fecha de actualización de formato: 2024-08-23 / Versión: 01.1 / Página 1 de 2',
                    fontSize: 5,
                    alignment: 'center',// centra verticalmente
                    margin: [0, 5, 0, 5],
                    border: [false, false, false, false],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 10,
                      paddingBottom: () => 10
                    }
                  }]
                ]
              },
              border: [false, false, false, false],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 10
              }
            }
          ],
          [
            {
              text: '',
              fontSize: 5,
              alignment: 'center',// centra verticalmente
              margin: [0, 9, 0, 9],
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
          [{
            text: 'RESPONSABLES DE FIRMAS',
            bold: true,
            fontSize: 8,
            fillColor: '#f2f2f2',
            margin: [0, 3, 0, 3],
            border: [true, true, true, true],
            noWrap: false,
            alignment: 'center', // centra horizontalmente
            valign: 'middle',     // centra verticalmente
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [{
            table: {
              widths: ['*', '*'],
              body: [
                [{
                  text: 'ACEPTACIÓN Y/O RECEPCIÓN DEL SERVIDOR PÚBLICO',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f2f2f2',
                  alignment: 'center',// centra verticalmente
                  margin: [0, 2, 0, 2],
                  border: [false, false, false, true],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                },
                {
                  text: 'EN CASO DE NEGATIVA DE LA RECEPCIÓN (TESTIGO)',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f2f2f2',
                  alignment: 'center',// centra verticalmente
                  margin: [0, 2, 0, 2],
                  border: [true, false, false, true],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }],
                [{
                  table: {
                    widths: [50, 200],
                    heights: [70],
                    body: [
                      [{
                        text: '',
                        margin: [0, 30, 0, 0]
                      },
                      {
                        text: '',
                        margin: [0, 30, 0, 0]
                      }],
                      [{
                        text: 'FIRMA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText("")],
                      [{
                        text: 'NOMBRE:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_empleado + '. ' + this.datosPedido.nombres.toUpperCase())],
                      [{
                        text: 'FECHA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.fecha_elaboracion)],
                      [{
                        text: 'HORA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.hora_elaboracion)],
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
                },
                {
                  table: {
                    widths: [50, 200],
                    heights: [70],
                    body: [
                      [{
                        text: '',
                        margin: [0, 30, 0, 0]
                      },
                      {
                        text: '',
                        margin: [0, 30, 0, 0]
                      }],
                      [{
                        text: 'FIRMA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText("")],
                      [{
                        text: 'NOMBRE:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_testigo + '. ' + this.datosPedido.empleado_testigo)],

                      [{
                        text: 'FECHA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 2, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.fecha_testigo)],

                      [{
                        text: 'RAZÓN:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 10, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',// centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, {
                        text: 'En presencia del testigo se deja constancia de que la o el servidor público tiene la negativa de recibir la comunicación de registro de esta acción de personal.',
                        fontSize: 8,
                        margin: [1, 3, 0, 4],
                        border: [false, false, false, false],
                        alignment: 'left',// centra derecha
                        valign: 'middle',// centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 1,
                          paddingBottom: () => 0
                        }
                      }],
                    ]
                  },
                  border: [true, false, false, false],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }],
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
          }],
          [{
            table: {
              widths: ['*', '*', '*'],
              body: [
                [{
                  text: 'RESPONSABLE DE ELABORACIÓN',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f2f2f2',
                  alignment: 'center',// centra verticalmente
                  margin: [0, 2, 0, 2],
                  border: [false, false, false, true],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }, {
                  text: 'RESPONSABLE DE REVISIÓN',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f2f2f2',
                  alignment: 'center',// centra verticalmente
                  margin: [0, 2, 0, 2],
                  border: [true, false, false, true],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }, {
                  text: 'RESPONSABLE DE REGISTRO Y CONTROL',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f2f2f2',
                  alignment: 'center',// centra verticalmente
                  margin: [0, 2, 0, 2],
                  border: [true, false, false, true],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }],
                [{
                  table: {
                    widths: [50, 120],
                    heights: [65],
                    body: [
                      [{
                        text: '',
                        margin: [0, 30, 0, 0]
                      },
                      {
                        text: '',
                        margin: [0, 30, 0, 0]
                      }],
                      [{
                        text: 'FIRMA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionText("")],
                      [{
                        text: 'NOMBRE:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_elaboracion + '. ' + this.datosPedido.empleado_elaboracion)],
                      [{
                        text: 'PUESTO:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.tipo_cargo_elaboracion)],
                      [{
                        text: '',
                        margin: [0, 0, 0, 10]
                      },
                      {
                        text: '',
                        margin: [0, 0, 0, 10]
                      }],
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
                },
                {
                  table: {
                    widths: [50, 120],
                    heights: [65],
                    body: [
                      [{
                        text: '',
                        margin: [0, 30, 0, 0]
                      },
                      {
                        text: '',
                        margin: [0, 30, 0, 0]
                      }],
                      [{
                        text: 'FIRMA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionText('')],
                      [{
                        text: 'NOMBRE:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_revision + '. ' + this.datosPedido.empleado_revision)],
                      [{
                        text: 'PUESTO:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.tipo_cargo_revision)],
                      [{
                        text: '',
                        margin: [0, 0, 0, 10]
                      },
                      {
                        text: '',
                        margin: [0, 0, 0, 10]
                      }],
                    ]
                  },
                  border: [true, false, false, false],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }, {
                  table: {
                    widths: [50, 120],
                    heights: [65],
                    body: [
                      [{
                        text: '',
                        margin: [0, 30, 0, 0]
                      },
                      {
                        text: '',
                        margin: [0, 30, 0, 0]
                      }],
                      [{
                        text: 'FIRMA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionText('')],
                      [{
                        text: 'NOMBRE:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_control + '. ' + this.datosPedido.empleado_control)],
                      [{
                        text: 'PUESTO:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 0, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.tipo_cargo_control)],
                      [{
                        text: '',
                        margin: [0, 0, 0, 10]
                      },
                      {
                        text: '',
                        margin: [0, 0, 0, 10]
                      }],
                    ]
                  },
                  border: [true, false, false, false],
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }]
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
          }]
        ]
      }, layout: {
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

  PresentarHoja1_Parte_5() {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 550, // ancho de la línea
                  y2: 0,
                  lineWidth: 1,
                  dash: { length: 5, space: 3 }, // línea entrecortada
                }
              ],
              border: [false, false, false, false],
              margin: [0, 5, 0, 5],
            }
          ],
          [{
            text: '**USO EXCLUSIVO PARA TALENTO HUMANO',
            bold: true,
            fontSize: 13,
            margin: [7, 2, 0, 2],
            border: [false, false, false, false],
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 550, // ancho de la línea
                  y2: 0,
                  lineWidth: 1,
                  dash: { length: 5, space: 3 }, // línea entrecortada
                }
              ],
              border: [false, false, false, false],
              margin: [0, 5, 0, 5],
            }
          ]
        ]
      },
      layout: 'noBorders',
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9, fillColor: '#d9d9d9', bold: true, },
        itemsTable_d: { fontSize: 9, alignment: "right" },
        itemsTable_e: { fontSize: 7 },
      }
    }
  }

  PresentarHoja1_Parte_6() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{
            text: [
              { text: 'REGISTRO DE NOTIFICACIÓN AL SERVIDOR PÚBLICO DE LA ACCIÓN DE PERSONAL ', bold: true, fontSize: 8, },
              { text: '(primer inciso del art. 22 RGLOSEP, art. 101 COA, art. 66 y 126 ERJAFE)', bold: false, fontSize: 6, }
            ], bold: true,
            fillColor: '#f2f2f2',
            margin: [0, 3, 0, 3],
            border: [true, true, true, true],
            noWrap: false,
            alignment: 'center', // centra horizontalmente
            valign: 'middle',     // centra verticalmente
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [
            {
              table: {
                widths: [200, 20, '*'],
                body: [
                  [{
                    text: 'COMUNICACIÓNELECTRÓNICA: ',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 20, 10, 7],
                    border: [false, false, false, false],
                    alignment: 'right', // centra horizontalmente
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 0,
                      paddingBottom: () => 0
                    }
                  }, this.getCheckBoxCellTalentoHumano(this.datosPedido.comunicacion_electronica),
                  {
                    text: '',
                    border: [false, false, false, false],
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
              border: [true, false, true, false],
              layout: {
                defaultBorder: false, // desactiva cualquier borde por defecto
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
              }
            }
          ],
          [{
            table: {
              widths: ['*', '*'],
              body: [
                [{
                  table: {
                    widths: [90, 120],
                    body: [
                      [{
                        text: 'FECHA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 4, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.fecha_comunicacion)]
                    ]
                  },
                  border: [false, false, false, false],
                },
                {
                  table: {
                    widths: [60, 120],
                    body: [
                      [{
                        text: 'HORA:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 4, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.hora_comunicacion)]
                    ]
                  },
                  border: [false, false, false, false],
                }]
              ]
            },
            border: [true, false, true, false],
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [{
            table: {
              widths: ['*', '*'],
              body: [
                [{
                  table: {
                    widths: [90, '*'],
                    body: [
                      [{
                        text: '** MEDIO:  ',
                        bold: true,
                        fontSize: 7,
                        margin: [0, 4, 0, 0],
                        border: [false, false, false, false],
                        noWrap: false,
                        alignment: 'right',// centra derecha
                        valign: 'middle',     // centra verticalmente
                        layout: {
                          defaultBorder: false, // desactiva cualquier borde por defecto
                          paddingLeft: () => 0,
                          paddingRight: () => 0,
                          paddingTop: () => 0,
                          paddingBottom: () => 0
                        }
                      }, this.getCellPosecionFirmasText(this.datosPedido.medio_comunicacion)]
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
                },
                {

                }]
              ]
            },
            border: [true, false, true, false],
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [{
            table: {
              widths: ['*', '*', '*'],
              body: [
                [{
                  text: '',
                  margin: [0, 30, 0, 0],
                },
                {
                  text: '',
                  margin: [0, 30, 0, 0],
                },
                {
                  text: '',
                  margin: [0, 30, 0, 0],
                }
                ],
                [{},
                this.getCellPosecionFirmasText(''),
                {}
                ],
                [{},
                {
                  text: 'FIRMA DEL RESPONSABLE QUE NOTIFICÓ',
                  fontSize: 7,
                  bold: true,
                  margin: [10, 3, 0, 10],
                  border: [false, false, false, false],
                  noWrap: false,
                  alignment: 'center',     // centra verticalmente
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                },
                {}
                ]
              ]
            },
            border: [true, false, true, false],
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0
            }
          }],
          [{
            table: {
              widths: ['*', 250, '*'],
              body: [
                [{},
                {
                  table: {
                    widths: [50, '*'],
                    body: [
                      [
                        {
                          text: 'NOMBRE: ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          valign: 'middle',     // centra verticalmente
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.abreviatura_comunicacion ? this.datosPedido.abreviatura_comunicacion.trim() + ". " : "" + (this.datosPedido.empleado_comunicacion ? this.datosPedido.empleado_comunicacion.toUpperCase().trim() : ""))
                      ],
                      [
                        {
                          text: 'PUESTO: ',
                          bold: true,
                          fontSize: 7,
                          margin: [0, 2, 0, 0],
                          noWrap: false,
                          alignment: 'right',// centra derecha
                          valign: 'middle',     // centra verticalmente
                          layout: {
                            defaultBorder: false, // desactiva cualquier borde por defecto
                            paddingLeft: () => 0,
                            paddingRight: () => 0,
                            paddingTop: () => 0,
                            paddingBottom: () => 0
                          }
                        }, this.getCellPosecionFirmasText(this.datosPedido.cargo_comunicacion)
                      ]
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
                },
                {}
                ],
              ]
            },
            border: [true, false, true, false],
            layout: {
              defaultBorder: false, // desactiva cualquier borde por defecto
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 10
            }
          }],
          [{
            table: {
              widths: ['*'],
              body: [
                [{
                  text: '**Si la comunicación fue electrónica, se deberá colocar el medio por el cual se notificóal servidor: así como el numero de documento.',
                  bold: true,
                  fontSize: 7,
                  margin: [0, 0, 0, 0],
                  border: [false, false, false, false],
                  noWrap: false,
                  alignment: 'center', // centra horizontalmente
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }],
                [{
                  text: '**Si la comunicación fue electrónica, se registrará la notificación manualmente, de conformidad a lo establecido en el Art. 7, segundo inciso de la LEY DE COMERCIO ELECTRÓNICO, FIRMAS ELECTRÓNICAS Y MENSAJES DE DATOS.',
                  bold: true,
                  fontSize: 7,
                  margin: [0, 0, 0, 5],
                  border: [false, false, false, false],
                  noWrap: false,
                  alignment: 'center', // centra horizontalmente
                  layout: {
                    defaultBorder: false, // desactiva cualquier borde por defecto
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                  }
                }]
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
          }],
        ]
      }
    }
  }

  PresentarHoja1_Parte_7() {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              table: {
                widths: [200, '*'],
                body: [
                  [{
                    text: 'Elaborado por el Ministerio del Trabajo',
                    fontSize: 5,
                    alignment: 'center',// centra verticalmente
                    margin: [0, 5, 0, 5],
                    border: [false, false, false, false],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 10,
                      paddingBottom: () => 10
                    }
                  }, {
                    text: 'Fecha de actualización de formato: 2024-08-23 / Versión: 01.1 / Página 2 de 2',
                    fontSize: 5,
                    alignment: 'center',// centra verticalmente
                    margin: [0, 5, 0, 5],
                    border: [false, false, false, false],
                    layout: {
                      defaultBorder: false, // desactiva cualquier borde por defecto
                      paddingLeft: () => 0,
                      paddingRight: () => 0,
                      paddingTop: () => 10,
                      paddingBottom: () => 10
                    }
                  }]
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
          ]
        ]
      }
    }
  }


}


