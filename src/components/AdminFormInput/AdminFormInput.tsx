import { ElementType } from 'react';
import { Col, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
  yetNotImplemented = false,
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
  yetNotImplemented?: boolean;
  as?: ElementType<any>;
  children?: any;
}) {
  const renderControl = () => (
    <Form.Control
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      as={as}
      disabled={yetNotImplemented}
      onChange={handleChange}
    >
      {children}
    </Form.Control>
  );
  return (
    <Form.Group as={Col} xs={xs} md={md} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <InputGroup hasValidation>
        {!yetNotImplemented && renderControl()}
        {yetNotImplemented && (
          <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip`}>Option not available yet</Tooltip>}>
            {renderControl()}
          </OverlayTrigger>
        )}
      </InputGroup>
    </Form.Group>
  );
}
