import React from 'react'
import CustomInput from '../CustomInput'
import CustomSelect from '../CustomSelect'
import Button from '../Button'

import stepIcon from '../../assets/images/STEP.svg'
import usdcIcon from '../../assets/images/USDC.svg'
import rayIcon from '../../assets/images/RAY.svg'
import solIcon from '../../assets/images/SOL.svg'
import ethIcon from '../../assets/images/ETH.svg'
import srmIcon from '../../assets/images/SRM.svg'
import mediaIcon from '../../assets/images/MEDIA.svg'

const options = [
  { value: 'SOL', label: 'SOL', icon: [solIcon] },
  { value: 'RAY', label: 'RAY', icon: [rayIcon] },
  { value: 'SRM', label: 'SRM', icon: [srmIcon] },
  { value: 'MEDIA', label: 'MEDIA', icon: [mediaIcon] },
  { value: 'ETH', label: 'ETH', icon: [ethIcon] },
  { value: 'USDC', label: 'USDC', icon: [usdcIcon] },
  { value: 'STEP', label: 'STEP', icon: [stepIcon] },
]

const options1 = [
  { value: 'STEP-USDC', label: 'STEP-USDC-LP', icon: [stepIcon, usdcIcon] },
  { value: 'RAY-SOL', label: 'RAY-SOL-LP', icon: [rayIcon, solIcon] },
  { value: 'RAY-EHT', label: 'RAY-EHT-LP', icon: [rayIcon, ethIcon] },
  { value: 'RAY-SRM', label: 'RAY-SRM-LP', icon: [rayIcon, srmIcon] },
  { value: 'RAY-USDC', label: 'RAY-USDC-LP', icon: [rayIcon, usdcIcon] },
  { value: 'MEDIA-USDC', label: 'MEDIA-USDC-LP', icon: [mediaIcon, usdcIcon] },
]

const InstaBuyLpCard = () => {
  return (
    <div className="instabuylpcard">
      <div className="instabuylpcard__top">
        <label>Please select a token</label>
        <CustomSelect options={options} />
        <label className="mt-4">
          How much <strong>SOL</strong> would you like to swap?
        </label>
        <CustomInput appendStr="Max" tokenStr="SOL" />
        <div className="balance">
          Balance: <p> 5.9 SOL</p>
        </div>
      </div>
      <div className="instabuylpcard__bottom">
        <label>Please select a token</label>
        <CustomSelect options={options1} />
        <label className="mt-4">
          Estimated <strong>RAY-SOL-LP</strong> tokens
        </label>
        <CustomInput appendStr="" tokenStr="RAY-SOL-LP" />
      </div>
      <div className="instabuylpcard__footer">
        <Button className="button--fill swaptokensBtn">Create LP</Button>
      </div>
    </div>
  )
}

export default InstaBuyLpCard
