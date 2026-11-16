/* Lê o gabarito gravado a partir da versão anterior (o index.html único). */
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

export function lerGabarito(nome) {
  const arq = fileURLToPath(new URL("./gabarito/" + nome + ".json.gz", import.meta.url));
  return JSON.parse(gunzipSync(readFileSync(arq)).toString("utf8"));
}
/** Cópia sem campos vazios (como o JSON grava), para comparar. */
export const json = (x) => JSON.parse(JSON.stringify(x));
