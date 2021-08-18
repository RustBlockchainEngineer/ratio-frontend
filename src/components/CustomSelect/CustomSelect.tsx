import React from 'react';

import Select, { components } from 'react-select';

interface Option {
  value: string;
  label: string;
  icon: Array<any>;
}

type CustomSelectProps = {
  options: Array<Option>;
};

const CustomSelect = ({ options }: CustomSelectProps) => {
  const CustomOption = (props: any) => {
    const { children, innerProps, data } = props;
    return (
      <div className="customSelect__option">
        <div {...innerProps} className="px-3 py-2">
          <img src={data.icon[0]} alt={children} />
          {data.icon[1] && (
            <img src={data.icon[1]} alt={children} className="secondIcon" />
          )}
          <span className="ml-3">{children}</span>
        </div>
      </div>
    );
  };

  const Control = ({ children, selectProps, ...rest }: any) => {
    return (
      <components.Control {...rest}>
        <img src={selectProps?.value?.icon[0]} alt={children} />{' '}
        {selectProps?.value?.icon[1] && (
          <img
            src={selectProps?.value?.icon[1]}
            alt={children}
            className="secondIcon"
          />
        )}{' '}
        {children}
      </components.Control>
    );
  };
  return (
    <div className="customSelect">
      <Select
        defaultValue={options[0]}
        components={{ Option: CustomOption, Control }}
        classNamePrefix="react-select"
        options={options}
        isSearchable={false}
      />
    </div>
  );
};

export default CustomSelect;
