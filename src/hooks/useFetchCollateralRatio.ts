import { useCallback, useEffect, useState } from 'react';
import { useAuthContextProvider } from '../contexts/authAPI';
import { getFromRatioApi } from '../utils/ratioApi';

const collateralRatioToRiskRating = {
  A: {
    value: 'cr_a_ratio',
    index: 0,
  },
  AA: {
    value: 'cr_aa_ratio',
    index: 1,
  },
  AAA: {
    value: 'cr_aaa_ratio',
    index: 2,
  },
  B: {
    value: 'cr_b_ratio',
    index: 3,
  },
  BB: {
    value: 'cr_bb_ratio',
    index: 4,
  },
  BBB: {
    value: 'cr_bbb_ratio',
    index: 5,
  },
  C: {
    value: 'cr_c_ratio',
    index: 6,
  },
  CC: {
    value: 'cr_cc_ratio',
    index: 7,
  },
  CCC: {
    value: 'cr_ccc_ratio',
    index: 8,
  },
  D: {
    value: 'cr_d_ratio',
    index: 9,
  },
};

//{{base_url}}/ratioconfig/collateralratio/last
const fetchAllCollateralRatios = async (accessToken: any) => {
  return await getFromRatioApi('ratioconfig/collateralratio/last', accessToken);
};

const getCollateralRatio = (collateralRatios: any, riskRating: string): number => {
  const mapValue: any | undefined = collateralRatioToRiskRating[riskRating];
  return collateralRatios[mapValue?.index];
};

export const useFetchCollateralRatio = (riskRating: string) => {
  const [collateralRatio, setCollateralRatio] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  const collateralizationRatios = useCallback(async () => await fetchAllCollateralRatios(accessToken), []);

  useEffect(() => {
    let cancelRequest = false;
    async function getCollRatio() {
      try {
        const collRatios = await collateralizationRatios();
        const collateralRatioObj = getCollateralRatio(collRatios, riskRating);
        const collRatioValue = collateralRatioObj[collateralRatioToRiskRating[riskRating]?.value];
        if (cancelRequest) return;
        setCollateralRatio(collRatioValue);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
      }
    }

    getCollRatio();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [riskRating]);

  return {
    collateralRatio,
    error,
  };
};
