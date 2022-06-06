import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useAccountByMint } from '../../../contexts/accounts';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { isWalletApproveError } from '../../../utils/utils';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import AmountSlider from '../AmountSlider';
import { useGetPoolManager } from '../../../hooks/useGetPoolManager';
import { LPair } from '../../../types/VaultTypes';
import { TokenAmount } from '../../../utils/safe-math';
import { DEPOSIT_ACTION, USDR_MINT_DECIMALS } from '../../../utils/ratio-lending';
import { useAppendUserAction, usePoolInfo, useSubscribeTx } from '../../../contexts/state';

const DepositModal = ({ data }: any) => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [show, setShow] = useState(false);

  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const poolInfo = usePoolInfo(data?.mint);

  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);
  const PoolManagerFactory = useGetPoolManager(vault);

  const collAccount = useAccountByMint(data.mint);
  const [depositAmount, setDepositAmount] = useState<any>();

  const [didMount, setDidMount] = useState(false);

  const [depositStatus, setDepositStatus] = useState(false);
  const [invalidStr, setInvalidStr] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [amountValue, setAmountValue] = useState(0);

  const appendUserAction = useAppendUserAction();
  const subscribeTx = useSubscribeTx();

  const depositAmountUSD = new TokenAmount(depositAmount * data.tokenPrice, USDR_MINT_DECIMALS).fixed();

  useEffect(() => {
    setDidMount(true);
    setDepositAmount('');
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const deposit = async () => {
    try {
      console.log('Depositing', depositAmount);
      if (!(depositAmount && data?.value >= depositAmount)) {
        setDepositStatus(true);
        setInvalidStr('Insufficient funds to deposit!');
        return;
      }
      if (!(collAccount && connected)) {
        setDepositStatus(true);
        setInvalidStr('Invalid  User Collateral account to deposit!');
        return;
      }

      setIsDepositing(true);
      const txHash = await PoolManagerFactory?.depositLP(
        connection,
        wallet,
        vault as LPair,
        depositAmount * Math.pow(10, poolInfo?.mintDecimals ?? 0),
        collAccount?.pubkey.toString() as string
      );
      subscribeTx(
        txHash,
        () => toast.info('Deposit Transaction Sent'),
        () => toast.success('Deposit Confirmed.'),
        () => toast.error('Deposit Transaction Failed')
      );
      appendUserAction(
        wallet.publicKey.toString(),
        data.mint,
        data.mint,
        DEPOSIT_ACTION,
        -depositAmount,
        txHash,
        poolInfo.currentPrice
      );

      setDepositAmount(0);
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    setIsDepositing(false);
    setShow(false);
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
        onEntered={() => {
          setAmountValue(0);
          setDepositAmount('');
          setDepositStatus(false);
          setButtonDisabled(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
        data-theme={darkMode ? 'dark' : 'light'}
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
              {data.icon && <img src={data.icon} className="dashboardModal__modal__header-icon" alt={data.title} />}
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
              initValue={0}
              appendValueStr={data.value}
              tokenStr={`${data.title}`}
              onTextChange={(value: any) => {
                setAmountValue((value / data.value) * 100);
                setDepositAmount(value);
                setDepositStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.value}
              valid={depositStatus}
              invalidStr={invalidStr}
              value={depositAmount}
            />
            <p className="vaultsetupcontainer-label mt-2">
              USD: <strong className="vaultsetupcontainer-value">${depositAmountUSD}</strong>
            </p>
            <AmountSlider
              onChangeValue={(value) => {
                setDepositAmount(Number(data.value * (value / 100)).toFixed(2));
                setAmountValue(value);
                setDepositStatus(false);
                setButtonDisabled(false);
              }}
              value={amountValue}
            />
            <Button
              disabled={depositAmount <= 0 || buttonDisabled || isNaN(depositAmount) || isDepositing}
              className="button--blue bottomBtn"
              onClick={() => deposit()}
            >
              Deposit Assets
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DepositModal;
