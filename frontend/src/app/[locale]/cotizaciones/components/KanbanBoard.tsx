
import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { Cotizacion } from './KanbanCard';
import { toast } from 'sonner';
import api from '@/services/api';

interface KanbanBoardProps {
    cotizaciones: Cotizacion[];
    onStatusChange: () => void; // Para recargar datos si es necesario o notificar al padre
}

export const KanbanBoard = ({ cotizaciones, onStatusChange }: KanbanBoardProps) => {
    const [columns, setColumns] = useState<{ [key: string]: Cotizacion[] }>({
        borrador: [],
        aceptada: [],
        rechazada: []
    });

    // Efecto para distribuir las cotizaciones en las columnas cuando cambian las props
    useEffect(() => {
        const newColumns: { [key: string]: Cotizacion[] } = {
            borrador: [],
            aceptada: [],
            rechazada: []
        };

        cotizaciones.forEach(cot => {
            const status = cot.estado.toLowerCase();
            if (newColumns[status]) {
                newColumns[status].push(cot);
            } else {
                // Por si hay un estado no contemplado, lo mandamos a borrador o lo ignoramos
                // newColumns.borrador.push(cot); 
            }
        });

        setColumns(newColumns);
    }, [cotizaciones]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Si no hay destino o se soltó en el mismo lugar, no hacemos nada
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        // 1. Actualización Optimista (UI First)
        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];

        // Clonamos para no mutar estado directamente
        const newSourceCol = Array.from(sourceCol);
        const newDestCol = source.droppableId === destination.droppableId ? newSourceCol : Array.from(destCol);

        // Removemos de origen
        const [movedCotizacion] = newSourceCol.splice(source.index, 1);

        // Actualizamos el estado interno del objeto movido
        const updatedCotizacion = { ...movedCotizacion, estado: destination.droppableId };

        // Insertamos en destino
        newDestCol.splice(destination.index, 0, updatedCotizacion);

        const newColumns = {
            ...columns,
            [source.droppableId]: newSourceCol,
            [destination.droppableId]: newDestCol
        };

        setColumns(newColumns);

        // 2. Llamada a la API (Background)
        try {
            await api.put(`/cotizaciones/${draggableId}/estado`, {
                estado: destination.droppableId // 'borrador', 'aceptada', 'rechazada'
            });
            // Opcional: onStatusChange() si queremos refrescar todo, 
            // pero con update optimista no hace falta recargar la pantalla.
            // Solo si falla, revertimos.
        } catch (error) {
            console.error("Error actualizando estado:", error);
            toast.error("Error al mover", { description: "No se pudo actualizar el estado. Se revertirán los cambios." });
            // Revertir cambios (forzando recarga de props o deshaciendo estado local)
            onStatusChange();
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                <KanbanColumn status="borrador" cotizaciones={columns.borrador} />
                <KanbanColumn status="aceptada" cotizaciones={columns.aceptada} />
                <KanbanColumn status="rechazada" cotizaciones={columns.rechazada} />
            </div>
        </DragDropContext>
    );
};
