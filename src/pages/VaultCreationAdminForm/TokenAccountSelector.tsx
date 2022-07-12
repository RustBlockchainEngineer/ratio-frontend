import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AdminFormInput from '../../components/AdminFormInput';
import { useConnection } from '../../contexts/connection';
import { ParsedAccountData, PublicKey } from '@solana/web3.js';

export default function TokenAccountSelector({ tokens, data, isFirst, isNew, onUpdate }) {
  const connection = useConnection();

  const [tokenAccount, setTokenAccount] = useState(data.tokenAccount);
  const [tokenMint, setTokenMint] = useState(data.tokenMint);
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const tokenAccount = event.target.value;
    setTokenAccount(tokenAccount);
    try {
      const info = await connection.getParsedAccountInfo(new PublicKey(event.target.value));
      const mint = (info.value.data as ParsedAccountData).parsed.info.mint;
      setTokenMint(mint);
    } catch {
      setTokenMint('');
    }
  };
  return (
    <>
      <AdminFormInput
        handleChange={handleChange}
        label={isFirst ? 'Underlying Asset Account' : ''}
        name="token_account"
        value={tokenAccount}
        md="6"
        required={!isNew}
      />
      <AdminFormInput
        label={isFirst ? 'Asset Mint' : ''}
        as="select"
        name="token_mint"
        value={tokenMint}
        md="4"
        readOnly={true}
        required={!isNew}
      >
        <option key="" disabled value="">
          -Token Account is wrong-
        </option>
        {tokens?.map((item) => (
          <option key={item.address_id} value={item.address_id}>
            {item.symbol}
          </option>
        ))}
      </AdminFormInput>
      <div style={{ lineHeight: isFirst ? 6 : 5 }}>
        <Button
          size="sm"
          disabled={!tokenMint}
          onClick={() => {
            onUpdate(tokenMint, tokenAccount, data.index);
            if (isNew) {
              setTokenMint('');
              setTokenAccount('');
            }
          }}
        >
          {isNew ? '++' : '>>'}
        </Button>{' '}
        {!isNew && (
          <Button size="sm" variant="danger" onClick={() => onUpdate('', '', data.index)}>
            --
          </Button>
        )}
      </div>
    </>
  );
}
