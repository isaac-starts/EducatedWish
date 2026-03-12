import React from 'react';
import { Edit3, Trash2, Clock, CheckCircle, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const PostCard = ({ post, onEdit, onDelete, onUpdateStatus }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all group ${isDragging ? 'shadow-2xl shadow-purple-500/50 border-purple-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div 
            {...listeners} 
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white p-1 -ml-2 rounded-md transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <h4 className="font-semibold text-white line-clamp-1 flex-1">{post.title}</h4>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-2">
          <button onClick={() => onEdit(post)} className="text-slate-400 hover:text-white"><Edit3 size={16}/></button>
          <button onClick={() => onDelete(post.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
        </div>
      </div>
      <p className="text-sm text-slate-300 line-clamp-3 mb-4">{post.content}</p>
      
      <div className="flex justify-between items-center text-xs">
        <span className="px-2 py-1 bg-slate-700/50 rounded-md text-slate-400 font-medium">{post.author}</span>
        
        <div className="flex gap-2">
          {post.status === 'draft' && (
            <button 
              onClick={() => onUpdateStatus(post.id, 'scheduled')}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2 py-1 rounded transition-colors">
              <Clock size={14}/> Schedule
            </button>
          )}
          {post.status === 'scheduled' && (
            <button 
              onClick={() => onUpdateStatus(post.id, 'published')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded transition-colors">
              <CheckCircle size={14}/> Publish Now
            </button>
          )}
          {post.status === 'published' && (
            <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
              <CheckCircle size={14}/> Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
