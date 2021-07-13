import React from 'react'
import classNames from 'classnames'

type ButtonProps = {
  children: string
  className: string
  onClick?: () => void
  disabled?: boolean
}

const Button = ({ children, className, disabled, onClick }: ButtonProps) => {
  return (
    <button
      type="button"
      className={classNames('button', className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  onClick: () => null,
  disabled: false,
}

export default Button
