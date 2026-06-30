import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#002855",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3px",
        }}
      >
        {/* Inline SVG polygons — Satori supports basic SVG */}
        <svg viewBox="0 0 200 230" width="26" height="30">
          <g fill="white">
            <polygon points="10,63 57,14 83,54 63,77" />
            <polygon points="190,63 143,14 117,54 137,77" />
            <polygon points="88,27 100,10 112,27 108,57 92,57" />
            <polygon points="92,57 108,57 108,77 92,77" />
            <polygon points="63,77 92,77 92,103 63,103" />
            <polygon points="108,77 137,77 137,103 108,103" />
            <polygon points="10,112 62,93 64,116 12,126" />
            <polygon points="190,112 138,93 136,116 188,126" />
            <polygon points="63,127 92,127 92,153 63,153" />
            <polygon points="108,127 137,127 137,153 108,153" />
            <polygon points="33,166 63,153 73,179 37,183" />
            <polygon points="167,166 137,153 127,179 163,183" />
            <polygon points="73,179 127,179 119,206 100,224 81,206" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
