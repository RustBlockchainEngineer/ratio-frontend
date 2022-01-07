import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import Button from '../Button';
import CustomInput from '../CustomInput';
import { PairType } from '../../models/UInterface';
import ComingSoon from '../ComingSoon';

import riskLevel from '../../assets/images/risklevel.svg';
import highRisk from '../../assets/images/highrisk.svg';
import {
  createTokenVault,
  lockAndMint,
  getTokenVaultByMint,
  getUserState,
  USDR_MINT_KEY,
  depositCollateral,
  borrowUSDr,
  getUpdatedUserState,
} from '../../utils/ratio-lending';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../utils/web3';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { getUSDrAmount } from '../../utils/risk';
import { toast } from 'react-toastify';
import { sleep } from '../../utils/utils';
import { useUpdateState } from '../../contexts/auth';
import usdrIcon from '../../assets/images/USDr.png';

type LockVaultModalProps = {
  data: PairType;
};

const MintUSDrModal = ({ data }: any) => {
  const history = useHistory();
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userState, setUserState] = React.useState(null);
  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);
  const collMint = useMint(data.mint);
  const usdrMint = useMint(USDR_MINT_KEY);
  const collAccount = useAccountByMint(data.mint);

  const [lockAmount, setLockAmount] = React.useState(0);

  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  const [mintStatus, setMintStatus] = React.useState(false);
  const [lockStatus, setLockStatus] = React.useState(false);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      const availableAmount = getUSDrAmount(data.riskPercentage, tokenPrice * Number(lpLockedAmount.fixed()));

      const maxAmount = availableAmount - Number(new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed());
      setMaxUSDrAmount(Number(maxAmount.toFixed(usdrMint?.decimals)));
    }
    if (userState) {
      const endDateOfLock = (userState as any).lastMintTime.toNumber() + 3600;
      const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM / DD /YYYY HH : MM : SS');

      setMintTime(unlockDateString);
    }
    return () => {
      setMaxUSDrAmount(0);
    };
  }, [tokenPrice, userState, usdrMint, collMint]);

  useEffect(() => {
    if (tokenPrice && collMint) {
      const initLPAmount = Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice;
      setMaxLockAmount(Number(Math.min(initLPAmount, lpWalletBalance).toFixed(collMint?.decimals)));
    }
    return () => {
      setMaxLockAmount(0);
    };
  }, [tokenPrice, lpWalletBalance, collMint]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
      });
      if (collAccount && collMint) {
        const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
        setLpWalletBalance(Number(tokenAmount.fixed()));
      }
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint]);

  useEffect(() => {
    if (connected) {
      getTokenVaultByMint(connection, data.mint).then((res) => {
        setVault(res);
        if (res) {
          setCreated(true);
        } else {
          setCreated(false);
        }
      });
    } else {
      setShow(false);
    }
    return () => {
      setCreated(false);
    };
  }, [connection, connected]);

  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();
  useEffect(() => {
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, data.mint, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    if (!(lpWalletBalance >= lockAmount && lockAmount > 0)) {
      // toast('Insufficient funds!');
      setLockStatus(true);
      return;
    }
    if (collAccount) {
      depositCollateral(
        connection,
        wallet,
        lockAmount * Math.pow(10, collMint?.decimals as number),
        collAccount.pubkey.toString(),
        new PublicKey(data.mint)
      )
        .then(() => {
          setUpdateStateFlag(true);
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          // history.push(`/dashboard/vaultdashboard/${data.mint}`);
        });
    }
  };

  const mintUSDr = () => {
    if (!(maxUSDrAmount >= borrowAmount && borrowAmount > 0)) {
      // toast('Amount is invalid to mint USDr!');
      setMintStatus(true);
      return;
    }

    borrowUSDr(connection, wallet, borrowAmount * Math.pow(10, usdrMint?.decimals as number), new PublicKey(data.mint))
      .then(() => {
        setUpdateStateFlag(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setShow(false);
        // history.push(`/dashboard/vaultdashboard/${data.mint}`);
      });
  };

  return (
    <>
      <Button className="button--fill generate" disabled={!connected} onClick={() => setShow(!show)}>
        Mint USDr
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="lockvaultmodal"
      >
        <Modal.Header>
          <div className="lockvaultmodal__footer">
            <IoMdClose size={32} className="lockvaultmodal__header-close" onClick={() => setShow(false)} />
            <div>
              <img src={usdrIcon} alt={data.icons[0].toString()} className="lockvaultmodal__header-icon1" />
            </div>
            <h3 className="mt-3">How much USDr would you like to generate?</h3>
            <CustomInput
              appendStr="Max"
              appendValueStr={'' + maxUSDrAmount}
              tokenStr={`USDr`}
              onTextChange={(value) => {
                setBorrowAmount(Number(value));
                setMintStatus(false);
              }}
              maxValue={maxUSDrAmount}
              valid={mintStatus}
              invalidStr="Amount is invalid to mint USDr!"
            />
            <Button className="button--fill lockBtn" onClick={() => mintUSDr()}>
              Mint USDr
            </Button>
          </div>
        </Modal.Header>
      </Modal>
    </>
  );
};

export default MintUSDrModal;