import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';

import { ITableEmpleados, IReportePuntualidad, model_pdf_puntualidad } from 'src/app/model/reportes.model';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-reporte-puntualidad',
  templateUrl: './reporte-puntualidad.component.html',
  styleUrls: ['./reporte-puntualidad.component.css']
})
export class ReportePuntualidadComponent implements OnInit, OnDestroy {

  get rangoFechas() { return this.reporteService.rangoFechas; }

  get opcion() { return this.reporteService.opcion; }

  get bool() { return this.reporteService.criteriosBusqueda; }

  public ParametrosForm = new FormGroup({
    menor: new FormControl('', Validators.required),
    intermedio: new FormControl(''),
    mayor: new FormControl('', Validators.required)
  })

  respuesta: any[];
  sucursales: any = [];
  departamentos: any = [];
  empleados: any = [];

  data_pdf: any = [];

  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }

  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };

  constructor(
    private toastr: ToastrService,
    private reporteService: ReportesService,
    private R_asistencias: ReportesAsistenciasService,
    private restEmpre: EmpresaService,
    public validar: ValidacionesService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('reporte_puntualidad');
    this.R_asistencias.DatosGeneralesUsuarios().subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_puntualidad', JSON.stringify(res))
      this.sucursales = res.map((obj: any) => {
        return {
          id: obj.id_suc,
          nombre: obj.name_suc
        }
      });

      res.forEach((obj: any) => {
        obj.departamentos.forEach((ele: any) => {
          this.departamentos.push({
            id: ele.id_depa,
            nombre: ele.name_dep
          })
        })
      })

      res.forEach((obj: any) => {
        obj.departamentos.forEach((ele: any) => {
          ele.empleado.forEach(r => {
            this.empleados.push({
              id: r.id,
              nombre: r.name_empleado,
              codigo: r.codigo,
              cedula: r.cedula
            })
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);

    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ngOnDestroy(): void {
    this.respuesta = [];
    this.sucursales = [];
    this.departamentos = [];
    this.empleados = [];
  }

  parametrizacion: any = '';
  onSubmitParametros() {
    this.parametrizacion = this.ParametrosForm.value;
    // console.log(this.ParametrosForm.value);
    this.toastr.success('Parametros Guardados')
  }

  /**
   * Funciones para validar los campos y las fechas de rangos del reporte
   */

  /**
   * VALIDACIONES REPORT
   */
  validacionReporte(action) {

    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de busqueda')
    if (this.bool.bool_suc === false && this.bool.bool_dep === false && this.bool.bool_emp === false) return this.toastr.error('Seleccione un criterio de búsqueda')
    if (this.parametrizacion === '') return this.toastr.error('Ingrese rango de semaforización para generar Reporte', 'Falta Semaforización')

    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione sucursal')
        this.ModelarSucursal(action);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione departamentos')
        this.ModelarDepartamento(action);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0) return this.toastr.error('No a seleccionado ninguno', 'Seleccione empleados')
        this.ModelarEmpleados(action);
        break;
      default:
        this.bool.bool_suc = false; this.bool.bool_dep = false; this.bool.bool_emp = false;
        break;
    }
  }

  ModelarSucursal(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_puntualidad') as any)

    let suc = respuesta.filter((o: any) => {
      var bool = this.selectionSuc.selected.find((obj1: any) => {
        return obj1.id === o.id_suc
      })
      return bool != undefined
    })

    console.log('SUCURSAL', suc);
    this.data_pdf = [];
    this.R_asistencias.ReportePuntualidadMultiple(suc, this.rangoFechas.fec_inico, this.rangoFechas.fec_final, this.parametrizacion).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
        default: this.GenerarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarDepartamento(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_puntualidad') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter((o: any) => {
        var bool = this.selectionDep.selected.find((obj1: any) => {
          return obj1.id === o.id_depa
        })
        return bool != undefined
      })
    })
    let dep = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });
    console.log('DEPARTAMENTOS', dep);
    this.data_pdf = [];

    this.R_asistencias.ReportePuntualidadMultiple(dep, this.rangoFechas.fec_inico, this.rangoFechas.fec_final, this.parametrizacion).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
        default: this.GenerarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  ModelarEmpleados(accion) {

    let respuesta = JSON.parse(sessionStorage.getItem('reporte_puntualidad') as any)

    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((element: any) => {
        element.empleado = element.empleado.filter((o: any) => {
          var bool = this.selectionEmp.selected.find((obj1: any) => {
            return obj1.id === o.id
          })
          return bool != undefined
        })
      });
    })
    respuesta.forEach((obj: any) => {
      obj.departamentos = obj.departamentos.filter(e => {
        return e.empleado.length > 0
      })
    });

    let emp = respuesta.filter(obj => {
      return obj.departamentos.length > 0
    });

    console.log('EMPLEADOS', emp);
    this.data_pdf = [];
    this.R_asistencias.ReportePuntualidadMultiple(emp, this.rangoFechas.fec_inico, this.rangoFechas.fec_final, this.parametrizacion).subscribe(res => {
      this.data_pdf = res
      console.log(this.data_pdf);
      switch (accion) {
        case 'excel': this.exportToExcel(); break;
        default: this.GenerarPdf(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }


  /***************************
   *
   * COLORES Y LOGO PARA EL REPORTE
   *
   *****************************/

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

  /******************************************************
   *
   *          PDF
   *
   *******************************************/


  async GenerarPdf(action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    var f = new Date()
    let doc_name = "Reporte puntualidad" + f.toLocaleString() + ".pdf";
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 40],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      //  |
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -40, 0, 10] },
        { text: 'Reporte de Empleados Puntuales', bold: true, fontSize: 13, alignment: 'center', margin: [0, 0, 0, 10] },
        { text: 'Periodo del: ' + this.rangoFechas.fec_inico + " al " + this.rangoFechas.fec_final, bold: true, fontSize: 13, alignment: 'center' },
        ...this.impresionDatosPDF(this.data_pdf).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableMarginDep: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let n: any = []
    let c = 0;
    let arr_aux: Array<model_pdf_puntualidad> = [];
    let cont_color_verde = 0;
    let cont_color_naranja = 0;
    let cont_color_rojo = 0;

    data.forEach((obj: IReportePuntualidad) => {
      obj.departamentos.forEach((obj1: any) => {
        obj1.empleado.forEach((obj2: any) => {
          let e = {
            cargo: obj2.cargo,
            cedula: obj2.cedula,
            ciudad: obj.ciudad,
            codigo: obj2.codigo,
            color: obj2.color,
            contrato: obj2.contrato,
            name_dep: obj1.name_dep,
            name_empleado: obj2.name_empleado,
            puntualidad: obj2.puntualidad
          } as model_pdf_puntualidad;

          console.log(e);
          if (e.color === '#06F313') {
            cont_color_verde = cont_color_verde + 1;
          } else if (e.color === '#EC2E05') {
            cont_color_rojo = cont_color_rojo + 1;
          } else if (e.color === '#F38306') {
            cont_color_naranja = cont_color_naranja + 1;
          }

          arr_aux.push(e);
        });
      });
    })

    n.push({
      style: 'tableMarginDep',
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'N°', style: 'tableHeader' },
            { text: 'Empleado', style: 'tableHeader' },
            { text: 'Cédula', style: 'tableHeader' },
            { text: 'Código', style: 'tableHeader' },
            { text: 'Ciudad', style: 'tableHeader' },
            { text: 'Departamento', style: 'tableHeader' },
            { text: 'Cargo', style: 'tableHeader' },
            { text: 'Contrato', style: 'tableHeader' },
            { text: 'Color', style: 'tableHeader' },
            { text: 'Días Puntuales', style: 'tableHeader' }
          ],
          ...arr_aux.map((obj: any) => {
            c = c + 1
            return [
              { style: 'itemsTableCentrado', text: c },
              { style: 'itemsTable', text: obj.name_empleado },
              { style: 'itemsTableCentrado', text: obj.cedula },
              { style: 'itemsTableCentrado', text: obj.codigo },
              { style: 'itemsTableCentrado', text: obj.ciudad },
              { style: 'itemsTable', text: obj.name_dep },
              { style: 'itemsTable', text: obj.cargo },
              { style: 'itemsTable', text: obj.contrato },
              { style: 'itemsTableCentrado', text: '', fillColor: obj.color },
              { style: 'itemsTableCentrado', text: obj.puntualidad }
            ]
          })
        ]
      }
    });

    n.push({
      columns: [
        {
          width: 'auto',
          bold: true, fontSize: 8, margin: [0, 5, 2, 5],
          text: 'Color Verde:', color: '#06F313'
        },
        {
          bold: true, fontSize: 8, margin: [0, 5, 0, 5],
          text: 'Mayor o igual a ' + this.parametrizacion.mayor + ' días significa que el o los empleados con esta cantidad de días son muy putuales.'
        }
      ]
    })
    n.push({
      columns: [
        {
          width: 'auto',
          bold: true, fontSize: 8, margin: [0, 5, 2, 5],
          text: 'Color Naranja:', color: '#F38306'
        },
        {
          bold: true, fontSize: 8, margin: [0, 5, 0, 5],
          text: ' Días entre ' + this.parametrizacion.mayor + ' y ' + this.parametrizacion.menor + ' son empleados que tienen un margen de puntualidad aceptable'
        }
      ]
    })
    n.push({
      columns: [
        {
          width: 'auto',
          bold: true, fontSize: 8, margin: [0, 5, 2, 5],
          text: 'Color Rojo:', color: '#EC2E05'
        },
        {
          bold: true, fontSize: 8, margin: [0, 5, 0, 5],
          text: 'Menor o igual a ' + this.parametrizacion.menor + ' días significa que el o los empleados con esta cantidad de días tienen más atrasos laborales que días puntuales.'
        }
      ]
    })

    n.push({
      columns: [
        { width: 250, text: '' },
        {
          style: 'tableMarginDep',
          table: {
            widths: [30, 'auto', 'auto'],
            body: [
              [
                { text: 'Color', style: 'tableHeader' },
                { text: 'Parámetro', style: 'tableHeader' },
                { text: 'Cantidad Colaboradores', style: 'tableHeader' }
              ],
              [ // parametro verde
                { text: '', fillColor: '#06F313' },
                { text: '>= ' + this.parametrizacion.mayor, style: 'itemsTableCentrado' },
                { text: cont_color_verde, style: 'itemsTableCentrado' }
              ],
              [ // parametro naranja
                { text: '', fillColor: '#F38306' },
                { text: 'Entre ' + this.parametrizacion.mayor + ' días y ' + this.parametrizacion.menor + ' días.', style: 'itemsTableCentrado' },
                { text: cont_color_naranja, style: 'itemsTableCentrado' }
              ],
              [ // parametro rojo
                { text: '', fillColor: '#EC2E05' },
                { text: '<= ' + this.parametrizacion.menor, style: 'itemsTableCentrado' },
                { text: cont_color_rojo, style: 'itemsTableCentrado' }
              ]
            ]
          }
        },
        { width: 250, text: '' }
      ]
    });

    return n
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel(): void {
/*
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.MapingDataPdfDefault(this.data_pdf));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Puntualidad');
    xlsx.writeFile(wb, "Puntualidad " + new Date().getTime() + '.xlsx');
*/
  }

  MapingDataPdfDefault(array: Array<any>) {
    let nuevo: Array<any> = [];
    array.forEach((obj1: IReportePuntualidad) => {
      obj1.departamentos.forEach((obj2: any) => {
        obj2.empleado.forEach((obj3: any) => {
          let ele = {
            'Id Sucursal': obj1.id_suc, 'Ciudad': obj1.ciudad, 'Sucursal': obj1.name_suc,
            'Id Departamento': obj2.id_depa, 'Departamento': obj2.name_dep,
            'Id Empleado': obj3.id, 'Nombre Empleado': obj3.name_empleado, 'Cédula': obj3.cedula, 'Código': obj3.codigo,
            'Género': obj3.genero, 'Contrato': obj3.contrato, 'Cargo': obj3.cargo, 'Puntualidad': obj3.puntualidad
          }
          nuevo.push(ele)
        })
      })
    })
    return nuevo
  }


  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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

  MostrarLista() {
    if (this.opcion === 's') {
      /*this.nombre_suc.reset();
      this.Filtrar('', 1)*/
    }
    else if (this.opcion === 'd') {
      /* this.nombre_dep.reset();
       this.Filtrar('', 2)*/
    }
    else if (this.opcion === 'e') {
      /*this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this.Filtrar('', 3)
      this.Filtrar('', 4)
      this.Filtrar('', 5)*/
    }
  }
}
