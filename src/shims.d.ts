declare namespace React {
  type ReactNode = any;
  type FC<P = any> = (props: P) => any;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  interface ButtonHTMLAttributes<T> {
    [key: string]: any;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export = React;
  export as namespace React;
  export type ReactNode = React.ReactNode;
  export type FC<P = any> = React.FC<P>;
  export type Dispatch<A> = React.Dispatch<A>;
  export type SetStateAction<S> = React.SetStateAction<S>;
  export interface ButtonHTMLAttributes<T> extends React.ButtonHTMLAttributes<T> {}
  export function useState<S>(value: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useRef<T>(value: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: unknown[]): T;
  const StrictMode: any;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): { render(node: any): void };
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'lucide-react' {
  export const ArrowLeft: any;
  export const Heart: any;
  export const Lock: any;
  export const ShoppingCart: any;
  export const Star: any;
  export const Trophy: any;
  export const Zap: any;
}

declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  export default function react(): any;
}
