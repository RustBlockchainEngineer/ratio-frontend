import { LPair, LPEditionData } from '../../../types/VaultTypes';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import VaultEditionForm from '../VaultEditionForm';

interface VaultEditionModalProps {
  show: boolean;
  close: () => void;
  vault: Maybe<LPair>;
}

export default function VaultEditionModal({ show, close, vault }: VaultEditionModalProps) {
  const vaultValues: LPEditionData = {
    address_id: vault?.address_id ?? '',
    vault_address_id: vault?.vault_address_id ?? null,
    page_url: vault?.page_url ?? null,
    icon: vault?.icon ?? null,
    platform_id: vault?.platform_id ?? null,
    platform_symbol: vault?.platform_name ?? null,
    pool_size: vault?.pool_size ?? null,
    symbol: vault?.symbol ?? null,
    collateralization_ratio: vault?.collateralization_ratio ?? null,
    liquidation_ratio: vault?.liquidation_ratio ?? null,
    risk_rating: vault?.risk_rating?.toString() ?? null,
    lpasset:
      vault?.lpasset?.map((x) => {
        return {
          token_address_id: x.token_address_id,
          token_pool_size: x.token_pool_size,
        };
      }) ?? [],
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
        </div>
      </Modal.Body>
    </Modal>
  );
}
