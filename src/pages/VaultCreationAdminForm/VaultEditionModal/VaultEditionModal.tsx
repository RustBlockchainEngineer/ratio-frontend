import { LPEditionData } from '../../../types/VaultTypes';
import { Modal, Button } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import VaultEditionForm from '../VaultEditionForm';
import AdminFormInput from '../../../components/AdminFormInput';
import { useEffect, useState } from 'react';
import { fundRatioRewards, setPoolDebtCeiling } from '../../../utils/ratio-lending-admin';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { PublicKey } from '@solana/web3.js';
import {
  calculateAPY,
  calculateFundAmount,
  RATIO_MINT_DECIMALS,
  RATIO_MINT_KEY,
  USDR_MINT_DECIMALS,
} from '../../../utils/ratio-lending';
import { toast } from 'react-toastify';
import { formatUSD, getDateStr } from '../../../utils/utils';
import { useOracleInfo, usePoolInfo } from '../../../contexts/state';
interface VaultEditionModalProps {
  show: boolean;
  close: () => void;
  vault: Maybe<LPEditionData>;
}

export default function VaultEditionModal({ show, close, vault }: VaultEditionModalProps) {
  const connection = useConnection();
  const { wallet } = useWallet();

  const poolInfo = usePoolInfo(vault?.address_id);
  const ratioPrice = useOracleInfo(RATIO_MINT_KEY);

  const [poolDebtCeilingValue, setPoolDebtCeilingValue] = useState(0);
  const [ratioRewardsDuration, setRatioRewardsDuration] = useState(0);
  const [lastRewardFundStart, setLastRewardFundStart] = useState('');
  const [lastRewardFundEnd, setLastRewardFundEnd] = useState('');
  const [ratioRewardsAmount, setRatioRewardsAmount] = useState(0);
  const [ratioRewardAPY, setRatioRewardAPY] = useState(0);
  const usdrAmountMinted = poolInfo ? poolInfo.totalDebt.toNumber() / 10 ** USDR_MINT_DECIMALS : 0;
  const [cvtApy2Amount, setCvtApy2Amount] = useState(false);

  const vaultValues: LPEditionData = {
    address_id: vault?.address_id ?? '',
    vault_address_id: vault?.vault_address_id ?? null,
    page_url: vault?.page_url ?? null,
    icon: vault?.icon ?? null,
    platform_id: vault?.platform_id ?? null,
    platform_symbol: vault?.platform_symbol ?? null,
    pool_size: vault?.pool_size ?? null,
    symbol: vault?.symbol ?? null,
    collateralization_ratio: vault?.collateralization_ratio ?? null,
    liquidation_ratio: vault?.liquidation_ratio ?? null,
    risk_rating: vault?.risk_rating,
    reward_mint: vault?.reward_mint,
    assets: vault?.assets,
  };
  useEffect(() => {
    if (poolInfo) {
      const debtCeiling = poolInfo.debtCeiling.toNumber() / 10 ** USDR_MINT_DECIMALS;
      setPoolDebtCeilingValue(debtCeiling);
      const lastRewardFundStart = poolInfo.lastRewardFundStart.toNumber();
      const lastRewardFundEnd = poolInfo.lastRewardFundEnd.toNumber();
      const lastRewardFundAmount = poolInfo.lastRewardFundAmount.toNumber();
      const days = Math.round((lastRewardFundEnd - lastRewardFundStart) / (3600 * 24));
      setRatioRewardsDuration(days);
      setLastRewardFundStart(getDateStr(lastRewardFundStart));
      setLastRewardFundEnd(getDateStr(lastRewardFundEnd));
      setRatioRewardsAmount(Math.round(lastRewardFundAmount / 10 ** RATIO_MINT_DECIMALS));
    }
  }, [vault]);

  useEffect(() => {
    if (cvtApy2Amount) {
      const amount = calculateFundAmount(usdrAmountMinted, ratioRewardAPY, ratioRewardsDuration, ratioPrice);
      setRatioRewardsAmount(amount);
    } else {
      const apy = calculateAPY(usdrAmountMinted, ratioRewardsAmount, ratioRewardsDuration, ratioPrice);
      setRatioRewardAPY(apy);
    }
  }, [cvtApy2Amount, usdrAmountMinted, ratioRewardsDuration, ratioRewardAPY, ratioRewardsAmount]);

  const handlePoolDebtCelilingChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setPoolDebtCeilingValue(value);
  };
  const handleRatioRewardAmount = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setRatioRewardsAmount(value);
  };
  const handleRatioRewardAPY = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    console.log(value);
    setRatioRewardAPY(value);
  };
  const handleRatioRewardsDuration = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setRatioRewardsDuration(value);
  };
  const handleAPY2Amount = () => {
    setCvtApy2Amount((prev) => !prev);
  };
  const savePoolDebtCeiling = async () => {
    try {
      if (vaultValues.address_id) {
        await setPoolDebtCeiling(connection, wallet, poolDebtCeilingValue, new PublicKey(vaultValues.address_id));
        toast.success('PoolDebtCeiling has been saved successfully!');
      } else {
        toast.error('collateral mint address is not defined!');
      }
    } catch (e) {
      toast.error('Setting PoolDebtCeiling has been failed!');
    }
  };
  const fundRewards = async () => {
    try {
      if (vaultValues.address_id && ratioRewardsAmount > 0 && ratioRewardsDuration > 0) {
        await fundRatioRewards(
          connection,
          wallet,
          new PublicKey(vaultValues.vault_address_id),
          ratioRewardsAmount,
          ratioRewardsDuration
        );
        toast.success('has been funded successfully!');
      } else {
        toast.error('input amount and duration!');
      }
    } catch (e) {
      toast.error('Funding Ratio rewards has been failed!');
    }
  };
  return (
    <Modal
      show={show}
      onHide={() => close()}
      aria-labelledby="contained-modal-title-vcenter"
      dialogClassName="w-100 mw-100"
      centered
      className="dashboardModal__modal"
      data-theme="light"
    >
      <Modal.Header>
        <div className="dashboardModal__modal__header">
          <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => close()} />
          <h5>Edit {vault?.symbol} Lending Pool</h5>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="dashboardModal__modal__body">
          <VaultEditionForm values={vaultValues} onSave={() => close()} />
          <AdminFormInput
            handleChange={handlePoolDebtCelilingChange}
            label="Pool Debt Ceiling"
            name="poolDebtCeilingValue"
            value={poolDebtCeilingValue}
          />
          <Button onClick={savePoolDebtCeiling}>Set Debt Ceiling</Button>
        </div>
        <div className="dashboardModal__modal__body">
          <h5>RATIO Emission Rate Calculator: {formatUSD.format(usdrAmountMinted)} USDr minted</h5>
          <AdminFormInput
            handleChange={handleRatioRewardsDuration}
            label="RATIO Rewards duration (days)"
            name="ratioRewardsDuration"
            value={ratioRewardsDuration}
          />
          <h5>
            {lastRewardFundStart} - {lastRewardFundEnd}
          </h5>
          {cvtApy2Amount ? (
            <AdminFormInput
              handleChange={handleRatioRewardAPY}
              label="APY(%)"
              name="ratioRewardAPY"
              value={ratioRewardAPY}
            />
          ) : (
            <AdminFormInput
              handleChange={handleRatioRewardAmount}
              label="RATIO Rewards amount"
              name="ratioRewardsAmount"
              value={ratioRewardsAmount}
            />
          )}
          <Button onClick={handleAPY2Amount}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="inherit">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.13797 7.80436L4.99989 9.66692H0.333008V5.00004L2.19557 6.86196L8.33301 0.723877L9.27613 1.667L3.13797 7.80436ZM13.6668 4.33316V9.00004L11.8042 7.13812L5.66677 13.2762L4.72365 12.3331L10.8617 6.19564L8.99981 4.33308L13.6668 4.33316Z"
                fill="inherit"
              ></path>
            </svg>
          </Button>
          {cvtApy2Amount ? (
            <AdminFormInput
              handleChange={handleRatioRewardAmount}
              label="RATIO Rewards amount"
              name="ratioRewardsAmount"
              value={ratioRewardsAmount}
            />
          ) : (
            <AdminFormInput
              handleChange={handleRatioRewardAPY}
              label="APY(%)"
              name="ratioRewardAPY"
              value={ratioRewardAPY}
            />
          )}
          <Button onClick={fundRewards}>Fund RATIO rewards</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
