// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR COMPONENTES
import { EditarTipoComidasComponent } from 'src/app/componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { TipoComidasComponent } from 'src/app/componentes/modulos/alimentacion/catTipoComidas/tipos-comidas/tipo-comidas/tipo-comidas.component';
import { DetalleMenuComponent } from '../../detalles-comidas/detalle-menu/detalle-menu.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

@Component({
  selector: 'app-listar-tipo-comidas',
  templateUrl: './listar-tipo-comidas.component.html',
  styleUrls: ['./listar-tipo-comidas.component.css']
})

export class ListarTipoComidasComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);
  tipoF = new FormControl('', [Validators.minLength(1)]);
  archivoForm = new FormControl('', Validators.required);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoComidaForm = new FormGroup({
    nombreForm: this.nombreF,
    tipoForm: this.tipoF
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS
  tipoComidas: any = [];
  empleado: any = [];
  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLE DE NAVEGACION ENTRE RUTAS
  hipervinculo: string = environment.url;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  get habilitarComida(): boolean { return this.funciones.alimentacion; }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    private rest: TipoComidasService, // SERVICIO DATOS DE TIPOS DE SERVICIOS DE COMIDAS
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public router: Router, // VARIABLE DE MANEJO DE RUTAS URL
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    private funciones: MainNavService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarComida === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');

      this.ObtenerEmpleados(this.idEmpleado);
      this.BuscarHora();
    }
  }


  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 2
    this.parametro.ListarDetalleParametros(2).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerTipoComidas(this.formato_hora);
      },
      vacio => {
        this.ObtenerTipoComidas(this.formato_hora);
      });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // EVENTO QUE MUESTRA FILAS DETERMINADAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LECTURA DE DATOS
  ObtenerTipoComidas(formato_hora: string) {
    this.tipoComidas = [];
    this.rest.ConsultarTipoComida().subscribe(datos => {
      this.tipoComidas = datos;
      this.tipoComidas.forEach((data: any) => {
        data.horaInicio = this.validar.FormatearHora(data.hora_inicio, formato_hora);
        data.horaFin = this.validar.FormatearHora(data.hora_fin, formato_hora);
      })
      console.log('tipo comidas ', this.tipoComidas);
      this.ConsultarDetallesComida();
    })
  }

  // METODO PARA LISTAR SERVICIOS DE ALIMENTACION CON SUS DETALLES
  detalles_comida: any = [];
  ConsultarDetallesComida() {
    let informacion: any = [];
    this.detalles_comida = [];
    this.rest.ConsultarDetallesComida().subscribe(datos => {
      informacion = datos;
      this.detalles_comida = this.tipoComidas;
      this.detalles_comida.forEach((comida: any) => {
        comida.detalles = informacion.filter((detalle: any) => detalle.id_horario_comida === comida.id_comida);
      });
      console.log('detalles ', this.detalles_comida)
    })
  }

  // METODO PARA ABRIR FORMULARIO CREAR
  ver_datos: boolean = false;
  ver_lista: boolean = true;
  tipo_id: number;
  AbrirVentanaRegistrar(): void {
    this.ventana.open(TipoComidasComponent, { width: '600px' })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerListaDetalles(items);
          }
        }
      });
  }

  // METODO PARA ABRIR FORMULARIO EDITAR
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarTipoComidasComponent, { width: '600px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items === 2) {
            this.VerListaDetalles(datosSeleccionados.id);
          }
        }
      });
    this.BuscarHora();

  }

  // METODO PARA ABRIR FORMULARIO MENU
  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(DetalleMenuComponent,
      { width: '350px', data: { menu: datosSeleccionados, vista: 'lista' } })
      .afterClosed().subscribe(item => {
        if (item) {
          if (item === 2) {
            this.VerListaDetalles(datosSeleccionados.id);
          }
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoComidaForm.setValue({
      nombreForm: '',
      tipoForm: ''
    });
    this.BuscarHora();
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_tipo: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_tipo, datos).subscribe((res: any) => {

      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });

      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.BuscarHora();
      }

    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarTipoComidas']);
        }
      });
  }

  // METODO PARA VER LISTA DE COMIDAS
  VerListaDetalles(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.tipo_id = id;
  }

  /** ********************************************************************************************** **
   ** **                              METODO PARA EXPORTAR A PDF                                  ** **
   ** ********************************************************************************************** **/
  GenerarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('ServiciosAlimentacion.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
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
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE SERVICIOS DE ALIMENTACIÓN', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableInfo: { fontSize: 9, margin: [0, -1, 0, -1], fillColor: this.p_color },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDF(): Array<any> {
    let n: any = []
    this.detalles_comida.forEach((obj: any) => {
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', '*'],
          headerRows: 2,
          body: [
            [
              { text: `SERVICIO: ${obj.tipo}`, style: 'itemsTableInfo', border: [true, true, false, false] },
              { text: `INICIA: ${obj.horaInicio}`, style: 'itemsTableInfo', border: [false, true, false, false] },
            ],
            [
              { text: `MENÚ: ${obj.nombre}`, style: 'itemsTableInfo', border: [true, false, false, false] },
              { text: `FINALIZA: ${obj.horaFin}`, style: 'itemsTableInfo', border: [false, false, false, false] },
            ],
          ]
        },
      });

      if (obj.detalles.length > 0) {
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [{ rowSpan: 1, text: 'DETALLES', style: 'tableHeader', border: [true, true, true, true] }],
            ]
          }
        });
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'PLATO', style: 'tableHeader' },
                { text: 'VALOR', style: 'tableHeader' },
                { text: 'OBSERVACIÓN', style: 'tableHeader' },
              ],
              ...obj.detalles.map((detalle: any) => {
                return [
                  { text: detalle.plato, style: 'itemsTableCentrado' },
                  { text: '$ ' + detalle.valor, style: 'itemsTableCentrado' },
                  { text: detalle.observacion, style: 'itemsTableCentrado' },
                ];
              })
            ]
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });
      }
    });
    return n;
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel());
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'ServiciosAlimentacion');
    xlsx.writeFile(wb, "ServiciosAlimentacionEXCEL" + '.xlsx');
  }

  EstructurarDatosExcel() {
    let datos: any = [];
    let n: number = 1;
    this.detalles_comida.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        datos.push({
          'N°': n++,
          'SERVICO': obj.tipo,
          'MENÚ': obj.nombre,
          'INICIA': obj.horaInicio,
          'FINALIZA': obj.horaFin,
          'PLATO': det.plato,
          'VALOR': det.valor,
          'OBSERVACIÓN': det.observacion,
        });
      });
    });

    return datos;
  }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/
  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosCSV());
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ServiciosAlimentacionCSV" + '.csv');
  }

  EstructurarDatosCSV() {
    let datos: any = [];
    let n: number = 1;
    this.detalles_comida.forEach((obj: any) => {
      obj.detalles.forEach((det: any) => {
        datos.push({
          'n': n++,
          'servicio': obj.tipo,
          'menu': obj.nombre,
          'inicia': obj.horaInicio,
          'finaliza': obj.horaFin,
          'plato': det.plato,
          'valor': det.valor,
          'observacion': det.observacion,
        });
      });
    });
    return datos;
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                              ** **
   ** ************************************************************************************************* **/
  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios: any = [];
    this.detalles_comida.forEach((obj: any) => {
      let detalles: any = [];
      obj.detalles.forEach((det: any) => {
        detalles.push({
          "plato": det.plato,
          "valor": det.valor,
          "observacion": det.observacion,
        });
      });

      objeto = {
        "servicio_alimentacion": {
          "$": { "id_comida": obj.id_comida },
          "servicio": obj.tipo,
          'menu': obj.nombre,
          'inicia': obj.horaInicio,
          "finaliza": obj.horaFin,
          "detalles": { "detalle": detalles }
        }
      }
      arregloHorarios.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'ServiciosAlimentacion' });
    const xml = xmlBuilder.buildObject(arregloHorarios);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'ServicioAlimentacion.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

}
