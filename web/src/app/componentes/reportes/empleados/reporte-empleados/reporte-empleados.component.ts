import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { IReporteEmpleados, IRestListEmpl } from 'src/app/model/reportes.model';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { KardexService } from 'src/app/servicios/reportes/kardex.service';
import { ConfigEmpleadosComponent } from '../../configuracion-reportes/config-report-empleados/config-empleados.component';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-reporte-empleados',
  templateUrl: './reporte-empleados.component.html',
  styleUrls: ['./reporte-empleados.component.css'],
})
export class ReporteEmpleadosComponent implements OnInit {

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);

  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';
  filtroApellido: '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleados: any = [];
  empleadoD: any = [];
  idEmpleado: number;

  constructor(
    private restEmpleado: EmpleadoService,
    private restKardex: KardexService,
    private empresa: EmpresaService,
    private toastr: ToastrService,
    private openVentana: MatDialog
  ) { }

  ngOnInit(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerEmpleados();
    this.ObtenerEmpleadoSolicitaKardex(this.idEmpleado);
    this.MensajeInicio()
  }

  MensajeInicio() {
    if (!!sessionStorage.getItem('arrayConfig') === false) {
      this.toastr.info('Configurar primero los campos a imprimir', 'Configurar campos Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteEmpleados();
      });
    }
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  lista: any = [];
  ListaEmpleadosDetallado(palabra: string) {
    var id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.restKardex.ListadoEmpleadosConDepartamentoRegimen(id_empresa).subscribe(res => {
      this.lista = res
      // console.log(this.lista)
      this.generarPdf(palabra, 2)
    })
  }

  ConfiguracionReporteEmpleados() {
    this.openVentana.open(ConfigEmpleadosComponent, { width: '300px' }).afterClosed();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACION DE ARCHIVOS PDF 
  * ****************************************************************************************************/
  fechaHoy: string;

  generarPdf(action = 'open', pdf: number) {

    let documentDefinition;

    if (pdf === 2) {
      documentDefinition = this.getDocumentDefinicionListaEmpleados();
    }

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  /**********************************************
   *  METODOS PARA IMPRIMIR LA LISTA DE EMPLEADOS
   **********************************************/
  getDocumentDefinicionListaEmpleados() {
    // sessionStorage.setItem('Empleado', this.empleados);
    var f = new Date();
    f.setUTCHours(f.getHours())
    this.fechaHoy = f.toJSON();
    // console.log(this.fechaHoy);
    return {
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        fecha = f.toJSON().split("T")[0];
        var timer = f.toJSON().split("T")[1].slice(0, 5);
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + timer,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue', opacity: 0.5
                }
              ],
            }
          ],
          fontSize: 10,
          color: '#A4B8FF',
        }
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
              margin: [230, 10, 0, 0],
            }
          ]
        },
        {
          style: 'subtitulos',
          text: 'Listado - Empleados'
        },
        {
          style: 'subtitulos',
          text: 'Cantidad de Empleados: ' + this.lista.length
        },
        this.ObtenerListadoDetallado(this.lista),
      ],
      styles: {
        tableHeaderDetalle: { bold: true, alignment: 'center', fillColor: this.p_color, fontSize: 12, margin: [0, 5, 0, 5] },
        itemsTableDetalle: { fontSize: 10, margin: [0, 5, 0, 5] },
        subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] }
      }
    };
  }

  ObtenerListadoDetallado(datosRest: any[]) {
    console.log(!!sessionStorage.getItem('arrayConfig'));
    console.log(!!sessionStorage.getItem('columnasValidas'));

    if (!!sessionStorage.getItem('arrayConfig') === false) {
      this.toastr.error('Configurar campos a imprimir antes de descargar o visualizar', 'Error Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteEmpleados();
      });

      return { text: 'No has seleccionado ningun campo de impresión.' }
    }

    if (!!sessionStorage.getItem('columnasValidas') === false) {
      this.toastr.error('Configurar campos a imprimir antes de descargar o visualizar', 'Error Pdf', {
        timeOut: 10000,
      }).onTap.subscribe(items => {
        console.log(items);
        this.ConfiguracionReporteEmpleados();
      });

      return { text: 'No has seleccionado ningun campo de impresión.' }
    }

    let columnas = parseInt(sessionStorage.getItem('columnasValidas') as string);
    let s = JSON.parse(sessionStorage.getItem('arrayConfig') as any) as IReporteEmpleados;
    console.log(s);
    return this.FuncionUno(columnas, s, datosRest);

  }

  FuncionUno(columnas: number, configuracion: IReporteEmpleados, datos: any[]) {
    let contador = 0;
    return {
      table: {
        headerRows: 1,
        widths: this.FuncionColumnas(columnas),
        body: [
          this.FuncionTituloColumna(configuracion),
          ...datos.map((obj: IRestListEmpl) => {
            contador = contador + 1;
            var array = [
              { style: 'itemsTableDetalle', text: contador },
              { style: 'itemsTableDetalle', text: obj.cedula },
              { style: 'itemsTableDetalle', text: obj.codigo },
              { style: 'itemsTableDetalle', text: obj.nom_completo },
              { style: 'itemsTableDetalle', text: obj.departamento },
              { style: 'itemsTableDetalle', text: obj.cargo },
              { style: 'itemsTableDetalle', text: obj.grupo },
              { style: 'itemsTableDetalle', text: obj.detalle_grupo }
            ]
            let index = 0;
            let cont = 0;
            if (configuracion.codigo === false) {
              cont = 0;
              array.forEach(ele => {
                if (ele.text === obj.codigo) { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.depart === false) {
              cont = 0;
              array.forEach(ele => {
                if (ele.text === obj.departamento) { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.cargo === false) {
              cont = 0;
              array.forEach(ele => {
                if (ele.text === obj.cargo) { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.grupo === false) {
              cont = 0;
              array.forEach(ele => {
                if (ele.text === obj.grupo) { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            if (configuracion.detall === false) {
              cont = 0;
              array.forEach(ele => {
                if (ele.text === obj.detalle_grupo) { index = cont; }
                cont = cont + 1
              })
              array.splice(index, 1)
            }

            return array
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

  FuncionColumnas(columnas: number) {
    console.log(columnas);
    let col = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
    // var inicio = 8 - columnas;
    console.log(col.slice(0, columnas));

    return col.slice(0, columnas);
  }

  FuncionTituloColumna(configuracion: IReporteEmpleados) {

    var arrayTitulos = [
      { text: 'N°', style: 'tableHeaderDetalle' },
      { text: 'CEDULA', style: 'tableHeaderDetalle' },
      { text: 'CODIGO', style: 'tableHeaderDetalle' },
      { text: 'APELLIDOS Y NOMBRES', style: 'tableHeaderDetalle' },
      { text: 'DEPARTAMENTOS', style: 'tableHeaderDetalle' },
      { text: 'CARGO', style: 'tableHeaderDetalle' },
      { text: 'GRUPO', style: 'tableHeaderDetalle' },
      { text: 'DETALLE GRUPO', style: 'tableHeaderDetalle' }
    ]
    let index = 0;
    let contador = 0;
    if (configuracion.codigo === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'CODIGO') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.depart === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'DEPARTAMENTOS') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.cargo === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'CARGO') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.grupo === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'GRUPO') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    if (configuracion.detall === false) {
      contador = 0;
      arrayTitulos.forEach(obj => {
        if (obj.text === 'DETALLE GRUPO') { index = contador; }
        contador = contador + 1
      })
      arrayTitulos.splice(index, 1)
    }

    console.log(arrayTitulos);

    return arrayTitulos
  }

  exportToExcelListaEmpleados() {
    var id_empresa = parseInt(localStorage.getItem('empresa') as string);
    this.restKardex.ListadoEmpleadosConDepartamentoRegimen(id_empresa).subscribe(res => {
      this.lista = res
      console.log(this.lista)
      const wsl: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.lista);
      const wb: xlsx.WorkBook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, wsl, 'lista-empleados');
      xlsx.writeFile(wb, "lista-empleados" + new Date().getTime() + '.xlsx');
    })
  }

  /**
   * METODOS PARA CONTROLAR INGRESO DE LETRAS
   */

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  limpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }
}
