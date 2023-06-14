import { Person, Prisma } from "@prisma/client";
import { ActionFunction, LoaderArgs, json, redirect } from "@remix-run/node";
import { Form, V2_MetaFunction, useLoaderData } from "@remix-run/react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form as BForm,
  Row,
  ListGroup,
  Dropdown,
} from "react-bootstrap";
import EditChore from "~/components/EditChore";
import prisma from "~/lib/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const person = await prisma.person.findUnique({
    where: { id: params.personId },
    include: { chores: true },
  });
  if (person == null) throw new Error("not found");

  return json(person);
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    const data = await request.formData();
    const {order, ...person} = Object.fromEntries(data) as unknown as Person;

    const updatedPerson = await prisma.person.update({
      where: { id: params.personId },
      data: {
        ...person,
        order: Number(order),
        updatedAt: new Date()
      },
    });

    return json(updatedPerson, 201);
  }

  //   return null;
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Update Person" },
    { name: "description", content: "Update an existing chore" },
  ];
};

export default () => {
  const person = useLoaderData<typeof loader>();

  function deleteChore(chore: string) {
    console.log(chore);
  }
  return (
    <Container>
      <Row>
        <Col>
          <h1>Edit Person</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form method="POST">
            <FloatingLabel
              controlId="person.name"
              label="Task"
              className="mb-3"
            >
              <BForm.Control required name="name" defaultValue={person.name} />
            </FloatingLabel>
            <FloatingLabel
              controlId="person.color"
              label="Color"
              className="mb-3"
            >
              <BForm.Control
                required
                type="color"
                name="color"
                className="w-100"
                defaultValue={person.color}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="person.order"
              label="Order"
              className="mb-3"
            >
              <BForm.Control
                required
                type="number"
                name="order"
                defaultValue={person.order}
              />
            </FloatingLabel>
            <Button type="submit">Save</Button>
          </Form>
          <hr />
          <ListGroup>
            {person.chores.map((chore) => (
              <div>
                <ListGroup.Item
                  key={chore.id}
                  className="d-flex justify-content-between"
                >
                  <div className="fs-1 chore-icon">{chore.icon}</div>{" "}
                  {chore.task}
                  <Dropdown id="dropdown-basic">
                    <Dropdown.Toggle variant="secondary" size="sm" />
                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="1" href={`/chore/${chore.id}`}>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey="2"
                        onClick={() => deleteChore(chore.id)}
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              </div>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};
