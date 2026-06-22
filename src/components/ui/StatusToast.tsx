import { useEffect, useState } from 'react';
import { usePencilStore, ToastType } from '@/store/usePencilStore';
import { cn } from '@/lib/utils';

const toastStyles = {
  [ToastType.INFO]: {
    bg: 'bg-blue-500/90 backdrop-blur-md border-blue-400/50',
    shadow: 'shadow-blue-500/25',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [ToastType.SUCCESS]: {
    bg: 'bg-emerald-500/90 backdrop-blur-md border-emerald-400/50',
    shadow: 'shadow-emerald-500/25',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [ToastType.WARNING]: {
    bg: 'bg-amber-500/90 backdrop-blur-md border-amber-400/50',
    shadow: 'shadow-amber-500/25',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

interface ToastItemProps {
  id: number;
  message: string;
  type: ToastType;
  onRemove: (id: number) => void;
}

function ToastItem({ id, message, type, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const style = toastStyles[type];

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    const leaveTimer = setTimeout(() => setIsLeaving(true), 3200);
    const removeTimer = setTimeout(() => onRemove(id), 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium border shadow-lg min-w-[280px] max-w-md',
        'transition-all duration-300 ease-out',
        style.bg,
        style.shadow,
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0 scale-100'
          : isLeaving
          ? 'opacity-0 -translate-y-2 scale-95'
          : 'opacity-0 -translate-y-4 scale-95'
      )}
      style={{
        animation: isVisible && !isLeaving ? 'toastPulse 2s ease-in-out infinite' : undefined,
      }}
    >
      <span className="flex-shrink-0">{style.icon}</span>
      <span className="flex-1 break-words">{message}</span>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onRemove(id), 300);
        }}
        className="flex-shrink-0 ml-1 p-0.5 rounded-md hover:bg-white/20 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function StatusToast() {
  const { toasts, actions } = usePencilStore();

  return (
    <>
      <style>{`
        @keyframes toastPulse {
          0%, 100% {
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
          }
          50% {
            box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onRemove={actions.removeToast}
            />
          </div>
        ))}
      </div>
    </>
  );
}
