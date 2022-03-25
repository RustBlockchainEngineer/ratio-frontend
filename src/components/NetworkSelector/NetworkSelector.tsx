import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { Networks } from '../../constants/constants';

import { actionTypes, walletSelectors } from '../../features/wallet';

const NetworkSelector = () => {
  const dispatch = useDispatch();
  const network = useSelector(walletSelectors.getNetwork);
  const [selectedOption, setSelectedOption] = useState(network);

  const onSelectOption = (data: any) => {
    setSelectedOption(data);
    dispatch({ type: actionTypes.SET_NETWORK, payload: data.value });
  };

  return (
    <div className="networkSelector">
      <Select
        className="networkSelector__select"
        classNamePrefix="network-select"
        defaultValue={selectedOption}
        isClearable={false}
        isSearchable={false}
        name="network"
        options={Networks}
        onChange={onSelectOption}
      />
    </div>
  );
};

export default NetworkSelector;
