import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})

export class ValidacionesService {

  constructor(
    private toastr: ToastrService,
    private router: Router
  ) { }


  /** ********************************************************************************* **
   ** **                REDIRECCION POR ACCESO A MODULOS NO AUTORIZADOS              ** **
   ** ********************************************************************************* **/

  // REDIRECCIONAMIENTO A LA PAGINA PRINCIPAL DEL ADMINISTRADOR
  RedireccionarHomeAdmin(error: any) {
    const { access, message, url, title } = error;

    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',

      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
      this.router.navigate(['/home']);
    }
  }

  // REDIRECCIONAMIENTO A LA PAGINA PRINCIPAL DEL EMPLEADO
  RedireccionarHomeEmpleado(error: any) {
    const { access, message, url, title } = error;
    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',

      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
      this.router.navigate(['/estadisticas']);
    }
  }

  // REDIRECCIONAMIENTO AL HOME DE LA RUTA ACTUAL
  RedireccionarMixto(error: any) {
    const { access, message, url, title } = error;
    if (access === false) {
      this.toastr.info(message + ' ' + url, title, {
        timeOut: 6000,
        positionClass: 'toast-top-center',
      })
        .onTap.subscribe(items => {
          if (url) {
            window.open(`https://${url}`, "_blank");
          }
        });
      this.router.navigate(['/']);
      // this.router.navigate(['/', { relativeTo: this.route, skipLocationChange: false }]);
    }

  }

  /** ******************************************************************** *
   *                  METODO PARA CONTROLAR INGRESO DE LETRAS              *
   *  ******************************************************************** */
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACION DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos.', 'Usar solo letras.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  /** ******************************************************************** **
   ** **                 METODO PARA CONTROLAR INGRESO DE NUMEROS          **
   ** ** ***************************************************************** **/
  IngresarSoloNumeros(evt: any) {
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
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }


  /** ******************************************************************** **
   ** **                     FORMATO DE FECHA Y HORA                    ** **
   ** ** ***************************************************************** **/
  // METODO PARA FORMATEAR FECHA
  dia_abreviado: string = 'ddd';
  dia_completo: string = 'dddd';

  FormatearFecha(fecha: string, formato: string, dia: string, idioma: string): string {
    let valor: string;
    // CONVERTIR FORMATOS DE FECHA
    if (formato === 'DD/MM/YYYY') {
      formato = 'dd/MM/yyyy';
    }
    else if (formato === 'MM/DD/YYYY') {
      formato = 'MM/dd/yyyy';
    }
    else {
      formato = 'yyyy/MM/dd';
    }
    console.log('ingresa fecha ', fecha)
    // PARSEAR LA FECHA CON LUXON
    const fechaLuxon = DateTime.fromISO(fecha).setLocale(idioma);

    // MANEJAR EL FORMATO PARA EL DIA
    if (dia === 'ddd') {
      const diaAbreviado = fechaLuxon.toFormat('EEE').charAt(0).toUpperCase() +
        fechaLuxon.toFormat('EEE').slice(1);
      valor = diaAbreviado + '. ' + fechaLuxon.toFormat(formato);
    }
    else if (dia === 'no') {
      valor = fechaLuxon.toFormat(formato);
    }
    else {
      const diaCompleto = fechaLuxon.toFormat('EEEE').charAt(0).toUpperCase() +
        fechaLuxon.toFormat('EEEE').slice(1);
      valor = diaCompleto + '. ' + fechaLuxon.toFormat(formato);
    }
    return valor;
  }

  FormatearHora(hora: string, formato: string) {
    //console.log('hora ', hora, ' formato ', formato)
    const horaLuxon = DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);;
    return valor;
  }

  DarFormatoFecha(fechaString: any, formatoSalida: any) {
    let formatos = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd'];
    let fecha: DateTime;
    // VERIFICAR SI LA FECHA ES UN OBJETO MOMENT
    if (typeof fechaString === 'object' && fechaString._isAMomentObject) {
      // SI ES UN OBJETO MOMENT, CONVIÉRTELO A ISO STRING
      fechaString = fechaString.toISOString();
    }
    // SI LA FECHA ES VALIDA EN FORMATO ISO 8601
    fecha = DateTime.fromISO(fechaString);
    if (fecha.isValid) {
      return fecha.toFormat(formatoSalida);
    }
    // SI NO ES ISO, INTENTA CON LOS FORMATOS CONOCIDOS
    for (let formato of formatos) {
      fecha = DateTime.fromFormat(fechaString, formato);
      if (fecha.isValid) {
        return fecha.toFormat(formatoSalida);
      }
    }
    // SI NO ES VALIDA EN NINGUNO DE LOS FORMATOS, DEVUELVE UN ERROR
    console.error('Formato de fecha no válido:', fechaString);
    return null;
  }

  /** ******************************************************************** **
   ** **                  METODO PARA OMITIR DUPLICADOS                    **
   ** ** ***************************************************************** **/
  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicadosSucursales(sucursales: any) {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION SUCURSALES
    let verificados_suc = sucursales.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    sucursales = verificados_suc;
    return sucursales;
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicadosRegimen(regimen: any) {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION REGIMEN
    let verificados_reg = regimen.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    regimen = verificados_reg;
    return regimen;
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicadosDepartamentos(departamentos: any) {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
    let verificados_dep = departamentos.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    departamentos = verificados_dep;
    return departamentos;
  }

  // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
  OmitirDuplicadosCargos(cargos: any) {
    // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION CARGOS
    let verificados_car = cargos.filter((objeto: any, indice: any, valor: any) => {
      // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
      for (let i = 0; i < indice; i++) {
        if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
          return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
        }
      }
      return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
    });
    cargos = verificados_car;
    return cargos;
  }

  /** ******************************************************************** **
   ** **                   METODO PARA SUMAR REGISTROS                  ** **
   ** ** ***************************************************************** **/
  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor;
  }


  /** ******************************************************************** **
   ** **              MODELAMIENTO DE DATOS DE REPORTES                 ** **
   ** ** ***************************************************************** **/

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal(array_general: any, array_modelado: any, datos_seleccionados: any) {
    let seleccionados: any = [];
    array_modelado.forEach((res: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === res.id) {
          seleccionados.push(res);
        }
      });
    });
    seleccionados.forEach((sucursales: any) => {
      sucursales.empleados = array_general.filter((selec: any) => {
        if (selec.id_suc === sucursales.id) {
          return true;
        }
        return false;
      });
    });
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen(array_general: any, array_modelado: any, datos_seleccionados: any) {
    let seleccionados: any = [];
    array_modelado.forEach((res: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === res.id && selec.id_suc === res.id_suc) {
          seleccionados.push(res);
        }
      });
    });
    seleccionados.forEach((regimen: any) => {
      regimen.empleados = array_general.filter((selec: any) => {
        if (selec.id_regimen === regimen.id && selec.id_suc === regimen.id_suc) {
          return true;
        }
        return false;
      });
    });
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento(array_general: any, array_modelado: any, datos_seleccionados: any) {
    let seleccionados: any = [];
    array_modelado.forEach((res: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === res.id && selec.id_suc === res.id_suc) {
          seleccionados.push(res);
        }
      });
    });
    seleccionados.forEach((departamento: any) => {
      departamento.empleados = array_general.filter((selec: any) => {
        if (selec.id_depa === departamento.id && selec.id_suc === departamento.id_suc) {
          return true;
        }
        return false;
      });
    });
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo(array_general: any, array_modelado: any, datos_seleccionados: any) {
    let seleccionados: any = [];
    array_modelado.forEach((res: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === res.id && selec.id_suc === res.id_suc) {
          seleccionados.push(res);
        }
      });
    });
    seleccionados.forEach((cargo: any) => {
      cargo.empleados = array_general.filter((selec: any) => {
        if (selec.id_cargo_ === cargo.id && selec.id_suc === cargo.id_suc) {
          return true;
        }
        return false;
      });
    });
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados(array_modelado: any, datos_seleccionados: any) {
    let seleccionados: any = [{ nombre: 'Empleados' }];
    let datos: any = [];
    array_modelado.forEach((res: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === res.id && selec.id_suc === res.id_suc) {
          datos.push(res);
        }
      });
    });
    seleccionados[0].empleados = datos;
    console.log("ver empleados web ", seleccionados)
    return seleccionados;
  }

  /** ******************************************************************** **
   ** **                PROCESAMIENTO DE LA INFORMACION                 ** **
   ** ** ***************************************************************** **/

  // METODO PARA PROCESAR LA INFORMACION DE SUCURSALES
  ProcesarDatosSucursales(informacion: any) {
    let arreglo_procesar: any = [];
    informacion.forEach((obj: any) => {
      arreglo_procesar.push({
        id: obj.id_suc,
        sucursal: obj.name_suc,
        ciudad: obj.ciudad,
      })
    })
    // RETIRAR DUPLICADOS DE LA LISTA
    arreglo_procesar = this.OmitirDuplicadosSucursales(arreglo_procesar);
    return arreglo_procesar;
  }

  // METODO PARA PROCESAR LA INFORMACION DE REGIMEN
  ProcesarDatosRegimen(informacion: any) {
    let arreglo_procesar: any = [];
    informacion.forEach((obj: any) => {
      arreglo_procesar.push({
        id: obj.id_regimen,
        nombre: obj.name_regimen,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })
    })
    // RETIRAR DUPLICADOS DE LA LISTA
    arreglo_procesar = this.OmitirDuplicadosRegimen(arreglo_procesar);
    return arreglo_procesar;
  }

  // METODO PARA PROCESAR LA INFORMACION DE DEPARTAMENTOS
  ProcesarDatosDepartamentos(informacion: any) {
    let arreglo_procesar: any = [];
    informacion.forEach((obj: any) => {
      arreglo_procesar.push({
        id: obj.id_depa,
        departamento: obj.name_dep,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
      })
    })
    // RETIRAR DUPLICADOS DE LA LISTA
    arreglo_procesar = this.OmitirDuplicadosDepartamentos(arreglo_procesar);
    return arreglo_procesar;
  }

  // METODO PARA PROCESAR LA INFORMACION DE CARGOS
  ProcesarDatosCargos(informacion: any) {
    let arreglo_procesar: any = [];
    informacion.forEach((obj: any) => {
      arreglo_procesar.push({
        id: obj.id_cargo_,
        nombre: obj.name_cargo,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc
      })
    })
    // RETIRAR DUPLICADOS DE LA LISTA
    arreglo_procesar = this.OmitirDuplicadosCargos(arreglo_procesar);
    return arreglo_procesar;
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatosEmpleados(informacion: any) {
    let arreglo_procesar: any = [];
    informacion.forEach((obj: any) => {
      arreglo_procesar.push({
        id: obj.id ?? obj.id_empleado, // VERIFICA SI obj.id existe, SI NO, TOMA obj.id_empleado
        nombre: obj.nombre,
        apellido: obj.apellido,
        codigo: obj.codigo,
        cedula: obj.cedula,
        correo: obj.correo,
        genero: obj.genero,
        id_cargo: obj.id_cargo,
        id_contrato: obj.id_contrato,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        id_depa: obj.id_depa,
        id_cargo_: obj.id_cargo_, // TIPO DE CARGO
        ciudad: obj.ciudad,
        regimen: obj.name_regimen,
        departamento: obj.name_dep,
        cargo: obj.name_cargo,
        hora_trabaja: obj.hora_trabaja,
        rol: obj.name_rol,
        userid: obj.userid,
        app_habilita: obj.app_habilita,
        web_habilita: obj.web_habilita,
        comunicado_mail: obj.comunicado_mail,
        comunicado_noti: obj.comunicado_notificacion
      })
    })
    return arreglo_procesar;
  }


  /** ********************************************************************************* **
   ** **                MODELAMIENTO DE DATOS DE PANTALLAS DEL SISTEMA               ** **
   ** ********************************************************************************* **/

  // TRATAMIENTO DE DATOS POR SUCURSAL
  ModelarSucursal_(array_general: any, datos_seleccionados: any, id: any) {
    let seleccionados: any = [];
    if (id === 0 || id === undefined) {
      array_general.forEach((empl: any) => {
        datos_seleccionados.selected.find((selec: any) => {
          if (empl.id_suc === selec.id) {
            seleccionados.push(empl)
          }
        })
      })
    }
    else {
      array_general.forEach((empl: any) => {
        if (empl.id_suc === id) {
          seleccionados.push(empl)
        }
      })
    }
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR REGIMEN
  ModelarRegimen_(array_general: any, datos_seleccionados: any, id: any, id_sucursal: any) {
    let seleccionados: any = [];
    if (id === 0 || id === undefined) {
      array_general.forEach((empl: any) => {
        datos_seleccionados.selected.find((selec: any) => {
          if (empl.id_regimen === selec.id && empl.id_suc === selec.id_suc) {
            seleccionados.push(empl)
          }
        })
      })
    }
    else {
      array_general.forEach((empl: any) => {
        if (empl.id_regimen === id && empl.id_suc === id_sucursal) {
          seleccionados.push(empl)
        }
      })
    }
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR DEPARTAMENTO
  ModelarDepartamento_(array_general: any, datos_seleccionados: any, id: any, id_sucursal: any) {
    let seleccionados: any = [];
    if (id === 0 || id === undefined) {
      array_general.forEach((empl: any) => {
        datos_seleccionados.selected.find((selec: any) => {
          if (empl.id_depa === selec.id && empl.id_suc === selec.id_suc) {
            seleccionados.push(empl)
          }
        })
      })
    }
    else {
      array_general.forEach((empl: any) => {
        if (empl.id_depa === id && empl.id_suc === id_sucursal) {
          seleccionados.push(empl)
        }
      })
    }
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR CARGO
  ModelarCargo_(array_general: any, datos_seleccionados: any, id: any, id_sucursal: any) {
    let seleccionados: any = [];
    if (id === 0 || id === undefined) {
      array_general.forEach((empl: any) => {
        datos_seleccionados.selected.find((selec: any) => {
          if (empl.id_cargo_ === selec.id && empl.id_suc === selec.id_suc) {
            seleccionados.push(empl)
          }
        })
      })
    }
    else {
      array_general.forEach((empl: any) => {
        if (empl.id_cargo_ === id && empl.id_suc === id_sucursal) {
          seleccionados.push(empl)
        }
      })
    }
    return seleccionados;
  }

  // TRATAMIENTO DE DATOS POR EMPLEADO
  ModelarEmpleados_(array_general: any, datos_seleccionados: any) {
    let seleccionados: any = [];
    array_general.forEach((empl: any) => {
      datos_seleccionados.selected.find((selec: any) => {
        if (selec.id === empl.id) {
          seleccionados.push(empl)
        }
      })
    })
    return seleccionados;
  }

}




