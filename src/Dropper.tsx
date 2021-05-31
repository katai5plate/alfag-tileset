import { Container } from "@material-ui/core";
import { DropzoneAreaBase, FileObject } from "material-ui-dropzone";
import { FC, useMemo } from "react";

const Dropper: FC<{
  files: FileObject[];
  setFiles: (fileObject: FileObject[]) => void;
}> = ({ files, setFiles }) => {
  const isDropped = useMemo(() => files.length !== 0, [files]);
  return (
    <Container>
      <div style={isDropped ? { display: "none" } : {}}>
        <DropzoneAreaBase
          fileObjects={files}
          onAdd={setFiles}
          filesLimit={100}
        />
      </div>
    </Container>
  );
};

export default Dropper;
