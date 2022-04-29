import React from 'react';
import classNames from 'classnames';
import { InputGroup, FormControl } from 'react-bootstrap';

type CustomInputProps = {
  appendStr?: string;
  tokenStr?: string;
  initValue?: number;
  appendValueStr?: string;
  className?: string;
  readOnly?: boolean;
  maxValue?: number;
  valid?: boolean;
  invalidStr?: string;
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
  maxValue,
  valid,
  invalidStr,
}: CustomInputProps) => {
  if (typeof maxValue === 'string') {
    maxValue = parseFloat(maxValue);
  }

  const defaultValue = initValue && +initValue ? initValue : maxValue ? maxValue : '0';
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (e: any) => {
    const amount = e.target.value;

    if (!amount || amount.match(/^[+-]?\d*(?:[.,]\d*)?$/)) {
      if (maxValue === 0 || (maxValue && maxValue < amount)) {
        return;
      }
      setValue(amount);
      onTextChange && onTextChange(amount);
    }
  };

  const setMaxValue = () => {
    setValue(appendValueStr ? appendValueStr : '0');
    // setHasValueChanged(true);
    onTextChange && onTextChange(appendValueStr ? appendValueStr : '0');
  };

  return (
    <>
      <InputGroup className={classNames('customInput mb-1', className)}>
        <FormControl
          placeholder={defaultValue.toString()}
          aria-label=""
          type="text"
          aria-describedby="customInput"
          value={value}
          spellCheck="false"
          onChange={handleChange}
          className={classNames({ onlytext: appendStr === '' })}
          readOnly={readOnly}
        />
        <p className={classNames('tokenName', { 'tokenName--onlytext': appendStr === '' })}>{tokenStr}</p>
        {appendStr !== '' && (
          <InputGroup.Append onClick={setMaxValue}>
            <InputGroup.Text id="customInput">{appendStr}</InputGroup.Text>
          </InputGroup.Append>
        )}
      </InputGroup>
      {valid && <div className="customInput--valid">{invalidStr}</div>}
    </>
  );
};

CustomInput.defaultProps = {
  appendValueStr: '',
  className: '',
};

export default CustomInput;
