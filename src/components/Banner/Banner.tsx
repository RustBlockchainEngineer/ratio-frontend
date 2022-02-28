import React from 'react';
import classNames from 'classnames';
import riskLevelIcon from '../../assets/images/risklevelwhite.svg';

enum BannerIcon {
  riskLevel = 'riskLevel',
}

type BannerProps = {
  title: string;
  message: string;
  className?: string;
  bannerIcon: BannerIcon;
  props?: any;
};

const iconMapped = {
  riskLevel: riskLevelIcon,
};

const Banner = ({ title, message, className, bannerIcon, props }: BannerProps) => {
  return (
    <div {...props} className={classNames('d-flex align-items-start', className)}>
      <div className="icon">
        <img src={iconMapped[bannerIcon]} />
      </div>
      <div className="title">
        <p>
          <strong>{title}</strong>
        </p>
      </div>
      <div className="message">
        <p>{message}</p>
      </div>
    </div>
  );
};

export { Banner, BannerIcon };
