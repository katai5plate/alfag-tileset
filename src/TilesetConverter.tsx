import { Container } from "@material-ui/core";
import { FileObject } from "material-ui-dropzone";
import { useState, useMemo, Fragment } from "react";
import bmp from "bmp-js";
import Viewer from "./Viewer";
import { ImportedBimap } from "./types";
import Dropper from "./Dropper";

export default () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [importedBitmap, setImportedBitmap] = useState<ImportedBimap[]>([]);
  useMemo(
    () =>
      Promise.all(
        files
          .filter(({ file }) => file.type === "image/bmp")
          .map(async ({ file }) => {
            const ab = await file.arrayBuffer();
            return {
              filename: file.name,
              blob: new Blob([ab], { type: "image/bmp" }),
              bitmap: bmp.decode(Buffer.from(ab)),
            };
          })
      ).then((res) => setImportedBitmap(res)),
    [files]
  );
  return (
    <Fragment>
      <Container>
        <h3>使い方</h3>
        <ul>
          <li>1. BMP ファイルを D&D する（複数可）</li>
          <li>2. プレビューが出てくる</li>
          <li>
            3.
            プレビューをクリックするとダウンロード、右クリックすると別窓表示できる
          </li>
          <li>やりなおす場合は更新(F5)</li>
        </ul>
        <h3>タイルそれぞれの情報</h3>
        <ul>
          <li>A1: 256x192 海などのアニメーションタイル</li>
          <li>A2: 256x192 地面のオートタイル</li>
          <li>A3: 256x128 外観の建物のオートタイル</li>
          <li>A4: 256x240 内装の壁と天井のオートタイル</li>
          <li>
            A5: <b>128</b>x256 その他の下層タイル
          </li>
          <li>
            B: 256x256 上層タイル（<b>一番左上のタイルは強制的に空白になる</b>）
          </li>
          <li>C,D,E: 256x256 その他の上層タイル</li>
        </ul>
        <Dropper files={files} setFiles={setFiles} />
        <div style={!importedBitmap.length ? { display: "none" } : {}}>
          {importedBitmap.map(({ filename, blob, bitmap }, key) => (
            <Viewer
              key={key}
              id={key}
              filename={filename}
              blob={blob}
              bitmap={bitmap}
              width={bitmap.width}
              height={bitmap.height}
            ></Viewer>
          ))}
        </div>
      </Container>
    </Fragment>
  );
};
