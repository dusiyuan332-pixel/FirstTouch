/**
 * LogoMark — FirstTouch 品牌图标（几何鸟/十字形）
 * 由 13 个独立多边形组成，中心形成十字形负空间。
 * 所有形状基于 200×230 viewBox 坐标系。
 */

interface LogoMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function LogoMark({
  size = 32,
  color = "currentColor",
  className,
}: LogoMarkProps) {
  const h = Math.round((size * 230) / 200);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g fill={color}>
        {/* ── 上方左翼 ─────────────────────────────────────── */}
        <polygon points="10,63 57,14 83,54 63,77" />
        {/* ── 上方右翼（左右对称）────────────────────────────── */}
        <polygon points="190,63 143,14 117,54 137,77" />
        {/* ── 顶部脊柱（最窄处，向上收尖）──────────────────── */}
        <polygon points="88,27 100,10 112,27 108,57 92,57" />
        {/* ── 颈部（连接脊柱与身体，保持中心线连续）─────────── */}
        <polygon points="92,57 108,57 108,77 92,77" />

        {/* ── 十字身体：上层左右两块（中间 x=92-108 留空）──── */}
        <polygon points="63,77 92,77 92,103 63,103" />
        <polygon points="108,77 137,77 137,103 108,103" />

        {/* ── 左右水平臂（位于中间白色横带位置）────────────── */}
        <polygon points="10,112 62,93 64,116 12,126" />
        <polygon points="190,112 138,93 136,116 188,126" />

        {/* ── 十字身体：下层左右两块（同样留中间空隙）──────── */}
        <polygon points="63,127 92,127 92,153 63,153" />
        <polygon points="108,127 137,127 137,153 108,153" />

        {/* ── 下方两个斜向爪/翼（落脚感）────────────────────── */}
        <polygon points="33,166 63,153 73,179 37,183" />
        <polygon points="167,166 137,153 127,179 163,183" />

        {/* ── 底部尾羽（向下收尖）────────────────────────────── */}
        <polygon points="73,179 127,179 119,206 100,224 81,206" />
      </g>
    </svg>
  );
}
