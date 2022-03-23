import { useFetchCollateralRatio } from '../../../hooks/useFetchCollateralRatio';

export interface PriceCardInterface {
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
  risk: string;
};

const PriceCard = ({ price, tokenName, risk }: PriceCardProps) => {
  const { collateralRatio, error: collateralRatioError } = useFetchCollateralRatio(risk);
  return (
    <div>
      <div className="pricecard">
        <div className="pricecard__header">
          <div className="pricecard__title">
            <p>Collateralization Ratio</p>
          </div>
          <div className="pricecard__value">
            <h3>{collateralRatioError !== null ? '...' : (collateralRatio * 100).toFixed(2)}%</h3>
          </div>
        </div>
        <div className="pricecard__body">
          {price?.currentPrice && (
            <div>
              <label>Current {tokenName} LP Token Price</label>
              <p>{price?.currentPrice}</p>
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
