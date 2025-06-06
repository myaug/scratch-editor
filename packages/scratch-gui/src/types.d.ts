declare module '!arraybuffer-loader!.*' {
  declare const value: ArrayBuffer;
  export default value;
}

declare module '!raw-loader!.*' {
  declare const value: string;
  export default value;
}

declare module '@scratch/scratch-vm' {
    class VirtualMachine {
        attachStorage(storage: unknown): void;
        // Add other methods as needed
    }
    export = VirtualMachine;
}
