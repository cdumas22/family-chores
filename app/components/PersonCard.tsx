import { Chore, Prisma } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button, Card, Col, Dropdown, ListGroup } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { MdCheckCircleOutline } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";
import { useChoreContext } from "~/root";
import type { personLoader } from "~/routes/_index";
import { TIME_OF_DAY } from "~/utils/days";

type Person = SerializeFrom<personLoader>[number];

export function ChoreLabel({ chore }: { chore: Person["chores"][string][number] }) {
  return (
    <div className="d-flex align-items-center text-reset" style={{ gap: "10px" }}>
      {chore.icon ? (
        <div className="fs-2">{chore.icon}</div>
      ) : chore.status?.completed ? (
        <MdCheckCircle className="fs-1" />
      ) : (
        <MdCheckCircleOutline className="fs-1" />
      )}{" "}
      <span
        className={`pl-1 fs-3 ${
          chore.status?.completed ? "text-decoration-line-through" : ""
        }`}
      >
        {chore.task}
      </span>
    </div>
  );
}

export default function ({ person }: { person: Person }) {
  const allChores = Object.values(person.chores).flat();
  const done = allChores.filter((x) => !!x.status?.completed);
  const percentage = (done.length / allChores.length) * 100;
  const progressStyles = { width: "115px", margin: "auto" };
  const choreContext = useChoreContext();
  const listStyles = {
    borderLeftWidth: "5px",
    borderLeftColor: person.color,
  };
  const buttonStyles = {
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
  };
  function onDone() {
    choreContext.choreComplete = true;
    choreContext.choreColor = person.color;
  }

  return (
    <Col style={{ flexBasis: "320px" }}>
      <Card bg="light" className="d-flex flex-column h-100 pb-3">
        <Card.Body style={{ flex: "0 1 auto" }}>
          <Card.Title>
            <Button
              variant="secondayr"
              href={`/person/${person.id}`}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                margin: "0.25rem",
              }}
            >
              ✏️
            </Button>
            <div style={progressStyles}>
              <CircularProgressbar
                value={percentage}
                text={person.name}
                styles={buildStyles({
                  strokeLinecap: "round",
                  pathColor: person.color,
                  textColor: person.color,
                })}
              />
            </div>

            <div className="fw-lighter" style={{ textAlign: "center" }}>
              {done.length} of {allChores.length} Complete
            </div>
          </Card.Title>
        </Card.Body>
        <div style={{ overflow: "auto" }} className="p-3 pt-0">
          {allChores.length === 0 ? (
            <div className="fs-4 text-center">🎉 No Chores TODAY 🎉 </div>
          ) : (
            <div>
              {Object.entries(person.chores).map(([key, chores]) => (
                <div key={`TIME${TIME_OF_DAY[Number(key)]}`}>
                  <div className="fw-bold lh-lg text-uppercase">{TIME_OF_DAY[Number(key)]}</div>
                  {chores.filter(x => !x.status?.completed).length ? (
                    <ListGroup>
                      {chores.filter(x => !x.status?.completed).map((chore) => (
                        <ListGroup.Item
                          key={chore.id}
                          style={listStyles}
                          className="d-flex justify-content-between"
                        >
                          <Form method="put" className="d-block w-100 h-100">
                            <input
                              hidden
                              name="complete"
                              defaultValue={chore.id}
                            />
                            <button
                              style={buttonStyles as any}
                              type="submit"
                              onClick={onDone}
                            >
                              <ChoreLabel chore={chore} />
                            </button>
                          </Form>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="fs-3 text-center">🎉 All Done 🎉 </div>
                  )}
                </div>
              ))}
              <hr/>
              <div className="fw-bold lh-lg text-uppercase">COMPLETED</div>
              {done.length ? (
                <ListGroup>
                  {done.map((chore) => (
                    <ListGroup.Item
                      key={chore.id}
                      style={listStyles}
                      className="d-flex justify-content-between bg-light"
                    >
                      <Form method="put" className="d-block w-100 h-100">
                        <input hidden name="complete" defaultValue={chore.id} />
                        <button
                          style={buttonStyles as any}
                          type="submit"
                          className="text-muted"
                        >
                          <ChoreLabel chore={chore} />
                        </button>
                      </Form>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div>Get working!</div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Col>
  );
}
