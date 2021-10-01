import React from 'react';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

const options = [
  { value: 'RAY-SOL', label: 'RAY-SOL LP' },
  { value: 'STEP-USDC', label: 'STEP-USDC LP' },
  { value: 'RAY-ETH', label: 'RAY-ETH LP' },
  { value: 'RAY-SRM', label: 'RAY-SRM LP' },
  { value: 'RAY-USDC', label: 'RAY-USDC LP' },
  { value: 'MEDIA-USDC', label: 'MEDIA-USDC LP' },
];

const Faucet = () => {
  const history = useHistory();
  return (
    <div className="faucet">
      <div className="text-center">
        <h1>Ratio LP Token Faucet</h1>
        <h4>Have a drikin! the premium faucet for Ratio Devnet and Testnet.</h4>
        <Select options={options} classNamePrefix="react-select" defaultValue={options[0]} />
        <h4 className="mt-5">Why does this exist? Because it&apos;s Ratio Summer!!</h4>
        <h5>
          I kept wanting to try out all the *awesome new project* coming on the solana blockchain, but I had noway to
          easily fund my testnet wallet. Enter SolFaucet! with the click of a button, fund your testnet or devnet wallet
          and join the fun in the LP Token
        </h5>
        <button onClick={() => history.push('/dashboard')}>Go To Dashboard</button>
      </div>
    </div>
  );
};

export default Faucet;
