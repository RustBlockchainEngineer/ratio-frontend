import React from 'react';
import classNames from 'classnames';
import { BiSearch } from 'react-icons/bi';
import Select, { components } from 'react-select';

interface Option {
  value: string;
  label: string;
  network?: string;
  icon: Array<any>;
}

type FilterSelectProps = {
  options: Array<Option>;
  onFilterChange: (value: any) => void;
  filterValue: Array<Option>;
  isMulti: boolean;
  placeholder: string;
};

const FilterSelect = ({ options, onFilterChange, filterValue, isMulti, placeholder }: FilterSelectProps) => {
  const CustomOption = (props: any) => {
    const { children, innerProps, data } = props;
    return (
      <div className={classNames('filterselect__option', { 'filterselect__option--active': props.isSelected })}>
        <div {...innerProps} className="px-3 py-2">
          <img src={data.icon[0]} alt={children} />
          {data.icon[1] && <img src={data.icon[1]} alt={children} className="secondIcon" />}
          <span className="ml-3 filterselect__option--token">{children}</span>
          {data.network && <span className="ml-3 filterselect__option--network">{data.network}</span>}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line
  const Control = ({ children, selectProps, ...rest }: any) => {
    return (
      <components.Control {...rest}>
        <span className="pl-2 filterselect__searchIcon">
          <BiSearch size={22} />
        </span>
        {children}
      </components.Control>
    );
  };

  const handleRemoveValue = (e: any) => {
    if (!onFilterChange) return;
    const { name: buttonName } = e.currentTarget;
    const removedValue = filterValue.find((val) => val.value === buttonName);
    if (!removedValue) return;
    onFilterChange(filterValue.filter((val) => val.value !== buttonName));
  };

  const onClearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={classNames('filterselect', { 'filterselect--active': filterValue.length > 0 })}>
      <Select
        components={{ Option: CustomOption, Control }}
        classNamePrefix="filter-select"
        options={options}
        isSearchable={true}
        controlShouldRenderValue={false}
        onChange={onFilterChange}
        value={filterValue}
        isMulti={isMulti}
        placeholder={placeholder}
      />
      <div className="filterselect__valuesContainer">
        {isMulti ? (
          <div className="d-flex align-items-center">
            {filterValue.map((val) => (
              <div key={val.value} className="filterselect__value">
                <img src={val.icon[0]} alt="icon" />
                <p>{val.label}</p>
                <button name={val.value} onClick={handleRemoveValue}>
                  ✕
                </button>
              </div>
            ))}
            {filterValue.length > 0 && (
              <div onClick={onClearFilters} className="filterselect__clearallfilters">
                Clear all filters
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FilterSelect;
