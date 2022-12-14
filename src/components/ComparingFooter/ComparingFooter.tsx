import React from 'react';
import { useHistory } from 'react-router-dom';
import { PairType } from '../../types/VaultTypes';
import Button from '../Button';

interface ComparingFooterProps {
  list: Array<PairType>;
}

const ComparingFooter = ({ list }: ComparingFooterProps) => {
  const history = useHistory();
  const onCompare = () => {
    history.push('/dashboard/comparevaults');
  };

  return (
    <div className="comparingFooter">
      <div className="d-flex align-items-center">
        <p>You will compare vaults:</p>
        {list.map((item, index) => {
          return (
            <div className="comparingFooter__vaults" key={index}>
              <div>
                {/* <img src={item.icons[0]} alt="icon" className="comparingFooter__vaults--icon1" />
                <img src={item.icons[1]} alt="icon" className="comparingFooter__vaults--icon2" /> */}
              </div>
              <div>
                <h5>{item?.title}</h5>
                <h6>{item?.tvl}</h6>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <Button className="button--danger danger-button">Cancel</Button>
        <Button className="button--fill compare-button" onClick={onCompare}>
          Compare
        </Button>
      </div>
    </div>
  );
};

export default ComparingFooter;
