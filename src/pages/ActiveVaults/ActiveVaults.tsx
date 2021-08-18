import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from '../../components/Button';
import ActivePairCard from '../../components/ActivePairCard';
import FilterPanel from '../../components/FilterPanel';
import stepIcon from '../../assets/images/STEP.svg';
import usdcIcon from '../../assets/images/USDC.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';

const tokenPairs = [
  {
    id: 0,
    icons: [stepIcon, usdcIcon],
    title: 'STEP-USDC',
    tvl: '$70,458,607.97',
    risk: 92,
    apr: 125,
    owed: '$1,200',
    mint: '$600',
    price: '$3,000'
  },
  {
    id: 1,
    icons: [rayIcon, solIcon],
    title: 'RAY-SOL',
    tvl: '$57,537,364.18',
    risk: 47,
    apr: 125,
    owed: '$1,200',
    mint: '$600',
    price: '$3,000',
    warning: true
  }
];

const columns = [
  {
    dataField: 'id',
    text: 'Asset',
    headerStyle: {
      width: '20%'
    },
    formatter: (cell: any, row: any) => {
      return (
        <div className="align-items-center">
          <div className="d-flex ">
            <div>
              <img src={row.icons[0]} alt={row.icons[0].toString()} />
              <img
                src={row.icons[1]}
                alt={row.icons[1].toString()}
                className="activepaircard__header-icon"
              />
            </div>
            <div
              className={classNames('activepaircard__titleBox', {
                'activepaircard__titleBox--warning': row.warning
              })}
            >
              <h6>{row.title}</h6>
              <p>TVL: {row.tvl}</p>
            </div>
          </div>
          {row.warning && (
            <div className="activepaircard__warningBox">
              <div>
                <IoWarningOutline size={27} />
              </div>
              <p className="pt-1">
                <strong>WARNING:</strong> You are approaching your liquidation
                threshold of <strong>$90.</strong>
              </p>
            </div>
          )}
        </div>
      );
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: 'apr',
    text: 'APR',
    headerStyle: {
      width: '7%'
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.apr}%</h6>;
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: 'owed',
    text: 'USDr Owed',
    headerStyle: {
      width: '10%'
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.owed}</h6>;
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: 'mint',
    text: 'Available to Mint',
    headerStyle: {
      width: '12%'
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.mint}</h6>;
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: 'price',
    text: 'Liquidation Price',
    headerStyle: {
      width: '12%'
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.price}</h6>;
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: 'risk',
    text: 'Risk Level',
    headerStyle: {
      width: '9%'
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.risk}</h6>;
    },
    style: {
      paddingTop: 35
    }
  },
  {
    dataField: '',
    text: '',
    formatter: (cell: any, row: any) => {
      return (
        <div
          className={classNames('activepaircard__btnBox d-flex', {
            'activepaircard__btnBox--warning': row.warning
          })}
        >
          <div className="col">
            <Button className="button--gradientBorder lp-button">
              Deposit LP
            </Button>
          </div>
          <div className="col">
            <Button className="button--fill lp-button">Enter Vault</Button>
          </div>
        </div>
      );
    }
  }
];
const rowClasses = (row: any) => {
  let classes = '';
  if (row.warning) {
    classes = 'warning_position';
  }
  return classes;
};

const ActiveVaults = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [viewType, setViewType] = React.useState('tile');

  React.useEffect(() => {
    if (isMobile) {
      setViewType('tile');
    }
  }, [isMobile]);

  const onViewType = (type: string) => {
    setViewType(type);
  };

  return (
    <div className="activeVaults">
      <FilterPanel
        label="My Active Vaults"
        viewType={viewType}
        onViewType={onViewType}
      />
      <div className="row ">
        {viewType === 'tile' &&
          tokenPairs.map((item) => {
            return <ActivePairCard data={item} key={item.id} />;
          })}
        {viewType === 'list' && (
          <div className="mt-4 activeVaults__list">
            <BootstrapTable
              bootstrap4
              keyField="id"
              data={tokenPairs}
              columns={columns}
              bordered={false}
              rowClasses={rowClasses}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveVaults;
