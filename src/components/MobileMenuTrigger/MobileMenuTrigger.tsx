import React from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';

type MobileMenuTriggerProps = {
  clickMenuTrigger: () => void;
  open: boolean;
};

const MobileMenuTrigger = ({ clickMenuTrigger, open }: MobileMenuTriggerProps) => {
  return (
    <div className="mobileMenuTrigger" onClick={clickMenuTrigger} aria-hidden="true">
      {!open ? <IoMenu size="40" color="white" /> : <IoClose size="40" color="white" />}
    </div>
  );
};

export default MobileMenuTrigger;
