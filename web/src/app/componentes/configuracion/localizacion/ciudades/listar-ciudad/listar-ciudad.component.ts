import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';


import { RegistrarCiudadComponent } from 'src/app/componentes/configuracion/localizacion/ciudades/registrar-ciudad/registrar-ciudad.component'
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ProvinciaService } from 'src/app/servicios/configuracion/localizacion/catProvincias/provincia.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ITableCiudades } from 'src/app/model/reportes.model';
import { CiudadService } from 'src/app/servicios/configuracion/localizacion/ciudad/ciudad.service';

@Component({
  selector: 'app-listar-ciudad',
  templateUrl: './listar-ciudad.component.html',
  styleUrls: ['./listar-ciudad.component.css'],
})

export class ListarCiudadComponent implements OnInit {

  datosCiudadesEliminar: any = [];

  // ALMACENAMIENTO DE DATOS
  datosCiudades: any = [];
  empleado: any = [];
  idEmpleado: number;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  ciudadF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    ciudadForm: this.ciudadF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public rest: CiudadService,
    public restp: ProvinciaService,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ListarCiudades();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerLogo();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO QUE MANEJA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR CIUDADES
  ListarCiudades() {
    this.datosCiudades = [];
    this.numero_pagina = 1;
    this.rest.ListarNombreCiudadProvincia().subscribe(datos => {
      this.datosCiudades = datos;
    })
  }

  // METODO PARA REGISTRAR CIUDAD
  AbrirVentanaRegistrarCiudad() {
    this.ventana.open(RegistrarCiudadComponent, { width: '600px' }).afterClosed().subscribe(item => {
      this.ListarCiudades();
    });
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectiondatosCiudades.clear();
    this.datosCiudadesEliminar = [];
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      ciudadForm: '',
      provinciaForm: ''
    });
    this.ListarCiudades;
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A PDF                              ** **
   ** ************************************************************************************************** **/


  // GENERACION DE REPORTE DE PDF
  async GenerarPdf(action = "open") {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case "open":
        pdfMake.default.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.default.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.default.createPdf(documentDefinition).download('Ciudades' + '.pdf');
        break;

      default:
        pdfMake.default.createPdf(documentDefinition).open();
        break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: "portrait",
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por:  " +
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
        var f = DateTime.now();
        fecha = f.toFormat("yyyy-MM-dd");
        hora = f.toFormat("HH:mm:ss");
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
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE CIUDADES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFCiudades(),
      ],
      styles: {
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 8 },
        itemsTableC: { fontSize: 8, alignment: "center" },
        tableMargin: { margin: [0, 5, 0, 0] },
      },
    };
  }

  presentarDataPDFCiudades() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          style: 'tableMargin',
          table: {
            widths: ["auto", "auto"],
            body: [
              [
                { text: "Provincia", style: "tableHeader" },
                { text: "Ciudad", style: "tableHeader" },

              ],
              ...this.datosCiudades.map((obj: any) => {
                return [
                  { text: obj.provincia, style: "itemsTableC" },
                  { text: obj.nombre, style: "itemsTableC" },
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

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A EXCEL                            ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.datosCiudades);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, "Ciudades");
    xlsx.writeFile(wb, "Ciudades" + ".xlsx");
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.datosCiudades);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], {
      type: "text/csv;charset=utf-8;",
    });
    FileSaver.saveAs(
      data,
      "CiudadesCSV" + ".csv"
    );
  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloCiudades: any = [];
    this.datosCiudades.forEach((obj: any) => {
      objeto = {
        ciudad: {
          "$": { "id": obj.id },
          nombre: obj.nombre,
          provincia: obj.provincia
        },
      };
      arregloCiudades.push(objeto);
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Ciudades' });
    const xml = xmlBuilder.buildObject(arregloCiudades);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
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
    a.download = 'Ciudades.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();

  }


  /** ************************************************************************************************* **
   ** **                               METODO DE SELECCION MULTIPLE DE DATOS                         ** **
   ** ************************************************************************************************* **/

  // METODOS PARA LA SELECCION MULTIPLE
  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;

  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;
  selectiondatosCiudades = new SelectionModel<ITableCiudades>(true, []);

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectiondatosCiudades.selected.length;
    return numSelected === this.datosCiudades.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectiondatosCiudades.clear() :
      this.datosCiudades.forEach((row: any) => this.selectiondatosCiudades.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableCiudades): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.datosCiudadesEliminar = this.selectiondatosCiudades.selected;

    return `${this.selectiondatosCiudades.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_ciu: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.rest.EliminarCiudad(id_ciu, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ListarCiudades();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.datosCiudadesEliminar = [];
          this.selectiondatosCiudades.clear();
          this.ListarCiudades();
        } else {
          this.router.navigate(['/listarCiudades']);
        }
      });
  }

  // METODO DE ELIMINACION MULTIPLE
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    }
    this.ingresar = false;
    this.contador = 0;
    this.datosCiudadesEliminar = this.selectiondatosCiudades.selected;
    this.datosCiudadesEliminar.forEach((datos: any) => {
      this.datosCiudades = this.datosCiudades.filter(item => item.id !== datos.id);
      this.contador = this.contador + 1;
      this.rest.EliminarCiudad(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
          this.contador = this.contador - 1;
        } else {
          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.ListarCiudades();
        }
      });
    }
    )
  }

  // METODO DE CONFIRMACION DE ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.datosCiudadesEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.datosCiudadesEliminar = [];
            this.selectiondatosCiudades.clear();
            this.ListarCiudades();
          } else {
            this.toastr.warning('No ha seleccionado CIUDADES.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        } else {
          this.router.navigate(['/listarCiudades']);
        }
      });
  }

}
