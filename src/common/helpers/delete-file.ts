import { existsSync, unlinkSync } from 'fs';

export function safeDeleteFile(path: string) {
  if (path && existsSync(path)) {
    unlinkSync(path);
  }
}
