import React from 'react';
import { Table } from 'react-bootstrap';
import Status from './Status';

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
            <td className="align-middle">
              <Status taskStatus />
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">
              <Status />
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">
              <Status taskStatus />
            </td>
          </tr>
          <tr>
            <td>4</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">
              <Status />
            </td>
          </tr>
          <tr>
            <td>5</td>
            <td className="align-middle">Mint USDr($550.00)</td>
            <td className="align-middle">200.00</td>
            <td className="align-middle">
              <Status />
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default TaskTable;
