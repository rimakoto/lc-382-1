import { Pencil, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { usePencilStore, PencilState } from '@/store/usePencilStore';
import { cn } from '@/lib/utils';

export default function ControlPanel() {
  const { pencil, actions } = usePencilStore();
  const { sharpness, currentLength, totalLength, optimalSharpness, color, state } = pencil;

  const isSharpnessOptimal = sharpness >= optimalSharpness;
  const lengthPercent = (currentLength / totalLength) * 100;
  const isLengthLow = lengthPercent < 30;
  const isRemoved = state === PencilState.REMOVED;

  const handleTogglePencil = () => {
    if (isRemoved) {
      actions.insertPencil();
    } else {
      actions.removePencil();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-8 h-8 rounded-lg shadow-inner"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">卷笔刀控制台</h3>
            <p className="text-white/60 text-xs">
              状态:{' '}
              {state === PencilState.INSERTED && '已插入'}
              {state === PencilState.SHARPENING && '正在削...'}
              {state === PencilState.REMOVED && '已取出'}
              {state === PencilState.REPLACED && '已更换'}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/80 text-sm flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                尖锐度
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isSharpnessOptimal ? 'text-green-400' : 'text-white/70'
                )}
              >
                {Math.round(sharpness * 100)}%
                {isSharpnessOptimal && ' ✓'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isSharpnessOptimal
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                )}
                style={{ width: `${sharpness * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/40 text-[10px]">钝</span>
              <span className="text-white/40 text-[10px]">最佳 {Math.round(optimalSharpness * 100)}%</span>
              <span className="text-white/40 text-[10px]">完美</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/80 text-sm flex items-center gap-1.5">
                {isLengthLow ? (
                  <EyeOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                铅笔长度
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isLengthLow ? 'text-red-400' : 'text-white/70'
                )}
              >
                {currentLength.toFixed(2)} / {totalLength.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isLengthLow
                    ? 'bg-gradient-to-r from-red-500 to-orange-400'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                )}
                style={{ width: `${lengthPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/40 text-[10px]">短</span>
              <span
                className={cn(
                  'text-[10px]',
                  isLengthLow ? 'text-red-400 font-medium' : 'text-white/40'
                )}
              >
                {lengthPercent < 30 && '⚠ 不足30%'}
              </span>
              <span className="text-white/40 text-[10px]">全长</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleTogglePencil}
            className={cn(
              'w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]',
              isRemoved
                ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
            )}
          >
            {isRemoved ? (
              <>
                <Eye className="w-4 h-4" />
                放回铅笔
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                取出查看
              </>
            )}
          </button>

          <button
            onClick={actions.replaceWithNewPencil}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            换一支新铅笔
          </button>
        </div>
      </div>
    </div>
  );
}
