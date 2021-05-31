import { BmpDecoder } from "bmp-js";

export interface ImportedBimap {
  filename: string;
  bitmap: BmpDecoder;
  blob: Blob;
}
