import React from 'react';
import classNames from 'classnames';

type ButtonProps = {
  children: React.ReactChild;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
  props?: any;
};

const Button = ({ children, className, disabled, onClick, props }: ButtonProps) => {
  return (
    <button type="button" {...props} className={classNames('button', className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  onClick: () => null,
  disabled: false,
};

export default Button;
