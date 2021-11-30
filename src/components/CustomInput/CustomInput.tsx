import React from 'react';
import classNames from 'classnames';
import { InputGroup, FormControl } from 'react-bootstrap';

type CustomInputProps = {
  appendStr: string;
  tokenStr: string;
  appendValueStr?: string;
  className?: string;
  readOnly?: boolean;
  onTextChange?: (value: string) => void;
};

const CustomInput = ({ appendStr, tokenStr, appendValueStr, className, onTextChange, readOnly }: CustomInputProps) => {
  const [value, setValue] = React.useState('0');

  const handleChange = (e: any) => {
    setValue(e.target.value.replace(/\D/, ''));
    onTextChange && onTextChange(e.target.value.replace(/\D/, ''));
  };

  const setMaxValue = () => {
    setValue(appendValueStr ? appendValueStr : '1000');
    onTextChange && onTextChange(appendValueStr ? appendValueStr : '1000');
  };

  return (
    <InputGroup className={classNames('customInput mb-1', className)}>
      <FormControl
        placeholder=""
        aria-label=""
        aria-describedby="customInput"
        value={value}
        onChange={handleChange}
        className={classNames(appendStr === '' && 'onlytext')}
        readOnly={readOnly}
      />
      <p className={classNames('tokenName', appendStr === '' && 'tokenName--onlytext')}>{tokenStr}</p>
      {appendStr !== '' && (
        <InputGroup.Append onClick={setMaxValue}>
          <InputGroup.Text id="customInput">
            {appendStr} {appendValueStr && `(${appendValueStr})`}
          </InputGroup.Text>
        </InputGroup.Append>
      )}
    </InputGroup>
  );
};

CustomInput.defaultProps = {
  appendValueStr: '',
  className: '',
};

export default CustomInput;
