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
import { parseISO, startOfDay } from "date-fns";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);

  const data = {
    chore: await prisma.chore.findUnique({ where: { id: params.choreId } }),
    people: await prisma.person.findMany({}),
  };
  return json(data);
};
type Chore = Prisma.ChoreGetPayload<{}>;

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    const data = await request.formData();
    const {
      repeat,
      order,
      timeOfDay,
      pointValue,
      startDate,
      endDate,
      ...chore
    } = Object.fromEntries(data) as unknown as Chore;

    const todo = await prisma.chore.findUnique({
      where: {
        id: params.choreId,
      },
    });
    if (!todo) {
      return json(
        { error: "Todo does not exist" },
        {
          status: 400,
        }
      );
    }

    await prisma.chore.update({
      where: {
        id: todo.id,
      },
      data: {
        ...chore,
        repeat: Number(repeat),
        timeOfDay: Number(timeOfDay),
        order: Number(order),
        pointValue: Number(pointValue),
        startDate: startDate ? parseISO(startDate).valueOf().toString() : null,
        endDate: endDate ? parseISO(endDate).valueOf().toString() : null,
        updatedAt: new Date(),
      } as Chore,
    });
    return redirect(`/person/${chore.personId}`);
  }
  if (request.method === "DELETE") {
    const deletedAt = startOfDay(new Date()).valueOf().toString();
    await prisma.chore.update({
      data: { deletedAt },
      where: { id: params.choreId },
    });
  }
  return redirect(`/`);

  //   return null;
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Update Chore" },
    { name: "description", content: "Update an existing chore" },
  ];
};

export default () => {
  const { people, chore } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Row>
        <Col>
          <h1>Edit Chore</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form method="POST">
            <EditChore chore={chore as any} people={people as any} />
            <Button type="submit">Save</Button>
            <Button variant="danger" type="submit" formMethod="DELETE">
              Delete
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
