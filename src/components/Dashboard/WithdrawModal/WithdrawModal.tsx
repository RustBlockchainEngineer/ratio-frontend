import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import { useGetPoolManager } from '../../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { LPair } from '../../../types/VaultTypes';
import { UPDATE_USER_STATE, useUpdateRFStates } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';

const WithdrawModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);

  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [userCollAccount, setUserCollAccount] = React.useState('');
  const collMint = useMint(data.mint);

  const [withdrawAmount, setWithdrawAmount] = React.useState(0);
  const updateRFStates = useUpdateRFStates();
  const [withdrawStatus, setWithdrawStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);

  const PoolManagerFactory = useGetPoolManager(vault);

  useEffect(() => {
    if (wallet?.publicKey) {
      getOneFilteredTokenAccountsByOwner(connection, wallet?.publicKey, new PublicKey(data.mint)).then((res) => {
        setUserCollAccount(res);
      });
    }
    return () => {
      return setUserCollAccount('');
    };
  }, [connected]);

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const withdraw = () => {
    console.log('Withdrawing', withdrawAmount);
    if (!(withdrawAmount && data.value >= withdrawAmount)) {
      setWithdrawStatus(true);
      setInvalidStr('Insufficient funds to withdraw!');
      return;
    }
    if (!(userCollAccount !== '' && collMint)) {
      setWithdrawStatus(true);
      setInvalidStr('Invalid  User Collateral account to withdraw!');
      return;
    }
    PoolManagerFactory?.withdrawLP(
      connection,
      wallet,
      vault as LPair,
      withdrawAmount * Math.pow(10, collMint?.decimals ?? 0),
      userCollAccount
    )
      .then(() => {
        updateRFStates(UPDATE_USER_STATE, data.mint);
        toast.success('Successfully Withdrawn!');
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setShow(false);
      });
    //disabled={Number(data.usdrValue) !== 0}
  };

  return (
    <div className="dashboardModal">
      <Button className="gradientBtn" onClick={() => setShow(!show)}>
        Withdraw
      </Button>
      <Modal
        show={show}
        onHide={() => {
          setButtonDisabled(true);
          setShow(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
      >
        <Modal.Header>
          <div className="dashboardModal__modal__header">
            <IoMdClose
              size={32}
              className="dashboardModal__modal__header-close"
              onClick={() => {
                setButtonDisabled(true);
                setShow(false);
              }}
            />
            <div>
              {data.icons ? (
                <>
                  <img src={data.icons[0]} alt={data.icons[0].toString()} />
                  <img
                    src={data.icons[1]}
                    alt={data.icons[1].toString()}
                    className="dashboardModal__modal__header-icon"
                  />
                </>
              ) : (
                <>
                  <img />
                  <img className="dashboardModal__modal__header-icon" />
                </>
              )}
            </div>
            <h4>Withdraw assets from vault</h4>
            <h5>
              Withdraw up to{' '}
              <strong>
                {data.value} {data.title}
              </strong>{' '}
              tokens from your vault.
            </h5>
            {Number(data.usdrValue) !== 0 && (
              <div className="customInput--valid">LP cannot be withdrawn until USDr debt is paid back</div>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label>How much would you like to withdraw?</label>
            <CustomInput
              appendStr="Max"
              initValue={'0'}
              appendValueStr={`${data.value}`}
              tokenStr={`${data.title}`}
              onTextChange={(value) => {
                setWithdrawAmount(Number(value));
                setWithdrawStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.value}
              valid={withdrawStatus}
              invalidStr={invalidStr}
            />
            <Button
              className="button--blue bottomBtn"
              disabled={withdrawAmount <= 0 || buttonDisabled || Number(data.usdrValue) !== 0}
              onClick={() => withdraw()}
            >
              Withdraw Assets
            </Button>
            <h6 className="text-center">Withdrawing also claims your rewards</h6>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WithdrawModal;
