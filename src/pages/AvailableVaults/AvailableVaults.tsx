import React, { useState } from 'react';
import useFetch from 'react-fetch-hook';
import classNames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from '../../components/Button';
import FilterPanel from '../../components/FilterPanel';
import TokenPairCard from '../../components/TokenPairCard';
import { useWallet } from '../../contexts/wallet';
import LockVaultModal from '../../components/LockVaultModal';
import DisclaimerModal from '../../components/DisclaimerModal';
import factorialData from '../../constants/factorial.json';
import rayIcon from '../../assets/images/RAY.svg';
import ethIcon from '../../assets/images/ETH.svg';

const AvailableVaults = () => {
  const [viewType, setViewType] = useState('tile');
  const { connected } = useWallet();

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const { isLoading, data } = useFetch<any>('http://144.126.208.158/index.php/api/rate');

  function factorialOf(d: any) {
    if (d !== undefined) {
      const p = Object.keys(d).map((key, index) => {
        return {
          id: index,
          icons: [rayIcon, ethIcon],
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

  const factorial = React.useMemo(() => factorialOf(factorialData), [factorialData, connected]);

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
        return <h6 className="semiBold">{row.risk}</h6>;
      },
      style: {
        paddingTop: 35,
      },
    },
    {
      dataField: '',
      text: '',
      headerStyle: {
        width: '25%',
      },
      formatter: (cell: any, row: any, rowIndex: any, { walletConnected }: any) => {
        return (
          <div className="activepaircard__btnBox d-flex">
            <div className="col">
              <Button className="button--gradientBorder lp-button">Insta-buy Lp</Button>
            </div>
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
            <p>$2,700</p>
          </div>
        </div>
        <div className="mt-3 w-25">
          <Button className="button--fill lp-button">Harvest</Button>
        </div>
      </div>
    ),
  };

  const showContent = (vtype: string) => {
    if (vtype === 'tile') {
      return factorial.map((item) => {
        return <TokenPairCard data={item} key={item.id} />;
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
          showContent(viewType)
        )}
      </div>
    </div>
  );
};

export default AvailableVaults;
