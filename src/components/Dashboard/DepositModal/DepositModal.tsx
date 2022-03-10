import React, { useEffect, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';

import { isWalletApproveError } from '../../../utils/utils';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import { useGetPoolInfoProvider } from '../../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { LPair } from '../../../types/VaultTypes';
import { UPDATE_USER_STATE, useUpdateRFStates } from '../../../contexts/state';

const DepositModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const collMint = useMint(data?.mint);

  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);
  const poolInfoProviderFactory = useGetPoolInfoProvider(vault);

  const collAccount = useAccountByMint(data.mint);
  const [depositAmount, setDepositAmount] = React.useState(0);

  const [didMount, setDidMount] = React.useState(false);

  const [depositStatus, setDepositStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const updateRFStates = useUpdateRFStates();

  useEffect(() => {
    setDidMount(true);
    setDepositAmount(0);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const deposit = () => {
    console.log('Depositing', depositAmount, data.value);
    console.log(data.mint);
    if (!(depositAmount && data?.value >= depositAmount)) {
      setDepositStatus(true);
      setInvalidStr('Insufficient funds to deposit!');
      return;
    }
    if (!(collAccount && collMint && connected)) {
      setDepositStatus(true);
      setInvalidStr('Invalid  User Collateral account to deposit!');
      return;
    }
    poolInfoProviderFactory
      ?.depositLP(
        connection,
        wallet,
        vault as LPair,
        depositAmount * Math.pow(10, collMint?.decimals ?? 0),
        collAccount?.pubkey.toString() as string
      )
      .then(() => {
        updateRFStates(UPDATE_USER_STATE, data.mint);
        setDepositAmount(0);
        toast.success('Successfully Deposited!');
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setShow(!show);
      });
  };
  return (
    <div className="dashboardModal">
      <Button className="button--blue fillBtn" onClick={() => setShow(!show)}>
        Deposit
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
            <h4>Deposit assets into vault</h4>
            <h5>
              {/* Deposit more <strong>{data.title}</strong> into your vault */}
              Deposit up to {data.value} of {data.title} into your vault
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to deposit?</label>
            <CustomInput
              appendStr="Max"
              initValue={'0'}
              appendValueStr={data.value}
              tokenStr={`${data.title}`}
              onTextChange={(value) => {
                setDepositAmount(Number(value));
                setDepositStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.value}
              valid={depositStatus}
              invalidStr={invalidStr}
            />
            <Button
              disabled={depositAmount <= 0 || buttonDisabled || isNaN(depositAmount)}
              className="button--blue bottomBtn"
              onClick={() => deposit()}
            >
              Deposit LP
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DepositModal;
