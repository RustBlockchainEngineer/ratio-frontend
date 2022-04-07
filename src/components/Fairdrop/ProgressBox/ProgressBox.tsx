import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import classNames from 'classnames';

type props = {
  currentTask: string;
  now: number;
};

const ProgressBox = ({ currentTask, now }: props) => {
  return (
    <div className="progressbox">
      <h5>Your progress</h5>
      {now === 100 && (
        <p className="progressbox__completedtext">You’ve completed all tasks, don’t forget to claim Your tokens!</p>
      )}
      <div className="mt-3 mb-1 d-flex justify-content-between">
        <p className="progressbox__currenttask">{currentTask}/4 tasks complete</p>
        <p className={classNames('progressbox__percent', { 'progressbox__percent--danger': now === 0 })}>{now}%</p>
      </div>
      <ProgressBar now={now} />
    </div>
  );
};

export default ProgressBox;
