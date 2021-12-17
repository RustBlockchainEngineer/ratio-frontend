import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRiskLevel } from '../../libs/helper';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import LockVaultModal from '../LockVaultModal';
import MintUSDrModal from '../MintUSDrModal';
import DisclaimerModal from '../DisclaimerModal';
import Button from '../Button';
import highRisk from '../../assets/images/highrisk.svg';
import { selectors } from '../../features/dashboard';
import { TokenPairCardProps } from '../../models/UInterface';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { useConnection } from '../../contexts/connection';
import { getUpdatedUserState, getUserState } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useUpdateState } from '../../contexts/auth';
import rayIcon from '../../assets/images/RAY.svg';

const TokenPairCard = ({ data, onCompareVault }: TokenPairCardProps) => {
  const history = useHistory();
  const [isOpen, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const tokenA = data.title.split('-')[0];
  const tokenB = data.title.split('-')[1];
  const compare_valuts_status = useSelector(selectors.getCompareVaultsStatus);

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const collMint = useMint(data.mint);
  const [userState, setUserState] = React.useState(null);
  const tokenPrice = usePrice(data.mint);

  const [positionValue, setPositionValue] = React.useState(0);

  React.useEffect(() => {
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
      });
    }
    return () => {
      setUserState(null);
    };
  }, [wallet, connection, collMint]);

  React.useEffect(() => {
    if (userState && tokenPrice && collMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      setPositionValue(tokenPrice * Number(lpLockedAmount.fixed()));
    }
    return () => {
      setPositionValue(0);
    };
  }, [tokenPrice, userState, collMint]);

  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();
  React.useEffect(() => {
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, data.mint, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  const renderModalButton = () => {
    // if (data.risk === 250) return <DisclaimerModal data={data} />;
    return (
      <div>
        <div className="d-flex justify-content-center align-items-center">
          <LockVaultModal data={data} />
          <div className="mx-1"></div>
          <MintUSDrModal data={data} />
        </div>
        <Button disabled={positionValue === 0} className="button button--fill generate mt-2" onClick={showDashboard}>
          Enter Vault
        </Button>
      </div>
    );
  };

  const handleChangeComparison = (e: any) => {
    setChecked(e.target.checked);
    onCompareVault(data, e.target.checked);
  };

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div className="tokenpaircard mt-4">
          <div className="tokenpaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icon1} alt={'Token1'} />
                <img src={data.icon2} alt={'Token2'} className="tokenpaircard__header-icon" />
              </div>
              <div className="tokenpaircard__titleBox">
                <div>
                  <h6>{data.title}</h6>
                </div>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="tokenpaircard__riskBox">
              <div className="text-right">
                <p>Risk Level</p>
                <h6 className={classNames('ml-1', getRiskLevel(data.risk))}>{getRiskLevel(data.risk)} </h6>
              </div>
            </div>
          </div>
          <div className="tokenpaircard__aprBox">
            <div>
              <h5>Platform:</h5>
              <div className="d-flex align-items-center mt-1">
                <img src={rayIcon} />
                <h6 className="semiBold ml-1">RAYDIUM</h6>
              </div>
            </div>
            <div>
              <h5>APR:</h5>
              <h6 className="semiBold mt-1">{data.apr}%</h6>
            </div>
          </div>
          {compare_valuts_status ? (
            <div className={classNames('tokenpaircard__btnBox', { 'tokenpaircard__btnBox--checked': checked })}>
              <label>
                <input type="checkbox" className="filled-in" checked={checked} onChange={handleChangeComparison} />
                <span>Compare this vault</span>
              </label>
            </div>
          ) : (
            <div className="tokenpaircard__btnBox d-flex">
              {/* <div className="col">
                <Link to="/insta-buy-lp">
                  <Button className="button--gradientBorder insta-buy-lp">Insta-buy LP</Button>
                </Link>
              </div> */}
              <div className="col">{renderModalButton()}</div>
            </div>
          )}

          <div className="tokenpaircard__detailBox">
            {isOpen && (
              <div className="tokenpaircard__detailBox__content">
                <div className="d-flex justify-content-between">
                  <div>
                    Position value:
                    <p>$ {positionValue.toFixed(2)}</p>
                    {/* <div className="tokenpaircard__detailBox__content--tokens">
                      <img src={data.icons[0]} alt="RayIcon" />
                      {tokenA}: $4200
                    </div>
                    <div className="tokenpaircard__detailBox__content--tokens">
                      <img src={data.icons[1]} alt="USDrIcon" />
                      {tokenB}: $6400
                    </div> */}
                  </div>
                  <div className="text-right">
                    Rewards earned:
                    <p>$0</p>
                  </div>
                </div>
                {/* <div className="mt-3">
                  <Button className="button--fill insta-buy-lp">Harvest</Button>
                </div> */}
              </div>
            )}

            <div className="tokenpaircard__detailBox__toggle" onClick={() => setOpen(!isOpen)} aria-hidden="true">
              Position Overview {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenPairCard;
