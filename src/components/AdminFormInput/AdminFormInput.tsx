import { TransportStatusError } from '@ledgerhq/hw-transport';
import { ElementType } from 'react';
import { Col, Form, InputGroup } from 'react-bootstrap';

export default function AdminFormInput({
  label,
  value,
  name,
  placeholder,
  md = '3',
  xs = 'auto',
  type = 'text',
  handleChange,
  required = true,
  as,
  children,
}: {
  label: string;
  value: any;
  name: string;
  placeholder?: string;
  md?: string;
  xs?: string;
  type?: string;
  handleChange: any;
  required?: boolean;
  as?: ElementType<any>;
  children?: any;
}) {
  return (
    <Form.Group as={Col} xs={xs} md={md} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          as={as}
          onChange={handleChange}
        >
          {children}
        </Form.Control>
      </InputGroup>
    </Form.Group>
  );
}
