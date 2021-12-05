import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getTokenVaultByMint, withdrawCollateral } from '../../../utils/ratio-lending';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';

type PairType = {
  mint: string;
  icons: Array<string>;
  title: string;
  value: string;
};

type WithdrawModalProps = {
  data: PairType;
};

const WithdrawModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);

  const connection = useConnection();
  const { wallet } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userCollAccount, setUserCollAccount] = React.useState('');
  const collMint = useMint(data.mint);

  useEffect(() => {
    getTokenVaultByMint(connection, data.mint).then((res) => {
      setVault(res);
      if (res) {
        setCreated(true);
      } else {
        setCreated(false);
      }
    });
  }, [connection]);

  useEffect(() => {
    if (wallet?.publicKey) {
      getOneFilteredTokenAccountsByOwner(connection, wallet?.publicKey, new PublicKey(data.mint)).then((res) => {
        setUserCollAccount(res);
      });
    }
  });

  const withdraw = () => {
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
      withdrawCollateral(
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
      <Button className="gradientBtn" onClick={() => setShow(!show)}>
        Withdraw
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
            <h4>Withdraw assets from vault</h4>
            <h5>
              Withdraw up to{' '}
              <strong>
                {data.value} {data.title}-LP
              </strong>{' '}
              tokens from your vault.
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to withdraw?</label>
            <CustomInput appendStr="Max" appendValueStr="12.54" tokenStr={`${data.title}-LP`} />
            <Button className="button--fill bottomBtn" onClick={() => withdraw()}>
              Withdraw Assets
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WithdrawModal;
