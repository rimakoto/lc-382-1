import { create } from 'zustand';

export enum PencilState {
  INSERTED = 'inserted',
  SHARPENING = 'sharpening',
  REMOVED = 'removed',
  REPLACED = 'replaced',
}

export enum ToastType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface PencilAttributes {
  id: string;
  color: string;
  totalLength: number;
  currentLength: number;
  sharpness: number;
  minimumLength: number;
  optimalSharpness: number;
  state: PencilState;
  rotationProgress: number;
}

interface SharpeningSession {
  isDragging: boolean;
  crankAngle: number;
  crankAngularVelocity: number;
  shavingsCount: number;
  hasReachedOptimal: boolean;
  lastShavingEmitAngle: number;
}

interface PencilStore {
  pencil: PencilAttributes;
  session: SharpeningSession;
  toasts: Toast[];
  showOptimalToast: boolean;
  actions: {
    updateCrankRotation: (deltaAngle: number) => void;
    applyInertia: (deltaTime: number) => void;
    removePencil: () => void;
    insertPencil: () => void;
    replaceWithNewPencil: () => void;
    startDragging: () => void;
    stopDragging: () => void;
    reset: () => void;
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
    emitShaving: () => void;
  };
}

const PENCIL_COLORS = [
  '#FFC107',
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#8E24AA',
  '#FB8C00',
];

const createNewPencil = (): PencilAttributes => ({
  id: Math.random().toString(36).substring(7),
  color: PENCIL_COLORS[Math.floor(Math.random() * PENCIL_COLORS.length)],
  totalLength: 4.5,
  currentLength: 4.5,
  sharpness: 0,
  minimumLength: 1.5,
  optimalSharpness: 0.75,
  state: PencilState.INSERTED,
  rotationProgress: 0,
});

const initialSession: SharpeningSession = {
  isDragging: false,
  crankAngle: 0,
  crankAngularVelocity: 0,
  shavingsCount: 0,
  hasReachedOptimal: false,
  lastShavingEmitAngle: 0,
};

let toastIdCounter = 0;

export const usePencilStore = create<PencilStore>((set, get) => ({
  pencil: createNewPencil(),
  session: { ...initialSession },
  toasts: [],
  showOptimalToast: false,

  actions: {
    updateCrankRotation: (deltaAngle: number) => {
      const state = get();
      if (state.pencil.state !== PencilState.INSERTED && state.pencil.state !== PencilState.SHARPENING) {
        return;
      }
      if (state.pencil.currentLength <= state.pencil.minimumLength) {
        return;
      }

      const absDelta = Math.abs(deltaAngle);
      const newCrankAngle = state.session.crankAngle + deltaAngle;
      const newRotationProgress = state.pencil.rotationProgress + absDelta / (Math.PI * 2);

      const sharpnessPerRotation = 0.22;
      const newSharpness = Math.min(
        state.pencil.sharpness + (absDelta / (Math.PI * 2)) * sharpnessPerRotation,
        1.0
      );

      const lengthPerRotation = 0.03;
      const newLength = Math.max(
        state.pencil.currentLength - (absDelta / (Math.PI * 2)) * lengthPerRotation,
        state.pencil.minimumLength
      );

      let hasReachedOptimal = state.session.hasReachedOptimal;
      const toasts = [...state.toasts];

      if (newSharpness >= state.pencil.optimalSharpness && !hasReachedOptimal) {
        hasReachedOptimal = true;
        toastIdCounter++;
        toasts.push({
          id: toastIdCounter,
          message: '✨ 已经够用了！笔尖刚刚好～',
          type: ToastType.SUCCESS,
        });
      }

      if (newLength <= state.pencil.minimumLength + 0.001 && state.pencil.currentLength > state.pencil.minimumLength) {
        toastIdCounter++;
        toasts.push({
          id: toastIdCounter,
          message: '⚠️ 铅笔太短了，换一支新的吧！',
          type: ToastType.WARNING,
        });
      }

      const shavingsInterval = Math.PI / 4;
      let shavingsCount = state.session.shavingsCount;
      let lastShavingEmitAngle = state.session.lastShavingEmitAngle;
      let accumulatedAngle = state.session.crankAngle;

      while (accumulatedAngle + shavingsInterval <= newCrankAngle) {
        accumulatedAngle += shavingsInterval;
        shavingsCount++;
        lastShavingEmitAngle = accumulatedAngle;
      }
      while (accumulatedAngle - shavingsInterval >= newCrankAngle) {
        accumulatedAngle -= shavingsInterval;
        shavingsCount++;
        lastShavingEmitAngle = accumulatedAngle;
      }

      set({
        pencil: {
          ...state.pencil,
          state: PencilState.SHARPENING,
          rotationProgress: newRotationProgress,
          sharpness: newSharpness,
          currentLength: newLength,
        },
        session: {
          ...state.session,
          crankAngle: newCrankAngle,
          crankAngularVelocity: deltaAngle / 0.016,
          shavingsCount,
          hasReachedOptimal,
          lastShavingEmitAngle,
        },
        toasts,
      });
    },

    applyInertia: (deltaTime: number) => {
      const state = get();
      if (state.session.isDragging) return;
      if (Math.abs(state.session.crankAngularVelocity) < 0.001) {
        if (state.pencil.state === PencilState.SHARPENING) {
          set({
            pencil: {
              ...state.pencil,
              state: PencilState.INSERTED,
            },
          });
        }
        return;
      }

      const damping = 0.95;
      const newVelocity = state.session.crankAngularVelocity * damping;
      const deltaAngle = newVelocity * deltaTime;

      get().actions.updateCrankRotation(deltaAngle);

      set({
        session: {
          ...get().session,
          crankAngularVelocity: newVelocity,
        },
      });
    },

    removePencil: () => {
      const state = get();
      set({
        pencil: {
          ...state.pencil,
          state: PencilState.REMOVED,
        },
      });
    },

    insertPencil: () => {
      const state = get();
      set({
        pencil: {
          ...state.pencil,
          state: PencilState.INSERTED,
        },
      });
    },

    replaceWithNewPencil: () => {
      toastIdCounter++;
      set({
        pencil: createNewPencil(),
        session: {
          ...initialSession,
        },
        toasts: [
          {
            id: toastIdCounter,
            message: '✏️ 新铅笔来啦，开始削吧！',
            type: ToastType.INFO,
          },
        ],
      });
    },

    startDragging: () => {
      set((state) => ({
        session: {
          ...state.session,
          isDragging: true,
        },
      }));
    },

    stopDragging: () => {
      set((state) => ({
        session: {
          ...state.session,
          isDragging: false,
        },
      }));
    },

    reset: () => {
      set({
        pencil: createNewPencil(),
        session: { ...initialSession },
        toasts: [],
      });
    },

    addToast: (message: string, type: ToastType) => {
      toastIdCounter++;
      const id = toastIdCounter;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }],
      }));
      setTimeout(() => {
        get().actions.removeToast(id);
      }, 3500);
    },

    removeToast: (id: number) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    emitShaving: () => {
      set((state) => ({
        session: {
          ...state.session,
          shavingsCount: state.session.shavingsCount + 1,
        },
      }));
    },
  },
}));

if (typeof window !== 'undefined') {
  (window as unknown as { __PENCIL_STORE__: typeof usePencilStore }).__PENCIL_STORE__ = usePencilStore;
}
