type Props = { className?: string; dotClassName?: string; dotRef?: React.Ref<HTMLSpanElement> }

/** re•set, set in type so the dot can be styled and animated on its own. */
export function Wordmark({ className = '', dotClassName = '', dotRef }: Props) {
  return (
    <span className={`wm mark ${className}`} aria-label="re•set">
      <span aria-hidden="true">re</span>
      <span aria-hidden="true" ref={dotRef} className={`wm__dot ${dotClassName}`} />
      <span aria-hidden="true">set</span>
    </span>
  )
}
