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
  const [hasValueChanged, setHasValueChanged] = React.useState(false);

  const handleChange = (e: any) => {
    const re = /^[+-]?\d*(?:[.,]\d*)?$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      if (maxValue === 0 || (maxValue && maxValue < e.target.value)) {
        return;
      }
      setValue(e.target.value);
      setHasValueChanged(true);
      onTextChange && onTextChange(e.target.value);
    }
  };

  const setMaxValue = () => {
    setValue(appendValueStr ? appendValueStr : '1000');
    setHasValueChanged(false);
    onTextChange && onTextChange(appendValueStr ? appendValueStr : '1000');
  };

  return (
    <>
      <InputGroup className={classNames('customInput mb-1', className)}>
        <FormControl
          placeholder=""
          aria-label=""
          aria-describedby="customInput"
          value={value}
          onChange={handleChange}
          className={classNames({ onlytext: appendStr === '' }, { withMax: +defaultValue > 0 && !hasValueChanged })}
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
