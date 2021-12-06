import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from 'react-router-dom';

import ComingSoon from '../../components/ComingSoon';
import RiskLevel from '../../components/Dashboard/RiskLevel';
import SpeedoMetor from '../../components/Dashboard/SpeedoMeter';
import VaultDebt from '../../components/Dashboard/VaultDebt';
import PriceCard from '../../components/Dashboard/PriceCard';
import ModalCard from '../../components/Dashboard/ModalCard';
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable';
import AmountPanel from '../../components/Dashboard/AmountPanel';

import share from '../../assets/images/share.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { getUserState, USDR_MINT_KEY, TOKEN_VAULT_OPTIONS, getUsdrMintKey } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getFaucetState } from '../../utils/ratio-faucet';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';

const priceCardData = [
  {
    title: 'Liquidation threshold',
    titleIcon: true,
    mainValue: '$90.00 USD',
    mainUnit: '(RAY/USD)',
    currentPrice: '$300.00 USD',
  },
  // {
  //   title: 'Collateralization Ratio',
  //   titleIcon: false,
  //   mainValue: '295.85%',
  //   minimumRatio: '295.85%',
  //   stabilityFee: '4%',
  // },
];

const defaultModalCardData = [
  {
    title: 'Tokens Locked',
    mint: '??',
    tokens: [rayIcon, solIcon],
    tokenNames: 'USDC-USDr LP',
    tokenValue: '0',
    type: 'deposit',
    withdrawValue: '0 USDC-USDr LP',
    riskLevel: 0,
    usdrMint: '??',
  },
  {
    title: 'Outstanding USDr Debt',
    mint: '??',
    tokens: [usdrIcon],
    tokenNames: 'USDr',
    tokenValue: '0',
    type: 'payback',
    GenerateValue: '0 USDr',
    usdrMint: '??',
  },
];

const VaultDashboard = () => {
  const history = useHistory();
  const search = useLocation().search;
  // const vault_mint = new URLSearchParams(search).get('mint');
  const { mint: vault_mint } = useParams<{ mint?: string }>();
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const [usdrMintAddress, setUsdrMintAddress] = useState('');
  const usdrMint = useMint(usdrMintAddress);
  const collMint = useMint(vault_mint as string);
  const tokenPrice = usePrice(vault_mint as string);

  const [userState, setUserState] = useState(null);
  const [riskLevel, setRiskLevel] = useState(0.0);
  const [vaultName, setVaultName] = useState('');
  const [VaultData, setVaultData] = useState<any>({});
  const availableVaults = useSelector(selectors.getAvailableVaults);
  const [vauldDebtData, setVaultDebtData] = useState({
    mint: vault_mint,
    usdrMint: usdrMintAddress,
    riskLevel: 0,
  });
  const [modalCardData, setModalCardData] = useState([
    {
      title: 'Tokens Locked',
      mint: vault_mint,
      tokens: [rayIcon, solIcon],
      tokenNames: 'USDC-USDr LP',
      tokenValue: '0',
      type: 'deposit',
      withdrawValue: '0 USDC-USDr LP',
      riskLevel: 0,
      usdrMint: usdrMintAddress,
    },
    {
      title: 'Outstanding USDr Debt',
      mint: vault_mint,
      tokens: [usdrIcon],
      tokenNames: 'USDr',
      tokenValue: '0',
      type: 'payback',
      GenerateValue: '0 USDr',
      usdrMint: usdrMintAddress,
    },
  ]);

  useEffect(() => {
    if (vault_mint && wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(vault_mint)).then((res) => {
        setUserState(res);
      });
    }
    return () => {
      setUserState(null);
    };
  }, [vault_mint, wallet]);

  useEffect(() => {
    if (connected) {
      getUsdrMintKey(connection, wallet).then((result) => {
        setUsdrMintAddress(result);
        const newData = [...modalCardData];
        const newVaultData = vauldDebtData;
        newData[0].usdrMint = result;
        newData[1].usdrMint = result;
        newVaultData.usdrMint = result;

        setModalCardData(newData);
        setVaultDebtData(newVaultData);
      });
    }
    if (userState && vault_mint && connected) {
      getFaucetState(connection, wallet).then((result) => {
        let riskLevel = 0;
        if (vault_mint === result.mintUsdcUsdrLp.toBase58()) {
          riskLevel = 0;
        } else if (vault_mint === result.mintEthSolLp.toBase58()) {
          riskLevel = 1;
        } else if (vault_mint === result.mintAtlasRayLp.toBase58()) {
          riskLevel = 2;
        } else if (vault_mint === result.mintSamoRayLp.toBase58()) {
          riskLevel = 3;
        }
        const newData = [...modalCardData];
        const newVaultData = vauldDebtData;
        newData[0].tokenValue = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals).fixed();
        newData[0].tokenValue = '' + Math.ceil(parseFloat(newData[0].tokenValue) * 100) / 100;
        newData[0].mint = vault_mint;
        newData[0].riskLevel = riskLevel;

        newData[1].tokenValue = new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed();
        newData[1].tokenValue = '' + Math.ceil(parseFloat(newData[1].tokenValue) * 100) / 100;
        newData[1].mint = vault_mint;
        newData[1].riskLevel = riskLevel;

        newVaultData.mint = vault_mint;
        newVaultData.riskLevel = riskLevel;

        setModalCardData(newData);
        setVaultDebtData(newVaultData);
      });
    }
    return () => {
      setUserState(defaultModalCardData as any);
    };
  }, [userState, wallet]);

  useEffect(() => {
    if (!connected) {
      history.push('/dashboard');
    } else {
      // const filterValues = filterObject(availableVaults, 'mint', vault_mint);
      const result: any = availableVaults.find((item: any) => item.mint === vault_mint);
      if (result) {
        setVaultData(result);
      }
    }
    return () => {
      setVaultData(null);
    };
  }, [connected]);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  return (
    <div className="vaultdashboard">
      <div className="vaultdashboard__header">
        <div className="vaultdashboard__header_titleBox">
          <div>
            <h3>{VaultData.title} Vault #2024</h3>
            {isMobile && (
              <Link to="/">
                View on Solana Beach
                <img src={share} alt="share" />
              </Link>
            )}
            <RiskLevel level={getRiskLevel(VaultData.risk)} />
          </div>
          {/* {isDefault && (
            <div className="text-right mt-4">
              <img src={share} alt="share" />
              <Link to="/">View on</Link>
              <Link to="/">Solana Beach</Link>
            </div>
          )} */}
        </div>
        <div className="vaultdashboard__header_rightBox">
          {/* <div className="vaultdashboard__header_speedometerBox">
            <SpeedoMetor risk={VaultData.risk} />
          </div> */}
          <div className="vaultdashboard__header_vaultdebtBox">
            <VaultDebt data={vauldDebtData} />
          </div>
        </div>
      </div>
      <div className="vaultdashboard__body row">
        <div className="col col-md-8">
          <div className="vaultdashboard__bodyleft row">
            {priceCardData.map((item, index) => {
              return (
                <div key={item.title} className="col col-md-12 col-sm-12">
                  <ComingSoon enable={index === 1}>
                    <PriceCard data={item} comingsoon={index === 0} />
                  </ComingSoon>
                </div>
              );
            })}
            {modalCardData.length ? (
              modalCardData.map((item, index) => {
                return (
                  <div key={item.title} className="col col-lg-6 col-sm-12">
                    <ModalCard data={item} />
                  </div>
                );
              })
            ) : (
              <div></div>
            )}
          </div>
          {/* <div className="vaultdashboard__bodyleft row pt-0">
            <VaultHistoryTable />
          </div> */}
        </div>
        <div className="col col-md-4 vaultdashboard__bodyright">
          <AmountPanel vault_mint={vault_mint} />
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;
