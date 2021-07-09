import React from 'react'
import classNames from 'classnames'

type ButtonProps = {
  children: string
  className: string
  onClick?: () => void
}

const Button = ({ children, className, onClick }: ButtonProps) => {
  return (
    <button
      type="button"
      className={classNames('button', className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  onClick: () => null,
}

export default Button
