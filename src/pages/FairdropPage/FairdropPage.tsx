import React from 'react';
import TaskTable from '../../components/Fairdrop/TaskTable';

const FairdropPage = () => {
  return (
    <div className="fairdroppage row">
      <div className="col-lg-8">
        <h2>RATIO Fairdrop</h2>
        <h6>
          Complete tasks and claim RATIO. Each task is worth 20% of the total claimable <br /> reward. There are three
          rounds lasting a certain period of time in which the claimable <br /> tokens value changes.
        </h6>
        <TaskTable />
      </div>
      <div className="col-lg-4"></div>
    </div>
  );
};

export default FairdropPage;
