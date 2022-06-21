import TokensEarned from './TokensEarned';

const AmountPanel = (data: any) => {
  return (
    <div className="amountPanel">
      <div>
        <TokensEarned data={data} />
      </div>
    </div>
  );
};

export default AmountPanel;
