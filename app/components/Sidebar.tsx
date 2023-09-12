import type { Group } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";

type NavItem = {
  label: string;
  href: string;
};

/**
 *   <Button variant="secondary" href="/">
          Refresh
        </Button>
        <Button href="/chore/create">+ Add</Button>
        <Button href="/person/create">+ Person</Button>
 */
const Nav = {
  unauthenticated: [] as NavItem[],
  authenticated: [
    {
      label: "Add Chore",
      href: "/chore/create",
    },
    {
      label: "Add Person",
      href: "/person/create",
    },
    {
      label: "Create group",
      href: "/group/create",
    },
  ] as NavItem[],
};

export function Sidebar({
  authenticated,
  groups,
}: {
  authenticated: boolean;
  groups: Group[];
}) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const nav = authenticated ? Nav.authenticated : Nav.unauthenticated;
  return (
    <>
      <div
        style={{
          borderRight: "solid 1px black",
          height: "100vh",
        }}
        onClick={handleShow}
        role="button"
        className="bg-secondary text-light px-2 py-4"
      >
        {"▶︎"}
      </div>

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chores Chart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            {nav.map((n) => (
              <ListGroup.Item key={n.label} action href={n.href}>
                {n.label}
              </ListGroup.Item>
            ))}

            {authenticated && (
              <ListGroup.Item action>
                <Form action="/logout" method="post">
                  <Button type="submit" variant="plain">
                    Logout
                  </Button>
                </Form>
              </ListGroup.Item>
            )}
          </ListGroup>

          {groups.length > 0 && (
            <>
              <h4>Groups</h4>
              <ListGroup>
                {groups.map((group) => (
                  <ListGroup.Item
                    key={group.id}
                    action
                    href={`/group/${group.id}`}
                    className={group.isDefault ? "active" : ""}
                  >
                    {group.groupName}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
