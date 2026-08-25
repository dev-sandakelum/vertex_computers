interface SvgIconProps {
  id: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SvgIcon({ id, width = 30, height = 30, className, style }: SvgIconProps) {
  return (
    <svg width={width} height={height} className={className} style={style}>
      <use href={`#${id}`} />
    </svg>
  );
}
