import { type Prisma } from "@prisma/client";
import {
  json,
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useLoaderData, type V2_MetaFunction } from "@remix-run/react";
import { format, startOfDay } from "date-fns";
import { Button, Col, Container, Row } from "react-bootstrap";
import EditChore from "~/components/EditChore";
import prisma from "~/lib/db.server";
import { dateWithOffset } from "~/utils/date.server";
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

    if (data.get("undelete")) {
      await prisma.chore.update({
        data: { deletedAt: null },
        where: { id: params.choreId },
      });
      return json({});
    } else {
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
          startDate: startDate ? startDate : null,
          endDate: endDate ? endDate : null,
          updatedAt: new Date(),
        } as Chore,
      });
      return redirect(`/person/${personId}`);
    }
  }
  if (request.method === "DELETE") {
    const deletedAt = startOfDay(new Date());
    await prisma.chore.update({
      data: {
        deletedAt: format(dateWithOffset(request, new Date()), "yyyy-MM-dd"),
      },
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
            {chore?.deletedAt != null ? (
              <Button type="submit" name="undelete" value="true">
                Restore Deleted Chore
              </Button>
            ) : (
              <>
                <Button type="submit">Save</Button>
                <Button variant="danger" type="submit" formMethod="DELETE">
                  Delete
                </Button>
              </>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
