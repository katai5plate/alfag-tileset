import { Container, Typography } from "@material-ui/core";
import { DropzoneAreaBase, FileObject } from "material-ui-dropzone";
import { FC, useState, useMemo, Fragment } from "react";
import bmp from "bmp-js";

const Dropper: FC<{
  files: FileObject[];
  setFiles: (fileObject: FileObject[]) => void;
}> = ({ files, setFiles }) => {
  const [bitmap, setBitmap] = useState<bmp.BmpDecoder | null>(null);
  files?.[0]?.file.arrayBuffer().then((x: ArrayBuffer) => {
    setBitmap(bmp.decode(Buffer.from(x)));
  });
  const isDropped = useMemo(() => files.length !== 0, [files]);
  return (
    <Container>
      <div style={isDropped ? { display: "none" } : {}}>
        <DropzoneAreaBase fileObjects={files} onAdd={setFiles} />
      </div>
      <div style={!isDropped ? { display: "none" } : {}}>
        <pre>
          {bitmap === null
            ? "Loading..."
            : JSON.stringify(
                (() => {
                  const { buffer, data, ...rest } = bitmap as any;
                  return rest;
                })(),
                null,
                2
              )}
        </pre>
      </div>
    </Container>
  );
};

export default () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  return (
    <Fragment>
      <Container>
        <Typography variant="h1">BMP ファイルを D&D</Typography>
        <Dropper files={files} setFiles={setFiles} />
      </Container>
    </Fragment>
  );
};
