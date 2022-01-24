import React from 'react';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import { actionTypes } from '../../features/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';
import Navbar from '../../components/Navbar';

const ErrorPage = ({ headline, message, description }: any) => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [collapseFlag, setCollapseFlag] = React.useState(false);

  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  const clickMenuTrigger = () => {
    setMenuOpen(!menuOpen);
  };

  const onCollapseMenu = () => {
    setCollapseFlag(!collapseFlag);
  };

  return (
    <div className="error_page" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="error_page_container">
        <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />
        <Navbar
          darkMode={darkMode}
          onClickWalletBtn={onClickWalletBtn}
          clickMenuItem={clickMenuTrigger}
          open={menuOpen}
          collapseFlag={collapseFlag}
          setCollapseFlag={onCollapseMenu}
        />
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
