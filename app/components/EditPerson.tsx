import type { Group, Person } from "@prisma/client";
import { Form } from "@remix-run/react";
import { Button, FloatingLabel, Form as BForm } from "react-bootstrap";

export default function EditPerson({
  person,
  groups,
}: {
  person?: Person;
  groups: Group[];
}) {
  return (
    <Form method="POST">
      <FloatingLabel controlId="person.name" label="Name" className="mb-3">
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
      <BForm.Group className="mb-3" controlId="person.group">
        <BForm.Label>Person Group</BForm.Label>
        <BForm.Select
          required
          name="groupId"
          defaultValue={person?.groupId ?? ""}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.groupName}
            </option>
          ))}
        </BForm.Select>
      </BForm.Group>
      <Button type="submit">Save</Button>
    </Form>
  );
}
