import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const KanbanColumn = ({ id, title, count, children, borderColorClass, headerBgClass, emptyMessage }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const bgStyle = isOver ? 'bg-slate-800/80 ring-2 ring-purple-500/50 scale-[1.02]' : 'bg-slate-900/50';

  return (
    <div ref={setNodeRef} className={`w-80 flex flex-col ${bgStyle} rounded-2xl border ${borderColorClass} backdrop-blur-sm transition-all duration-200`}>
      <div className={`p-4 border-b ${borderColorClass} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          {title}
        </div>
        <span className={`text-xs ${headerBgClass} px-2 py-1 rounded-full`}>{count}</span>
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 h-full min-h-[500px]">
        {children}
        {count === 0 && <p className="text-sm text-slate-500 text-center py-8">{emptyMessage}</p>}
      </div>
    </div>
  );
};

export default KanbanColumn;
