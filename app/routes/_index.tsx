import { ActionFunction, V2_MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button, ButtonGroup, Container, Row } from "react-bootstrap";
import ChoreComplete from "~/components/ChoreComplete";
import PersonCard from "~/components/PersonCard";
import prisma from "~/lib/db.server";
import { useChoreContext } from "~/root";
import { endOfDay, parse, startOfDay } from "date-fns";
import { DAY, IsDayChecked } from "~/utils/days";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";

export type personLoader = typeof loader;
export const loader = async () => {
  const d = startOfDay(new Date());
  const data = {
    people: await prisma.person.findMany({ orderBy: [{ order: "asc" }] }),
    chores: await prisma.chore.findMany({
      where: {
        AND: [
          {
            startDate: {},
          },
        ],
      },
    }),
    choreStatus: await prisma.chore_Status.findMany({
      where: {
        AND: [
          {
            date: d.valueOf().toString(),
          },
        ],
      },
    }),
  };

  return json(
    data.people.map((x) => ({
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
    }))
  );
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export let action: ActionFunction = async ({ request }) => {
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
      AND: [
        {
          choreId: completeTodoId,
        },
        {
          date: d.valueOf().toString(),
        },
      ],
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
  const people = useLoaderData<personLoader>();
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
        <Button variant="secondary" href="/">
          Refresh
        </Button>
        <Button href="chore/create">+ Add</Button>
        <Button href="person/create">+ Person</Button>
      </ButtonGroup>
    </Container>
  );
}
