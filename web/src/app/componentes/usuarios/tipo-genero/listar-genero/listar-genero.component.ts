import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';

import { SelectionModel } from '@angular/cdk/collections';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import * as xml2js from 'xml2js';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';

@Component({
  selector: 'app-listar-genero',
  standalone: false,

  templateUrl: './listar-genero.component.html',
  styleUrl: './listar-genero.component.scss'
})
export class ListarGeneroComponent {

  // ALMACENAMIENTO DE DATOS
  idEmpleado: number;
  generos: any = [];
  ips_locales: any = '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  empleado: any = [];

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;



  constructor(
    public validar: ValidacionesService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    public restG: GenerosService,



  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);

  }

  generoF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);


  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    //this.ListarProvincias();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerLogo();
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };

    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }


  // METODO PARA BUSCAR PROVINCIAS
  ListarGeneros() {
    this.generos = [];
    this.numero_pagina = 1;

    this.restG.ListarGeneros().subscribe(datos => {
      this.generos = datos;
    })


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
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  AbrirVentanaRegistrarGenero() {

  }


  LimpiarCampos() {

  }

  ConfirmarDeleteMultiple() {

  }


  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


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

  selectionGeneros = new SelectionModel<any>(true, []);

  generosEliminar: any = []

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionGeneros.selected.length;
    return numSelected === this.generos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionGeneros.clear() :
      this.generos.forEach((row: any) => this.selectionGeneros.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.generosEliminar = this.selectionGeneros.selected;
    return `${this.selectionGeneros.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
  }


  ConfirmarDelete(datos: any) {

  }



  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


  async GenerarPdf(action = "open") {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download('Generos' + '.pdf');
        break;

      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }


  DefinirInformacionPDF() {

  }

  async generarExcelProvincias() {
  }



  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  ExportToCSV() {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ProvinciasCSV');
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.generos[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.generos.forEach((obj: any) => {
      worksheet.addRow(obj);
    });

    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "ProvinciasCSV.csv");
    });

  }

  /** ************************************************************************************************* **
     ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
     ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloProvincias: any = [];
    this.generos.forEach((obj: any) => {
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
    a.download = 'Provincias.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }

}
