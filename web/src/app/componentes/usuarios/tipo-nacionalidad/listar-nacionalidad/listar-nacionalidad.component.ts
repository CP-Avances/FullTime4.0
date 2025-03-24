import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { DateTime } from 'luxon';
import { SelectionModel } from '@angular/cdk/collections';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import * as xml2js from 'xml2js';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { NacionalidadService } from 'src/app/servicios/usuarios/catNacionalidad/nacionalidad.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistrarNacionalidadComponent } from '../registrar-nacionalidad/registrar-nacionalidad.component';
import { EditarNacionalidadComponent } from '../editar-nacionalidad/editar-nacionalidad.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-nacionalidad',
  standalone: false,
  
  templateUrl: './listar-nacionalidad.component.html',
  styleUrl: './listar-nacionalidad.component.css'
})
export class ListarNacionalidadComponent {

  // ALMACENAMIENTO DE DATOS
  idEmpleado: number;
  nacionalidades: any = [];
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
    public restG: NacionalidadService,
    public ventana: MatDialog,
    private router: Router, // VARIABLE DE MANEJO DE TUTAS URL
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES



  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);

  }
  

  nacionalidadF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nacionalidadForm: this.nacionalidadF,
  });

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.ListarNacionalidades();
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

// METODO PARA BUSCAR NACIONALIDADES
ListarNacionalidades() {

  this.nacionalidades = [];
  this.numero_pagina = 1;
  this.restG.ListarNacionalidad().subscribe(datos => {
    this.nacionalidades = datos;
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

AbrirVentanaRegistrarNacionalidad() {
  this.ventana.open(RegistrarNacionalidadComponent, { width: '550px' }).afterClosed().subscribe(item => {
    this.ListarNacionalidades();
  });
  this.activar_seleccion = true;
  this.plan_multiple = false;
  this.plan_multiple_ = false;
  this.selectionNacionalidades.clear();
  this.nacionalidadesEliminar = [];
}


AbrirVentanaEditarNacionalidad(datosSeleccionados: any) {
  this.ventana.open(EditarNacionalidadComponent, { width: '400px', data: datosSeleccionados })
    .afterClosed().subscribe(items => {
      this.ListarNacionalidades();
    });
}


LimpiarCampos() {
  this.formulario.setValue({
    nacionalidadForm: '',
  });
  this.ListarNacionalidades();
}

ConfirmarDeleteMultiple() {
  this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        if (this.nacionalidadesEliminar.length != 0) {
          this.EliminarMultiple();
          this.activar_seleccion = true;
          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.nacionalidadesEliminar = [];
          this.selectionNacionalidades.clear();
          this.ListarNacionalidades();
        } else {
          this.toastr.warning('No ha seleccionado nacionalidades.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          })
        }
      } else {
        this.router.navigate(['/nacionalidades']);
      }
    });
}


// METODO DE ELIMINACION MULTIPLE
contador: number = 0;
ingresar: boolean = false;
EliminarMultiple() {
  const data = {
    user_name: this.user_name,
    ip: this.ip, ip_local: this.ips_locales
  };
  this.ingresar = false;
  this.contador = 0;
  this.nacionalidadesEliminar = this.selectionNacionalidades.selected;
  this.nacionalidadesEliminar.forEach((datos: any) => {
    this.nacionalidades = this.nacionalidades.filter(item => item.id !== datos.id);
    this.contador = this.contador + 1;
    this.restG.EliminarNacionalidad(datos.id, data).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con ' + datos.nacionalidad + '.', 'No fue posible eliminar.', {
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
        this.ListarNacionalidades();
      }
    });
  }
  )
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

selectionNacionalidades = new SelectionModel<any>(true, []);

nacionalidadesEliminar: any = []

// SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
isAllSelectedPag() {
  const numSelected = this.selectionNacionalidades.selected.length;
  return numSelected === this.nacionalidades.length
}

// SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
masterTogglePag() {
  this.isAllSelectedPag() ?
    this.selectionNacionalidades.clear() :
    this.nacionalidades.forEach((row: any) => this.selectionNacionalidades.select(row));
}

// LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
checkboxLabelPag(row?: any): string {
  if (!row) {
    return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
  }
  this.nacionalidadesEliminar = this.selectionNacionalidades.selected;
  return `${this.selectionNacionalidades.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;
}


ConfirmarDelete(datos: any) {

  this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        this.Eliminar(datos.id);
        this.activar_seleccion = true;
        this.plan_multiple = false;
        this.plan_multiple_ = false;
        this.nacionalidadesEliminar = [];
        this.selectionNacionalidades.clear();
        this.ListarNacionalidades;
      } else {
        this.router.navigate(['/nacionalidad']);
      }
    });
}

// FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
Eliminar(id_nivel: number) {
  const data = {
    user_name: this.user_name,
    ip: this.ip, ip_local: this.ips_locales
  };
  this.restG.EliminarNacionalidad(id_nivel, data).subscribe((res: any) => {
    if (res.message === 'error') {
      this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
        timeOut: 6000,
      });
    } else {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarNacionalidades();
    }
  });
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
      pdfMake.createPdf(documentDefinition).download('Nacionalidades' + '.pdf');
      break;

    default:
      pdfMake.createPdf(documentDefinition).open();
      break;
  }
}


DefinirInformacionPDF() {
  return {
    // ENCABEZADO DE LA PAGINA
    watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
    header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
    // PIE DE LA PAGINA
    footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
      var f = DateTime.now();
      fecha = f.toFormat('yyyy-MM-dd');
      hora = f.toFormat('HH:mm:ss');
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
        ],
        fontSize: 10
      }
    },
    content: [
      { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
      { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
      { text: 'LISTA DE NACIONALIDADES', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
      this.PresentarDataPDF(),
    ],
    styles: {
      tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
      itemsTableD: { fontSize: 8, alignment: 'center' },
      itemsTable: { fontSize: 8 },
      tableMargin: { margin: [0, 5, 0, 0] },
    }
  };
}


PresentarDataPDF() {
  return {
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        style: 'tableMargin',
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'CÓDIGO', style: 'tableHeader' },
              { text: 'NACIONALIDAD', style: 'tableHeader' },
            ],
            ...this.nacionalidades.map((obj: any) => {
              return [
                { text: obj.id, style: 'itemsTableD' },
                { text: obj.nombre, style: 'itemsTable' },
              ];
            })
          ]
        },
        // ESTILO DE COLORES FORMATO ZEBRA
        layout: {
          fillColor: function (i: any) {
            return (i % 2 === 0) ? '#CCD1D1' : null;
          }
        }
      },
      { width: '*', text: '' },
    ]
  };
}


async generarExcelNacionalidades() {
  this.OrdenarDatos(this.nacionalidades);

  const nacionalidades: any[] = [];
  this.nacionalidades.forEach((nivel: any, index: number) => {
    nacionalidades.push([
      index + 1,
      nivel.id,
      nivel.nombre,
    ]);
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Nacionalidad");


  console.log("ver logo. ", this.logo)
  this.imagen = workbook.addImage({
    base64: this.logo,
    extension: "png",
  });

  worksheet.addImage(this.imagen, {
    tl: { col: 0, row: 0 },
    ext: { width: 220, height: 105 },
  });

  // COMBINAR CELDAS
  worksheet.mergeCells("B1:C1");
  worksheet.mergeCells("B2:C2");
  worksheet.mergeCells("B3:C3");
  worksheet.mergeCells("B4:C4");
  worksheet.mergeCells("B5:C5");

  // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
  worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
  worksheet.getCell("B2").value = "Lista de Nacionalidades".toUpperCase();

  // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
  ["B1", "B2"].forEach((cell) => {
    worksheet.getCell(cell).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(cell).font = { bold: true, size: 14 };
  });


  worksheet.columns = [
    { key: "n", width: 20 },
    { key: "codigo", width: 30 },
    { key: "nacionalidad", width: 40 },
  ];


  const columnas = [
    { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
    { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
    { name: "NACIONALIDAD", totalsRowLabel: "", filterButton: true },
  ];

  worksheet.addTable({
    name: "NivelesTitulosTabla",
    ref: "A6",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium16",
      showRowStripes: true,
    },
    columns: columnas,
    rows: nacionalidades,
  });


  const numeroFilas = nacionalidades.length;
  for (let i = 0; i <= numeroFilas; i++) {
    for (let j = 1; j <= 3; j++) {
      const cell = worksheet.getRow(i + 6).getCell(j);
      if (i === 0) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = {
          vertical: "middle",
          horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
        };
      }
      cell.border = this.bordeCompleto;
    }
  }
  worksheet.getRow(6).font = this.fontTitulo;

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, "NacionalidadEXCEL.xlsx");
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
  }
}

private obtenerAlineacionHorizontalEmpleados(
  j: number
): "left" | "center" | "right" {
  if (j === 1 || j === 9 || j === 10 || j === 11) {
    return "center";
  } else {
    return "left";
  }
}

OrdenarDatos(array: any) {
  function compare(a: any, b: any) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }
  array.sort(compare);
}




/** ************************************************************************************************** **
 ** **                                      METODO PARA EXPORTAR A CSV                              ** **
 ** ************************************************************************************************** **/

ExportToCSV() {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('NacionalidadCSV');
  //  Agregar encabezados dinámicos basados en las claves del primer objeto
  const keys = Object.keys(this.nacionalidades[0] || {}); // Obtener las claves
  worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
  // Llenar las filas con los datos
  this.nacionalidades.forEach((obj: any) => {
    worksheet.addRow(obj);
  });

  workbook.csv.writeBuffer().then((buffer) => {
    const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "NacionalidadCSV.csv");
  });

}

/** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

urlxml: string;
data: any = [];
exportToXML() {
  var objeto: any;
  var arregloNacionalidades: any = [];
  this.nacionalidades.forEach((obj: any) => {
    objeto = {
      nacionalidad: {
        "$": { "id": obj.id },
        nacionalidad: obj.nombre,
      },
    };
    arregloNacionalidades.push(objeto);
  });

  const xmlBuilder = new xml2js.Builder({ rootName: 'Géneros' });
  const xml = xmlBuilder.buildObject(arregloNacionalidades);

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
  a.download = 'Nacionalidad.xml';
  // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
  a.click();
}
}

