import type { Person } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { Col, Container, Row } from "react-bootstrap";
import EditPerson from "~/components/EditPerson";
import prisma from "~/lib/db.server";

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    const data = await request.formData();
    const { order, ...person } = Object.fromEntries(data) as unknown as Person;

    await prisma.person.create({
      data: {
        ...person,
        order: Number(order),
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });

    return redirect(`/`);
  }
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Create Person" },
    { name: "description", content: "Create a person" },
  ];
};

export default () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Create Person</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <EditPerson />
        </Col>
      </Row>
    </Container>
  );
};
