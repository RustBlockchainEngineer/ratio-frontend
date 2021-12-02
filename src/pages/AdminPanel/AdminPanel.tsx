import React from 'react';

import Button from '../../components/Button';
import CustomInput from '../../components/CustomInput';
import LoginModal from '../../components/LoginModal';
import { useGetLoggedIn } from '../../contexts/auth';

const AdminPanel = () => {
  const [tokenName, setTokenName] = React.useState('');
  const [assetName, setAssetName] = React.useState('');
  const [mintAddress, setMintAddress] = React.useState('');
  const [poolID, setPoolID] = React.useState('');
  const loggedIn = useGetLoggedIn();

  return (
    <>
      {!loggedIn ? (
        <LoginModal />
      ) : (
        <div className="adminpanel">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between">
              <h2>AdminPanel</h2>
              <Button className="button--fill mt-4">Connect Wallet</Button>
            </div>
            <Button className="button--fill mt-4">Create Program State</Button>
            <form className="form-bg mt-4">
              <div>
                <div className="mb-3">
                  <label className="form-label">LP token name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="form-control"
                    placeholder="LP token name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Asset name</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="form-control"
                    placeholder="Asset name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">LP token mint address</label>
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    className="form-control"
                    placeholder="LP token mint address"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pool ID</label>
                  <input
                    type="text"
                    value={poolID}
                    onChange={(e) => setPoolID(e.target.value)}
                    className="form-control"
                    placeholder="Pool ID"
                  />
                </div>
              </div>
              <Button className="button--fill mt-4" disabled={!tokenName || !assetName || !mintAddress || !poolID}>
                Create LP Token
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
