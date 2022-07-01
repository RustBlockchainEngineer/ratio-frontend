export type RatioLending = {
  version: '0.1.0';
  name: 'ratio_lending';
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
          isSigner: true;
        },
        {
          name: 'ratioMint';
          isMut: false;
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
          type: 'u128';
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
      args: [];
    },
    {
      name: 'depositCollateral';
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
          isMut: false;
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
          isMut: false;
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
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRatioTreasury';
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
        }
      ];
      args: [];
    },
    {
      name: 'harvestRatio';
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
          name: 'ratioVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRewardUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ataRatioTreasury';
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
        }
      ];
      args: [];
    },
    {
      name: 'borrowUsdr';
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
        },
        {
          name: 'treasury';
          isMut: false;
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
          name: 'ataUsdrTreasury';
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
          isMut: false;
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
          isMut: false;
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
          name: 'tvlLimit';
          type: 'u128';
        }
      ];
    },
    {
      name: 'setCollateralRatios';
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
          name: 'ratios';
          type: {
            array: ['u64', 10];
          };
        }
      ];
    },
    {
      name: 'setGlobalDebtCeiling';
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
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: false;
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
      name: 'setPoolPaused';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'globalState';
          isMut: false;
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
          name: 'isPaused';
          type: 'u8';
        }
      ];
    },
    {
      name: 'updatePool';
      accounts: [
        {
          name: 'authority';
          isMut: false;
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
        }
      ];
      args: [
        {
          name: 'riskLevel';
          type: 'u8';
        },
        {
          name: 'platformType';
          type: 'u8';
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
      name: 'setBorrowFee';
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
          isMut: false;
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
      args: [];
    },
    {
      name: 'changeFundingWallet';
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
        },
        {
          name: 'fundingWallet';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'changeAuthority';
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
          name: 'newAuthority';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'changeOracleReporter';
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
        },
        {
          name: 'oracleReporter';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'setRatioMint';
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
          name: 'ratioVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ratioMint';
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
    },
    {
      name: 'fundRatioToken';
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
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ratioVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userVault';
          isMut: true;
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
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'duration';
          type: {
            option: 'i64';
          };
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
          isMut: false;
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
          isMut: false;
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
          isMut: false;
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
            name: 'tvlCollatCeilingUsd';
            type: 'u128';
          },
          {
            name: 'tvlUsd';
            type: 'u128';
          },
          {
            name: 'tvlCollat';
            type: {
              array: ['u128', 4];
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
            name: 'debtCeilingUser';
            type: 'u64';
          },
          {
            name: 'harvestFeeNumer';
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
            name: 'ratioMint';
            type: 'publicKey';
          },
          {
            name: 'fundingWallet';
            type: 'publicKey';
          },
          {
            name: 'borrowFeeNumer';
            type: 'u64';
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 21];
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
            name: 'reserved';
            type: {
              array: ['u64', 30];
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
            type: 'u128';
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
            name: 'farmId';
            type: 'publicKey';
          },
          {
            name: 'ammId';
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
            name: 'isPaused';
            type: 'u8';
          },
          {
            name: 'tokenPerSecond';
            type: 'u64';
          },
          {
            name: 'accRewardPerShare';
            type: 'u128';
          },
          {
            name: 'lastRewardTime';
            type: 'i64';
          },
          {
            name: 'lastRewardFundStart';
            type: 'i64';
          },
          {
            name: 'lastRewardFundAmount';
            type: 'u64';
          },
          {
            name: 'lastRewardFundEnd';
            type: 'i64';
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 23];
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
            type: 'u128';
          },
          {
            name: 'activeVaults';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 29];
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
            type: 'u128';
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
            name: 'ratioRewardAmount';
            type: 'u128';
          },
          {
            name: 'ratioRewardDebt';
            type: 'u128';
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 26];
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
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'Unauthorized';
      msg: 'You are not authorized to perform this action.';
    },
    {
      code: 6001;
      name: 'AlreadyInUse';
      msg: 'AlreadyInUse';
    },
    {
      code: 6002;
      name: 'InvalidProgramAddress';
      msg: 'InvalidProgramAddress';
    },
    {
      code: 6003;
      name: 'InvalidState';
      msg: 'InvalidState';
    },
    {
      code: 6004;
      name: 'InvalidOwner';
      msg: 'InvalidOwner';
    },
    {
      code: 6005;
      name: 'NotAllowed';
      msg: 'NotAllowed';
    },
    {
      code: 6006;
      name: 'MathOverflow';
      msg: 'Math operation overflow';
    },
    {
      code: 6007;
      name: 'InvalidOracleConfig';
      msg: 'InvalidOracleConfig';
    },
    {
      code: 6008;
      name: 'InvalidAccountInput';
      msg: 'InvalidAccountInput';
    },
    {
      code: 6009;
      name: 'InvalidCluster';
      msg: 'This function works on devnet only';
    },
    {
      code: 6010;
      name: 'GlobalTVLExceeded';
      msg: 'Global TVL Exceeded';
    },
    {
      code: 6011;
      name: 'LTVExceeded';
      msg: 'LTV Exceeded';
    },
    {
      code: 6012;
      name: 'GlobalDebtCeilingExceeded';
      msg: 'Global Debt Ceiling Exceeded';
    },
    {
      code: 6013;
      name: 'PoolDebtCeilingExceeded';
      msg: 'Pool Debt Ceiling Exceeded';
    },
    {
      code: 6014;
      name: 'UserDebtCeilingExceeded';
      msg: 'User Debt Ceiling Exceeded';
    },
    {
      code: 6015;
      name: 'WithdrawNotAllowedWithDebt';
      msg: "Can't withdraw due to debt";
    },
    {
      code: 6016;
      name: 'InvalidTransferAmount';
      msg: 'Transfer amount is invalid';
    },
    {
      code: 6017;
      name: 'InvalidPlatformType';
      msg: 'Invalid platform type';
    },
    {
      code: 6018;
      name: 'InvalidSaberPlatformType';
      msg: 'Invalid platform, should be Saber';
    },
    {
      code: 6019;
      name: 'RepayingMoreThanBorrowed';
      msg: 'Attempting to repay more than the amount originally borrowed';
    },
    {
      code: 6020;
      name: 'RewardMintMismatch';
      msg: 'Reward mint account mismatch';
    },
    {
      code: 6021;
      name: 'PoolPaused';
      msg: 'The pool is paused by admin';
    },
    {
      code: 6022;
      name: 'InvalidFundingWallet';
      msg: 'Invalid Funding Wallet';
    }
  ];
};

export const IDL: RatioLending = {
  version: '0.1.0',
  name: 'ratio_lending',
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
          isSigner: true,
        },
        {
          name: 'ratioMint',
          isMut: false,
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
          type: 'u128',
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
      args: [],
    },
    {
      name: 'depositCollateral',
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
          isMut: false,
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
          isMut: false,
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
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRatioTreasury',
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
      ],
      args: [],
    },
    {
      name: 'harvestRatio',
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
          name: 'ratioVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRewardUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ataRatioTreasury',
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
      ],
      args: [],
    },
    {
      name: 'borrowUsdr',
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
        {
          name: 'treasury',
          isMut: false,
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
          name: 'ataUsdrTreasury',
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
          isMut: false,
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
          isMut: false,
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
          name: 'tvlLimit',
          type: 'u128',
        },
      ],
    },
    {
      name: 'setCollateralRatios',
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
          name: 'ratios',
          type: {
            array: ['u64', 10],
          },
        },
      ],
    },
    {
      name: 'setGlobalDebtCeiling',
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
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: false,
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
      name: 'setPoolPaused',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'globalState',
          isMut: false,
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
          name: 'isPaused',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updatePool',
      accounts: [
        {
          name: 'authority',
          isMut: false,
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
      ],
      args: [
        {
          name: 'riskLevel',
          type: 'u8',
        },
        {
          name: 'platformType',
          type: 'u8',
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
      name: 'setBorrowFee',
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
          isMut: false,
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
      args: [],
    },
    {
      name: 'changeFundingWallet',
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
        {
          name: 'fundingWallet',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'changeAuthority',
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
          name: 'newAuthority',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'changeOracleReporter',
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
        {
          name: 'oracleReporter',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'setRatioMint',
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
          name: 'ratioVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ratioMint',
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
    {
      name: 'fundRatioToken',
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
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ratioVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userVault',
          isMut: true,
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
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'duration',
          type: {
            option: 'i64',
          },
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
          isMut: false,
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
          isMut: false,
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
          isMut: false,
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
            name: 'tvlCollatCeilingUsd',
            type: 'u128',
          },
          {
            name: 'tvlUsd',
            type: 'u128',
          },
          {
            name: 'tvlCollat',
            type: {
              array: ['u128', 4],
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
            name: 'debtCeilingUser',
            type: 'u64',
          },
          {
            name: 'harvestFeeNumer',
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
            name: 'ratioMint',
            type: 'publicKey',
          },
          {
            name: 'fundingWallet',
            type: 'publicKey',
          },
          {
            name: 'borrowFeeNumer',
            type: 'u64',
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 21],
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
            name: 'reserved',
            type: {
              array: ['u64', 30],
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
            type: 'u128',
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
            name: 'farmId',
            type: 'publicKey',
          },
          {
            name: 'ammId',
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
            name: 'isPaused',
            type: 'u8',
          },
          {
            name: 'tokenPerSecond',
            type: 'u64',
          },
          {
            name: 'accRewardPerShare',
            type: 'u128',
          },
          {
            name: 'lastRewardTime',
            type: 'i64',
          },
          {
            name: 'lastRewardFundStart',
            type: 'i64',
          },
          {
            name: 'lastRewardFundAmount',
            type: 'u64',
          },
          {
            name: 'lastRewardFundEnd',
            type: 'i64',
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 23],
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
            type: 'u128',
          },
          {
            name: 'activeVaults',
            type: 'u64',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 29],
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
            type: 'u128',
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
            name: 'ratioRewardAmount',
            type: 'u128',
          },
          {
            name: 'ratioRewardDebt',
            type: 'u128',
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 26],
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
  ],
  errors: [
    {
      code: 6000,
      name: 'Unauthorized',
      msg: 'You are not authorized to perform this action.',
    },
    {
      code: 6001,
      name: 'AlreadyInUse',
      msg: 'AlreadyInUse',
    },
    {
      code: 6002,
      name: 'InvalidProgramAddress',
      msg: 'InvalidProgramAddress',
    },
    {
      code: 6003,
      name: 'InvalidState',
      msg: 'InvalidState',
    },
    {
      code: 6004,
      name: 'InvalidOwner',
      msg: 'InvalidOwner',
    },
    {
      code: 6005,
      name: 'NotAllowed',
      msg: 'NotAllowed',
    },
    {
      code: 6006,
      name: 'MathOverflow',
      msg: 'Math operation overflow',
    },
    {
      code: 6007,
      name: 'InvalidOracleConfig',
      msg: 'InvalidOracleConfig',
    },
    {
      code: 6008,
      name: 'InvalidAccountInput',
      msg: 'InvalidAccountInput',
    },
    {
      code: 6009,
      name: 'InvalidCluster',
      msg: 'This function works on devnet only',
    },
    {
      code: 6010,
      name: 'GlobalTVLExceeded',
      msg: 'Global TVL Exceeded',
    },
    {
      code: 6011,
      name: 'LTVExceeded',
      msg: 'LTV Exceeded',
    },
    {
      code: 6012,
      name: 'GlobalDebtCeilingExceeded',
      msg: 'Global Debt Ceiling Exceeded',
    },
    {
      code: 6013,
      name: 'PoolDebtCeilingExceeded',
      msg: 'Pool Debt Ceiling Exceeded',
    },
    {
      code: 6014,
      name: 'UserDebtCeilingExceeded',
      msg: 'User Debt Ceiling Exceeded',
    },
    {
      code: 6015,
      name: 'WithdrawNotAllowedWithDebt',
      msg: "Can't withdraw due to debt",
    },
    {
      code: 6016,
      name: 'InvalidTransferAmount',
      msg: 'Transfer amount is invalid',
    },
    {
      code: 6017,
      name: 'InvalidPlatformType',
      msg: 'Invalid platform type',
    },
    {
      code: 6018,
      name: 'InvalidSaberPlatformType',
      msg: 'Invalid platform, should be Saber',
    },
    {
      code: 6019,
      name: 'RepayingMoreThanBorrowed',
      msg: 'Attempting to repay more than the amount originally borrowed',
    },
    {
      code: 6020,
      name: 'RewardMintMismatch',
      msg: 'Reward mint account mismatch',
    },
    {
      code: 6021,
      name: 'PoolPaused',
      msg: 'The pool is paused by admin',
    },
    {
      code: 6022,
      name: 'InvalidFundingWallet',
      msg: 'Invalid Funding Wallet',
    },
  ],
};
