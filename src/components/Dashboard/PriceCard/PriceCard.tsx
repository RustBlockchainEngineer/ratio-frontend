import { formatUSD } from '../../../utils/utils';

interface PriceCardInterface {
  title?: string;
  titleIcon?: boolean;
  mainValue?: string;
  mainUnit?: string;
  currentPrice?: string;
  minimumRatio?: string;
  stabilityFee?: string;
}

type PriceCardProps = {
  price: PriceCardInterface;
  tokenName: string;
  risk: number;
};

const PriceCard = ({ price, tokenName, risk }: PriceCardProps) => {
  return (
    <div>
      <div className="pricecard">
        <div className="pricecard__header">
          <div className="pricecard__title">
            <p>Collateralization Ratio</p>
          </div>
          <div className="pricecard__value">
            <h3>{!risk ? '...' : (100 / risk).toFixed(2)}%</h3>
          </div>
        </div>
        <div className="pricecard__body">
          {price?.currentPrice && (
            <div>
              <label>Current {tokenName} LP </label>
              <label>
                {/* <a href="https://app.gitbook.com/o/6gq6zK9zYcsbHkTov1Uy/s/b7FwVyumWzCgj0UwzhQP/our-business/how-does-ratios-collateralization-work"> */}
                &nbsp;Market Price
                {/* </a> */}
              </label>
              <p>{formatUSD.format(+price?.currentPrice ?? 0)}</p>
            </div>
          )}
          {price?.minimumRatio && (
            <div className="d-flex justify-content-between">
              <div>
                <label>Minimum Ratio</label>
                <p>{price?.minimumRatio}</p>
              </div>
              <div>
                <label>Stability Fee</label>
                <p className="text-right">{price?.stabilityFee}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
