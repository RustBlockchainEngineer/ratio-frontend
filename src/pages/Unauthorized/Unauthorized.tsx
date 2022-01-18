import React from 'react';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import { actionTypes } from '../../features/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';

const Unauthorized = () => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;

  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  return (
    <div className="adminpanel">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />
        </div>
        <h2>You do not have access to this page. Please check that you wallet is connected. </h2>
      </div>
    </div>
  );
};

export default Unauthorized;
