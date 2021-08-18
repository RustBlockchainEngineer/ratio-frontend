import React from 'react';
import classNames from 'classnames';
import {
  InputGroup,
  FormControl,
  DropdownButton,
  Dropdown,
} from 'react-bootstrap';

import stepIcon from '../../assets/images/STEP.svg';
import usdcIcon from '../../assets/images/USDC.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';

const tokenList = [
  {
    id: 0,
    icons: solIcon,
    title: 'SOL',
  },
  {
    id: 1,
    icons: rayIcon,
    title: 'RAY',
  },
  {
    id: 2,
    icons: stepIcon,
    title: 'STEP',
  },
  {
    id: 3,
    icons: usdcIcon,
    title: 'USDC',
  },
];

const CustomDropDownInput = () => {
  const [value, setValue] = React.useState('0');
  const [token, setToken] = React.useState(0);

  const handleChange = (e: any) => {
    setValue(e.target.value.replace(/\D/, ''));
  };
  return (
    <div>
      <InputGroup className={classNames('customDropDownInput mb-1')}>
        <FormControl
          placeholder=""
          aria-label=""
          aria-describedby="customDropDownInput"
          value={value}
          onChange={handleChange}
        />
        <DropdownButton
          variant="outline-secondary"
          title={
            <span>
              <img src={tokenList[token].icons} alt="solIcon" />{' '}
              {tokenList[token].title}
            </span>
          }
          id="input-group-dropdown-2"
        >
          {tokenList.map((item) => {
            return (
              <Dropdown.Item
                key={item.id}
                eventKey={item.id}
                onSelect={(eventKey: any) => setToken(eventKey)}
              >
                <img src={item.icons} alt={item.icons.toString()} />
                {item.title}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </InputGroup>
    </div>
  );
};

export default CustomDropDownInput;
