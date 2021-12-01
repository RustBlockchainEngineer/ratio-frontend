import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRiskLevel } from '../../libs/helper';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useWallet } from '../../contexts/wallet';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';
import { walletSelectors } from '../../features/wallet';

import classNames from 'classnames';
import useFetch from 'react-fetch-hook';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from '../../components/Button';
import FilterPanel from '../../components/FilterPanel';
import TokenPairCard from '../../components/TokenPairCard';
import LockVaultModal from '../../components/LockVaultModal';
import DisclaimerModal from '../../components/DisclaimerModal';
import ComparingFooter from '../../components/ComparingFooter';

import { getCoinPicSymbol } from '../../utils/helper';
import { getTokenBySymbol } from '../../utils/tokens';

import usdrIcon from '../../assets/images/USDr.png';
import ethIcon from '../../assets/images/ETH.svg';
import { getFaucetState } from '../../utils/ratio-faucet';
import { useConnection } from '../../contexts/connection';

type whitelistProps = {
  id: number;
  address: any;
  created_at: string;
  updated_at: string;
  name: string;
};

const AvailableVaults = () => {
  const connection = useConnection();
  const wallet = useWallet().wallet;
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState('tile');
  const compareValutsList = useSelector(selectors.getCompareVaultsList);
  const whitelist_data = useSelector(walletSelectors.getWhiteListData);
  const filter_data = useSelector(selectors.getFilterData);

  const [enable, setEnable] = React.useState(false);
  const { connected, publicKey } = useWallet();

  const [faucetState, setFaucetState] = React.useState(null as any);

  const onViewType = (type: string) => {
    setViewType(type);
  };

  React.useEffect(() => {
    if (connected) {
      const filtered = whitelist_data.filter((item: whitelistProps) => {
        return item.address === publicKey?.toString();
      });
      if (filtered?.length > 0) {
        setEnable(true);
      } else {
        setEnable(false);
        alert('Please add your address to whitelist.');
      }
    }
    if (connected) {
      getFaucetState(connection, wallet).then((result) => {
        setFaucetState(result);
      });
    }
  }, [connected, publicKey]);

  const { isLoading, data } = useFetch<any>('https://api.ratio.finance/api/rate');

  // if (faucetState && data) {
  //   data['USDC-USDR'] = faucetState.mintUsdcUsdrLp.toBase58();
  //   data['ETH-SOL'] = faucetState.mintEthSolLp.toBase58();
  //   data['ATLAS-RAY'] = faucetState.mintAtlasRayLp.toBase58();
  //   data['SAMO-RAY'] = faucetState.mintSamoRayLp.toBase58();
  //   console.log()
  // }

  const filterData = (array1: any, array2: any) => {
    if (array2.length === 0) {
      return array1;
    }
    return array1.filter((item1: any) => {
      const item1Str = JSON.stringify(item1);
      return array2.find((item2: any) => {
        return item1Str.indexOf(item2.label) > -1;
      });
    });
  };

  function factorialOf(d: any, filter_data: any) {
    if (d !== undefined) {
      const p = filterData(Object.keys(d), filter_data).map((key: any, index: any) => {
        const tokens = key.split('-');

        return {
          id: index,
          mint: d[key].mint,
          icons: [getCoinPicSymbol(tokens[0]), getCoinPicSymbol(tokens[1])],
          icon1: getCoinPicSymbol(tokens[0]), //`https://sdk.raydium.io/icons/${getTokenBySymbol(tokens[0])?.mintAddress}.png`,
          icon2: getCoinPicSymbol(tokens[1]),
          title: key,
          tvl: '$20,818,044.40',
          apr: 125,
          details:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
          risk: d[key].c,
        };
      });
      return p;
    }
    return [];
  }

  const factorial = React.useMemo(() => factorialOf(data, filter_data), [data, connected, filter_data]);

  const renderModalButton = (row: any, connect: boolean) => {
    if (connect) {
      if (row.risk >= 200 && row.risk < 250) return <DisclaimerModal data={row} />;
      return <LockVaultModal data={row} />;
    }
  };

  const columns = [
    {
      dataField: 'id',
      text: 'Asset',
      headerStyle: {
        width: '40%',
      },
      formatter: (cell: any, row: any) => {
        return (
          <div className="align-items-center">
            <div className="d-flex ">
              <div>
                <img src={row.icons[0]} alt={row.icons[0].toString()} />
                <img src={row.icons[1]} alt={row.icons[1].toString()} className="activepaircard__header-icon" />
              </div>
              <div
                className={classNames('activepaircard__titleBox', {
                  'activepaircard__titleBox--warning': row.warning,
                })}
              >
                <h6>{row.title}</h6>
                <p>TVL: {row.tvl}</p>
              </div>
            </div>
          </div>
        );
      },
      style: {
        paddingTop: 35,
      },
    },
    {
      dataField: 'apr',
      text: 'APR',
      formatter: (cell: any, row: any) => {
        return <h6 className="semiBold">{row.apr}%</h6>;
      },
      style: {
        paddingTop: 35,
      },
    },
    {
      dataField: 'risk',
      text: 'Risk Level',
      formatter: (cell: any, row: any) => {
        return <h6 className={classNames('semiBold', getRiskLevel(row.risk))}>{getRiskLevel(row.risk)}</h6>;
      },
      style: {
        paddingTop: 35,
      },
    },
    {
      dataField: '',
      text: '',
      headerStyle: {
        width: '15%',
      },
      formatter: (cell: any, row: any, rowIndex: any, { walletConnected }: any) => {
        return (
          <div className="activepaircard__btnBox d-flex">
            {/* <div className="col">
              <Button className="button--gradientBorder lp-button">Insta-buy LP</Button>
            </div> */}
            <div className="col">
              {walletConnected ? (
                renderModalButton(row, walletConnected)
              ) : (
                <OverlayTrigger
                  placement="top"
                  trigger="click"
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip id="tooltip">Connect your wallet to unlock this.</Tooltip>}
                >
                  <div>
                    <Button className="button--disabled generate">Mint USDr</Button>
                  </div>
                </OverlayTrigger>
              )}
            </div>
          </div>
        );
      },
      formatExtraData: { walletConnected: connected },
    },
  ];

  const expandRow = {
    renderer: (row: any) => (
      <div className="tokenpaircard__detailBox__content">
        <div className="d-flex justify-content-between">
          <div>
            Position value:
            <p>$16,200</p>
            <div className="tokenpaircard__detailBox__content--tokens">
              <img src={row.icons[0]} alt="RayIcon" />
              RAY: $4200
            </div>
            <div className="tokenpaircard__detailBox__content--tokens">
              <img src={row.icons[1]} alt="USDrIcon" />
              USDr: $6400
            </div>
          </div>
          <div className="text-right">
            Rewards earned:
            <p>$0</p>
          </div>
        </div>
        {/* <div className="mt-3 w-25">
          <Button className="button--fill lp-button">Harvest</Button>
        </div> */}
      </div>
    ),
  };

  const showContent = (vtype: string, enable: boolean) => {
    const onCompareVault = (data: PairType, status: boolean) => {
      if (status) {
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: [...compareValutsList, data] });
      } else {
        const arr = compareValutsList.filter((vault: PairType) => vault.id !== data.id);
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: arr });
      }
    };

    if (vtype === 'tile') {
      return factorial.map((item: any) => {
        return <TokenPairCard data={item} key={item.id} onCompareVault={onCompareVault} enable={enable} />;
      });
    } else {
      return (
        <div className="mt-4 activeVaults__list">
          <BootstrapTable
            bootstrap4
            keyField="id"
            data={factorial}
            columns={columns}
            bordered={false}
            expandRow={expandRow}
          />
        </div>
      );
    }
  };

  return (
    <div className="availablevaults">
      <FilterPanel label="Available Vaults" viewType={viewType} onViewType={onViewType} />
      <div className="row">
        {isLoading ? (
          <div className="col availablevaults__loading">
            <div className="spinner-border text-info" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          showContent(viewType, enable)
        )}
      </div>
      {compareValutsList.length > 0 && <ComparingFooter list={compareValutsList} />}
    </div>
  );
};

export default AvailableVaults;
