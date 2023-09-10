import { Person } from "@prisma/client";
import { Form } from "@remix-run/react";
import { Button, FloatingLabel, Form as BForm } from "react-bootstrap";

export default function EditPerson({ person }: { person?: Person }) {
  return (
    <Form method="POST">
      <FloatingLabel controlId="person.name" label="Task" className="mb-3">
        <BForm.Control required name="name" defaultValue={person?.name} />
      </FloatingLabel>
      <FloatingLabel controlId="person.color" label="Color" className="mb-3">
        <BForm.Control
          required
          type="color"
          name="color"
          className="w-100"
          defaultValue={person?.color}
        />
      </FloatingLabel>
      <FloatingLabel controlId="person.order" label="Order" className="mb-3">
        <BForm.Control
          required
          type="number"
          name="order"
          defaultValue={person?.order}
        />
      </FloatingLabel>
      <Button type="submit">Save</Button>
    </Form>
  );
}
