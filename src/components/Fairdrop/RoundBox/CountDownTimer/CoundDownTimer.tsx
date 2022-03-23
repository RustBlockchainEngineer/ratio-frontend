import React from 'react';

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
      <span>Expired!!!</span>
      <p>Please select a future date and time.</p>
    </div>
  );
};

const ShowCounter = ({ days, hours, minutes, seconds, isDanger }: any) => {
  return (
    <div className="roundbox__countdown">
      <div className="d-flex">
        <DateTimeDisplay value={days} type={'Days'} isDanger={isDanger} />
        <h4 className={isDanger ? 'danger' : ''}>:</h4>
        <DateTimeDisplay value={hours} type={'Hours'} isDanger={isDanger} />
        <h4 className={isDanger ? 'danger' : ''}>:</h4>
        <DateTimeDisplay value={minutes} type={'Mins'} isDanger={isDanger} />
        <h4 className={isDanger ? 'danger' : ''}>:</h4>
        <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={isDanger} />
      </div>
      {isDanger && <h5 className="danger">Complete tasks to receive max allocation</h5>}
    </div>
  );
};

const DateTimeDisplay = ({ value, type, isDanger }: any) => {
  return (
    <div>
      <h3 className={isDanger && 'danger'}>{value}</h3>
      <h6 className={isDanger && 'danger'}>{type}</h6>
    </div>
  );
};

const CountdownTimer = ({ days, hours, minutes, seconds, isDanger }: any) => {
  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />;
  } else {
    return <ShowCounter days={days} hours={hours} minutes={minutes} seconds={seconds} isDanger={isDanger} />;
  }
};

export default CountdownTimer;
