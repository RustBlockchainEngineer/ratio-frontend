import TokensEarned from './TokensEarned';

const AmountPanel = (data: any) => {
  return (
    <div className="amountPanel">
      <div className="pb-4">
        <TokensEarned data={data} />
      </div>
    </div>
  );
};

export default AmountPanel;
