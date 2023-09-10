import {
  ActionFunction,
  LoaderArgs,
  V2_MetaFunction,
  json,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Button, ButtonGroup, Container, Row } from "react-bootstrap";
import ChoreComplete from "~/components/ChoreComplete";
import PersonCard from "~/components/PersonCard";
import prisma from "~/lib/db.server";
import { useChoreContext } from "~/root";
import { endOfDay, parse, startOfDay } from "date-fns";
import { DAY, IsDayChecked } from "~/utils/days";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import { requireUserId } from "~/utils/session.server";

export type personLoader = typeof loader;
export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const groups = await prisma.group.findMany({
    where: { userId },
  });
  const group = groups.find((x) => x.id === params.groupId);
  if (!group) throw new Error("Group not found");

  const people = await prisma.person.findMany({
    where: { groupId: group.id },
    orderBy: [{ order: "asc" }],
  });
  const chores = await prisma.chore.findMany({
    where: {
      personId: { in: people.map((x) => x.id) },
      startDate: {},
    },
  });
  const d = startOfDay(new Date());
  const data = {
    people,
    chores,
    choreStatus: await prisma.chore_Status.findMany({
      where: {
        date: d.valueOf().toString(),
        choreId: { in: chores.map((x) => x.id) },
      },
    }),
  };

  return json({
    groups,
    group,
    people: data.people.map((x) => ({
      ...x,
      chores: groupBy(
        orderBy(
          data.chores.flatMap((y) => {
            const status = data.choreStatus.find((z) => z.choreId === y.id);
            if (
              y.startDate != null &&
              y.endDate != null &&
              !(
                d.valueOf() >= Number(y.startDate) &&
                new Date() <= endOfDay(new Date(Number(y.endDate)))
              )
            )
              return [];

            return y.personId === x.id &&
              (y.repeat === 0 ||
                IsDayChecked(y.repeat, Object.values(DAY)[d.getDay()]))
              ? [{ ...y, status }]
              : [];
          }),
          ["timeOfDay", "order"]
        ),
        "timeOfDay"
      ),
    })),
  });
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export let action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const d = startOfDay(new Date());

  const data = new URLSearchParams(await request.text());
  const completeTodoId = data.get("complete");
  if (!completeTodoId)
    return json(
      { error: "Todo id must be defined" },
      {
        status: 400,
      }
    );
  const choreStatus = await prisma.chore_Status.findFirst({
    where: {
      choreId: completeTodoId,
      date: d.valueOf().toString(),
    },
  });

  // Create or update status
  if (choreStatus == null) {
    const chore = await prisma.chore.findUnique({
      where: { id: completeTodoId },
    });
    const created = await prisma.chore_Status.create({
      data: {
        date: d.valueOf().toString(),
        choreId: completeTodoId,
        pointValue: chore?.pointValue,
        completed: true,
      },
    });
    return json(created, { status: 201 });
  } else {
    const updatedTodo = await prisma.chore_Status.update({
      where: {
        id: choreStatus.id,
      },
      data: {
        completed: !choreStatus.completed,
      },
    });
    return json(updatedTodo, { status: 200 });
  }
};

export default function Index() {
  const { group, people } = useLoaderData<personLoader>();
  const choreContext = useChoreContext();

  return (
    <Container
      fluid
      style={{
        height: "100vh",
        padding: "1rem",
        overflowY: "hidden",
        overflowX: "auto",
      }}
    >
      {choreContext.choreComplete && <ChoreComplete />}
      <Row style={{ flexWrap: "nowrap" }} className="h-100">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </Row>
      <ButtonGroup
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          margin: "1rem",
          opacity: 0.5,
        }}
      >
        <Form action="/logout" method="post">
          <Button type="submit">Logout</Button>
        </Form>
        <Button variant="secondary" href="/">
          Refresh
        </Button>
        <Button href="/chore/create">+ Add</Button>
        <Button href="/person/create">+ Person</Button>
      </ButtonGroup>
    </Container>
  );
}
