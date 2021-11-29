import React from 'react';
import classNames from 'classnames';
type comingsoonTypes = { children: any; enable?: boolean };

const ComingSoon = ({ children, enable }: comingsoonTypes) => {
  console.log(enable);
  return (
    <div className={classNames('comingsoon', { comingsoon__enable: enable })}>
      {enable && <h4>Feature Coming Soon</h4>}
      {children}
    </div>
  );
};

export default ComingSoon;
