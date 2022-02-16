import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { IoIosArrowForward } from 'react-icons/io';
import Select from 'react-select';

const Breadcrumb = ({ VaultData, availableVaults }: any) => {
  const history = useHistory();
  const [value, setValue] = useState();
  const [options, setOptions] = useState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const p = availableVaults.map((item: any) => {
      return { label: item.title, icon1: item.icon1, icon2: item.icon2, value: item.mint };
    });
    setOptions(p);
  }, [availableVaults]);

  const CustomOption = (props: any) => {
    // console.log(props);
    const { children, innerProps, data } = props;
    return (
      <div className={classNames('react-select__option', { 'react-select__option--active': props.isSelected })}>
        <div {...innerProps} className="px-3 py-2">
          {data.icon1 && <img src={data.icon1} alt={children} className="react-select__option--icon1" />}
          {data.icon2 && <img src={data.icon2} alt={children} className="react-select__option--icon2" />}
          <span className="ml-3 react-select__option--token">{children}</span>
        </div>
      </div>
    );
  };

  const onSelectChange = (value: any) => {
    setValue(value);
    setIsOpen(false);
    history.push(`/dashboard/vaultdashboard/${value.value}`);
  };

  const onToggle = (nextShow: any, event: any, metadata: any) => {
    const isClosingPermitted = metadata.source !== 'select';
    const currentNextShow = nextShow ? true : !isClosingPermitted;
    setIsOpen(currentNextShow);
  };

  return (
    <div className="bread-crumb">
      <p className="bread-crumb__text">
        Available Vaults <IoIosArrowForward />
      </p>
      <Dropdown onToggle={onToggle} show={isOpen}>
        <Dropdown.Toggle id="dropdown-basic">
          {VaultData?.title === 'USDC-USDR' ? 'USDC-USDr' : VaultData.title} Vault
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Select
            autoFocus
            backspaceRemovesValue={false}
            components={{ Option: CustomOption }}
            //   controlShouldRenderValue={false}
            // hideSelectedOptions={false}
            //   isClearable={false}
            classNamePrefix="react-select"
            menuIsOpen
            onChange={onSelectChange}
            options={options}
            placeholder="Search vaults"
            //   styles={selectStyles}
            tabSelectsValue={false}
            value={value}
          />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Breadcrumb;
