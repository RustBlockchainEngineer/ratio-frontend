import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import lightIcon from '../../assets/images/lighticon.svg';
import darkIcon from '../../assets/images/darkicon.svg';

export default function SwitchButton() {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;

  const onClick = () => {
    if (darkMode) {
      theme.dispatch({ type: 'LIGHTMODE' });
    } else {
      theme.dispatch({ type: 'DARKMODE' });
    }
  };

  return (
    <div className="switchBtn" onClick={onClick} aria-hidden="true">
      {darkMode ? (
        <img src={darkIcon} alt="light" className="switchBtn__icon" />
      ) : (
        <img src={lightIcon} alt="darkIcon" className="switchBtn__icon" />
      )}
    </div>
  );
}
