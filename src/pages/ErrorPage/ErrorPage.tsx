import React from 'react';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import { actionTypes } from '../../features/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';

const ErrorPage = ({ headline, message, description }: any) => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;

  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  return (
    <div className="error_page" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="error_page_container">
        <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />
        <div className="error_page_content">
          <div className="error_page_headline">{headline}</div>
          <div className="error_page_message">{message}</div>
          <div className="error_page_description">{description}</div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
