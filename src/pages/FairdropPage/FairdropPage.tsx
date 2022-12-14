import React from 'react';
import TaskTable from '../../components/Fairdrop/TaskTable';
import RoundBox from '../../components/Fairdrop/RoundBox';
// import ProgressBox from '../../components/Fairdrop/ProgressBox';
import ClaimBox from '../../components/Fairdrop/ClaimBox';
import TotalRewards from '../../components/Fairdrop/TotalRewards';

const FairdropPage = () => {
  return (
    <div>
      <TotalRewards now={50} />
      <div className="fairdroppage row">
        <div className="col-xl-8">
          <h2>RATIO Fairdrop</h2>
          <h6>
            Complete tasks and claim RATIO. Each task is worth 25% of the total claimable <br /> reward. There are three
            rounds lasting a certain period of time in which the claimable <br /> tokens value changes.
          </h6>
          <TaskTable />
        </div>
        <div className="col-xl-4">
          <RoundBox />
          {/* <ProgressBox currentTask="2" now={50} /> */}
          <ClaimBox ratioValue="1,000.00" />
        </div>
      </div>
    </div>
  );
};

export default FairdropPage;
