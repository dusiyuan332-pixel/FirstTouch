"use client";

import { useEffect, useRef, useState } from "react";

/** 将固定设计尺寸的 bracket 等比缩放进容器，禁止横向滚动 */
export default function BracketFit({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number;
  designHeight: number;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.clientWidth ?? designWidth;
      setScale(Math.min(1, w / designWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [designWidth]);

  const scaledH = Math.ceil(designHeight * scale);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden" style={{ height: scaledH }}>
      <div
        style={{
          width: designWidth,
          height: designHeight,
          margin: "0 auto",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
