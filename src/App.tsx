import { Fragment } from "react";
import TilesetConverter from "./TilesetConverter";

const getSearch = (): { page?: string } | null =>
  window.location.search === ""
    ? null
    : window.location.search
        .slice(1)
        .split("&")
        .reduce((p, c) => {
          const [k, v] = c.split("=");
          return { ...p, [k]: v };
        }, {});

export default () => {
  return (
    <Fragment>
      {(() => {
        switch (getSearch()?.page) {
          case "tc":
            return <TilesetConverter />;
          default:
            return (
              <ul>
                <li>
                  <a href="?page=tc">タイルセットコンバーター</a>を開く
                </li>
              </ul>
            );
        }
      })()}
    </Fragment>
  );
};
