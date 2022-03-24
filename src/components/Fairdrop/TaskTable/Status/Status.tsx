import React from 'react';

import completedIcon from '../../../../assets/images/completedcheckbox.svg';
import notcompletedIcon from '../../../../assets/images/notcompletedcheckbox.svg';

type props = {
  taskStatus?: boolean;
};

const Status = ({ taskStatus }: props) => {
  return (
    <div className="tasktable__status">
      {taskStatus ? (
        <div className="tasktable__status--complete">
          <img src={completedIcon} alt="completedIcon" />
          Complete
        </div>
      ) : (
        <div className="tasktable__status--notcomplete">
          <img src={notcompletedIcon} alt="notcompletedIcon" />
          Not Complete
        </div>
      )}
    </div>
  );
};

export default Status;
