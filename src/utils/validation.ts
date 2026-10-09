/**
 * Función de validación para el formulario de 'Reportar nuevo precio'.
 * 
 * Verifica que:
 * 1. La tarifa sea un número entero o decimal positivo mayor que 0.
 * 2. La tarifa reportada no varíe más del 50% con respecto al precio actual registrado.
 * 3. Devuelve un mensaje de error claro o un objeto formateado listo para enviar.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SE EQUIVOCA:
 * - Usar Number(input) directamente: En JS, Number("") da 0, y Number(" ") da 0.
 * - Olvidar comparar límites superior e inferior (un precio no puede bajar a menos de la mitad
 *   ni subir más de 1.5 veces de un solo golpe sin ser probablemente un error de digitación).
 * - Manejo de decimales vs redondeo: Tarifas en transporte público suelen redondearse al entero
 *   más cercano o tener hasta 2 decimales según la moneda.
 */

export interface ValidationSuccessResult {
  esValido: true;
  error: null;
  datosFormateados: {
    tarifaAnterior: number;
    tarifaNueva: number;
    diferencia: number;
    porcentajeVariacion: number;
    fechaEfectiva: string;
    nota?: string;
  };
}

export interface ValidationErrorResult {
  esValido: false;
  error: string;
  datosFormateados: null;
}

export type ValidacionReporteResultado = ValidationSuccessResult | ValidationErrorResult;

export interface ParametrosValidacionReporte {
  tarifaActual: number;
  tarifaIngresada: string | number;
  fechaIngresada: string;
  notaOpcional?: string;
  simboloMoneda?: string;
}

/**
 * Valida el reporte de nuevo precio.
 * 
 * @param params Objeto con tarifaActual, tarifaIngresada, fechaIngresada, notaOpcional y simboloMoneda
 * @returns Objeto con estado `esValido`, mensaje de `error` o `datosFormateados` listos para guardar
 */
export function validarReporteNuevoPrecio({
  tarifaActual,
  tarifaIngresada,
  fechaIngresada,
  notaOpcional = '',
  simboloMoneda = '₡',
}: ParametrosValidacionReporte): ValidacionReporteResultado {
  // 1. Validación de tarifa actual base
  if (typeof tarifaActual !== 'number' || isNaN(tarifaActual) || tarifaActual <= 0) {
    return {
      esValido: false,
      error: 'La tarifa actual de referencia no es válida en el sistema.',
      datosFormateados: null,
    };
  }

  // 2. Validación de entrada vacía o tipo inválido
  if (tarifaIngresada === undefined || tarifaIngresada === null || String(tarifaIngresada).trim() === '') {
    return {
      esValido: false,
      error: 'Por favor ingresá un monto para la nueva tarifa.',
      datosFormateados: null,
    };
  }

  // 3. Conversión estricta a número
  const valorLimpio = String(tarifaIngresada).trim().replace(',', '.');
  const nuevaTarifaNum = Number(valorLimpio);

  // Verificar que sea un número válido, finito y positivo (> 0)
  if (isNaN(nuevaTarifaNum) || !isFinite(nuevaTarifaNum) || nuevaTarifaNum <= 0) {
    return {
      esValido: false,
      error: 'La tarifa debe ser un número entero o decimal positivo mayor a cero.',
      datosFormateados: null,
    };
  }

  // Redondear a 2 decimales para evitar problemas de precisión en coma flotante de JS (0.1 + 0.2)
  const nuevaTarifaRedondeada = Math.round(nuevaTarifaNum * 100) / 100;

  // 4. Verificación de variación máxima del 50%
  // Límite inferior: -50% (tarifaActual * 0.5)
  // Límite superior: +50% (tarifaActual * 1.5)
  const limiteMinimo = Math.round((tarifaActual * 0.5) * 100) / 100;
  const limiteMaximo = Math.round((tarifaActual * 1.5) * 100) / 100;

  const diferencia = nuevaTarifaRedondeada - tarifaActual;
  const porcentajeVariacion = Math.round((Math.abs(diferencia) / tarifaActual) * 100);

  if (nuevaTarifaRedondeada < limiteMinimo || nuevaTarifaRedondeada > limiteMaximo) {
    const esMayor = nuevaTarifaRedondeada > limiteMaximo;
    return {
      esValido: false,
      error: `La tarifa reportada (${simboloMoneda}${nuevaTarifaRedondeada}) varía un ${porcentajeVariacion}%, superando el límite permitido del 50%. Debe estar entre ${simboloMoneda}${limiteMinimo} y ${simboloMoneda}${limiteMaximo} para evitar datos erróneos o bromas.`,
      datosFormateados: null,
    };
  }

  // 5. Validación de la fecha (si se proporciona)
  let fechaLimpia = (fechaIngresada || '').trim();
  if (!fechaLimpia || !/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia)) {
    // Si no tiene fecha válida, se usa la fecha actual local
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    fechaLimpia = `${y}-${m}-${d}`;
  }

  // 6. Retorno exitoso con objeto formateado listo para enviar / persistir
  return {
    esValido: true,
    error: null,
    datosFormateados: {
      tarifaAnterior: tarifaActual,
      tarifaNueva: nuevaTarifaRedondeada,
      diferencia: Math.round(diferencia * 100) / 100,
      porcentajeVariacion,
      fechaEfectiva: fechaLimpia,
      nota: notaOpcional.trim() || undefined,
    },
  };
}
