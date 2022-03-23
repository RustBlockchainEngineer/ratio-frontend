import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import classNames from 'classnames';
import Select from 'react-select';
import FilterSelect from '../FilterSelect';
import { actionTypes, selectors } from '../../features/dashboard';

import { ThemeContext } from '../../contexts/ThemeContext';

import raydiumIcon from '../../assets/images/raydium.svg';
import orcaIcon from '../../assets/images/orca.svg';
import mercurialIcon from '../../assets/images/mercurial.svg';
import saberIcon from '../../assets/images/saber.svg';

import title from '../../assets/images/tile.svg';
import list from '../../assets/images/list.svg';
import titleDark from '../../assets/images/tile-dark.svg';
import listDark from '../../assets/images/list-dark.svg';

import { useFetchTokens } from '../../hooks/useFetchTokens';
import { FetchingStatus } from '../../types/fetching-types';

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

// eslint-disable-next-line
const platformOptions = [
  { value: 'ALL', label: 'All platforms', icon: null },
  { value: 'RAYDIUM', label: 'Raydium', icon: raydiumIcon },
  { value: 'ORCA', label: 'Orca', icon: orcaIcon },
  { value: 'MERCURIAL', label: 'Mercurial', icon: mercurialIcon },
  { value: 'SABER', label: 'Saber', icon: saberIcon },
];

const FilterPanel = ({ label, onViewType, viewType }: FilterPanelProps) => {
  const dispatch = useDispatch();
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isDefault = useMediaQuery({ minWidth: 992 });
  const [compareVaults, setCompareVaults] = useState(false);

  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const view_data = useSelector(selectors.getViewData);

  const { tokens, status, error } = useFetchTokens();

  const filterOptions = useMemo(() => {
    if (tokens.length === 0 || status !== FetchingStatus.Finish) {
      return [];
    }
    return tokens.map(({ symbol, icon }) => {
      return {
        value: symbol,
        label: symbol,
        network: null, // For the moment we leave it as null, since we will have to integrate the rest of the platforms later on
        icon: [icon],
      };
    });
  }, [tokens, status]);

  // We check here for errors when fetch the tokens
  useEffect(() => {
    if (status === FetchingStatus.Error && error) {
      toast.error(`There was an error when fetching the tokens: ${error?.message}`);
    }
  }, [status, error]);

  // eslint-disable-next-line
  const platform_data = useSelector(selectors.getPlatformData);

  const onFilterChange = (values: any) => {
    dispatch({ type: actionTypes.SET_FILTER_DATA, payload: values });
  };

  // eslint-disable-next-line
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

  // eslint-disable-next-line
  const onPlatformChange = (values: any) => {
    dispatch({ type: actionTypes.SET_PLATFORM_DATA, payload: values });
  };

  // eslint-disable-next-line
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
            options={filterOptions}
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
