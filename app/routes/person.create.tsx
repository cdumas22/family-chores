import type { Group, Person } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, type V2_MetaFunction } from "@remix-run/react";
import { Col, Container, Row } from "react-bootstrap";
import EditPerson from "~/components/EditPerson";
import prisma from "~/lib/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const groups = await prisma.group.findMany({ where: { userId } });
  return json({ groups });
};
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
  const { groups } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Row>
        <Col>
          <h1>Create Person</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <EditPerson groups={groups as unknown as Group[]} />
        </Col>
      </Row>
    </Container>
  );
};
