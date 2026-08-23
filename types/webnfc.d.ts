// Web NFC — Android Chrome only, not yet in TypeScript's DOM lib.
// https://developer.mozilla.org/docs/Web/API/NDEFReader
declare class NDEFReader {
  constructor()
  write(message: { records: { recordType: string; data: string }[] }): Promise<void>
}
