import React, { useState, useEffect } from 'react';
import { BusRoute, PriceReport } from '../types/bus';
import { formatFare } from '../utils/storage';
import { validarReporteNuevoPrecio } from '../utils/validation';
import { X, DollarSign, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PriceReportModalProps {
  route: BusRoute | null;
  onClose: () => void;
  onSubmitReport: (report: PriceReport) => void;
}

/**
 * Modal para reportar un cambio de tarifa con su fecha de vigencia.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SE EQUIVOCA:
 * 1. Inicialización de la fecha de hoy:
 *    Usar `new Date().toISOString().split('T')[0]` puede dar el día de mañana si estás
 *    en una zona como UTC-6 tarde en la noche (porque UTC ya pasó la medianoche).
 *    Deben usarse los métodos locales: `getFullYear()`, `getMonth() + 1`, `getDate()`.
 * 2. Validación numérica en React:
 *    Un `<input type="number">` devuelve un `string`. Si el usuario ingresa un valor
 *    vacío o letras (como 'e'), `Number("")` da 0 o NaN. Debe verificarse estrictamente
 *    que sea un número entero o decimal positivo mayor a 0.
 * 3. Limpieza de estado (Form Reset):
 *    Si el modal se abre para otra ruta, el formulario debe reinicializarse correctamente
 *    para no mostrar datos residuales de la ruta anterior.
 */
export const PriceReportModal: React.FC<PriceReportModalProps> = ({
  route,
  onClose,
  onSubmitReport,
}) => {
  // Función segura para obtener la fecha de hoy en hora LOCAL (evita desfases de UTC)
  const getTodayLocalDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newFareInput, setNewFareInput] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(getTodayLocalDate());
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reiniciar formulario cada vez que cambie la ruta activa
  useEffect(() => {
    if (route) {
      setNewFareInput('');
      setEffectiveDate(getTodayLocalDate());
      setNote('');
      setErrorMessage('');
      setIsSuccess(false);
    }
  }, [route]);

  if (!route) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validación mediante la función centralizada
    const resultado = validarReporteNuevoPrecio({
      tarifaActual: route.currentFare,
      tarifaIngresada: newFareInput,
      fechaIngresada: effectiveDate,
      notaOpcional: note,
      simboloMoneda: route.currencySymbol,
    });

    if (!resultado.esValido) {
      setErrorMessage(resultado.error);
      return;
    }

    const { datosFormateados } = resultado;

    // Creación del reporte tipado listo para enviar
    const newReport: PriceReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      routeId: route.id,
      oldFare: datosFormateados.tarifaAnterior,
      newFare: Math.round(datosFormateados.tarifaNueva),
      effectiveDate: datosFormateados.fechaEfectiva,
      note: datosFormateados.nota,
      createdAt: new Date().toISOString(),
    };

    setIsSuccess(true);

    // Breve pausa para feedback visual antes de cerrar
    setTimeout(() => {
      onSubmitReport(newReport);
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera del formulario */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xs px-2 py-0.5 bg-amber-500 text-slate-950 rounded">
                {route.code}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Reporte Comunitario
              </span>
            </div>
            <h2 id="report-modal-title" className="text-lg font-bold text-white leading-tight">
              Reportar cambio de precio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ruta: <span className="text-slate-200 font-medium">{route.name}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparativa rápida: Tarifa registrada actual */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Tarifa registrada actualmente:</span>
          <span className="font-bold text-amber-400 text-sm">
            {formatFare(route.currentFare, route.currencySymbol)}
          </span>
        </div>

        {/* Mensaje de error si la validación falla */}
        {errorMessage && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo 1: Nuevo precio */}
          <div>
            <label
              htmlFor="new-fare-input"
              className="block text-xs font-bold text-slate-200 mb-1.5"
            >
              Nuevo precio del pasaje (en {route.currencySymbol}) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400 font-bold text-sm">
                {route.currencySymbol}
              </div>
              <input
                id="new-fare-input"
                type="number"
                min="10"
                step="5"
                required
                value={newFareInput}
                onChange={(e) => setNewFareInput(e.target.value)}
                placeholder="Ej: 500"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Rango permitido (±50%):</span>
              <span className="font-semibold text-amber-400/90">
                {route.currencySymbol}{Math.round(route.currentFare * 0.5)} — {route.currencySymbol}{Math.round(route.currentFare * 1.5)}
              </span>
            </div>
          </div>

          {/* Campo 2: Fecha del cambio */}
          <div>
            <label
              htmlFor="effective-date-input"
              className="block text-xs font-bold text-slate-200 mb-1.5"
            >
              Fecha en que comenzó o empezará a regir *
            </label>
            <div className="relative">
              <input
                id="effective-date-input"
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all [color-scheme:dark]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Seleccioná el día del cambio para que la comunidad sepa la vigencia.
            </p>
          </div>

          {/* Campo 3: Nota o referencia opcional */}
          <div>
            <label
              htmlFor="note-input"
              className="block text-xs font-bold text-slate-200 mb-1.5"
            >
              ¿Dónde lo viste o algún detalle? (opcional)
            </label>
            <input
              id="note-input"
              type="text"
              maxLength={80}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Rótulo pegado en el parabrisas / Aumento del lunes"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSuccess}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>¡Reportado!</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  <span>Guardar reporte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
