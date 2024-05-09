import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xml2js from 'xml2js';

import { RegistroProvinciaComponent } from '../registro-provincia/registro-provincia.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ProvinciaService } from '../../../../servicios/catalogos/catProvincias/provincia.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-principal-provincia',
  templateUrl: './principal-provincia.component.html',
  styleUrls: ['./principal-provincia.component.css'],
})

export class PrincipalProvinciaComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS
  provincias: any = [];
  filtroPais = '';
  filtroProvincia = '';
  empleado: any = [];
  idEmpleado: number;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  confirmacion = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  paisF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    paisForm: this.paisF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    private toastr: ToastrService,
    private router: Router,
    public rest: ProvinciaService,
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

    this.ListarProvincias();
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


  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR PROVINCIAS
  ListarProvincias() {
    this.provincias = [];
    this.rest.BuscarProvincias().subscribe(datos => {
      this.provincias = datos;
    })
  }

  // METODO PARA REGISTRAR PROVINCIAS
  AbrirVentanaRegistrarProvincia() {
    this.ventana.open(RegistroProvinciaComponent, { width: '550px' }).afterClosed().subscribe(item => {
      this.ListarProvincias();
    });
  }

  /** ******************************************************************************* **
   ** **                       ELIMAR REGISTRO PROVINCIA                           ** **
   ** ******************************************************************************* **/

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_prov: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.rest.EliminarProvincia(id_prov, datos).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarProvincias();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/provincia']);
        }
      });
  }

  // METODO PARA REGISTRAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      paisForm: '',
      provinciaForm: ''
    });
    this.ListarProvincias;
  }

  /** ************************************************************************************************** **
  ** **                                      METODO PARA EXPORTAR A PDF                              ** **
  ** ************************************************************************************************** **/
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
        pdfMake.createPdf(documentDefinition).download('Provincias' + '.pdf');
        break;

      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  getDocumentDefinicion() {
    sessionStorage.setItem("Provincia", this.provincias);
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        {
          text: "Lista de Provincias",
          bold: true,
          fontSize: 20,
          alignment: "center",
          margin: [0, -30, 0, 10],
        },
        this.presentarDataPDFProvincias(),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: "center" },
      },
    };
  }

  presentarDataPDFProvincias() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto"],
            body: [
              [
                { text: "País", style: "tableHeader" },
                { text: "Provincias", style: "tableHeader" },
              ],
              ...this.provincias.map((obj) => {
                return [
                  { text: obj.pais, style: "itemsTableC" },
                  { text: obj.nombre, style: "itemsTable" },
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
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.provincias);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, "Provincias");
    xlsx.writeFile(wb, "Provincias" + ".xlsx");
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.provincias);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], {
      type: "text/csv;charset=utf-8;",
    });
    FileSaver.saveAs(
      data,
      "ProvinciasCSV" + ".csv"
    );
  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloProvincias: any = [];
    this.provincias.forEach((obj) => {
      objeto = {
        provincia: {
          "$": { "id": obj.id },
          nombre: obj.nombre,
          pais: obj.pais
        },
      };
      arregloProvincias.push(objeto);
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Provincias' });
    const xml = xmlBuilder.buildObject(arregloProvincias);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // Abrir una nueva pestaña o ventana con el contenido XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // Evitar que la nueva pestaña tenga acceso a la ventana padre
      newTab.focus(); // Dar foco a la nueva pestaña
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Provincias.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();

  }

}
