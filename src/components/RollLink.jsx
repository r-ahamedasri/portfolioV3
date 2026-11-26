export default function RollLink({ children, className = '', ...rest }) {
  return (
    <a className={`roll ${className}`} {...rest}>
      <span className="roll-inner">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </a>
  )
}
