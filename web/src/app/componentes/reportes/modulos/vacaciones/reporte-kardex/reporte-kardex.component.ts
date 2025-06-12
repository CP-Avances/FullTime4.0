
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { KardexService } from 'src/app/servicios/reportes/kardex.service';

@Component({
  selector: 'app-reporte-kardex',
  standalone: false,
  templateUrl: './reporte-kardex.component.html',
  styleUrls: ['./reporte-kardex.component.css'],

})

export class ReporteKardexComponent implements OnInit {

  empleados: any = [];

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleadoD: any = [];
  idEmpleado: number;

  anio_inicio = new FormControl('', Validators.required);
  anio_final = new FormControl('', Validators.required);

  public fechasKardexForm = new FormGroup({
    fec_inicio: this.anio_inicio,
    fec_final: this.anio_final
  })

  constructor(
    private restEmpleado: EmpleadoService,
    private restKardex: KardexService,
    private empresa: EmpresaService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerEmpleados();
    this.ObtenerEmpleadoSolicitaKardex(this.idEmpleado);
    this.ObtenerColores();
  }

  ObtenerEmpleados() {
    this.empleados = [];
    this.restEmpleado.ListarEmpleadosActivos().subscribe(res => {
      this.empleados = res;
    });
  }

  // METODO para ver la informacion del empleado
  urlImagen: string;
  nombreEmpresa: string;
  ObtenerEmpleadoSolicitaKardex(idemploy: any) {
    this.empleadoD = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoD = data;
    });
    this.empresa.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.urlImagen = 'data:image/jpeg;base64,' + res.imagen;
      this.nombreEmpresa = res.nom_empresa;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.empresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  f_inicio_reqK: string = '';
  f_final_reqK: string = '';
  estiloK: any = { 'visibility': 'hidden' };
  ValidarRangofechasKardex(form: any) {
    var f_i = new Date(form.fec_inicio)
    var f_f = new Date(form.fec_final)

    if (f_i < f_f) {
      this.toastr.success('Fechas validas', '', {
        timeOut: 6000,
      });
      this.f_inicio_reqK = f_i.toJSON().split('T')[0];
      this.f_final_reqK = f_f.toJSON().split('T')[0];
      this.estiloK = { 'visibility': 'visible' };
    } else if (f_i > f_f) {
      this.toastr.info('Fecha final es menor a la fecha inicial', '', {
        timeOut: 6000,
      });
      this.fechasKardexForm.reset();
    } else if (f_i.toLocaleDateString() === f_f.toLocaleDateString()) {
      this.toastr.info('Fecha inicial es igual a la fecha final', '', {
        timeOut: 6000,
      });
      this.fechasKardexForm.reset();
    }
    console.log(f_i.toJSON());
    console.log(f_f.toJSON());
  }

  kardex: any = [];
  KardexEmpleado(id_empleado: number, palabra: string) {
    if (this.f_inicio_reqK != '' && this.f_final_reqK != '') {
      this.restKardex.ObtenerKardexVacacionDiasCalendarioByIdEmpleado(id_empleado, this.f_inicio_reqK, this.f_final_reqK).subscribe(res => {
        console.log(this.kardex);
        if (!res.message) {
          this.kardex = res;
          this.GenerarPdf(palabra, 3)
        } else {
          this.toastr.error(res.message, 'Error Calculos');
        }
      })
    } else {
      this.toastr.error('Una de las fechas no a sido asignada', 'Error al ingresar Fechas', {
        timeOut: 6000,
      });
    }
  }

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACION DE ARCHIVOS PDF
  * ****************************************************************************************************/
  fechaHoy: string;


  async GenerarPdf(action = 'open', pdf: number) {
    const pdfMake = await this.validar.ImportarPDF();
    let documentDefinition;
    if (pdf === 3) {
      documentDefinition = this.DefinirInformacionPDFKardex();
    }
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  /**********************************************
   *  METODOS PARA IMPRIMIR EL KARDEX
   **********************************************/
  DefinirInformacionPDFKardex() {
    // sessionStorage.setItem('Empleado', this.empleados);
    var f = new Date();
    f.setUTCHours(f.getHours())
    this.fechaHoy = f.toJSON();
    console.log(this.fechaHoy);

    return {
      pageSize: 'A4',
      // pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);

        return [
          {
            table: {
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'F.CARGA: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Fecha de inicio del periodo.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'F.INGRESO: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Fecha de ingreso a la compañia.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'F.SALIDA: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Fecha de termino de contrato.', border: [false, false, false, false], style: ['quote', 'small'] }
                ],
                [
                  { text: 'ACUM: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Dias acumulados hasta el final del periodo.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'C.I: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Número de identificación.', border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'COD: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Código de empleado en el sistema.', border: [false, false, false, false], style: ['quote', 'small'] }
                ]
              ]
            }
          },
          {
            margin: [10, -2, 10, 0],
            columns: [
              'Fecha: ' + fecha + ' Hora: ' + timer,
              {
                text: [
                  {
                    text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                    alignment: 'right', color: 'blue', opacity: 0.5
                  }
                ],
              }
            ],
            fontSize: 10,
            color: '#A4B8FF',
          }
        ]
      },
      content: [
        {
          columns: [
            {
              image: this.urlImagen,
              width: 90,
              height: 40,
            },
            {
              width: '*',
              text: this.nombreEmpresa,
              bold: true,
              fontSize: 20,
              margin: [100, 10, 0, 0],
            }
          ]
        },
        {
          style: 'subtitulos',
          text: 'Reporte - Kardex Vacaciones Días Calendario'
        },
        this.CampoInformacionGeneralKardex(this.kardex.empleado[0].ciudad, this.kardex.empleado[0]),
        this.CampoDetallePeriodo(this.kardex.detalle),
        {
          stack: [
            this.CampoLiquidacionProporcional(this.kardex.proporcional.antiguedad[0], this.kardex.proporcional.periodo[0], this.kardex.liquidacion[0]),
          ],
          style: 'tableLiqPro',
        }
      ],
      styles: {
        tableHeader: { fontSize: 11, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, margin: [0, 5, 0, 5] },
        itemsTableDesHas: { fontSize: 9, margin: [0, 5, 0, 5] },
        itemsTableCentrado: { fontSize: 10, alignment: 'center', margin: [0, 5, 0, 5] },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] },
        tableMargin: { margin: [0, 20, 0, 0] },
        CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 8, 0, 8], fillColor: this.p_color },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3] },
        tableLiqPro: { alignment: 'right', margin: [0, 20, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  CampoInformacionGeneralKardex(ciudad: string, e: any) {
    return {
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          [
            { colSpan: 3, text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'CabeceraTabla' },
            '', ''
          ],
          [
            {
              border: [true, true, false, true],
              bold: true,
              text: 'PERIODO DEL: ' + DateTime.fromFormat(this.f_inicio_reqK, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' AL ' + DateTime.fromFormat(this.f_final_reqK, 'yyyy/MM/dd').toFormat('dd/MM/yyyy'),
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'CIUDAD: ' + ciudad,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'N° REGISTROS: ' + this.kardex.detalle.length,
              style: 'itemsTableInfo'
            }
          ],
          [
            {
              border: [true, true, false, true],
              text: 'EMPLEADO: ' + e.nombre,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'C.C.: ' + e.identificacion,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'COD: ' + e.codigo,
              style: 'itemsTableInfo'
            }
          ],
          [
            {
              border: [true, false, false, true],
              text: 'F.INGRESO: ' + DateTime.fromFormat(e.fec_ingreso.split('T')[0], 'yyyy/MM/dd').toFormat('dd/MM/yyyy'),
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, false, true],
              text: 'F.SALIDA: ',
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, true, true],
              text: ''
            }
          ],
          [
            {
              border: [true, true, false, true],
              text: 'F.CARGA: ' + DateTime.fromFormat(e.fec_carga.split('T')[0], 'yyyy/MM/dd').toFormat('dd/MM/yyyy'),
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, false, true],
              text: 'ESTADO: ' + e.estado,
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, true, true],
              text: 'ACUM: ' + e.acumulado.toString().slice(0, 7),
              style: 'itemsTableInfo',
            }
          ]
        ]
      }
    }
  }

  CampoDetallePeriodo(d: any[]) {
    return {
      style: 'tableMargin',
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', 25, 25, 25, 25, 25, 25],
        body: [
          [
            { rowSpan: 2, text: 'Periodo', style: 'tableHeader' },
            { rowSpan: 2, text: 'Detalle', style: 'tableHeader' },
            { rowSpan: 2, text: 'Desde', style: 'tableHeader' },
            { rowSpan: 2, text: 'Hasta', style: 'tableHeader' },
            { colSpan: 3, text: 'Descuento', style: 'tableHeader' },
            '', '',
            { colSpan: 3, text: 'Saldo', style: 'tableHeader' },
            '', ''
          ],
          [
            '', '', '', '',
            {
              style: 'tableHeader',
              text: 'Dias'
            },
            {
              style: 'tableHeader',
              text: 'Hor'
            },
            {
              style: 'tableHeader',
              text: 'Min'
            },
            {
              style: 'tableHeader',
              text: 'Dias'
            },
            {
              style: 'tableHeader',
              text: 'Hor'
            },
            {
              style: 'tableHeader',
              text: 'Min'
            }
          ],
          ...d.map((obj: any) => {
            return [
              { style: 'itemsTableCentrado', text: obj.periodo },
              { style: 'itemsTable', text: obj.detalle },
              { style: 'itemsTableDesHas', text: obj.desde.split("T")[0] + ' ' + obj.desde.split("T")[1].slice(0, 5) },
              { style: 'itemsTableDesHas', text: obj.hasta.split("T")[0] + ' ' + obj.desde.split("T")[1].slice(0, 5) },
              { style: 'itemsTableCentrado', text: obj.descuento.dias },
              { style: 'itemsTableCentrado', text: obj.descuento.horas },
              { style: 'itemsTableCentrado', text: obj.descuento.min },
              { style: 'itemsTableCentrado', text: obj.saldo.dias },
              { style: 'itemsTableCentrado', text: obj.saldo.horas },
              { style: 'itemsTableCentrado', text: obj.saldo.min }]
          })
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }
  }

  CampoLiquidacionProporcional(antiguedad: any, periodo: any, liquidacion: any) {
    console.log(antiguedad);
    console.log(periodo);
    console.log(liquidacion);
    return {
      table: {
        widths: [25, 25, 25, 25, 25, 25, 25, 25, 25],
        body: [
          [
            { colSpan: 6, text: 'Proporcional', style: 'tableHeader' },
            '', '', '', '', '',
            { rowSpan: 2, colSpan: 3, text: 'Liquidacion', style: 'tableHeader' },
            '', ''
          ],
          [
            { colSpan: 3, text: 'Antigüedad', style: 'tableHeader' },
            '', '',
            { colSpan: 3, text: 'Periódo', style: 'tableHeader' },
            '', '',
            '', '', ''
          ],
          [
            { style: 'tableHeader', text: 'Dias' },
            { style: 'tableHeader', text: 'Hor' },
            { style: 'tableHeader', text: 'Min' },
            { style: 'tableHeader', text: 'Dias' },
            { style: 'tableHeader', text: 'Hor' },
            { style: 'tableHeader', text: 'Min' },
            { style: 'tableHeader', text: 'Dias' },
            { style: 'tableHeader', text: 'Hor' },
            { style: 'tableHeader', text: 'Min' }
          ],
          [
            { style: 'itemsTableCentrado', text: antiguedad.dias },
            { style: 'itemsTableCentrado', text: antiguedad.horas },
            { style: 'itemsTableCentrado', text: antiguedad.min },
            { style: 'itemsTableCentrado', text: periodo.dias },
            { style: 'itemsTableCentrado', text: periodo.horas },
            { style: 'itemsTableCentrado', text: periodo.min },
            { style: 'itemsTableCentrado', text: liquidacion.dias },
            { style: 'itemsTableCentrado', text: liquidacion.horas },
            { style: 'itemsTableCentrado', text: liquidacion.min }
          ],
          [
            { colSpan: 3, text: antiguedad.valor.toString().slice(0, 8), style: 'itemsTableCentrado' },
            '', '',
            { colSpan: 3, text: periodo.valor.toString().slice(0, 8), style: 'itemsTableCentrado' },
            '', '',
            { colSpan: 3, text: liquidacion.valor.toString().slice(0, 8), style: 'itemsTableCentrado' },
            '', ''
          ]
        ]
      }
    }
  }

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  limpiarCamposRangoKardex() {
    this.fechasKardexForm.reset();
    this.estiloK = { 'visibility': 'hidden' };
  }

  limpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }

}
