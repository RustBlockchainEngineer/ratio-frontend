import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { MINTADDRESS } from '../../constants';
import { getRiskLevel } from '../../libs/helper';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useWallet } from '../../contexts/wallet';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';
import { walletSelectors } from '../../features/wallet';

import classNames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from '../../components/Button';
import FilterPanel from '../../components/FilterPanel';
import TokenPairCard from '../../components/TokenPairCard';
import LockVaultModal from '../../components/LockVaultModal';
import DisclaimerModal from '../../components/DisclaimerModal';
import ComparingFooter from '../../components/ComparingFooter';

import { getCoinPicSymbol } from '../../utils/helper';

import { SET_AVAILABLE_VAULT } from '../../features/dashboard/actionTypes';

const AvailableVaults = () => {
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState('tile');
  const compareValutsList = useSelector(selectors.getCompareVaultsList);
  const filter_data = useSelector(selectors.getFilterData);

  const { connected, publicKey } = useWallet();

  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const getData = async () => {
    setIsLoading(true);
    const d = await axios.get('https://api.ratio.finance/api/rate');
    setData(d.data);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getData();
  }, []);

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
          mint: MINTADDRESS[key],
          icons: [getCoinPicSymbol(tokens[0]), getCoinPicSymbol(tokens[1])],
          icon1: getCoinPicSymbol(tokens[0]), //`https://sdk.raydium.io/icons/${getTokenBySymbol(tokens[0])?.mintAddress}.png`,
          icon2: getCoinPicSymbol(tokens[1]),
          title: key,
          tvl: '$20,818,044.40',
          apr: 125,
          details:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
          risk: d[key].c,
          riskPercentage: d[key].r,
          riskLevel: d[key].riskLevel,
        };
      });
      dispatch({ type: actionTypes.SET_AVAILABLE_VAULT, payload: p });
      return p;
    }
    return [];
  }

  const factorial = React.useMemo(() => factorialOf(data, filter_data), [data, connected, filter_data]);

  const renderModalButton = (row: any, connect: boolean) => {
    if (connect) {
      if (row.risk === 250) return <DisclaimerModal data={row} />;
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
                <img src={row.icons[0]} alt={row.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={row.icons[1]} alt={row.icons[1].toString()} className="activepaircard__header-icon1" />
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

  const showContent = (vtype: string) => {
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
        return <TokenPairCard data={item} key={item.id} onCompareVault={onCompareVault} />;
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

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

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
          showContent(viewType)
        )}
      </div>
      {compareValutsList.length > 0 && <ComparingFooter list={compareValutsList} />}
    </div>
  );
};

export default AvailableVaults;
