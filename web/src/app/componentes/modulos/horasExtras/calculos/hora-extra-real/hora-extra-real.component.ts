import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/horasExtrasReales/horas-extras-reales.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-hora-extra-real',
  templateUrl: './hora-extra-real.component.html',
  styleUrls: ['./hora-extra-real.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class HoraExtraRealComponent implements OnInit {

  empleado: any = [];
  nacionalidades: any = [];


  // Arreglo datos cargo actual
  datosTotales: any = [];

  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'cedula'];

  buscador !: FormGroup;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);

  fechaInicialF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);

  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleadoD: any = [];
  idEmpleado: number;

  constructor(
    public rest: EmpleadoService,
    public restH: HorasExtrasRealesService,
    public restEmpre: EmpresaService,
    public router: Router,
    public restD: DatosGeneralesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.getEmpleados();
    this.obtenerNacionalidades();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.VerDatosContratoA();

  }

  // metodo para ver la informacion del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleadoD = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoD = data;
    })
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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // Mostrar datos de los empleados según su contrato Actual
  VerDatosContratoA(): any {
    this.datosTotales = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosTotales = data;
      console.log('datos_actuales', this.datosTotales)
    });
  }

  pedidos: any = [];
  timbres: any = [];

  CalcularEmpleado(id_seleccionado, form) {
    if (form.inicioForm === '' || form.finalForm === '') {
      this.toastr.info('Ingresar fechas de periodo de búsqueda', '', {
        timeOut: 6000,
      })
    }
    else {
      if (Date.parse(form.inicioForm) < Date.parse(form.finalForm)) {
        let fechas = {
          fechaInicio: form.inicioForm,
          fechaFinal: form.finalForm
        }
        this.pedidos = [];
        this.timbres = [];
        this.restH.ObtenerPedidos(id_seleccionado, fechas).subscribe(data => {
          this.pedidos = data;
          this.restH.ObtenerEntradaSalida(id_seleccionado, fechas).subscribe(data1 => {
            this.timbres = data1;
            this.VerificarTimbres(this.pedidos, this.timbres);
          });
        });
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        })
      }
    }

  }

  CalcularTodos(form: any) {
    if (form.inicioForm === '' || form.finalForm === '') {
      this.toastr.info('Ingresar fechas de Inicio o Fin de periodo de búsqueda.', '', {
        timeOut: 6000,
      })
    }
    else {
      if (Date.parse(form.inicioForm) < Date.parse(form.finalForm)) {
        let fechas = {
          fechaInicio: form.inicioForm,
          fechaFinal: form.finalForm
        }
        this.pedidos = [];
        this.timbres = [];
        this.restH.ObtenerPedidosTodos(fechas).subscribe(data => {
          this.pedidos = data;
          this.restH.ObtenerEntradaSalidaTodos(fechas).subscribe(data1 => {
            this.timbres = data1;
            this.VerificarTimbresTodos(this.pedidos, this.timbres);
          });
        });
      }
      else {
        this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
          timeOut: 6000,
        })
      }
    }
  }

  VerificarNumHoras(horaInicio, horaFin) {
    var hora1 = (String(horaInicio)).split(":"),
      hora2 = (String(horaFin)).split(":"),
      t1 = new Date(),
      t2 = new Date();
    t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
    t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));
    //Aquí hago la resta
    t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
    var tiempoTotal = t1.getHours() + ':' + t1.getMinutes();
    console.log('horas', tiempoTotal)
  }

  VerificarTimbres(listaPedidos: any, listaTimbres: any) {
    console.log('pedidos', listaPedidos);
    console.log('timbres', listaTimbres);
    listaPedidos.forEach((obj: any) => {
      listaTimbres.forEach((element: any) => {
        if (obj.fec_inicio.split('T')[0] === element.fecha_inicio.split('T')[0]) {
          if (element.fecha_inicio.split('T')[1] <= obj.fec_inicio.split('T')[1]) {
            if (element.fecha_fin.split('T')[1] <= obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(obj.fec_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
            }
            else if (element.fecha_fin.split('T')[1] > obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(obj.fec_inicio.split('T')[1], obj.fec_final.split('T')[1]);
            }
          }
          else if (element.fecha_inicio.split('T')[1] > obj.fec_inicio.split('T')[1]) {
            if (element.fecha_fin.split('T')[1] <= obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(element.fecha_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
            }
            else if (element.fecha_fin.split('T')[1] > obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(element.fecha_inicio.split('T')[1], obj.fec_final.split('T')[1]);
            }
          }
          this.VerificarNumHoras(element.fecha_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
        }
      });
    })
  }

  VerificarTimbresTodos(listaPedidos: any, listaTimbres: any) {
    console.log('pedidos', listaPedidos);
    console.log('timbres', listaTimbres);
    listaPedidos.forEach((obj: any) => {
      listaTimbres.forEach((element: any) => {
        if (obj.fec_inicio.split('T')[0] === element.fecha_inicio.split('T')[0] && obj.id_usua_solicita === element.id_empleado) {
          if (element.fecha_inicio.split('T')[1] <= obj.fec_inicio.split('T')[1]) {
            if (element.fecha_fin.split('T')[1] <= obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(obj.fec_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
            }
            else if (element.fecha_fin.split('T')[1] > obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(obj.fec_inicio.split('T')[1], obj.fec_final.split('T')[1]);
            }
          }
          else if (element.fecha_inicio.split('T')[1] > obj.fec_inicio.split('T')[1]) {
            if (element.fecha_fin.split('T')[1] <= obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(element.fecha_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
            }
            else if (element.fecha_fin.split('T')[1] > obj.fec_final.split('T')[1]) {
              this.VerificarNumHoras(element.fecha_inicio.split('T')[1], obj.fec_final.split('T')[1]);
            }
          }
          this.VerificarNumHoras(element.fecha_inicio.split('T')[1], element.fecha_fin.split('T')[1]);
        }
      });
    })
  }

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

  getEmpleados() {
    this.empleado = [];
    this.rest.ListarEmpleadosActivos().subscribe(data => {
      this.empleado = data;
      //console.log(this.empleado);
    })
  }


  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }
  obtenerNacionalidades() {
    this.rest.BuscarNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/

  generarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {

    return {
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = new Date();
        if (f.getMonth() < 10 && f.getDate() < 10) {
          fecha = f.getFullYear() + "-0" + [f.getMonth() + 1] + "-0" + f.getDate();
        } else if (f.getMonth() >= 10 && f.getDate() >= 10) {
          fecha = f.getFullYear() + "-" + [f.getMonth() + 1] + "-" + f.getDate();
        } else if (f.getMonth() < 10 && f.getDate() >= 10) {
          fecha = f.getFullYear() + "-0" + [f.getMonth() + 1] + "-" + f.getDate();
        } else if (f.getMonth() >= 10 && f.getDate() < 10) {
          fecha = f.getFullYear() + "-" + [f.getMonth() + 1] + "-0" + f.getDate();
        }
        // Formato de hora actual
        if (f.getMinutes() < 10) {
          var time = f.getHours() + ':0' + f.getMinutes();
        }
        else {
          var time = f.getHours() + ':' + f.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + time, ,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
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
          text: 'Empleados',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        this.presentarDataPDFEmpleados(),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
        itemsTable: {
          fontSize: 8
        },
        itemsTableD: {
          fontSize: 8,
          alignment: 'center'
        }
      }
    };
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];
  presentarDataPDFEmpleados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Fecha Nacimiento', style: 'tableHeader' },
                { text: 'Correo', style: 'tableHeader' },
                { text: 'Género', style: 'tableHeader' },
                { text: 'Estado Civil', style: 'tableHeader' },
                { text: 'Domicilio', style: 'tableHeader' },
                { text: 'Teléfono', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' },
                { text: 'Nacionalidad', style: 'tableHeader' },
              ],
              ...this.empleado.map((obj: any) => {
                var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
                var genero = this.GeneroSelect[obj.genero - 1];
                var estado = this.EstadoSelect[obj.estado - 1];
                let nacionalidad;
                this.nacionalidades.forEach((element: any) => {
                  if (obj.id_nacionalidad == element.id) {
                    nacionalidad = element.nombre;
                  }
                });
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTableD' },
                  { text: obj.fecha_nacimiento.split("T")[0], style: 'itemsTableD' },
                  { text: obj.correo, style: 'itemsTableD' },
                  { text: genero, style: 'itemsTableD' },
                  { text: estadoCivil, style: 'itemsTableD' },
                  { text: obj.domicilio, style: 'itemsTableD' },
                  { text: obj.telefono, style: 'itemsTableD' },
                  { text: estado, style: 'itemsTableD' },
                  { text: nacionalidad, style: 'itemsTableD' }
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS EXCEL
   * ****************************************************************************************************/

  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleado);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'empleados');
    xlsx.writeFile(wb, "EmpleadoEXCEL" + new Date().getTime() + '.xlsx');
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS XML 
   * ****************************************************************************************************/
  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloEmpleado: any = [];
    this.empleado.forEach((obj: any) => {
      var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
      var genero = this.GeneroSelect[obj.genero - 1];
      var estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad;
      this.nacionalidades.forEach((element: any) => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });

      objeto = {
        "empleado": {
          '@id': obj.id,
          "cedula": obj.cedula,
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fecha_nacimiento.split("T")[0],
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
          "imagen": obj.imagen
        }
      }
      arregloEmpleado.push(objeto)
    });

  }

  /****************************************************************************************************** 
   * METODO PARA EXPORTAR A CSV 
   ******************************************************************************************************/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleado);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadosCSV" + new Date().getTime() + '.csv');
  }







  timbresEntradaSalida: any = [];
  empleadoTimbre: any = [];
  //REPORTES TIMBRES
  ObtenerTimbresEmpleado(emple_id: number) {
    this.timbresEntradaSalida = [];
    this.empleadoTimbre = [];
    this.restH.ObtenerTimbres(emple_id).subscribe(data => {
      this.timbresEntradaSalida = data;
      this.rest.BuscarUnEmpleado(emple_id).subscribe(data => {
        this.empleadoTimbre = data;
      })
    })
  }


  GenerarPDFTimbreEmpleado(action = 'open') {
    const documentDefinition = this.DefinirPDFTimbre();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirPDFTimbre() {

    return {
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido, margin: 10, fontSize: 9, opacity: 0.3 },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = new Date();
        if (f.getMonth() < 10 && f.getDate() < 10) {
          fecha = f.getFullYear() + "-0" + [f.getMonth() + 1] + "-0" + f.getDate();
        } else if (f.getMonth() >= 10 && f.getDate() >= 10) {
          fecha = f.getFullYear() + "-" + [f.getMonth() + 1] + "-" + f.getDate();
        } else if (f.getMonth() < 10 && f.getDate() >= 10) {
          fecha = f.getFullYear() + "-0" + [f.getMonth() + 1] + "-" + f.getDate();
        } else if (f.getMonth() >= 10 && f.getDate() < 10) {
          fecha = f.getFullYear() + "-" + [f.getMonth() + 1] + "-0" + f.getDate();
        }
        // Formato de hora actual
        if (f.getMinutes() < 10) {
          var time = f.getHours() + ':0' + f.getMinutes();
        }
        else {
          var time = f.getHours() + ':' + f.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + time, ,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
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
          text: 'Empleados',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        this.presentarDataPDFEmpleados(),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
        itemsTable: {
          fontSize: 8
        },
        itemsTableD: {
          fontSize: 8,
          alignment: 'center'
        }
      }
    };
  }

  EstructurarPDFTimbres() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Apellido', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Fecha Nacimiento', style: 'tableHeader' },
                { text: 'Correo', style: 'tableHeader' },
                { text: 'Género', style: 'tableHeader' },
                { text: 'Estado Civil', style: 'tableHeader' },
                { text: 'Domicilio', style: 'tableHeader' },
                { text: 'Teléfono', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' },
                { text: 'Nacionalidad', style: 'tableHeader' },
              ],
              ...this.empleadoTimbre.map((obj: any) => {
                var estadoCivil = this.EstadoCivilSelect[obj.estado_civil - 1];
                var genero = this.GeneroSelect[obj.genero - 1];
                var estado = this.EstadoSelect[obj.estado - 1];
                let nacionalidad;
                this.nacionalidades.forEach((element: any) => {
                  if (obj.id_nacionalidad == element.id) {
                    nacionalidad = element.nombre;
                  }
                });
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.apellido, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTableD' },
                  { text: obj.fehac_nacimiento.split("T")[0], style: 'itemsTableD' },
                  { text: obj.correo, style: 'itemsTableD' },
                  { text: genero, style: 'itemsTableD' },
                  { text: estadoCivil, style: 'itemsTableD' },
                  { text: obj.domicilio, style: 'itemsTableD' },
                  { text: obj.telefono, style: 'itemsTableD' },
                  { text: estado, style: 'itemsTableD' },
                  { text: nacionalidad, style: 'itemsTableD' }
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }


}
