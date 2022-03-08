import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { ThemeContext } from '../../contexts/ThemeContext';
import classNames from 'classnames';
import Select from 'react-select';
import Switch from 'react-switch';
import FilterSelect from '../FilterSelect';
import { actionTypes, selectors } from '../../features/dashboard';

import raydiumIcon from '../../assets/images/raydium.svg';
import orcaIcon from '../../assets/images/orca.svg';
import mercurialIcon from '../../assets/images/mercurial.svg';
import saberIcon from '../../assets/images/saber.svg';

import title from '../../assets/images/tile.svg';
import list from '../../assets/images/list.svg';
import titleDark from '../../assets/images/tile-dark.svg';
import listDark from '../../assets/images/list-dark.svg';

import stepIcon from '../../assets/images/STEP.svg';
import usdcIcon from '../../assets/images/USDC.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import ethIcon from '../../assets/images/ETH.svg';
import srmIcon from '../../assets/images/SRM.svg';
import mediaIcon from '../../assets/images/MEDIA.svg';

type FilterPanelProps = {
  label: string;
  onViewType: (type: string) => void;
  viewType: string;
};

const optionsSortBy = [
  { value: 'apr', label: 'APY' },
  { value: 'riskLevel', label: 'RISK' },
  { value: 'tvl', label: 'TVL' },
];

const optionsViewBy = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

const filter_options = [
  { value: 'SOL', label: 'SOL', network: 'solana', icon: [solIcon] },
  { value: 'RAY', label: 'RAY', network: 'solana', icon: [rayIcon] },
  { value: 'ETH', label: 'ETH', network: 'solana', icon: [ethIcon] },
  { value: 'USDC', label: 'USDC', network: 'solana', icon: [usdcIcon] },
];

const platformOptions = [
  { value: 'ALL', label: 'All platforms', icon: null },
  { value: 'RAYDIUM', label: 'Raydium', icon: raydiumIcon },
  { value: 'ORCA', label: 'Orca', icon: orcaIcon },
  { value: 'MERCURIAL', label: 'Mercurial', icon: mercurialIcon },
  { value: 'SABER', label: 'Saber', icon: saberIcon },
];

const FilterPanel = ({ label, onViewType, viewType }: FilterPanelProps) => {
  const dispatch = useDispatch();
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isDefault = useMediaQuery({ minWidth: 992 });
  const [compareVaults, setCompareVaults] = React.useState(false);

  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const view_data = useSelector(selectors.getViewData);
  const platform_data = useSelector(selectors.getPlatformData);

  const onFilterChange = (values: any) => {
    dispatch({ type: actionTypes.SET_FILTER_DATA, payload: values });
  };

  const handleCompareVaults = () => {
    setCompareVaults(!compareVaults);
    dispatch({ type: actionTypes.SET_COMPARE_VAULTS, payload: !compareVaults });
  };

  const onSortChange = (values: any) => {
    dispatch({ type: actionTypes.SET_SORT_DATA, payload: values });
  };

  const onViewChange = (values: any) => {
    dispatch({ type: actionTypes.SET_VIEW_DATA, payload: values });
  };

  const onPlatformChange = (values: any) => {
    dispatch({ type: actionTypes.SET_PLATFORM_DATA, payload: values });
  };

  const CustomOption = (props: any) => {
    const { children, innerProps, data } = props;
    return (
      <div className={classNames('platform-select__option', { 'platform-select__option--active': props.isSelected })}>
        <div {...innerProps} className="px-3 py-2">
          {data.icon && <img src={data.icon} alt={children} />}
          <span className="ml-3 platform-select__option--token">{children}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="filterpanel">
      <h2>{label}</h2>
      <div className="d-flex flex-wrap justify-content-between align-items-start filterpanel__gap">
        <div className="d-flex flex-wrap align-items-center filterpanel__gap">
          <FilterSelect
            options={filter_options}
            onFilterChange={onFilterChange}
            filterValue={filter_data}
            placeholder="Search vaults by token"
            isMulti
          />
          {/* HIDE this filter, until we have more than one platform to be filtered */}
          {/*<Select*/}
          {/*components={{ Option: CustomOption }}*/}
          {/*options={platformOptions}*/}
          {/*value={platform_data}*/}
          {/*onChange={onPlatformChange}*/}
          {/*classNamePrefix="platform-select"*/}
          {/*defaultValue={platformOptions[0]}*/}
          {/*/>*/}
          {/* <Switch
            onChange={handleCompareVaults}
            checked={compareVaults}
            className="mt-2 ml-3"
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#07B127"
            offColor="#DBE0E2"
            handleDiameter={18}
            width={48}
          /> */}
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-start filterpanel__gap">
          <>
            <Select
              options={optionsSortBy}
              value={sort_data}
              onChange={onSortChange}
              classNamePrefix="react-select"
              defaultValue={optionsSortBy[0]}
            />
          </>
          <>
            <Select
              className="more-width"
              options={optionsViewBy}
              value={view_data}
              onChange={onViewChange}
              classNamePrefix="react-select"
              defaultValue={optionsViewBy[0]}
            />
          </>
          {isDefault && (
            <>
              <img
                src={darkMode ? titleDark : title}
                alt="grid"
                onClick={() => onViewType('grid')}
                className={classNames([
                  'ml-4 filterpanel__viewtype',
                  { 'filterpanel__viewtype-active': viewType === 'grid' },
                ])}
                aria-hidden="true"
              />
              <img
                src={darkMode ? listDark : list}
                alt="list"
                onClick={() => onViewType('list')}
                className={classNames([
                  'filterpanel__viewtype',
                  { 'filterpanel__viewtype-active': viewType === 'list' },
                ])}
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
