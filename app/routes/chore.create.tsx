import { type Prisma } from "@prisma/client";
import {
  type ActionFunction,
  type LoaderArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, type V2_MetaFunction, useLoaderData } from "@remix-run/react";
import { Button, Col, Container, Row } from "react-bootstrap";
import EditChore from "~/components/EditChore";
import prisma from "~/lib/db.server";

type Chore = Prisma.ChoreGetPayload<{}>;

export const loader = async ({ params }: LoaderArgs) => {
  const data = {
    people: await prisma.person.findMany({}),
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    const data = await request.formData();
    const people = data.getAll("personId");
    const {
      repeat,
      order,
      timeOfDay,
      pointValue,
      startDate,
      endDate,
      personId,
      ...chore
    } = Object.fromEntries(data) as unknown as Chore;
    for (let personId of people) {
      await prisma.chore.create({
        data: {
          ...chore,
          personId,
          repeat: Number(repeat),
          order: Number(order),
          pointValue: Number(pointValue),
          timeOfDay: Number(timeOfDay),
          startDate: startDate ? startDate : null,
          endDate: endDate ? endDate : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Chore,
      });
    }

    return redirect("/");
  }
  return null;
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Update Chore" },
    { name: "description", content: "Update an existing chore" },
  ];
};

export default () => {
  const { people } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Row>
        <Col>
          <h1>Create Chore</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form method="POST">
            <EditChore people={people as any} />
            <Button type="submit">Save</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
