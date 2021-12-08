import React from 'react';
import classNames from 'classnames';
import { InputGroup, FormControl } from 'react-bootstrap';

type CustomInputProps = {
  appendStr?: string;
  tokenStr?: string;
  initValue?: string;
  appendValueStr?: string;
  className?: string;
  readOnly?: boolean;
  onTextChange?: (value: string) => void;
};

const CustomInput = ({
  appendStr,
  tokenStr,
  initValue,
  appendValueStr,
  className,
  onTextChange,
  readOnly,
}: CustomInputProps) => {
  const [value, setValue] = React.useState(initValue);

  const handleChange = (e: any) => {
    const re = /^[+-]?\d*(?:[.,]\d*)?$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setValue(e.target.value);
      onTextChange && onTextChange(e.target.value);
    }
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
