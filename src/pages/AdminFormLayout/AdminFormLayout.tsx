import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import Header from '../../components/Header';
import AdminNavbar from '../../components/AdminNavbar';
import { ThemeContext } from '../../contexts/ThemeContext';
import { actionTypes } from '../../features/wallet';
import { ToastContainer } from 'react-toastify';

export default function AdminFormLayout(props: any) {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapseFlag, setCollapseFlag] = useState(false);

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
    <div className="admin_form_page" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="admin_form_page_container">
        <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />
        <AdminNavbar
          darkMode={darkMode}
          onClickWalletBtn={onClickWalletBtn}
          clickMenuItem={clickMenuTrigger}
          open={menuOpen}
          collapseFlag={collapseFlag}
          setCollapseFlag={onCollapseMenu}
        />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
        />
        <div className="admin_form_page_content">{props.children}</div>
      </div>
    </div>
  );
}
