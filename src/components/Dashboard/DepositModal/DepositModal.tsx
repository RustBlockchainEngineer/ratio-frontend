import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { depositCollateral, getTokenVaultByMint } from '../../../utils/ratio-lending';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';

type PairType = {
  mint: string;
  icons: Array<string>;
  title: string;
};

type DepositModalProps = {
  data: PairType;
};

const DepositModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userCollAccount, setUserCollAccount] = React.useState('');
  const collMint = useMint(data.mint);
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
    }

    return () => {
      setCreated(false);
    };
  }, [connection]);

  useEffect(() => {
    if (wallet?.publicKey) {
      getOneFilteredTokenAccountsByOwner(connection, wallet?.publicKey, new PublicKey(data.mint)).then((res) => {
        setUserCollAccount(res);
      });
    }
    return () => {
      setUserCollAccount('');
    };
  }, [wallet?.publicKey]);

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const deposit = () => {
    let tenWorthOfLp = 0;
    if (data.riskLevel === 0) {
      tenWorthOfLp = 0.143;
    } else if (data.riskLevel === 1) {
      tenWorthOfLp = 0.00261;
    } else if (data.riskLevel === 2) {
      tenWorthOfLp = 0.317;
    } else if (data.riskLevel === 3) {
      tenWorthOfLp = 3.278;
    }
    if (userCollAccount !== '' && collMint) {
      depositCollateral(
        connection,
        wallet,
        tenWorthOfLp * Math.pow(10, collMint?.decimals),
        userCollAccount,
        new PublicKey(data.mint)
      )
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setShow(false);
        });
    }
  };
  return (
    <div className="dashboardModal">
      <Button className="button--fill fillBtn" onClick={() => setShow(!show)}>
        Deposit
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
      >
        <Modal.Header>
          <div className="dashboardModal__modal__header">
            <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => setShow(false)} />
            <div>
              <img src={data.icons[0]} alt={data.icons[0].toString()} />
              <img src={data.icons[1]} alt={data.icons[1].toString()} className="dashboardModal__modal__header-icon" />
            </div>
            <h4>Deposit assets into vault</h4>
            <h5>
              Deposit more <strong>{data.title}-LP</strong> into your vault
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much USDr would you like to generate?</label>
            <CustomInput appendStr="Max" tokenStr={`${data.title}-LP`} />
            <Button className="button--fill bottomBtn" onClick={() => deposit()}>
              Deposit & Lock Assets
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DepositModal;
