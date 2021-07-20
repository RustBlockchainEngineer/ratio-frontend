import React from 'react'

const SystemInfo = () => {
  return (
    <div className="systemInfo">
      <h4 className="mb-4">System Info</h4>
      <div className="d-flex justify-content-between mt-2">
        <h6>Collateralization::</h6>
        <h5>295.85%</h5>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <h6>Total USDr Supply::</h6>
        <h5>10,000,000 rUSD</h5>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <h6>Active Vaults::</h6>
        <h5>10,000,000</h5>
      </div>
    </div>
  )
}

export default SystemInfo
