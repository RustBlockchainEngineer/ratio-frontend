import React from 'react';
import classNames from 'classnames';
import riskLevelIcon from '../../assets/images/risklevelwhite.svg';
import warningIcon from '../../assets/images/highrisk-light-icon.svg';

enum BannerIcon {
  riskLevel = 'riskLevel',
  warningLevel = 'warningLevel',
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
  warningLevel: warningIcon,
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
