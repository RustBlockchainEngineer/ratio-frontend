import { LPEditionData } from '../../../types/VaultTypes';
import { Modal, Button } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import VaultEditionForm from '../VaultEditionForm';
import AdminFormInput from '../../../components/AdminFormInput';
import { useEffect, useState } from 'react';
import { fundRatioRewards, getPool, setPoolDebtCeiling } from '../../../utils/ratio-lending-admin';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { PublicKey } from '@solana/web3.js';
import { RATIO_MINT_DECIMALS, USDR_MINT_DECIMALS } from '../../../utils/ratio-lending';
import { toast } from 'react-toastify';
import { getDateStr } from '../../../utils/utils';
interface VaultEditionModalProps {
  show: boolean;
  close: () => void;
  vault: Maybe<LPEditionData>;
}

export default function VaultEditionModal({ show, close, vault }: VaultEditionModalProps) {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [poolDebtCeilingValue, setPoolDebtCeilingValue] = useState(0);
  const [ratioRewardsDuration, setRatioRewardsDuration] = useState(0);
  const [lastRewardFundStart, setLastRewardFundStart] = useState('');
  const [lastRewardFundEnd, setLastRewardFundEnd] = useState('');
  const [ratioRewardsAmount, setRatioRewardsAmount] = useState(0);
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
    lpasset:
      vault?.lpasset?.map((x) => {
        return {
          token_address_id: x.token_address_id,
          token_pool_size: x.token_pool_size,
        };
      }) ?? [],
    reward_mint: vault?.reward_mint,
    token_mint_a: vault?.token_mint_a,
    token_mint_b: vault?.token_mint_b,
    token_reserve_a: vault?.token_reserve_a,
    token_reserve_b: vault?.token_reserve_b,
  };
  useEffect(() => {
    if (vault && vault.vault_address_id) {
      getPool(connection, wallet, new PublicKey(vault.vault_address_id)).then((poolData) => {
        const debtCeiling = poolData.debtCeiling.toNumber() / 10 ** USDR_MINT_DECIMALS;
        setPoolDebtCeilingValue(debtCeiling);
        const lastRewardFundStart = poolData.lastRewardFundStart.toNumber();
        const lastRewardFundEnd = poolData.lastRewardFundEnd.toNumber();
        const lastRewardFundAmount = poolData.lastRewardFundAmount.toNumber();
        const days = Math.round((lastRewardFundEnd - lastRewardFundStart) / (3600 * 24));
        setRatioRewardsDuration(days);
        setLastRewardFundStart(getDateStr(lastRewardFundStart));
        setLastRewardFundEnd(getDateStr(lastRewardFundEnd));
        setRatioRewardsAmount(Math.round(lastRewardFundAmount / 10 ** RATIO_MINT_DECIMALS));
      });
    }
  }, [vault]);
  const handlePoolDebtCelilingChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setPoolDebtCeilingValue(value);
  };
  const handleRatioRewardsAmount = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setRatioRewardsAmount(value);
  };
  const handleRatioRewardsDuration = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: any = event.target.value ?? 0;
    setRatioRewardsDuration(value);
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
          new PublicKey(vaultValues.address_id),
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
    >
      <Modal.Header>
        <div className="dashboardModal__modal__header">
          <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => close()} />
          <h5>Edit vault</h5>
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
          <AdminFormInput
            handleChange={handleRatioRewardsAmount}
            label="RATIO Rewards amount"
            name="ratioRewardsAmount"
            value={ratioRewardsAmount}
          />
          <h5>
            {lastRewardFundStart} - {lastRewardFundEnd}
          </h5>
          <AdminFormInput
            handleChange={handleRatioRewardsDuration}
            label="RATIO Rewards duration (days)"
            name="ratioRewardsDuration"
            value={ratioRewardsDuration}
          />
          <Button onClick={fundRewards}>Fund RATIO rewards</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
