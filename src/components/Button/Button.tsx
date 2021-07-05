import React from 'react'
import classNames from 'classnames'

interface ButtonProps {
  children: string
  className: string
}

const Button = ({ children, className }: ButtonProps) => {
  return (
    <button type="button" className={classNames('button', className)}>
      {children}
    </button>
  )
}

export default Button
