import React from 'react';
import classNames from 'classnames';
type comingsoonTypes = { children: any; enable: boolean };

const ComingSoon = ({ children, enable }: comingsoonTypes) => {
  return (
    <div className={classNames('comingsoon', { commingsoon__enable: enable })}>
      <h4>Feature Coming Soon</h4>
      {children}
    </div>
  );
};

export default ComingSoon;
