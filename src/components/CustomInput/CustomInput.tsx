import React from 'react';
import classNames from 'classnames';
import { InputGroup, FormControl } from 'react-bootstrap';

type CustomInputProps = {
  appendStr: String;
  tokenStr: String;
  appendValueStr?: String;
  className?: String;
};

const CustomInput = ({
  appendStr,
  tokenStr,
  appendValueStr,
  className
}: CustomInputProps) => {
  const [value, setValue] = React.useState('0');

  const handleChange = (e: any) => {
    setValue(e.target.value.replace(/\D/, ''));
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
      />
      <p
        className={classNames(
          'tokenName',
          appendStr === '' && 'tokenName--onlytext'
        )}
      >
        {tokenStr}
      </p>
      {appendStr !== '' && (
        <InputGroup.Append>
          <InputGroup.Text id="customInput">
            {appendStr} <i>{appendValueStr && appendValueStr}</i>
          </InputGroup.Text>
        </InputGroup.Append>
      )}
    </InputGroup>
  );
};

CustomInput.defaultProps = {
  appendValueStr: '',
  className: ''
};

export default CustomInput;
