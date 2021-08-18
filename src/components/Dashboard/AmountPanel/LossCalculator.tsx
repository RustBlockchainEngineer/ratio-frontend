import React from 'react';

import { IoMdArrowDropdown } from 'react-icons/io';

const LossCalculator = () => {
  return (
    <div>
      <h4 className="mb-4">Impermanent Loss Calculator</h4>
      <div className="d-flex justify-content-between mx-4 mt-2">
        <h6>Value of ETH at purchase:</h6>
        <h5>$1,000</h5>
      </div>
      <div className="d-flex justify-content-between mx-4 mt-2">
        <h6>Value of ETH at purchase:</h6>
        <h5>$1,500</h5>
      </div>
      <div className="d-flex justify-content-between mx-4 mt-2">
        <h6>Value of ETH at purchase:</h6>
        <h5 className="text-danger">
          <IoMdArrowDropdown />
          $2,000
        </h5>
      </div>
    </div>
  );
};

export default LossCalculator;
