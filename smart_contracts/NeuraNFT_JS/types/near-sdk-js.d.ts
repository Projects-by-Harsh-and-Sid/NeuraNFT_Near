declare module 'near-sdk-js' {
    export function NearBindgen(options: any): any;
    export function call(options: any): any;
    export function view(options: any): any;
    export function initialize(options: any): any;
    export class UnorderedMap<V> {
      constructor(prefix: string);
      set(key: string, value: V): void;
      get(key: string): V | null;
      remove(key: string): void;
      toArray(): Array<[string, V]>;
      // Add any other methods you use from UnorderedMap
    }
    export const near: {
      predecessorAccountId(): string;
      panicUtf8(message: string): void;
      log(message: string): void;
    };
  }
  