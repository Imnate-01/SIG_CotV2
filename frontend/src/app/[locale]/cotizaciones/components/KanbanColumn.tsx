
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard, Cotizacion } from './KanbanCard';

interface KanbanColumnProps {
    status: string;
    cotizaciones: Cotizacion[];
}

export const KanbanColumn = ({ status, cotizaciones }: KanbanColumnProps) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'borrador': return 'bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-gray-300';
            case 'aceptada': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400';
            case 'rechazada': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
            default: return 'bg-gray-100 dark:bg-zinc-800 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className={`
      flex flex-col h-full min-w-[300px] w-full md:w-1/3 
      rounded-2xl border-2 border-dashed
      ${getStatusColor(status)}
      p-4 transition-colors
    `}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/5 dark:border-white/10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${status === 'aceptada' ? 'bg-emerald-500' :
                            status === 'rechazada' ? 'bg-red-500' : 'bg-slate-400'
                        }`} />
                    {getStatusLabel(status)}
                </h3>
                <span className="bg-white dark:bg-zinc-900 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    {cotizaciones.length}
                </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`
              flex-1 overflow-y-auto px-1 -mx-1
              min-h-[200px] transition-colors rounded-xl
              ${snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''}
            `}
                    >
                        {cotizaciones.map((cotizacion, index) => (
                            <KanbanCard key={cotizacion.id} cotizacion={cotizacion} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
