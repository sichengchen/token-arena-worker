export interface ServiceSupport {
  ok: boolean;
  reason?: string;
}

export interface ServiceBackend {
  readonly displayName: string;
  canSetup(): ServiceSupport;
  isInstalled(): boolean;
  getDefinitionPath(): string;
  getStatusHint(): string;
  setup(skipPrompt?: boolean): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  status(): Promise<void>;
  uninstall(skipPrompt?: boolean): Promise<void>;
}
