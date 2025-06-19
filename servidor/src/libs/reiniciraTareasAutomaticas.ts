import { tareasAutomaticas, TAREAS } from './tareasAutomaticas';

// REINICIA DINAMICAMENTE LAS TAREAS QUE USAN EL PARAMETRO AFECTADO.

export async function reiniciarTareasAutomaticas(id: string | number): Promise<void> {

    const id_parametro = parseInt(id as string, 10);

    if (isNaN(id_parametro)) return;

    console.log(`Reiniciando tareas automáticas para el parámetro con id: ${id_parametro}`);

    for (const tarea of TAREAS) {
        if (
            tarea.envioId === id_parametro ||
            tarea.horaId === id_parametro ||
            tarea.diaId === id_parametro
        ) {
            tareasAutomaticas.DetenerTarea(tarea.clave);
            await tareasAutomaticas.EjecutarProgramacionTareas(tarea);
        }
    }

}