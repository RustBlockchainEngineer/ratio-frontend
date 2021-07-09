import React from 'react'
import classNames from 'classnames'
import { InputGroup, FormControl } from 'react-bootstrap'

type CustomInputProps = {
  appendStr: String
  tokenStr: String
}

const CustomInput = ({ appendStr, tokenStr }: CustomInputProps) => {
  const [value, setValue] = React.useState('0')

  const handleChange = (e: any) => {
    setValue(e.target.value.replace(/\D/, ''))
  }

  return (
    <InputGroup className="customInput mb-1">
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
          <InputGroup.Text id="customInput">{appendStr}</InputGroup.Text>
        </InputGroup.Append>
      )}
    </InputGroup>
  )
}

export default CustomInput
