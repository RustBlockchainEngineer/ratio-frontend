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
}: {
  label: string;
  value: any;
  name: string;
  placeholder?: string;
  md?: string;
  xs?: string;
  type?: string;
  handleChange: any;
}) {
  return (
    <Form.Group as={Col} xs={xs} md={md} controlId={name}>
      <Form.Label>{label}</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          name={name}
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      </InputGroup>
    </Form.Group>
  );
}
