import { Person } from "@prisma/client";
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
} from "react-bootstrap";
import prisma from "~/lib/db.server";
import sortBy from "lodash/sortBy";
import { ChoreLabel } from "~/components/PersonCard";
import { format } from "date-fns";
import { DAY, IsDayChecked } from "~/utils/days";
import EditPerson from "~/components/EditPerson";

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
    const { order, ...person } = Object.fromEntries(data) as unknown as Person;

    const updatedPerson = await prisma.person.update({
      where: { id: params.personId },
      data: {
        ...person,
        order: Number(order),
        updatedAt: new Date(),
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

  return (
    <Container>
      <Row>
        <Col>
          <h1>Edit Person</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <EditPerson person={person as unknown as Person} />
          <hr />
          <ListGroup>
            {sortBy(person.chores, ["timeOfDay", "order"]).map((chore) => (
              <ListGroup.Item
                key={chore.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <ChoreLabel chore={chore} />
                  <Row>
                    <Col>
                      <div className="badge rounded-pill bg-secondary">
                        {chore.timeOfDay}
                      </div>
                    </Col>
                    <Col>
                      <div className="badge rounded-pill bg-secondary">
                        Pts: {chore.pointValue}
                      </div>
                    </Col>
                    <Col>
                      {(!!chore.startDate || !!chore.endDate) && (
                        <div>
                          {chore.startDate
                            ? format(
                                new Date(Number(chore.startDate)),
                                "MMM dd, yyyy"
                              )
                            : "No start"}{" "}
                          -{" "}
                          {chore.endDate
                            ? format(
                                new Date(Number(chore.endDate)),
                                "MMM dd, yyyy"
                              )
                            : "No end"}
                        </div>
                      )}
                    </Col>
                    <Col>
                      <div className="d-flex">
                        {Object.entries(DAY).map(([key, value]) => (
                          <div
                            key={key}
                            style={{ width: "25px", height: "25px" }}
                            className={`border border-1 pr-2 rounded-circle text-uppercase text-center ${
                              IsDayChecked(chore.repeat, value)
                                ? "bg-success text-light"
                                : ""
                            }`}
                          >
                            {key.substring(0, 1)}
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </div>
                <Button variant="secondary" href={`/chore/${chore.id}`}>
                  ✏️
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};
