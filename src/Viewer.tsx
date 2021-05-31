import { FC, useState, Fragment, useEffect } from "react";
import { BmpDecoder } from "bmp-js";
import { ImportedBimap } from "./types";

const createCanvasFromImageData = (imageData: ImageData) => {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext("2d")!.putImageData(imageData, 0, 0);
  return canvas;
};

const getGrayImageData = (
  context: CanvasRenderingContext2D,
  originWidth: number,
  originHeight: number
) => {
  const probablyGray = context.getImageData(
    originWidth / 2,
    0,
    originWidth / 2,
    originHeight
  );
  for (let i = 0; i < probablyGray.data.length; i += 4) {
    if (
      !(
        probablyGray.data[i] === probablyGray.data[i + 1] &&
        probablyGray.data[i + 1] === probablyGray.data[i + 2] &&
        probablyGray.data[i] === probablyGray.data[i + 2]
      )
    )
      return null;
  }
  return probablyGray;
};

const Viewer: FC<{
  id: number;
  filename: ImportedBimap["filename"];
  blob: ImportedBimap["blob"];
  bitmap: BmpDecoder;
  width: number;
  height: number;
}> = ({ id, filename, blob, width, height, bitmap }) => {
  const idWord = `viewer-${id}`;
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [warn, setWarn] = useState<string[]>([]);
  useEffect(() => {
    console.log(1);
    setContext(
      (document.getElementById(idWord) as HTMLCanvasElement).getContext("2d")
    );
  }, []);
  useEffect(() => {
    let warnStuck: string[] = [];
    if (!context) return;
    console.log(2);
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => {
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0);
      if (bitmap.palette?.[0]) {
        const imageData = context.getImageData(0, 0, width, height);
        context.putImageData(imageData, 0, 0);
        const p0 = bitmap.palette[0];
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i + 3] =
            imageData.data[i] === p0.red &&
            imageData.data[i + 1] === p0.green &&
            imageData.data[i + 2] === p0.blue
              ? 0
              : imageData.data[i + 3];
        }
        context.putImageData(imageData, 0, 0);
        const alterCanvas = createCanvasFromImageData(imageData);
        context.clearRect(0, 0, width, height);
        context.drawImage(alterCanvas, 0, 0, width * 3, height * 3);
      } else {
        const grayImageData =
          width <= 512 ? getGrayImageData(context, width, height) : null;
        if (grayImageData) {
          console.log("g");
          const originalImageData = context.getImageData(
            0,
            0,
            width / 2,
            height
          );
          const grayImageData = context.getImageData(
            width / 2,
            0,
            width / 2,
            height
          );
          for (let i = 0; i < originalImageData.data.length; i += 4) {
            originalImageData.data[i + 3] = grayImageData.data[i];
          }
          const alterCanvas = createCanvasFromImageData(originalImageData);
          context.clearRect(0, 0, width, height);
          context.canvas.width /= 2;
          context.imageSmoothingEnabled = false;
          context.drawImage(
            alterCanvas,
            0,
            0,
            originalImageData.width * 3,
            originalImageData.height * 3
          );
        } else {
          width <= 512 &&
            (warnStuck = [
              ...warnStuck,
              "透過情報が見つからない。パレット0番に透過色を置くか、画像の右半分にグレースケールの透過情報を定義する必要がある。",
            ]);
          context.drawImage(image, 0, 0, width * 3, height * 3);
        }
        (image.width > (grayImageData ? 512 : 256) || image.height > 256) &&
          (warnStuck = [
            ...warnStuck,
            "サイズでかすぎ。B～Eでも 256x256 （グレー込なら 512x256） が限度。",
          ]);
        (image.width < 128 || image.height < 192) &&
          (warnStuck = [...warnStuck, "サイズ小さすぎ。"]);
        (image.width % 16 !== 0 || image.height % 16 !== 0) &&
          (warnStuck = [
            ...warnStuck,
            "サイズが中途半端。大きさは 16 の倍数である必要がある。",
          ]);
      }
      setWarn(warnStuck);
    };
  }, [context]);
  return (
    <Fragment>
      <hr />
      <p>{filename}</p>
      {warn.length ? (
        <div style={{ color: "red" }}>
          <h3>警告</h3>
          <ul>
            {warn.map((x, key) => (
              <li key={key}>{x}</li>
            ))}
          </ul>
        </div>
      ) : (
        <Fragment />
      )}
      <canvas
        style={{
          border: 0,
          imageRendering: "pixelated",
          backgroundImage: `url(${process.env.PUBLIC_URL}/backgrid.gif)`,
        }}
        id={idWord}
        width={width * 3}
        height={height * 3}
        onContextMenu={(e) => {
          e.preventDefault();
          const canvas = e.target as HTMLCanvasElement;
          canvas.toBlob((b) => {
            const url = URL.createObjectURL(b);
            window.open(url);
            URL.revokeObjectURL(url);
          });
        }}
        onClick={(e) => {
          const canvas = e.target as HTMLCanvasElement;
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download =
            (filename.match(/(^.*?)\.[a-zA-Z0-9]*?$/)?.[1] ||
              encodeURIComponent(filename)) + ".png";
          link.click();
        }}
      />
    </Fragment>
  );
};

export default Viewer;
