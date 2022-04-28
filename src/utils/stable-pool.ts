export type StablePool = {
  version: '0.1.0';
  name: 'stable_pool';
  instructions: [
    {
      name: 'createGlobalState';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintUsdr';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'tvlLimit';
          type: 'u64';
        },
        {
          name: 'globalDebtCeiling';
          type: 'u64';
        },
        {
          name: 'debtCeilingUser';
          type: 'u64';
        },
        {
          name: 'oracleReporter';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'createPool';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintReward';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'poolBump';
          type: 'u8';
        },
        {
          name: 'riskLevel';
          type: 'u8';
        },
        {
          name: 'debtCeiling';
          type: 'u64';
        },
        {
          name: 'platformType';
          type: 'u8';
        }
      ];
    },
    {
      name: 'createUserState';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createVault';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'vaultBump';
          type: 'u8';
        }
      ];
    },
    {
      name: 'depositCollateral';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'depositAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'withdrawCollateral';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'withdrawAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'distributeReward';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRewardVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRewardUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'ataRatioTreasury';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'borrowUsdr';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataUsdr';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintUsdr';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'oracleA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenA';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapTokenB';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'borrowAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'repayUsdr';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintUsdr';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataUsdr';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'repayAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'createOracle';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clock';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'initPrice';
          type: 'u64';
        }
      ];
    },
    {
      name: 'reportPriceToOracle';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clock';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'price';
          type: 'u64';
        }
      ];
    },
    {
      name: 'setGlobalTvlLimit';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'limitPrecise';
          type: 'u64';
        }
      ];
    },
    {
      name: 'setGlobalDebtCeiling';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'ceiling';
          type: 'u64';
        }
      ];
    },
    {
      name: 'setUserDebtCeiling';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'ceiling';
          type: 'u64';
        }
      ];
    },
    {
      name: 'setPoolDebtCeiling';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'ceiling';
          type: 'u64';
        }
      ];
    },
    {
      name: 'setHarvestFee';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'feeNum';
          type: 'u64';
        }
      ];
    },
    {
      name: 'toggleEmerState';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'newState';
          type: 'u8';
        }
      ];
    },
    {
      name: 'changeTreasuryWallet';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'treasury';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'newTreasury';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'changeAuthority';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'newAuthority';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'createRewardVault';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRewardVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintReward';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createSaberQuarryMiner';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintCollat';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatMiner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarryProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'minerBump';
          type: 'u8';
        }
      ];
    },
    {
      name: 'stakeCollateralToSaber';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatMiner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarryProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amtToStake';
          type: {
            option: 'u64';
          };
        }
      ];
    },
    {
      name: 'unstakeCollateralFromSaber';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatMiner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'minerVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarryProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'harvestRewardsFromSaber';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'treasury';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintWrapper';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintWrapperProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'minter';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'claimFeeTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRewardVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatMiner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataCollatVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarryProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'globalState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'treasury';
            type: 'publicKey';
          },
          {
            name: 'oracleReporter';
            type: 'publicKey';
          },
          {
            name: 'mintUsdr';
            type: 'publicKey';
          },
          {
            name: 'mintUsdrBump';
            type: 'u8';
          },
          {
            name: 'tvlCollatCeilingUsd';
            type: 'u64';
          },
          {
            name: 'tvlUsd';
            type: 'u64';
          },
          {
            name: 'tvlCollat';
            type: {
              array: ['u64', 4];
            };
          },
          {
            name: 'paused';
            type: 'u8';
          },
          {
            name: 'totalDebt';
            type: 'u64';
          },
          {
            name: 'debtCeilingGlobal';
            type: 'u64';
          },
          {
            name: 'debtCeilingPool';
            type: 'u64';
          },
          {
            name: 'debtCeilingUser';
            type: 'u64';
          },
          {
            name: 'feeNum';
            type: 'u64';
          },
          {
            name: 'feeDeno';
            type: 'u64';
          },
          {
            name: 'collPerRisklv';
            type: {
              array: ['u64', 10];
            };
          },
          {
            name: 'pubkeys';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'data128';
            type: {
              array: ['u128', 8];
            };
          },
          {
            name: 'data64';
            type: {
              array: ['u64', 8];
            };
          },
          {
            name: 'data32';
            type: {
              array: ['u32', 8];
            };
          }
        ];
      };
    },
    {
      name: 'oracle';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'mint';
            type: 'publicKey';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'lastUpdatedTime';
            type: 'u64';
          },
          {
            name: 'pubkeys';
            type: {
              array: ['publicKey', 8];
            };
          },
          {
            name: 'data';
            type: {
              array: ['u128', 8];
            };
          }
        ];
      };
    },
    {
      name: 'pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'mintCollat';
            type: 'publicKey';
          },
          {
            name: 'mintReward';
            type: 'publicKey';
          },
          {
            name: 'tvlUsd';
            type: 'u64';
          },
          {
            name: 'totalColl';
            type: 'u64';
          },
          {
            name: 'totalDebt';
            type: 'u64';
          },
          {
            name: 'debtCeiling';
            type: 'u64';
          },
          {
            name: 'riskLevel';
            type: 'u8';
          },
          {
            name: 'platformType';
            type: 'u8';
          },
          {
            name: 'farmInfo';
            type: 'publicKey';
          },
          {
            name: 'swapTokenA';
            type: 'publicKey';
          },
          {
            name: 'swapTokenB';
            type: 'publicKey';
          },
          {
            name: 'swapMintA';
            type: 'publicKey';
          },
          {
            name: 'swapMintB';
            type: 'publicKey';
          },
          {
            name: 'pubkeys';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'data128';
            type: {
              array: ['u128', 4];
            };
          },
          {
            name: 'data64';
            type: {
              array: ['u64', 4];
            };
          },
          {
            name: 'data32';
            type: {
              array: ['u32', 4];
            };
          }
        ];
      };
    },
    {
      name: 'userState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'totalDebt';
            type: 'u64';
          },
          {
            name: 'tvlUsd';
            type: 'u64';
          },
          {
            name: 'activeVaults';
            type: 'u64';
          },
          {
            name: 'pubkeys';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'data128';
            type: {
              array: ['u128', 8];
            };
          },
          {
            name: 'data64';
            type: {
              array: ['u64', 8];
            };
          },
          {
            name: 'data32';
            type: {
              array: ['u32', 8];
            };
          }
        ];
      };
    },
    {
      name: 'vault';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'mintCollat';
            type: 'publicKey';
          },
          {
            name: 'mintReward';
            type: 'publicKey';
          },
          {
            name: 'ataCollatVault';
            type: 'publicKey';
          },
          {
            name: 'ataCollatMiner';
            type: 'publicKey';
          },
          {
            name: 'ataRewardVault';
            type: 'publicKey';
          },
          {
            name: 'totalColl';
            type: 'u64';
          },
          {
            name: 'tvlUsd';
            type: 'u64';
          },
          {
            name: 'debt';
            type: 'u64';
          },
          {
            name: 'lastMintTime';
            type: 'u64';
          },
          {
            name: 'walletNonce';
            type: 'u8';
          },
          {
            name: 'pubkeys';
            type: {
              array: ['publicKey', 16];
            };
          },
          {
            name: 'data128';
            type: {
              array: ['u128', 8];
            };
          },
          {
            name: 'data64';
            type: {
              array: ['u64', 8];
            };
          },
          {
            name: 'data32';
            type: {
              array: ['u32', 8];
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'PlatformType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Saber';
          },
          {
            name: 'Unknown';
          }
        ];
      };
    },
    {
      name: 'StablePoolError';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Unauthorized';
          },
          {
            name: 'AlreadyInUse';
          },
          {
            name: 'InvalidProgramAddress';
          },
          {
            name: 'InvalidState';
          },
          {
            name: 'InvalidOwner';
          },
          {
            name: 'NotAllowed';
          },
          {
            name: 'MathOverflow';
          },
          {
            name: 'InvalidOracleConfig';
          },
          {
            name: 'InvalidAccountInput';
          },
          {
            name: 'InvalidCluster';
          },
          {
            name: 'GlobalTVLExceeded';
          },
          {
            name: 'LTVExceeded';
          },
          {
            name: 'GlobalDebtCeilingExceeded';
          },
          {
            name: 'PoolDebtCeilingExceeded';
          },
          {
            name: 'UserDebtCeilingExceeded';
          },
          {
            name: 'WithdrawNotAllowedWithDebt';
          },
          {
            name: 'InvalidTransferAmount';
          },
          {
            name: 'InvalidPlatformType';
          },
          {
            name: 'InvalidPlatformNotSaber';
          },
          {
            name: 'RepayingMoreThanBorrowed';
          },
          {
            name: 'RewardMintMismatch';
          }
        ];
      };
    }
  ];
};

export const IDL: StablePool = {
  version: '0.1.0',
  name: 'stable_pool',
  instructions: [
    {
      name: 'createGlobalState',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintUsdr',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'tvlLimit',
          type: 'u64',
        },
        {
          name: 'globalDebtCeiling',
          type: 'u64',
        },
        {
          name: 'debtCeilingUser',
          type: 'u64',
        },
        {
          name: 'oracleReporter',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'createPool',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintReward',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolBump',
          type: 'u8',
        },
        {
          name: 'riskLevel',
          type: 'u8',
        },
        {
          name: 'debtCeiling',
          type: 'u64',
        },
        {
          name: 'platformType',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createUserState',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createVault',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'vaultBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'depositCollateral',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'depositAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawCollateral',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'withdrawAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'distributeReward',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRewardVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRewardUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'ataRatioTreasury',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'borrowUsdr',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataUsdr',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintUsdr',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracleA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenA',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapTokenB',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'borrowAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'repayUsdr',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintUsdr',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataUsdr',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'repayAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'createOracle',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'initPrice',
          type: 'u64',
        },
      ],
    },
    {
      name: 'reportPriceToOracle',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'price',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setGlobalTvlLimit',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'limitPrecise',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setGlobalDebtCeiling',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ceiling',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setUserDebtCeiling',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ceiling',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setPoolDebtCeiling',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ceiling',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setHarvestFee',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeNum',
          type: 'u64',
        },
      ],
    },
    {
      name: 'toggleEmerState',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newState',
          type: 'u8',
        },
      ],
    },
    {
      name: 'changeTreasuryWallet',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'treasury',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newTreasury',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'changeAuthority',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newAuthority',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'createRewardVault',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRewardVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintReward',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createSaberQuarryMiner',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintCollat',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatMiner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarryProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'minerBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'stakeCollateralToSaber',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatMiner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarryProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amtToStake',
          type: {
            option: 'u64',
          },
        },
      ],
    },
    {
      name: 'unstakeCollateralFromSaber',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatMiner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'minerVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarryProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'harvestRewardsFromSaber',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'treasury',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintWrapper',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintWrapperProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'minter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'claimFeeTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRewardVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatMiner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataCollatVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarryProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'globalState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'treasury',
            type: 'publicKey',
          },
          {
            name: 'oracleReporter',
            type: 'publicKey',
          },
          {
            name: 'mintUsdr',
            type: 'publicKey',
          },
          {
            name: 'mintUsdrBump',
            type: 'u8',
          },
          {
            name: 'tvlCollatCeilingUsd',
            type: 'u64',
          },
          {
            name: 'tvlUsd',
            type: 'u64',
          },
          {
            name: 'tvlCollat',
            type: {
              array: ['u64', 4],
            },
          },
          {
            name: 'paused',
            type: 'u8',
          },
          {
            name: 'totalDebt',
            type: 'u64',
          },
          {
            name: 'debtCeilingGlobal',
            type: 'u64',
          },
          {
            name: 'debtCeilingPool',
            type: 'u64',
          },
          {
            name: 'debtCeilingUser',
            type: 'u64',
          },
          {
            name: 'feeNum',
            type: 'u64',
          },
          {
            name: 'feeDeno',
            type: 'u64',
          },
          {
            name: 'collPerRisklv',
            type: {
              array: ['u64', 10],
            },
          },
          {
            name: 'pubkeys',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'data128',
            type: {
              array: ['u128', 8],
            },
          },
          {
            name: 'data64',
            type: {
              array: ['u64', 8],
            },
          },
          {
            name: 'data32',
            type: {
              array: ['u32', 8],
            },
          },
        ],
      },
    },
    {
      name: 'oracle',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'decimals',
            type: 'u8',
          },
          {
            name: 'lastUpdatedTime',
            type: 'u64',
          },
          {
            name: 'pubkeys',
            type: {
              array: ['publicKey', 8],
            },
          },
          {
            name: 'data',
            type: {
              array: ['u128', 8],
            },
          },
        ],
      },
    },
    {
      name: 'pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'mintCollat',
            type: 'publicKey',
          },
          {
            name: 'mintReward',
            type: 'publicKey',
          },
          {
            name: 'tvlUsd',
            type: 'u64',
          },
          {
            name: 'totalColl',
            type: 'u64',
          },
          {
            name: 'totalDebt',
            type: 'u64',
          },
          {
            name: 'debtCeiling',
            type: 'u64',
          },
          {
            name: 'riskLevel',
            type: 'u8',
          },
          {
            name: 'platformType',
            type: 'u8',
          },
          {
            name: 'farmInfo',
            type: 'publicKey',
          },
          {
            name: 'swapTokenA',
            type: 'publicKey',
          },
          {
            name: 'swapTokenB',
            type: 'publicKey',
          },
          {
            name: 'swapMintA',
            type: 'publicKey',
          },
          {
            name: 'swapMintB',
            type: 'publicKey',
          },
          {
            name: 'pubkeys',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'data128',
            type: {
              array: ['u128', 4],
            },
          },
          {
            name: 'data64',
            type: {
              array: ['u64', 4],
            },
          },
          {
            name: 'data32',
            type: {
              array: ['u32', 4],
            },
          },
        ],
      },
    },
    {
      name: 'userState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'totalDebt',
            type: 'u64',
          },
          {
            name: 'tvlUsd',
            type: 'u64',
          },
          {
            name: 'activeVaults',
            type: 'u64',
          },
          {
            name: 'pubkeys',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'data128',
            type: {
              array: ['u128', 8],
            },
          },
          {
            name: 'data64',
            type: {
              array: ['u64', 8],
            },
          },
          {
            name: 'data32',
            type: {
              array: ['u32', 8],
            },
          },
        ],
      },
    },
    {
      name: 'vault',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'mintCollat',
            type: 'publicKey',
          },
          {
            name: 'mintReward',
            type: 'publicKey',
          },
          {
            name: 'ataCollatVault',
            type: 'publicKey',
          },
          {
            name: 'ataCollatMiner',
            type: 'publicKey',
          },
          {
            name: 'ataRewardVault',
            type: 'publicKey',
          },
          {
            name: 'totalColl',
            type: 'u64',
          },
          {
            name: 'tvlUsd',
            type: 'u64',
          },
          {
            name: 'debt',
            type: 'u64',
          },
          {
            name: 'lastMintTime',
            type: 'u64',
          },
          {
            name: 'walletNonce',
            type: 'u8',
          },
          {
            name: 'pubkeys',
            type: {
              array: ['publicKey', 16],
            },
          },
          {
            name: 'data128',
            type: {
              array: ['u128', 8],
            },
          },
          {
            name: 'data64',
            type: {
              array: ['u64', 8],
            },
          },
          {
            name: 'data32',
            type: {
              array: ['u32', 8],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'PlatformType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Saber',
          },
          {
            name: 'Unknown',
          },
        ],
      },
    },
    {
      name: 'StablePoolError',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Unauthorized',
          },
          {
            name: 'AlreadyInUse',
          },
          {
            name: 'InvalidProgramAddress',
          },
          {
            name: 'InvalidState',
          },
          {
            name: 'InvalidOwner',
          },
          {
            name: 'NotAllowed',
          },
          {
            name: 'MathOverflow',
          },
          {
            name: 'InvalidOracleConfig',
          },
          {
            name: 'InvalidAccountInput',
          },
          {
            name: 'InvalidCluster',
          },
          {
            name: 'GlobalTVLExceeded',
          },
          {
            name: 'LTVExceeded',
          },
          {
            name: 'GlobalDebtCeilingExceeded',
          },
          {
            name: 'PoolDebtCeilingExceeded',
          },
          {
            name: 'UserDebtCeilingExceeded',
          },
          {
            name: 'WithdrawNotAllowedWithDebt',
          },
          {
            name: 'InvalidTransferAmount',
          },
          {
            name: 'InvalidPlatformType',
          },
          {
            name: 'InvalidPlatformNotSaber',
          },
          {
            name: 'RepayingMoreThanBorrowed',
          },
          {
            name: 'RewardMintMismatch',
          },
        ],
      },
    },
  ],
};
