import React from 'react';

import { NavBarProgressBarVaultMint } from '../../Navbar/NavBarProgressBarVaultMint';

const MintableProgressBar = () => {
  return (
    <div className="mintableProgressbar">
      <NavBarProgressBarVaultMint className="mintableProgressbar__progressbar" shouldDisplayLabel={false} />
    </div>
  );
};

export default MintableProgressBar;
