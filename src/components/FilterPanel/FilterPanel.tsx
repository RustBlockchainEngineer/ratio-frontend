import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { ThemeContext } from '../../contexts/ThemeContext';
import classNames from 'classnames';
import Select from 'react-select';
import Switch from 'react-switch';
import FilterSelect from '../FilterSelect';
import { actionTypes, selectors } from '../../features/dashboard';

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

const options = [
  { value: 'apr', label: 'APR' },
  { value: 'risk', label: 'RISK' },
  { value: 'tvl', label: 'TVL' },
];

const filter_options = [
  { value: 'SOL', label: 'SOL', network: 'solana', icon: [solIcon] },
  { value: 'RAY', label: 'RAY', network: 'solana', icon: [rayIcon] },
  { value: 'ETH', label: 'ETH', network: 'solana', icon: [ethIcon] },
  { value: 'USDC', label: 'USDC', network: 'solana', icon: [usdcIcon] },
];

const platformOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'RAYDIUM', label: 'Raydium' },
  { value: 'ORCA', label: 'Orca' },
  { value: 'MERCURIAL', label: 'Mercurial' },
  { value: 'SABER', label: 'Saber' },
];

const FilterPanel = ({ label, onViewType, viewType }: FilterPanelProps) => {
  const dispatch = useDispatch();
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isDefault = useMediaQuery({ minWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [compareVaults, setCompareVaults] = React.useState(false);

  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
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

  const onPlatformChange = (values: any) => {
    dispatch({ type: actionTypes.SET_PLATFORM_DATA, payload: values });
  };

  return (
    <div className="filterpanel">
      <h2>{label}</h2>
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-start">
          {isMobile && <p className="mr-2 filterpanel__sortby">Search: </p>}
          <FilterSelect
            options={filter_options}
            onFilterChange={onFilterChange}
            filterValue={filter_data}
            placeholder="Search all vaults by token"
            isMulti
          />
          <Select
            options={platformOptions}
            value={platform_data}
            onChange={onPlatformChange}
            classNamePrefix="platform-select"
            // defaultValue={{ value: 'apr', label: 'APR' }}
          />
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
        <div className="d-md-flex align-items-center">
          <p className="mr-2 filterpanel__sortby">Sort by: </p>
          <Select
            options={options}
            value={sort_data}
            onChange={onSortChange}
            classNamePrefix="react-select"
            defaultValue={{ value: 'apr', label: 'APR' }}
          />
          {isDefault && (
            <>
              <img
                src={darkMode ? titleDark : title}
                alt="tile"
                onClick={() => onViewType('tile')}
                className={classNames([
                  'ml-4 filterpanel__viewtype',
                  { 'filterpanel__viewtype-active': viewType === 'tile' },
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
