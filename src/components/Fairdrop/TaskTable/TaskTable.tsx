import React from 'react';
import { Table } from 'react-bootstrap';

const TaskTable = () => {
  return (
    <div className="tasktable">
      <Table striped hover>
        <thead>
          <tr>
            <th>Task</th>
            <th>Description</th>
            <th>Value(RATIO)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">Not Complete</td>
          </tr>
          <tr>
            <td>1</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">Not Complete</td>
          </tr>
          <tr>
            <td>1</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">Not Complete</td>
          </tr>
          <tr>
            <td>1</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">Not Complete</td>
          </tr>
          <tr>
            <td>1</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">Not Complete</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default TaskTable;
